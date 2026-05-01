from __future__ import annotations
from typing import Optional
from pydantic import BaseModel, HttpUrl


# ---------- Inbound ----------

class ExtractSyncRequest(BaseModel):
    """Sync extraction — caller uploads a base64-encoded image."""
    image_base64: str
    mime_type: str = "image/jpeg"  # image/jpeg | image/png | application/pdf


class ProcessAsyncRequest(BaseModel):
    """Async extraction — caller provides a Cloudinary URL + callback info."""
    image_url: str
    prescription_id: str
    callback_path: str = "/prescriptions/{id}/ocr-result"  # path template


# ---------- Outbound ----------

class MedicineItem(BaseModel):
    name: str
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    duration: Optional[str] = None
    raw_text: Optional[str] = None


class ExtractResponse(BaseModel):
    success: bool
    engine_used: str  # "google_vision" | "tesseract"
    raw_text: str
    medicines: list[MedicineItem]
    confidence: float  # 0.0 – 1.0


class AsyncAccepted(BaseModel):
    accepted: bool
    prescription_id: str
    message: str
