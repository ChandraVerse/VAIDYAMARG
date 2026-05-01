"""VaidyaMarg OCR Microservice — FastAPI entry point."""
from __future__ import annotations
import asyncio
import base64
import logging
from contextlib import asynccontextmanager
from typing import Annotated

import httpx
from fastapi import FastAPI, File, Form, HTTPException, Header, UploadFile, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from callbacks import send_ocr_result
from config import settings
from ocr.engine import extract_text
from ocr.extractor import extract_medicines
from schemas import (
    AsyncAccepted,
    ExtractResponse,
    ExtractSyncRequest,
    MedicineItem,
    ProcessAsyncRequest,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# App lifecycle
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("OCR service starting — engine=%s", settings.ocr_engine)
    yield
    logger.info("OCR service shutting down")


app = FastAPI(
    title="VaidyaMarg OCR Service",
    description="Prescription OCR microservice — Google Vision + Tesseract",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.backend_url, "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Auth helper
# ---------------------------------------------------------------------------

def _require_internal(x_internal_secret: str | None) -> None:
    if x_internal_secret != settings.internal_secret:
        raise HTTPException(status_code=401, detail="Unauthorized")


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/health", tags=["Health"])
async def health_check():
    """Kubernetes / Docker healthcheck endpoint."""
    return {"status": "ok", "engine": settings.ocr_engine}


@app.post("/ocr/extract", response_model=ExtractResponse, tags=["OCR"])
async def extract_sync(
    request: ExtractSyncRequest,
    x_internal_secret: Annotated[str | None, Header()] = None,
):
    """
    Synchronous extraction.

    Caller sends a base64-encoded image; receives extracted medicines immediately.
    Used by NestJS when the client is waiting for a response (mobile upload flow).
    """
    _require_internal(x_internal_secret)

    try:
        image_bytes = base64.b64decode(request.image_base64)
    except Exception:
        raise HTTPException(status_code=422, detail="Invalid base64 image")

    try:
        ocr_result = extract_text(image_bytes)
    except Exception as exc:
        logger.exception("OCR engine failed")
        raise HTTPException(status_code=500, detail=f"OCR engine error: {exc}")

    medicines = extract_medicines(ocr_result.text)

    return ExtractResponse(
        success=True,
        engine_used=ocr_result.engine,
        raw_text=ocr_result.text,
        medicines=medicines,
        confidence=ocr_result.confidence,
    )


@app.post("/ocr/extract-file", response_model=ExtractResponse, tags=["OCR"])
async def extract_sync_file(
    file: UploadFile = File(...),
    x_internal_secret: Annotated[str | None, Header()] = None,
):
    """
    Synchronous extraction via multipart file upload.

    Convenience endpoint for testing — accepts a raw image file instead of base64.
    """
    _require_internal(x_internal_secret)

    image_bytes = await file.read()

    try:
        ocr_result = extract_text(image_bytes)
    except Exception as exc:
        logger.exception("OCR engine failed")
        raise HTTPException(status_code=500, detail=f"OCR engine error: {exc}")

    medicines = extract_medicines(ocr_result.text)

    return ExtractResponse(
        success=True,
        engine_used=ocr_result.engine,
        raw_text=ocr_result.text,
        medicines=medicines,
        confidence=ocr_result.confidence,
    )


@app.post("/ocr/process-async", response_model=AsyncAccepted, tags=["OCR"])
async def process_async(
    request: ProcessAsyncRequest,
    background_tasks: BackgroundTasks,
    x_internal_secret: Annotated[str | None, Header()] = None,
):
    """
    Asynchronous extraction.

    NestJS provides a Cloudinary URL + prescription ID.
    The service downloads the image, runs OCR, and POSTs results back
    to NestJS via the callback endpoint — with up to 5 retry attempts.
    """
    _require_internal(x_internal_secret)

    async def _run():
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.get(request.image_url)
                resp.raise_for_status()
                image_bytes = resp.content

            ocr_result  = extract_text(image_bytes)
            medicines   = extract_medicines(ocr_result.text)

            result = ExtractResponse(
                success=True,
                engine_used=ocr_result.engine,
                raw_text=ocr_result.text,
                medicines=medicines,
                confidence=ocr_result.confidence,
            )

            await send_ocr_result(request.prescription_id, result)

        except Exception:
            logger.exception(
                "Async OCR failed for prescription %s", request.prescription_id
            )
            # Post a failure result so the backend can mark the prescription accordingly
            failure = ExtractResponse(
                success=False,
                engine_used="none",
                raw_text="",
                medicines=[],
                confidence=0.0,
            )
            try:
                await send_ocr_result(request.prescription_id, failure)
            except Exception:
                logger.exception("Callback also failed — giving up")

    background_tasks.add_task(_run)

    return AsyncAccepted(
        accepted=True,
        prescription_id=request.prescription_id,
        message="OCR job accepted and processing in background",
    )
