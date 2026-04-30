import httpx
import structlog
from tenacity import retry, stop_after_attempt, wait_exponential

from .config import settings

log = structlog.get_logger()


@retry(
    stop=stop_after_attempt(4),
    wait=wait_exponential(multiplier=1, min=2, max=30),
)
async def notify_backend(
    prescription_id: str,
    raw_text: str,
    medicines: list[dict],
    confidence: float,
    error: str | None = None,
) -> None:
    """POST OCR results back to the NestJS backend with retry logic."""
    payload = {
        "prescriptionId": prescription_id,
        "rawText":        raw_text,
        "medicines":      medicines,
        "confidence":     confidence,
        "error":          error,
    }

    log.info("Notifying backend", prescription_id=prescription_id, medicines=len(medicines))

    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.post(
            settings.BACKEND_CALLBACK_URL,
            json=payload,
            headers={
                "x-internal-secret": settings.BACKEND_INTERNAL_SECRET,
                "Content-Type":      "application/json",
            },
        )
        resp.raise_for_status()

    log.info("Backend notified successfully", prescription_id=prescription_id)
