from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import pytesseract
from PIL import Image
import requests
import spacy
import io
import re
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("vaidyamarg-ocr")

app = FastAPI(
    title="VaidyaMarg AI / OCR Service",
    description="Prescription OCR and medicine extraction service",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://backend:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load spaCy NLP model
try:
    nlp = spacy.load("en_core_web_sm")
    logger.info("spaCy model loaded successfully")
except Exception as e:
    logger.warning(f"spaCy model not found: {e}")
    nlp = None


# ─── Models ───────────────────────────────────────────────────────────────
class OcrRequest(BaseModel):
    image_url: str
    prescription_id: str

class MedicineExtracted(BaseModel):
    name: str
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    duration: Optional[str] = None

class OcrResponse(BaseModel):
    prescription_id: str
    medicines: List[MedicineExtracted]
    doctor_name: Optional[str] = None
    patient_name: Optional[str] = None
    raw_text: str
    confidence: float


# ─── Helpers ──────────────────────────────────────────────────────────────
def download_image(url: str) -> Image.Image:
    """Download image from URL."""
    response = requests.get(url, timeout=15)
    response.raise_for_status()
    return Image.open(io.BytesIO(response.content))


def extract_medicines(text: str) -> List[MedicineExtracted]:
    """Basic medicine extraction using regex + NLP."""
    medicines = []
    # Common dosage pattern: Tab./Cap./Syrup followed by medicine name and dosage
    pattern = r'(?:Tab\.?|Cap\.?|Syp\.?|Inj\.?)\s*([A-Za-z]+(?:\s[A-Za-z]+)?)\s*(\d+\s*mg|\d+\s*ml)?\s*([0-9x]+(?:-[0-9]+)*)?'
    matches = re.finditer(pattern, text, re.IGNORECASE)

    for match in matches:
        medicines.append(MedicineExtracted(
            name=match.group(1).strip(),
            dosage=match.group(2).strip() if match.group(2) else None,
            frequency=match.group(3).strip() if match.group(3) else None,
        ))

    return medicines


def extract_names(text: str):
    """Extract doctor and patient names using spaCy NER."""
    doctor_name, patient_name = None, None

    if nlp:
        doc = nlp(text[:500])  # process first 500 chars
        persons = [ent.text for ent in doc.ents if ent.label_ == 'PERSON']
        if len(persons) >= 1:
            doctor_name = persons[0]
        if len(persons) >= 2:
            patient_name = persons[1]

    # Fallback: regex for Dr. prefix
    dr_match = re.search(r'Dr\.?\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)', text)
    if dr_match and not doctor_name:
        doctor_name = dr_match.group(0)

    return doctor_name, patient_name


# ─── Routes ───────────────────────────────────────────────────────────────
@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "vaidyamarg-ocr", "version": "1.0.0"}


@app.post("/ocr/extract", response_model=OcrResponse)
async def extract_prescription(request: OcrRequest):
    """Main OCR endpoint: download image → extract text → parse medicines."""
    try:
        logger.info(f"Processing prescription: {request.prescription_id}")

        # Step 1: Download image
        image = download_image(request.image_url)

        # Step 2: Run Tesseract OCR
        ocr_data = pytesseract.image_to_data(
            image,
            output_type=pytesseract.Output.DICT,
            config='--psm 6 --oem 3',  # Assume uniform block of text
        )
        raw_text = pytesseract.image_to_string(image, config='--psm 6 --oem 3')

        # Step 3: Calculate average confidence
        confidences = [int(c) for c in ocr_data['conf'] if int(c) > 0]
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0

        # Step 4: Extract medicines and names
        medicines = extract_medicines(raw_text)
        doctor_name, patient_name = extract_names(raw_text)

        logger.info(
            f"OCR complete for {request.prescription_id}: "
            f"{len(medicines)} medicines found, confidence: {avg_confidence:.1f}%"
        )

        return OcrResponse(
            prescription_id=request.prescription_id,
            medicines=medicines,
            doctor_name=doctor_name,
            patient_name=patient_name,
            raw_text=raw_text,
            confidence=round(avg_confidence / 100, 2),
        )

    except requests.RequestException as e:
        logger.error(f"Image download failed: {e}")
        raise HTTPException(status_code=422, detail=f"Could not download image: {str(e)}")
    except Exception as e:
        logger.error(f"OCR processing failed: {e}")
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {str(e)}")
