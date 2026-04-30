# VaidyaMarg OCR Microservice

FastAPI service that extracts medicine names from prescription images.

## Engines

| Engine | Accuracy | Setup |
|---|---|---|
| **Google Cloud Vision** | ~95% | Add `credentials/gcloud.json` + set `OCR_ENGINE=google` |
| **Tesseract** (fallback) | ~75% | Pre-installed in Docker — zero config |

The service **automatically falls back to Tesseract** if Google Vision fails or returns too little text.

## Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/ocr/extract` | Sync: upload image → get result immediately |
| `POST` | `/ocr/process-async` | Async: give image URL → OCR runs in background → POSTs result to NestJS |

All endpoints require `x-internal-secret` header.

## Running locally

```bash
cd ocr-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Running with Docker

```bash
docker build -t vaidyamarg-ocr .
docker run -p 8000:8000 --env-file .env vaidyamarg-ocr
```

## Running tests

```bash
cd ocr-service
pytest app/ocr/tests/ -v
```

## Image Preprocessing Pipeline

```
Raw image
  → Upscale if width < 1000px (LANCZOS)
  → Convert to greyscale
  → Contrast ×2.0
  → Sharpness ×2.0
  → Median filter (denoise)
  → Feed to OCR engine
```

## Medicine Extraction

The extractor uses:
1. **Regex pattern** — matches `Tab./Cap./Inj./Syrup` prefixes + Title Case medicine names + dosage (mg/mcg/ml)
2. **Frequency parser** — detects OD, BD, TDS, QID, SOS, PRN, HS, etc.
3. **Duration parser** — detects "for X days/weeks/months"
4. **Stop-word filter** — removes common English words that look like names
5. **Confidence scoring** — 0.0–1.0 based on dosage + frequency + duration presence

## Callback to NestJS

The async endpoint POSTs to `BACKEND_CALLBACK_URL` with:
```json
{
  "prescriptionId": "uuid",
  "rawText": "full OCR text...",
  "medicines": [
    { "name": "Metformin", "dosage": "500mg", "frequency": "BD", "duration": "30 days", "confidence": 0.9 }
  ],
  "confidence": 0.87,
  "error": null
}
```
Retries up to **4 times** with exponential backoff if the backend is temporarily unavailable.
