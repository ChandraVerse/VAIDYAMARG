"""Image preprocessing to maximise OCR accuracy."""
from __future__ import annotations
import io
from PIL import Image, ImageEnhance, ImageFilter


def preprocess(image_bytes: bytes) -> bytes:
    """
    Apply a sequence of image enhancements:
      1. Convert to greyscale
      2. Boost contrast  (1.8×)
      3. Sharpen        (2.0×)
      4. Upscale to ≥ 1200 px wide (Tesseract works better on larger images)
      5. Return as JPEG bytes
    """
    img = Image.open(io.BytesIO(image_bytes)).convert("L")  # greyscale

    # Contrast boost
    img = ImageEnhance.Contrast(img).enhance(1.8)

    # Sharpness boost
    img = ImageEnhance.Sharpness(img).enhance(2.0)

    # Unsharp mask for edge clarity
    img = img.filter(ImageFilter.UnsharpMask(radius=1, percent=150, threshold=3))

    # Upscale if too small
    min_width = 1200
    if img.width < min_width:
        scale = min_width / img.width
        img = img.resize(
            (int(img.width * scale), int(img.height * scale)),
            Image.LANCZOS,
        )

    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=92)
    return buf.getvalue()
