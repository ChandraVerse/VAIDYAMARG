import pytest
from ..extractor import extract_medicines


SAMPLE_RX = """
Dr. Ramesh Kumar, MBBS, MD
City Hospital, Kolkata
Date: 10/04/2026

Patient: Arjun Das   Age: 45   Sex: Male
Diagnosis: Type 2 Diabetes + Hypertension

Rx:
1. Tab. Metformin 500mg BD x 30 days
2. Tab. Amlodipine 5mg OD for 30 days
3. Tab. Atorvastatin 10mg HS for 90 days
4. Cap. Pantoprazole 40mg AC
5. Syrup Amoxicillin 250ml TDS x 7 days

Advice: Low sugar diet. Walk 30 min daily.
Review after 1 month.

Dr. Ramesh Kumar
Reg. No: MCI/12345
"""


def test_extract_known_medicines():
    results = extract_medicines(SAMPLE_RX)
    names   = [r["name"].lower() for r in results]

    assert any("metformin" in n   for n in names), f"Metformin not found in {names}"
    assert any("amlodipine" in n  for n in names), f"Amlodipine not found in {names}"
    assert any("atorvastatin" in n for n in names), f"Atorvastatin not found in {names}"
    assert any("pantoprazole" in n for n in names), f"Pantoprazole not found in {names}"
    assert any("amoxicillin" in n for n in names),  f"Amoxicillin not found in {names}"


def test_dosage_extraction():
    results = extract_medicines(SAMPLE_RX)
    metformin = next((r for r in results if "metformin" in r["name"].lower()), None)
    assert metformin is not None
    assert metformin["dosage"] is not None
    assert "500" in metformin["dosage"]


def test_frequency_extraction():
    results   = extract_medicines(SAMPLE_RX)
    metformin = next((r for r in results if "metformin" in r["name"].lower()), None)
    assert metformin is not None
    assert metformin["frequency"] is not None
    assert "BD" in metformin["frequency"].upper() or "bd" in metformin["frequency"].lower()


def test_empty_text():
    assert extract_medicines("") == []
    assert extract_medicines("   ") == []


def test_no_false_positives():
    results = extract_medicines(SAMPLE_RX)
    names   = [r["name"] for r in results]
    # These should NOT appear as medicines
    for bad in ["The", "For", "Patient", "Doctor", "Daily", "Date"]:
        assert bad not in names, f"False positive: {bad}"
