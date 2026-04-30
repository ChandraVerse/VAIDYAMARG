from pydantic import BaseModel
from typing import Optional


class ExtractedMedicineSchema(BaseModel):
    name:       str
    dosage:     Optional[str] = None
    frequency:  Optional[str] = None
    duration:   Optional[str] = None
    raw_line:   str = ""
    confidence: float = 0.5


class OCRResult(BaseModel):
    raw_text:   str
    medicines:  list[ExtractedMedicineSchema]
    confidence: float


class OCRRequest(BaseModel):
    prescription_id: str
    image_url:       str
