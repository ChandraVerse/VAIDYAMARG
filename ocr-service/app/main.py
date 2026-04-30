from fastapi import FastAPI, UploadFile, File, HTTPException, Header, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import structlog

from .config import settings
from .ocr.engine import run_ocr
from .ocr.extractor import extract_medicines
from .callbacks import notify_backend
from .schemas import OCRRequest, OCRResult

log = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("OCR service starting", engine=settings.OCR_ENGINE)
    yield
    log.info("OCR service shutting down")


app = FastAPI(
    title="VaidyaMarg OCR Service",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "ok", "engine": settings.OCR_ENGINE}


# ── Synchronous OCR endpoint (for direct calls) ───────────────────────────────
@app.post("/ocr/extract", response_model=OCRResult)
async def extract(
    file: UploadFile = File(...),
    x_internal_secret: str = Header(None),
):
    """Extract text + medicine names from a prescription image."""
    if x_internal_secret != settings.BACKEND_INTERNAL_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized")

    if file.size and file.size > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large")

    image_bytes = await file.read()

    log.info("OCR request", filename=file.filename, size=len(image_bytes))

    raw_text = await run_ocr(image_bytes)
    medicines = extract_medicines(raw_text)

    log.info("OCR complete", chars=len(raw_text), medicines_found=len(medicines))

    return OCRResult(
        raw_text=raw_text,
        medicines=medicines,
        confidence=_estimate_confidence(raw_text),
    )


# ── Async endpoint: process + callback to NestJS ──────────────────────────────
@app.post("/ocr/process-async")
async def process_async(
    background_tasks: BackgroundTasks,
    prescription_id: str,
    image_url: str,
    x_internal_secret: str = Header(None),
):
    """Download image from Cloudinary signed URL, OCR it, callback NestJS."""
    if x_internal_secret != settings.BACKEND_INTERNAL_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized")

    background_tasks.add_task(
        _process_and_callback, prescription_id, image_url
    )
    return {"status": "queued", "prescription_id": prescription_id}


async def _process_and_callback(prescription_id: str, image_url: str):
    import httpx
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(image_url)
            resp.raise_for_status()
            image_bytes = resp.content

        raw_text = await run_ocr(image_bytes)
        medicines = extract_medicines(raw_text)
        confidence = _estimate_confidence(raw_text)

        await notify_backend(prescription_id, raw_text, medicines, confidence)
        log.info("Async OCR done", prescription_id=prescription_id)

    except Exception as exc:
        log.error("Async OCR failed", prescription_id=prescription_id, error=str(exc))
        await notify_backend(prescription_id, "", [], 0.0, error=str(exc))


def _estimate_confidence(text: str) -> float:
    """Heuristic confidence based on text quality indicators."""
    if not text or len(text) < 20:
        return 0.1
    word_count = len(text.split())
    has_rx_keywords = any(k in text.lower() for k in [
        "tablet", "capsule", "mg", "ml", "syrup", "injection",
        "rx", "dr.", "doctor", "prescribed", "twice", "daily",
    ])
    score = min(0.5 + (word_count / 200) + (0.3 if has_rx_keywords else 0), 1.0)
    return round(score, 2)
