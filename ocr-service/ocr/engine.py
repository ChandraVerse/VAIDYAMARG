"""OCR engine — Google Cloud Vision (primary) + Tesseract (fallback)."""
from __future__ import annotations
import base64
import io
import os
from dataclasses import dataclass

import pytesseract
from PIL import Image

from config import settings
from ocr.preprocessor import preprocess


@dataclass
class OCRResult:
    text: str
    engine: str
    confidence: float


# ---------------------------------------------------------------------------
# Google Cloud Vision
# ---------------------------------------------------------------------------

def _vision_extract(image_bytes: bytes) -> OCRResult | None:
    """Return OCR result from Google Cloud Vision, or None if unavailable."""
    creds_path = settings.google_application_credentials
    if not creds_path or not os.path.isfile(creds_path):
        return None

    try:
        from google.cloud import vision  # type: ignore

        client = vision.ImageAnnotatorClient()
        image = vision.Image(content=image_bytes)
        response = client.document_text_detection(image=image)

        if response.error.message:
            return None

        full_text = response.full_text_annotation.text or ""

        # Average word-level confidence
        confidences: list[float] = []
        for page in response.full_text_annotation.pages:
            for block in page.blocks:
                for para in block.paragraphs:
                    for word in para.words:
                        confidences.append(word.confidence)

        avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0

        return OCRResult(text=full_text, engine="google_vision", confidence=avg_confidence)

    except Exception:
        return None


# ---------------------------------------------------------------------------
# Tesseract
# ---------------------------------------------------------------------------

def _tesseract_extract(image_bytes: bytes) -> OCRResult:
    """Always available; returns extracted text via Tesseract."""
    processed = preprocess(image_bytes)
    img = Image.open(io.BytesIO(processed))

    # oem 3 = LSTM + legacy; psm 6 = assume uniform block of text
    config = r"--oem 3 --psm 6"
    data = pytesseract.image_to_data(img, config=config, output_type=pytesseract.Output.DICT)

    words = [
        w for w, c in zip(data["text"], data["conf"])
        if w.strip() and int(c) > 0
    ]
    confidences = [int(c) / 100 for c in data["conf"] if int(c) > 0]

    text = pytesseract.image_to_string(img, config=config)
    avg_confidence = sum(confidences) / len(confidences) if confidences else 0.5

    return OCRResult(text=text, engine="tesseract", confidence=avg_confidence)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def extract_text(image_bytes: bytes) -> OCRResult:
    """
    Extract text from an image.

    Engine selection controlled by OCR_ENGINE env var:
      "vision"     — Google Vision only (raises if unavailable)
      "tesseract"  — Tesseract only
      "auto"       — Vision first, Tesseract fallback (default)
    """
    mode = settings.ocr_engine.lower()

    if mode == "tesseract":
        return _tesseract_extract(image_bytes)

    if mode == "vision":
        result = _vision_extract(image_bytes)
        if result is None:
            raise RuntimeError("Google Vision unavailable and engine=vision")
        return result

    # auto — Vision first, Tesseract fallback
    result = _vision_extract(image_bytes)
    return result if result is not None else _tesseract_extract(image_bytes)
