"""Pytest tests for the medicine extractor."""
import pytest
from ocr.extractor import extract_medicines


SAMPLE_PRESCRIPTION = """
Date: 12/04/2026
Dr. Arjun Mehta | MD General Medicine
Patient: Ravi Kumar  Age: 52

Rx/
Tab. Amoxicillin 500mg BD x 7 days
Tab. Paracetamol 650mg TDS x 5 days
Cap. Pantoprazole 40mg OD before breakfast x 14 days
Syr. Azithromycin 200mg/5ml once daily x 3 days

Advice: Plenty of fluids. Follow up in 1 week.
"""


def test_extracts_multiple_medicines():
    items = extract_medicines(SAMPLE_PRESCRIPTION)
    names = [i.name.lower() for i in items]
    assert any("amoxicillin" in n for n in names)
    assert any("paracetamol" in n for n in names)
    assert len(items) >= 3


def test_dosage_extracted():
    items = extract_medicines(SAMPLE_PRESCRIPTION)
    amox = next((i for i in items if "amoxicillin" in i.name.lower()), None)
    assert amox is not None
    assert amox.dosage is not None
    assert "500" in amox.dosage


def test_frequency_extracted():
    items = extract_medicines(SAMPLE_PRESCRIPTION)
    para = next((i for i in items if "paracetamol" in i.name.lower()), None)
    assert para is not None
    assert para.frequency is not None
    assert "TDS" in para.frequency.upper() or "3" in para.frequency


def test_empty_text_returns_empty_list():
    assert extract_medicines("") == []
    assert extract_medicines("   \n  ") == []
