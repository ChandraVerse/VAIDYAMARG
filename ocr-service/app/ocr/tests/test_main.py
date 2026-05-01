"""
Integration tests for the FastAPI routes in app.main.
"""
import io
import pytest
from unittest.mock import AsyncMock, patch
from PIL import Image
from fastapi.testclient import TestClient

from app.main import app

TEST_SECRET = "test-internal-secret"

client = TestClient(app)


def _png_bytes(text_hint: str = "") -> bytes:
    img = Image.new("RGB", (800, 600), color="white")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


# ── /health ───────────────────────────────────────────────────────────────────
class TestHealth:
    def test_health_returns_200(self):
        resp = client.get("/health")
        assert resp.status_code == 200

    def test_health_body_has_status_ok(self):
        resp = client.get("/health")
        assert resp.json()["status"] == "ok"

    def test_health_body_has_engine_key(self):
        resp = client.get("/health")
        assert "engine" in resp.json()


# ── /ocr/extract ──────────────────────────────────────────────────────────────
class TestExtractEndpoint:
    def test_missing_secret_returns_401(self):
        img_bytes = _png_bytes()
        resp = client.post(
            "/ocr/extract",
            files={"file": ("rx.png", img_bytes, "image/png")},
        )
        assert resp.status_code == 401

    def test_wrong_secret_returns_401(self):
        img_bytes = _png_bytes()
        resp = client.post(
            "/ocr/extract",
            files={"file": ("rx.png", img_bytes, "image/png")},
            headers={"x-internal-secret": "wrong-secret"},
        )
        assert resp.status_code == 401

    def test_valid_request_returns_200(self):
        with patch("app.main.run_ocr", new_callable=AsyncMock) as mock_ocr, \
             patch("app.main.settings") as mock_settings:
            mock_settings.BACKEND_INTERNAL_SECRET = TEST_SECRET
            mock_settings.MAX_FILE_SIZE_MB = 5
            mock_ocr.return_value = "Tab. Metformin 500mg BD x 30 days"

            resp = client.post(
                "/ocr/extract",
                files={"file": ("rx.png", _png_bytes(), "image/png")},
                headers={"x-internal-secret": TEST_SECRET},
            )
            assert resp.status_code == 200

    def test_valid_request_response_shape(self):
        with patch("app.main.run_ocr", new_callable=AsyncMock) as mock_ocr, \
             patch("app.main.settings") as mock_settings:
            mock_settings.BACKEND_INTERNAL_SECRET = TEST_SECRET
            mock_settings.MAX_FILE_SIZE_MB = 5
            mock_ocr.return_value = "Tab. Metformin 500mg BD x 30 days"

            resp = client.post(
                "/ocr/extract",
                files={"file": ("rx.png", _png_bytes(), "image/png")},
                headers={"x-internal-secret": TEST_SECRET},
            )
            body = resp.json()
            assert "raw_text"   in body
            assert "medicines"  in body
            assert "confidence" in body
            assert isinstance(body["medicines"],  list)
            assert isinstance(body["confidence"], float)

    def test_confidence_is_between_0_and_1(self):
        with patch("app.main.run_ocr", new_callable=AsyncMock) as mock_ocr, \
             patch("app.main.settings") as mock_settings:
            mock_settings.BACKEND_INTERNAL_SECRET = TEST_SECRET
            mock_settings.MAX_FILE_SIZE_MB = 5
            mock_ocr.return_value = "Tab. Metformin 500mg BD x 30 days"

            resp = client.post(
                "/ocr/extract",
                files={"file": ("rx.png", _png_bytes(), "image/png")},
                headers={"x-internal-secret": TEST_SECRET},
            )
            assert 0.0 <= resp.json()["confidence"] <= 1.0


# ── /ocr/process-async ────────────────────────────────────────────────────────
class TestProcessAsyncEndpoint:
    def test_missing_secret_returns_401(self):
        resp = client.post(
            "/ocr/process-async",
            params={"prescription_id": "abc123", "image_url": "https://example.com/rx.png"},
        )
        assert resp.status_code == 401

    def test_valid_request_queued(self):
        with patch("app.main.settings") as mock_settings:
            mock_settings.BACKEND_INTERNAL_SECRET = TEST_SECRET
            mock_settings.MAX_FILE_SIZE_MB = 5

            resp = client.post(
                "/ocr/process-async",
                params={"prescription_id": "abc123", "image_url": "https://example.com/rx.png"},
                headers={"x-internal-secret": TEST_SECRET},
            )
            assert resp.status_code == 200
            assert resp.json()["status"] == "queued"
            assert resp.json()["prescription_id"] == "abc123"
