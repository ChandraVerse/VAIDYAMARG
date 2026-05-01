"""
Unit tests for app.ocr.engine — image preprocessing + OCR routing.
"""
import io
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from PIL import Image

from app.ocr.engine import _preprocess_image, run_ocr


# ── _preprocess_image ─────────────────────────────────────────────────────────
class TestPreprocessImage:
    def _make_png(self, width=400, height=300) -> bytes:
        img = Image.new("RGB", (width, height), color="white")
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        return buf.getvalue()

    def test_returns_bytes(self):
        result = _preprocess_image(self._make_png())
        assert isinstance(result, bytes)
        assert len(result) > 0

    def test_output_is_valid_image(self):
        result = _preprocess_image(self._make_png())
        img = Image.open(io.BytesIO(result))
        assert img.mode in ("L", "RGB", "RGBA")

    def test_small_image_upscaled(self):
        """Images narrower than 1000px should be upscaled."""
        result = _preprocess_image(self._make_png(width=300, height=200))
        img = Image.open(io.BytesIO(result))
        assert img.width >= 1000

    def test_already_large_image_not_upscaled(self):
        """Images already >= 1000px wide should not change width."""
        original = self._make_png(width=1200, height=900)
        result = _preprocess_image(original)
        img = Image.open(io.BytesIO(result))
        assert img.width == 1200

    def test_invalid_bytes_returns_original(self):
        """Corrupt bytes should be passed through without exception."""
        junk = b"notanimage1234"
        result = _preprocess_image(junk)
        assert result == junk


# ── run_ocr ───────────────────────────────────────────────────────────────────
class TestRunOcr:
    def _make_png(self) -> bytes:
        img = Image.new("RGB", (800, 600), color="white")
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        return buf.getvalue()

    @pytest.mark.asyncio
    async def test_tesseract_engine_returns_string(self):
        """With OCR_ENGINE=tesseract, run_ocr should always return a str."""
        with patch("app.ocr.engine.settings") as mock_settings:
            mock_settings.OCR_ENGINE = "tesseract"
            with patch("app.ocr.engine._tesseract_ocr", new_callable=AsyncMock) as mock_t:
                mock_t.return_value = "Tab. Metformin 500mg BD"
                result = await run_ocr(self._make_png())
                assert isinstance(result, str)
                assert "Metformin" in result

    @pytest.mark.asyncio
    async def test_google_engine_falls_back_on_empty_result(self):
        """If Google Vision returns < 10 chars, fall back to Tesseract."""
        with patch("app.ocr.engine.settings") as mock_settings:
            mock_settings.OCR_ENGINE = "google"
            with patch("app.ocr.engine._google_vision_ocr", new_callable=AsyncMock) as mock_g, \
                 patch("app.ocr.engine._tesseract_ocr",     new_callable=AsyncMock) as mock_t:
                mock_g.return_value = ""          # Google returns nothing
                mock_t.return_value = "Fallback text from Tesseract"
                result = await run_ocr(self._make_png())
                mock_t.assert_called_once()
                assert result == "Fallback text from Tesseract"

    @pytest.mark.asyncio
    async def test_google_engine_uses_google_when_successful(self):
        """If Google Vision returns sufficient text, Tesseract should NOT be called."""
        with patch("app.ocr.engine.settings") as mock_settings:
            mock_settings.OCR_ENGINE = "google"
            with patch("app.ocr.engine._google_vision_ocr", new_callable=AsyncMock) as mock_g, \
                 patch("app.ocr.engine._tesseract_ocr",     new_callable=AsyncMock) as mock_t:
                mock_g.return_value = "Tab. Metformin 500mg BD x 30 days"
                result = await run_ocr(self._make_png())
                mock_t.assert_not_called()
                assert "Metformin" in result

    @pytest.mark.asyncio
    async def test_google_engine_falls_back_on_exception(self):
        """If Google Vision raises, fall back to Tesseract without crashing."""
        with patch("app.ocr.engine.settings") as mock_settings:
            mock_settings.OCR_ENGINE = "google"
            with patch("app.ocr.engine._google_vision_ocr", new_callable=AsyncMock) as mock_g, \
                 patch("app.ocr.engine._tesseract_ocr",     new_callable=AsyncMock) as mock_t:
                mock_g.side_effect = RuntimeError("Vision API quota exceeded")
                mock_t.return_value = "Fallback via exception path"
                result = await run_ocr(self._make_png())
                mock_t.assert_called_once()
                assert result == "Fallback via exception path"
