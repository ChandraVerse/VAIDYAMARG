import re
from dataclasses import dataclass, field
from typing import Optional
import structlog

log = structlog.get_logger()

# ── Common Indian medicine name patterns ──────────────────────────────────────
# Matches: "Tab. Metformin 500mg", "Inj. Amoxicillin", "Syrup Paracetamol",
#          "Cap. Omeprazole 20mg", "Metformin 500 mg OD"
MED_PATTERN = re.compile(
    r"(?:"
    r"(?:Tab(?:let)?|Cap(?:sule)?|Inj(?:ection)?|Syr(?:up)?|Oint(?:ment)?|Drops?|Cream|Gel|Patch|Powder)[s.]?\s*"
    r")?"  # optional prefix
    r"([A-Z][a-zA-Z]+(?:[\s-][A-Z][a-zA-Z]+)?)"  # medicine name (Title Case)
    r"\s*"  # optional space
    r"(\d+\.?\d*\s*(?:mg|mcg|g|ml|iu|IU|%))?",  # optional dose
    re.MULTILINE,
)

# Dosage/frequency patterns
DOSAGE_PATTERN = re.compile(
    r"(\d+\.?\d*\s*(?:mg|mcg|g|ml|iu|IU|%))",
    re.IGNORECASE,
)

FREQUENCY_PATTERN = re.compile(
    r"\b(OD|BD|TDS|QID|SOS|PRN|HS|AC|PC|Twice\s+daily|Once\s+daily|Thrice\s+daily|\d+\s*times?\s+daily)\b",
    re.IGNORECASE,
)

DURATION_PATTERN = re.compile(
    r"\bfor\s+(\d+)\s*(days?|weeks?|months?)\b",
    re.IGNORECASE,
)

# Stop-words: common English words that look like medicine names but aren't
STOP_WORDS = {
    "The", "For", "And", "With", "Take", "Use", "Apply", "After",
    "Before", "Daily", "Twice", "Once", "Patient", "Doctor", "Date",
    "Name", "Age", "Sex", "Male", "Female", "Address", "Diagnosis",
    "Advice", "Review", "Follow", "Next", "Visit", "Test", "Blood",
    "Pressure", "Sugar", "Weight", "Height", "Pulse", "Temp", "Sign",
    "Reg", "Hospital", "Clinic", "Centre", "Medical", "Health",
}


@dataclass
class ExtractedMedicine:
    name: str
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    duration: Optional[str] = None
    raw_line: str = ""
    confidence: float = 0.5


def extract_medicines(text: str) -> list[dict]:
    """
    Extract medicine names with dosage, frequency, and duration
    from raw OCR text of a prescription.

    Returns a list of dicts ready for JSON serialisation.
    """
    if not text or len(text.strip()) < 5:
        return []

    lines   = text.split("\n")
    results: list[ExtractedMedicine] = []
    seen:    set[str] = set()

    for line in lines:
        line = line.strip()
        if not line or len(line) < 3:
            continue

        meds_on_line = _parse_line(line)
        for med in meds_on_line:
            key = med.name.lower()
            if key not in seen:
                seen.add(key)
                results.append(med)

    log.debug("Medicine extraction", total_lines=len(lines), found=len(results))
    return [_to_dict(m) for m in results]


def _parse_line(line: str) -> list[ExtractedMedicine]:
    found = []

    for match in MED_PATTERN.finditer(line):
        name   = match.group(1).strip()
        dosage = match.group(2)

        # Filter noise
        if len(name) < 4:
            continue
        if name in STOP_WORDS:
            continue
        if not re.search(r"[a-z]", name):          # all-uppercase is likely a header
            continue
        if re.match(r"^\d+$", name):               # pure number
            continue
        if len(name.split()) > 5:                  # too many words — probably a sentence
            continue

        # Extract frequency + duration from the surrounding line
        freq_match = FREQUENCY_PATTERN.search(line)
        dur_match  = DURATION_PATTERN.search(line)

        # Boost confidence if the line has dosage keywords
        confidence = 0.6
        if dosage:
            confidence += 0.2
        if freq_match:
            confidence += 0.1
        if dur_match:
            confidence += 0.1

        found.append(ExtractedMedicine(
            name=name,
            dosage=dosage.strip() if dosage else None,
            frequency=freq_match.group(1).strip() if freq_match else None,
            duration=f"{dur_match.group(1)} {dur_match.group(2)}" if dur_match else None,
            raw_line=line,
            confidence=round(min(confidence, 1.0), 2),
        ))

    return found


def _to_dict(med: ExtractedMedicine) -> dict:
    return {
        "name":       med.name,
        "dosage":     med.dosage,
        "frequency":  med.frequency,
        "duration":   med.duration,
        "raw_line":   med.raw_line,
        "confidence": med.confidence,
    }
