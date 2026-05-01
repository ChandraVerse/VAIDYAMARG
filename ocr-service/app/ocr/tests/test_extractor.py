"""
Unit tests for app.ocr.extractor — medicine name + dosage extraction.
"""
import pytest
from app.ocr.extractor import extract_medicines, _parse_line, ExtractedMedicine


# ── _parse_line ───────────────────────────────────────────────────────────────
class TestParseLine:
    def test_tablet_with_dose_and_frequency(self):
        meds = _parse_line("Tab. Metformin 500mg BD x 30 days")
        assert any(m.name == "Metformin" for m in meds)
        met = next(m for m in meds if m.name == "Metformin")
        assert met.dosage == "500mg"
        assert met.frequency is not None
        assert "BD" in met.frequency.upper()
        assert met.duration == "30 days"

    def test_capsule_detection(self):
        meds = _parse_line("Cap. Omeprazole 20mg OD AC")
        assert any(m.name == "Omeprazole" for m in meds)

    def test_syrup_detection(self):
        meds = _parse_line("Syrup Paracetamol 250ml TDS")
        assert any(m.name == "Paracetamol" for m in meds)

    def test_injection_detection(self):
        meds = _parse_line("Inj. Amoxicillin 500mg IM")
        assert any(m.name == "Amoxicillin" for m in meds)

    def test_stop_words_excluded(self):
        """Common English words that look like medicine names must be filtered."""
        meds = _parse_line("Take Before Daily")
        names = [m.name for m in meds]
        assert "Take" not in names
        assert "Before" not in names
        assert "Daily" not in names

    def test_short_tokens_excluded(self):
        """Tokens under 4 chars must be rejected."""
        meds = _parse_line("Tab. ORS 1g OD")
        names = [m.name for m in meds]
        assert "ORS" not in names

    def test_confidence_increases_with_dosage(self):
        meds_with_dose    = _parse_line("Tab. Metformin 500mg OD x 30 days")
        meds_without_dose = _parse_line("Tab. Metformin OD")
        if meds_with_dose and meds_without_dose:
            assert meds_with_dose[0].confidence >= meds_without_dose[0].confidence

    def test_empty_line_returns_empty(self):
        assert _parse_line("") == []
        assert _parse_line("   ") == []

    def test_pure_number_excluded(self):
        meds = _parse_line("1234")
        assert meds == []


# ── extract_medicines ─────────────────────────────────────────────────────────
class TestExtractMedicines:
    FULL_RX = (
        "Dr. A. Sharma  MB BS\n"
        "Patient: Rahul  Age: 34\n\n"
        "Rx\n"
        "Tab. Metformin 500mg  BD x 30 days\n"
        "Cap. Omeprazole 20mg  OD AC x 14 days\n"
        "Syrup Paracetamol 250ml  TDS x 5 days\n"
        "Tab. Amlodipine 5mg  OD HS x 30 days\n"
    )

    def test_returns_list_of_dicts(self):
        result = extract_medicines(self.FULL_RX)
        assert isinstance(result, list)
        assert all(isinstance(r, dict) for r in result)

    def test_known_medicines_present(self):
        result = extract_medicines(self.FULL_RX)
        names = [r["name"] for r in result]
        assert "Metformin" in names
        assert "Omeprazole" in names
        assert "Paracetamol" in names

    def test_no_duplicates(self):
        result = extract_medicines(self.FULL_RX)
        names = [r["name"].lower() for r in result]
        assert len(names) == len(set(names))

    def test_dict_keys_present(self):
        result = extract_medicines(self.FULL_RX)
        required_keys = {"name", "dosage", "frequency", "duration", "raw_line", "confidence"}
        for item in result:
            assert required_keys.issubset(item.keys())

    def test_empty_string_returns_empty(self):
        assert extract_medicines("") == []

    def test_short_string_returns_empty(self):
        assert extract_medicines("hi") == []

    def test_confidence_is_float_between_0_and_1(self):
        result = extract_medicines(self.FULL_RX)
        for item in result:
            assert 0.0 <= item["confidence"] <= 1.0
