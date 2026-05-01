"""
Integration tests for main.py FastAPI routes.

Uses FastAPI's TestClient (httpx under the hood).
All OCR engine calls are mocked — no Tesseract or Vision needed.
"""
from __future__ import annotations
import base64
import io
import sys
import os
from unittest.mock import patch, MagicMock

import pytest
from fastapi.testclient import TestClient
import PIL.Image as PILImage

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

# ---------------------------------------------------------------------------
# Mock settings before importing main
# ---------------------------------------------------------------------------

class _MockSettings:
    ocr_engine = "tesseract"
    google_application_credentials = ""
    internal_secret = "test-secret"
    backend_url = "http://localhost:3000"


MOCK_OCR_RESULT = MagicMock()
MOCK_OCR_RESULT.text = "Tab. Metformin 500mg BD x 3 months"
MOCK_OCR_RESULT.engine = "tesseract"
MOCK_OCR_RESULT.confidence = 0.88

VALID_SECRET = "test-secret"
BAD_SECRET   = "wrong-secret"


@pytest.fixture(scope="module")
def client():
    with (
        patch("config.settings", _MockSettings()),
        patch("ocr.engine.settings", _MockSettings()),
    ):
        from main import app
        with TestClient(app, raise_server_exceptions=True) as c:
            yield c


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

class TestHealth:
    def test_health_returns_ok(self, client):
        resp = client.get("/health")
        assert resp.status_code == 200
        assert resp.json()["status"] == "ok"

    def test_health_includes_engine(self, client):
        resp = client.get("/health")
        assert "engine" in resp.json()


# ---------------------------------------------------------------------------
# /ocr/extract — sync base64
# ---------------------------------------------------------------------------

class TestExtractSync:
    def _valid_b64(self) -> str:
        buf = io.BytesIO()
        PILImage.new("RGB", (100, 50), color=255).save(buf, format="JPEG")
        return base64.b64encode(buf.getvalue()).decode()

    def test_extract_returns_200(self, client):
        with patch("main.extract_text", return_value=MOCK_OCR_RESULT):
            resp = client.post(
                "/ocr/extract",
                json={"image_base64": self._valid_b64(), "mime_type": "image/jpeg"},
                headers={"x-internal-secret": VALID_SECRET},
            )
        assert resp.status_code == 200

    def test_extract_response_schema(self, client):
        with patch("main.extract_text", return_value=MOCK_OCR_RESULT):
            resp = client.post(
                "/ocr/extract",
                json={"image_base64": self._valid_b64()},
                headers={"x-internal-secret": VALID_SECRET},
            )
        data = resp.json()
        assert data["success"] is True
        assert "engine_used" in data
        assert "medicines" in data
        assert isinstance(data["medicines"], list)
        assert "confidence" in data

    def test_extract_missing_secret_returns_401(self, client):
        resp = client.post(
            "/ocr/extract",
            json={"image_base64": self._valid_b64()},
            # No x-internal-secret header
        )
        assert resp.status_code == 401

    def test_extract_wrong_secret_returns_401(self, client):
        resp = client.post(
            "/ocr/extract",
            json={"image_base64": self._valid_b64()},
            headers={"x-internal-secret": BAD_SECRET},
        )
        assert resp.status_code == 401

    def test_extract_invalid_base64_returns_422(self, client):
        resp = client.post(
            "/ocr/extract",
            json={"image_base64": "!!!not-base64!!!"},
            headers={"x-internal-secret": VALID_SECRET},
        )
        assert resp.status_code == 422


# ---------------------------------------------------------------------------
# /ocr/extract-file — sync multipart
# ---------------------------------------------------------------------------

class TestExtractFile:
    def _jpeg_bytes(self) -> bytes:
        buf = io.BytesIO()
        PILImage.new("RGB", (100, 50), color=255).save(buf, format="JPEG")
        return buf.getvalue()

    def test_extract_file_returns_200(self, client):
        with patch("main.extract_text", return_value=MOCK_OCR_RESULT):
            resp = client.post(
                "/ocr/extract-file",
                files={"file": ("rx.jpg", self._jpeg_bytes(), "image/jpeg")},
                headers={"x-internal-secret": VALID_SECRET},
            )
        assert resp.status_code == 200

    def test_extract_file_no_secret_returns_401(self, client):
        resp = client.post(
            "/ocr/extract-file",
            files={"file": ("rx.jpg", self._jpeg_bytes(), "image/jpeg")},
        )
        assert resp.status_code == 401


# ---------------------------------------------------------------------------
# /ocr/process-async
# ---------------------------------------------------------------------------

class TestProcessAsync:
    def test_async_returns_202_accepted(self, client):
        resp = client.post(
            "/ocr/process-async",
            json={
                "image_url": "https://res.cloudinary.com/demo/sample.jpg",
                "prescription_id": "clxtest123",
            },
            headers={"x-internal-secret": VALID_SECRET},
        )
        # FastAPI returns 200 for response_model=AsyncAccepted (not 202),
        # unless we explicitly set status_code=202 on the route.
        assert resp.status_code in (200, 202)
        data = resp.json()
        assert data["accepted"] is True
        assert data["prescription_id"] == "clxtest123"

    def test_async_no_secret_returns_401(self, client):
        resp = client.post(
            "/ocr/process-async",
            json={
                "image_url": "https://res.cloudinary.com/demo/sample.jpg",
                "prescription_id": "clxtest456",
            },
        )
        assert resp.status_code == 401
