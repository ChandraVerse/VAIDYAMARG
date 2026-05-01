"""Parse raw OCR text → structured medicine list."""
from __future__ import annotations
import re
from schemas import MedicineItem

# ---------------------------------------------------------------------------
# Regex patterns
# ---------------------------------------------------------------------------

# Dosage: 500mg, 10 mg, 5ml, 0.5 mcg, 1000 IU, etc.
_DOSAGE_RE = re.compile(
    r"\b(\d+(?:\.\d+)?\s*(?:mg|mcg|g|ml|iu|units?|tabs?|caps?))\b",
    re.IGNORECASE,
)

# Frequency: OD, BD, TDS, QID, once daily, twice a day, every 8 hours, etc.
_FREQ_RE = re.compile(
    r"\b("
    r"once\s+daily|twice\s+(?:a\s+)?day|thrice\s+(?:a\s+)?day"
    r"|\d+\s*times?\s*(?:a\s*)?day"
    r"|every\s+\d+\s*hours?"
    r"|OD|BD|TDS|QID|SOS|PRN"
    r")\b",
    re.IGNORECASE,
)

# Duration: 5 days, 2 weeks, 1 month, etc.
_DUR_RE = re.compile(
    r"\b(\d+\s*(?:days?|weeks?|months?|years?))\b",
    re.IGNORECASE,
)

# Common Indian drug suffixes / prefixes to help identify medicine tokens
_DRUG_SUFFIX_RE = re.compile(
    r"\b(\w+(?:cillin|mycin|floxacin|azole|olol|pril|sartan|statin|prazole|dipine"
    r"|metformin|glipizide|thyroxine|insulin|ibuprofen|paracetamol|acetaminophen"
    r"|aspirin|amoxicillin|azithromycin|cefixime|cetirizine|pantoprazole"
    r"|omeprazole|atorvastatin|losartan|amlodipine|metoprolol|enalapril"
    r"|hydrochlorothiazide|furosemide|spironolactone|digoxin|warfarin"
    r"|montelukast|salbutamol|budesonide|fluticasone|prednisolone"
    r"|dexamethasone|hydroxychloroquine|methotrexate|tamoxifen|ondansetron"
    r"|domperidone|ranitidine|fexofenadine|levocetirizine|desloratadine))\b",
    re.IGNORECASE,
)

# Lines that look like medicine entries start with Rx/, Tab., Cap., Inj., Syr.
_RX_LINE_RE = re.compile(
    r"^\s*(Rx\.?/?|Tab\.?|Cap\.?|Inj\.?|Syr\.?|Oint\.?|Drop\.?)\s*(.+)",
    re.IGNORECASE,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _clean(text: str) -> str:
    return re.sub(r"[^\x20-\x7E\n]", " ", text).strip()


def _extract_first(pattern: re.Pattern, text: str) -> str | None:
    m = pattern.search(text)
    return m.group(1).strip() if m else None


# ---------------------------------------------------------------------------
# Main extractor
# ---------------------------------------------------------------------------

def extract_medicines(raw_text: str) -> list[MedicineItem]:
    """
    Two-pass strategy:
      Pass 1 — Lines starting with Rx/Tab/Cap/Inj/Syr → high-confidence candidates
      Pass 2 — Any token matching known drug suffixes not already captured
    """
    text = _clean(raw_text)
    medicines: list[MedicineItem] = []
    seen_names: set[str] = set()

    # ---------- Pass 1: structured Rx lines ----------
    for line in text.splitlines():
        m = _RX_LINE_RE.match(line)
        if not m:
            continue

        raw_line = m.group(2).strip()
        # Medicine name = everything before the first dosage/digit token
        name_match = re.split(r"\s+\d", raw_line)
        name = name_match[0].strip() if name_match else raw_line

        # Strip trailing punctuation
        name = re.sub(r"[^\w\s-]+$", "", name).strip()
        if not name or name.lower() in seen_names:
            continue

        seen_names.add(name.lower())
        medicines.append(
            MedicineItem(
                name=name,
                dosage=_extract_first(_DOSAGE_RE, raw_line),
                frequency=_extract_first(_FREQ_RE, raw_line),
                duration=_extract_first(_DUR_RE, raw_line),
                raw_text=raw_line,
            )
        )

    # ---------- Pass 2: drug-suffix scan ----------
    for match in _DRUG_SUFFIX_RE.finditer(text):
        candidate = match.group(1).strip()
        if candidate.lower() in seen_names:
            continue
        seen_names.add(candidate.lower())

        # Grab surrounding context (± 80 chars) to extract dosage/freq/dur
        start = max(0, match.start() - 40)
        end   = min(len(text), match.end() + 80)
        context = text[start:end]

        medicines.append(
            MedicineItem(
                name=candidate,
                dosage=_extract_first(_DOSAGE_RE, context),
                frequency=_extract_first(_FREQ_RE, context),
                duration=_extract_first(_DUR_RE, context),
                raw_text=context.strip(),
            )
        )

    return medicines
