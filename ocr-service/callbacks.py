"""Retry-safe HTTP callback to the NestJS backend."""
from __future__ import annotations
import logging

import httpx
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

from config import settings
from schemas import ExtractResponse

logger = logging.getLogger(__name__)


@retry(
    retry=retry_if_exception_type((httpx.TransportError, httpx.TimeoutException)),
    wait=wait_exponential(multiplier=1, min=2, max=30),
    stop=stop_after_attempt(5),
    reraise=True,
)
async def send_ocr_result(prescription_id: str, result: ExtractResponse) -> None:
    """
    POST the OCR result back to the NestJS backend.

    Retries up to 5 times with exponential back-off on network errors.
    The INTERNAL_SECRET header lets NestJS authenticate the callback.
    """
    url = f"{settings.backend_url}/api/v1/prescriptions/{prescription_id}/ocr-result"

    payload = {
        "success":    result.success,
        "engineUsed": result.engine_used,
        "rawText":    result.raw_text,
        "medicines":  [m.model_dump() for m in result.medicines],
        "confidence": result.confidence,
    }

    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.post(
            url,
            json=payload,
            headers={
                "x-internal-secret": settings.internal_secret,
                "Content-Type":      "application/json",
            },
        )
        response.raise_for_status()

    logger.info("OCR callback delivered for prescription %s", prescription_id)
