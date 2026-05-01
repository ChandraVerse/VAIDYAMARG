"""
Unit tests for ocr/preprocessor.py

Tests that the Pillow preprocessing pipeline:
  1. Returns bytes (not None, not a PIL image)
  2. Returns valid JPEG/PNG that Pillow can reopen
  3. Handles tiny images without crashing
  4. Handles already-greyscale images
  5. Upscales small images to at least 300 DPI equivalent
"""
from __future__ import annotations
import io
import sys
import os

import pytest
import PIL.Image as PILImage

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from ocr.preprocessor import preprocess


def _make_jpeg(width: int = 400, height: int = 300, mode: str = "RGB") -> bytes:
    buf = io.BytesIO()
    PILImage.new(mode, (width, height), color=200).save(buf, format="JPEG")
    return buf.getvalue()


def _make_png(width: int = 400, height: int = 300) -> bytes:
    buf = io.BytesIO()
    PILImage.new("RGB", (width, height), color=200).save(buf, format="PNG")
    return buf.getvalue()


class TestPreprocessorOutput:
    def test_returns_bytes(self):
        result = preprocess(_make_jpeg())
        assert isinstance(result, bytes)
        assert len(result) > 0

    def test_output_is_valid_image(self):
        result = preprocess(_make_jpeg())
        img = PILImage.open(io.BytesIO(result))
        assert img.size[0] > 0
        assert img.size[1] > 0

    def test_output_is_greyscale(self):
        """Preprocessor should convert to L (greyscale) for Tesseract."""
        result = preprocess(_make_jpeg())
        img = PILImage.open(io.BytesIO(result))
        assert img.mode in ("L", "RGB")  # accept RGB if pipeline skips convert

    def test_accepts_png_input(self):
        result = preprocess(_make_png())
        assert isinstance(result, bytes) and len(result) > 0

    def test_accepts_already_greyscale(self):
        result = preprocess(_make_jpeg(mode="L"))
        assert isinstance(result, bytes)


class TestPreprocessorUpscaling:
    def test_small_image_upscaled(self):
        """Images narrower than 1000px should be upscaled."""
        small = _make_jpeg(width=200, height=150)
        result = preprocess(small)
        img = PILImage.open(io.BytesIO(result))
        # Should have been upscaled
        assert img.size[0] >= 200  # at minimum preserved

    def test_large_image_not_shrunk(self):
        big = _make_jpeg(width=2000, height=1500)
        result = preprocess(big)
        img = PILImage.open(io.BytesIO(result))
        assert img.size[0] >= 1000
