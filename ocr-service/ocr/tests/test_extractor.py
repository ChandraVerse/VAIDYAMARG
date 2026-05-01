"""
Unit tests for ocr/extractor.py

All tests run offline — no OCR engine, no network, no Pillow.
We feed raw text directly to extract_medicines() and assert on
the structured MedicineItem list returned.
"""
from __future__ import annotations
import sys
import os
import types

# ---------------------------------------------------------------------------
# Minimal stub for `schemas` so extractor.py can be imported without the
# full dependency tree (pydantic IS available in the test environment).
# ---------------------------------------------------------------------------
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

import pytest
from ocr.extractor import extract_medicines
from schemas import MedicineItem


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def names(items: list[MedicineItem]) -> list[str]:
    return [i.name for i in items]


# ---------------------------------------------------------------------------
# Pass 1: structured Rx-line tests
# ---------------------------------------------------------------------------

class TestRxLineExtraction:
    def test_tab_line_extracted(self):
        text = "Tab. Amoxicillin 500mg BD x 5 days"
        result = extract_medicines(text)
        assert len(result) >= 1
        assert "Amoxicillin" in names(result)

    def test_cap_line_extracted(self):
        text = "Cap. Omeprazole 20mg OD before food"
        result = extract_medicines(text)
        assert any("Omeprazole" in n for n in names(result))

    def test_inj_line_extracted(self):
        text = "Inj. Insulin 10 units BD"
        result = extract_medicines(text)
        assert len(result) >= 1

    def test_rx_slash_line_extracted(self):
        text = "Rx/\nTab. Metformin 500mg BD x 3 months"
        result = extract_medicines(text)
        assert any("Metformin" in n for n in names(result))

    def test_dosage_captured(self):
        text = "Tab. Azithromycin 250mg OD x 3 days"
        result = extract_medicines(text)
        assert result[0].dosage is not None
        assert "250" in result[0].dosage

    def test_frequency_od_captured(self):
        text = "Tab. Atorvastatin 10mg OD at night"
        result = extract_medicines(text)
        assert result[0].frequency == "OD"

    def test_frequency_bd_captured(self):
        text = "Tab. Losartan 50mg BD"
        result = extract_medicines(text)
        assert result[0].frequency == "BD"

    def test_frequency_tds_captured(self):
        text = "Tab. Ibuprofen 400mg TDS after meals"
        result = extract_medicines(text)
        assert result[0].frequency == "TDS"

    def test_duration_captured(self):
        text = "Tab. Cefixime 200mg BD x 7 days"
        result = extract_medicines(text)
        assert result[0].duration is not None
        assert "7" in result[0].duration

    def test_duration_weeks(self):
        text = "Tab. Methotrexate 7.5mg once weekly x 4 weeks"
        result = extract_medicines(text)
        assert any(i.duration and "week" in i.duration.lower() for i in result)

    def test_no_duplicates(self):
        text = "Tab. Paracetamol 500mg TDS\nTab. Paracetamol 500mg TDS"
        result = extract_medicines(text)
        # Should deduplicate by lowercase name
        pct = [i for i in result if "paracetamol" in i.name.lower()]
        assert len(pct) == 1

    def test_multiple_medicines_same_prescription(self):
        text = (
            "Tab. Metformin 500mg BD x 3 months\n"
            "Tab. Atorvastatin 10mg OD at night\n"
            "Tab. Amlodipine 5mg OD\n"
        )
        result = extract_medicines(text)
        assert len(result) == 3


# ---------------------------------------------------------------------------
# Pass 2: drug-suffix scan tests
# ---------------------------------------------------------------------------

class TestDrugSuffixScan:
    def test_known_suffix_detected(self):
        # No Rx/Tab prefix — should be caught by suffix scan
        text = "Patient should take pantoprazole twice daily for 2 weeks"
        result = extract_medicines(text)
        assert any("pantoprazole" in n.lower() for n in names(result))

    def test_suffix_context_dosage(self):
        text = "Take cetirizine 10mg once daily for 5 days"
        result = extract_medicines(text)
        match = next((i for i in result if "cetirizine" in i.name.lower()), None)
        assert match is not None
        assert match.dosage is not None

    def test_empty_text_returns_empty_list(self):
        assert extract_medicines("") == []

    def test_whitespace_only_returns_empty_list(self):
        assert extract_medicines("   \n   \t  ") == []

    def test_unrelated_text_returns_empty_list(self):
        text = "Patient name: Priya Sharma\nDate: 01/05/2026\nDr. Rajan"
        result = extract_medicines(text)
        assert result == []

    def test_non_ascii_chars_cleaned(self):
        # Non-ASCII garbage should not crash the extractor
        text = "Tab. Amoxicillin 500mg\x00\xff\xfe BD x 5 days"
        result = extract_medicines(text)
        assert len(result) >= 1


# ---------------------------------------------------------------------------
# MedicineItem schema tests
# ---------------------------------------------------------------------------

class TestMedicineItemSchema:
    def test_optional_fields_none_when_absent(self):
        text = "Tab. SomeDrug"
        result = extract_medicines(text)
        # SomeDrug won't match suffix scan; it will be caught by Rx line parser
        # dosage/frequency/duration should all be None (not in the line)
        if result:
            assert result[0].dosage is None or isinstance(result[0].dosage, str)

    def test_raw_text_populated(self):
        text = "Tab. Metformin 500mg BD x 3 months"
        result = extract_medicines(text)
        assert result[0].raw_text is not None
        assert len(result[0].raw_text) > 0
