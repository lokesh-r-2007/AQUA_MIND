"""
Tests for AquaMind AI Intelligence Modules.
Verifies Anomaly Detection, Leak Classification, Demand Forecasting,
and Shortage Risk calculations without data leakage.
"""

import pytest
import pandas as pd
import numpy as np

from backend.core.config import SAVED_MODELS_DIR, CAMPUS_BUILDINGS
from ai.anomaly_detection.detector import WaterAnomalyDetector
from ai.leak_prediction.classifier import LeakClassifier
from ai.demand_forecasting.forecaster import DemandForecaster
from ai.shortage_prediction.risk_engine import ShortageRiskEngine


def test_anomaly_detector_loading_and_prediction():
    """Verify Anomaly Detector loads and outputs binary anomaly and continuous score."""
    detector = WaterAnomalyDetector.load(SAVED_MODELS_DIR)
    assert detector.is_fitted

    sample = pd.DataFrame([{
        "water_consumption_liters": 3500.0,
        "flow_rate_lpm": 58.0,
        "pressure_bar": 2.2,
        "tank_level_percent": 45.0,
        "night_flow_lpm": 18.0,
        "occupancy": 300,
        "temperature": 27.0,
        "rainfall": 0.0,
        "humidity": 55.0,
        "hour_of_day": 14,
        "day_of_week": 2,
    }])

    is_anom, scores = detector.predict(sample)
    assert len(is_anom) == 1
    assert is_anom[0] in (0, 1)
    assert len(scores) == 1

    diag = detector.diagnose_category(sample.iloc[0])
    assert isinstance(diag, str)


def test_leak_classifier_prediction_and_confidence():
    """Verify Leak Classifier predicts severity tier with calibrated probabilities."""
    clf = LeakClassifier.load(SAVED_MODELS_DIR)
    assert clf.is_fitted

    # High flow + low pressure condition (leak symptom)
    sample = pd.DataFrame([{
        "flow_rate_lpm": 65.0,
        "pressure_bar": 1.9,
        "night_flow_lpm": 22.0,
        "water_consumption_liters": 3900.0,
        "tank_level_percent": 35.0,
        "occupancy": 150,
        "temperature": 26.0,
        "rainfall": 0.0,
        "humidity": 50.0,
        "hour_of_day": 3,
        "is_weekend": 0,
    }])

    preds, confs, prob_dicts = clf.predict(sample)
    assert len(preds) == 1
    assert preds[0] in ("none", "minor", "moderate", "major")
    assert 0.0 <= confs[0] <= 1.0

    status_info = clf.format_status_label(preds[0], confs[0])
    assert "status_code" in status_info
    assert "confidence_percent" in status_info


def test_demand_forecaster_multi_horizon():
    """Verify Demand Forecaster produces valid multi-step hourly predictions."""
    forecaster = DemandForecaster.load(SAVED_MODELS_DIR)
    assert forecaster.is_fitted

    res = forecaster.forecast_next_hours(hours_ahead=12)
    assert res["forecast_horizon_hours"] == 12
    assert len(res["campus_hourly_total_liters"]) == 12
    assert all(v >= 0.0 for v in res["campus_hourly_total_liters"])
    assert "hostel_a" in res["building_forecasts"]
    assert len(res["building_forecasts"]["hostel_a"]) == 12


def test_shortage_risk_logic():
    """Verify shortage risk logic is explainable and logically grounded."""
    # Healthy tank + high central reservoir => Low Risk
    res_low = ShortageRiskEngine.evaluate_building_risk(
        building_id="hostel_a",
        current_tank_level_pct=90.0,
        current_tank_volume_liters=54000.0,
        forecast_demand_24h_liters=40000.0,
        central_reservoir_level_pct=85.0,
    )
    assert res_low["risk_tier"] == "Low Risk"
    assert res_low["hours_of_storage_remaining"] > 24.0

    # Depleted tank (5 hours storage remaining) => High Risk
    res_high = ShortageRiskEngine.evaluate_building_risk(
        building_id="hostel_a",
        current_tank_level_pct=15.0,
        current_tank_volume_liters=9000.0,
        forecast_demand_24h_liters=48000.0,
        central_reservoir_level_pct=30.0,
    )
    assert res_high["risk_tier"] == "High Risk"
    assert res_high["hours_of_storage_remaining"] < 8.0
    assert "critically low" in res_high["reason"].lower()

