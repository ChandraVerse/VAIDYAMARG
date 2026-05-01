"""
Unit tests for callbacks.py — the Tenacity retry logic that POSTs
OCR results back to the NestJS backend.
"""
from __future__ import annotations
import sys
import os
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
import httpx

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

class _MockSettings:
    backend_url = "http://localhost:3000"
    internal_secret = "test-secret"


def _make_extract_response(success: bool = True):
    from schemas import ExtractResponse, MedicineItem
    return ExtractResponse(
        success=success,
        engine_used="tesseract",
        raw_text="Tab. Metformin 500mg BD" if success else "",
        medicines=[
            MedicineItem(name="Metformin", dosage="500mg", frequency="BD", duration="3 months")
        ] if success else [],
        confidence=0.88 if success else 0.0,
    )


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

class TestSendOcrResult:
    @pytest.mark.asyncio
    async def test_successful_callback(self):
        """Happy path — backend returns 200, no retries."""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.raise_for_status = MagicMock()

        mock_client = AsyncMock()
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=False)
        mock_client.post = AsyncMock(return_value=mock_response)

        with (
            patch("callbacks.settings", _MockSettings()),
            patch("httpx.AsyncClient", return_value=mock_client),
        ):
            from callbacks import send_ocr_result
            await send_ocr_result("rx_123", _make_extract_response(success=True))

        mock_client.post.assert_called_once()
        call_args = mock_client.post.call_args
        # Verify the correct prescription ID is in the URL
        assert "rx_123" in call_args[0][0]

    @pytest.mark.asyncio
    async def test_payload_contains_required_fields(self):
        """The JSON body sent to NestJS must contain all ExtractResponse fields."""
        posted_json = {}

        async def capture_post(url, **kwargs):
            posted_json.update(kwargs.get("json", {}))
            m = MagicMock()
            m.raise_for_status = MagicMock()
            return m

        mock_client = AsyncMock()
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=False)
        mock_client.post = capture_post

        with (
            patch("callbacks.settings", _MockSettings()),
            patch("httpx.AsyncClient", return_value=mock_client),
        ):
            from callbacks import send_ocr_result
            await send_ocr_result("rx_abc", _make_extract_response())

        assert "success" in posted_json
        assert "medicines" in posted_json
        assert "engine_used" in posted_json
        assert "confidence" in posted_json

    @pytest.mark.asyncio
    async def test_failure_payload_sent_on_ocr_error(self):
        """A failure ExtractResponse (success=False) is still sent correctly."""
        mock_response = MagicMock()
        mock_response.raise_for_status = MagicMock()

        mock_client = AsyncMock()
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=False)
        mock_client.post = AsyncMock(return_value=mock_response)

        with (
            patch("callbacks.settings", _MockSettings()),
            patch("httpx.AsyncClient", return_value=mock_client),
        ):
            from callbacks import send_ocr_result
            await send_ocr_result("rx_fail", _make_extract_response(success=False))

        mock_client.post.assert_called_once()

    @pytest.mark.asyncio
    async def test_internal_secret_header_sent(self):
        """x-internal-secret header must be present on every callback request."""
        captured_headers = {}

        async def capture_post(url, **kwargs):
            captured_headers.update(kwargs.get("headers", {}))
            m = MagicMock()
            m.raise_for_status = MagicMock()
            return m

        mock_client = AsyncMock()
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=False)
        mock_client.post = capture_post

        with (
            patch("callbacks.settings", _MockSettings()),
            patch("httpx.AsyncClient", return_value=mock_client),
        ):
            from callbacks import send_ocr_result
            await send_ocr_result("rx_hdr", _make_extract_response())

        assert "x-internal-secret" in captured_headers
        assert captured_headers["x-internal-secret"] == "test-secret"
