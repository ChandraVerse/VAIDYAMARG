"""
Shared pytest fixtures for the OCR service test suite.
"""
import io
import pytest
from PIL import Image, ImageDraw, ImageFont
from fastapi.testclient import TestClient

from app.main import app


# ── App client ────────────────────────────────────────────────────────────────
@pytest.fixture(scope="module")
def client():
    """Synchronous FastAPI test client."""
    with TestClient(app) as c:
        yield c


# ── Fake internal secret ──────────────────────────────────────────────────────
@pytest.fixture(scope="session")
def internal_secret(monkeypatch=None):
    """Return the test secret that matches the default dev config."""
    return "test-internal-secret"


# ── Synthetic prescription image ─────────────────────────────────────────────
def _make_prescription_image(text: str) -> bytes:
    """Render plain text onto a white 800x600 PNG and return raw bytes."""
    img = Image.new("RGB", (800, 600), color="white")
    draw = ImageDraw.Draw(img)
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 18)
    except Exception:
        font = ImageFont.load_default()
    draw.multiline_text((40, 40), text, fill="black", font=font, spacing=8)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


PRESCRIPTION_TEXT = (
    "Dr. A. Sharma  MB BS\n"
    "Date: 01/05/2026\n"
    "Patient: Rahul Kumar  Age: 34  M\n\n"
    "Rx\n"
    "Tab. Metformin 500mg  BD x 30 days\n"
    "Cap. Omeprazole 20mg  OD AC x 14 days\n"
    "Syrup Paracetamol 250ml  TDS x 5 days\n"
    "Tab. Amlodipine 5mg  OD HS x 30 days\n"
)


@pytest.fixture(scope="session")
def prescription_image_bytes():
    return _make_prescription_image(PRESCRIPTION_TEXT)


@pytest.fixture(scope="session")
def tiny_image_bytes():
    """A near-blank image that should yield low confidence."""
    return _make_prescription_image("hello")
