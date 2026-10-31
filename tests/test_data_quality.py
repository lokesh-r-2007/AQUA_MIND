"""
Tests for Data Quality, Patterns, and ML Leakage Prevention in AQUAMIND.
"""

import pytest
import pandas as pd
from pathlib import Path

from src.config import DATA_DIR
from src.data.splitter import validate_feature_matrix_leakage, split_features_and_targets
from src.data.patterns import get_academic_calendar_factor, get_zone_diurnal_factor


def test_calendar_factors():
    """Verify academic calendar logic accurately distinguishes weekends and holidays."""
    # Weekend test (Sunday)
    ts_sunday = pd.Timestamp("2024-01-07 10:00:00")
    cal_sun = get_academic_calendar_factor(ts_sunday)
    assert cal_sun["is_weekend"] == 1

    # Weekday test (Wednesday)
    ts_wed = pd.Timestamp("2024-01-10 10:00:00")
    cal_wed = get_academic_calendar_factor(ts_wed)
    assert cal_wed["is_weekend"] == 0

    # National Holiday (Jan 26 - Republic Day)
    ts_rep = pd.Timestamp("2024-01-26 10:00:00")
    cal_rep = get_academic_calendar_factor(ts_rep)
    assert cal_rep["is_holiday"] == 1


def test_diurnal_rhythms_academic_north():
    """Verify academic north zone has high demand during workday and low at night."""
    cal = {"academic_activity_factor": 1.0, "is_weekend": 0}
    day_factor = get_zone_diurnal_factor("zone_1_academic_north", 11, cal)
    night_factor = get_zone_diurnal_factor("zone_1_academic_north", 2, cal)
    assert day_factor > night_factor * 5.0


def test_ml_data_leakage_protection_on_master_dataset():
    """Verify that splitting master dataset leaves zero target labels in X."""
    master_path = DATA_DIR / "master_benchmark_dataset.csv"
    if not master_path.exists():
        pytest.skip("Master dataset not generated yet.")

    X, y = split_features_and_targets(master_path, include_metadata=False)
    
    # Assert X has no ground truth columns
    is_clean, violations = validate_feature_matrix_leakage(X)
    assert is_clean, f"Data leakage found in X: {violations}"
    assert len(violations) == 0

    # Assert y contains target labels
    assert "ground_truth_leak_status" in y.columns
    assert "ground_truth_anomaly_status" in y.columns

