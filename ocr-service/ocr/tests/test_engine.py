"""
Unit tests for ocr/engine.py

All external dependencies (Google Vision, Tesseract, Pillow) are mocked.
No real OCR is performed — we test engine selection logic, fallback
behaviour, and the OCRResult dataclass contract.
"""
from __future__ import annotations
import sys
import os
import io
import types
from dataclasses import dataclass
from unittest.mock import MagicMock, patch, PropertyMock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

import pytest


# ---------------------------------------------------------------------------
# Minimal stub for config.settings before importing engine
# ---------------------------------------------------------------------------

class _FakeSettings:
    ocr_engine = "auto"
    google_application_credentials = ""  # empty → Vision unavailable


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

class TestOCRResult:
    def test_dataclass_fields(self):
        """OCRResult must expose .text, .engine, .confidence."""
        from ocr.engine import OCRResult
        r = OCRResult(text="hello", engine="tesseract", confidence=0.75)
        assert r.text == "hello"
        assert r.engine == "tesseract"
        assert 0.0 <= r.confidence <= 1.0

    def test_confidence_zero_is_valid(self):
        from ocr.engine import OCRResult
        r = OCRResult(text="", engine="none", confidence=0.0)
        assert r.confidence == 0.0


class TestVisionExtract:
    def test_returns_none_when_no_credentials(self):
        """_vision_extract returns None when GOOGLE_APPLICATION_CREDENTIALS is empty."""
        with patch("ocr.engine.settings", _FakeSettings()):
            from ocr.engine import _vision_extract
            result = _vision_extract(b"fake-image-bytes")
        assert result is None

    def test_returns_none_when_creds_file_missing(self):
        fake = _FakeSettings()
        fake.google_application_credentials = "/nonexistent/path/credentials.json"
        with patch("ocr.engine.settings", fake):
            from ocr.engine import _vision_extract
            result = _vision_extract(b"fake-image-bytes")
        assert result is None


class TestTesseractExtract:
    def test_returns_ocr_result(self):
        """_tesseract_extract returns an OCRResult with engine='tesseract'."""
        import PIL.Image as PILImage

        # Create a tiny real 1x1 white JPEG so Pillow doesn't complain
        buf = io.BytesIO()
        PILImage.new("RGB", (100, 30), color=(255, 255, 255)).save(buf, format="JPEG")
        fake_bytes = buf.getvalue()

        mock_data = {
            "text": ["Tab", "Amoxicillin", "500mg", ""],
            "conf": [90, 88, 85, -1],
        }
        mock_string = "Tab Amoxicillin 500mg"

        with (
            patch("ocr.engine.settings", _FakeSettings()),
            patch("ocr.engine.preprocess", return_value=fake_bytes),
            patch("pytesseract.image_to_data", return_value=mock_data),
            patch("pytesseract.image_to_string", return_value=mock_string),
        ):
            from ocr.engine import _tesseract_extract
            result = _tesseract_extract(fake_bytes)

        assert result.engine == "tesseract"
        assert result.text == mock_string
        assert 0.0 <= result.confidence <= 1.0


class TestExtractTextAutoMode:
    def test_auto_falls_back_to_tesseract_when_vision_unavailable(self):
        """In auto mode with no Vision creds, should return Tesseract result."""
        import PIL.Image as PILImage
        import io

        buf = io.BytesIO()
        PILImage.new("RGB", (100, 30), color=(255, 255, 255)).save(buf, format="JPEG")
        fake_bytes = buf.getvalue()

        fake_settings = _FakeSettings()
        fake_settings.ocr_engine = "auto"

        mock_data = {"text": ["Metformin"], "conf": [90]}

        with (
            patch("ocr.engine.settings", fake_settings),
            patch("ocr.engine.preprocess", return_value=fake_bytes),
            patch("pytesseract.image_to_data", return_value=mock_data),
            patch("pytesseract.image_to_string", return_value="Metformin 500mg"),
        ):
            from ocr.engine import extract_text
            result = extract_text(fake_bytes)

        assert result.engine == "tesseract"

    def test_tesseract_mode_bypasses_vision(self):
        import PIL.Image as PILImage, io

        buf = io.BytesIO()
        PILImage.new("RGB", (100, 30), color=(255, 255, 255)).save(buf, format="JPEG")
        fake_bytes = buf.getvalue()

        fake_settings = _FakeSettings()
        fake_settings.ocr_engine = "tesseract"

        with (
            patch("ocr.engine.settings", fake_settings),
            patch("ocr.engine.preprocess", return_value=fake_bytes),
            patch("pytesseract.image_to_data", return_value={"text": [], "conf": []}),
            patch("pytesseract.image_to_string", return_value=""),
        ):
            from ocr.engine import extract_text
            result = extract_text(fake_bytes)

        assert result.engine == "tesseract"

    def test_vision_mode_raises_when_unavailable(self):
        fake_settings = _FakeSettings()
        fake_settings.ocr_engine = "vision"
        fake_settings.google_application_credentials = ""

        with (
            patch("ocr.engine.settings", fake_settings),
            pytest.raises(RuntimeError, match="Google Vision unavailable"),
        ):
            from ocr.engine import extract_text
            extract_text(b"fake")
