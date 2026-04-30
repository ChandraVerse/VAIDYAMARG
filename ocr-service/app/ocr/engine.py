import asyncio
import io
import structlog
from PIL import Image, ImageFilter, ImageEnhance

from ..config import settings

log = structlog.get_logger()


async def run_ocr(image_bytes: bytes) -> str:
    """Route to the configured OCR engine. Always returns raw text string."""
    preprocessed = _preprocess_image(image_bytes)

    if settings.OCR_ENGINE == "google":
        try:
            text = await _google_vision_ocr(preprocessed)
            if text and len(text.strip()) > 10:
                return text
            log.warning("Google Vision returned little text, falling back to Tesseract")
        except Exception as exc:
            log.error("Google Vision failed, falling back", error=str(exc))

    return await _tesseract_ocr(preprocessed)


def _preprocess_image(image_bytes: bytes) -> bytes:
    """
    Enhance image quality before OCR:
    - Convert to greyscale
    - Increase contrast
    - Sharpen
    - Resize if too small (< 1000px wide)
    """
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        # Upscale small images
        w, h = img.size
        if w < 1000:
            scale = 1000 / w
            img = img.resize((int(w * scale), int(h * scale)), Image.LANCZOS)

        # Greyscale
        grey = img.convert("L")

        # Contrast boost
        grey = ImageEnhance.Contrast(grey).enhance(2.0)

        # Sharpness
        grey = ImageEnhance.Sharpness(grey).enhance(2.0)

        # Light denoise
        grey = grey.filter(ImageFilter.MedianFilter(size=3))

        buf = io.BytesIO()
        grey.save(buf, format="PNG")
        return buf.getvalue()

    except Exception as exc:
        log.warning("Image preprocessing failed, using original", error=str(exc))
        return image_bytes


async def _google_vision_ocr(image_bytes: bytes) -> str:
    """Use Google Cloud Vision DOCUMENT_TEXT_DETECTION for high accuracy."""
    from google.cloud import vision

    client = vision.ImageAnnotatorClient()
    image  = vision.Image(content=image_bytes)

    # Run in thread pool to avoid blocking
    loop     = asyncio.get_event_loop()
    response = await loop.run_in_executor(
        None,
        lambda: client.document_text_detection(image=image),
    )

    if response.error.message:
        raise RuntimeError(f"Vision API error: {response.error.message}")

    return response.full_text_annotation.text


async def _tesseract_ocr(image_bytes: bytes) -> str:
    """Tesseract OCR fallback — runs in thread pool."""
    import pytesseract

    img  = Image.open(io.BytesIO(image_bytes))
    config = "--oem 3 --psm 6 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,/()-: "

    loop = asyncio.get_event_loop()
    text = await loop.run_in_executor(
        None,
        lambda: pytesseract.image_to_string(img, lang="eng", config=config),
    )
    return text
