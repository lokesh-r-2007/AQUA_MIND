"""
Tests for Continuous Sensor Simulator and Scenario Triggering in AQUAMIND.
"""

import pytest
import json
import pandas as pd
from datetime import datetime

from src.simulation.campus_network import CampusNetworkSimulator
from src.simulation.sensor_simulator import ContinuousSensorSimulator
from src.config import CAMPUS_ZONES


def test_campus_simulator_all_six_zones_present():
    """Verify that CampusNetworkSimulator steps all 6 zones and updates central reservoir."""
    sim = CampusNetworkSimulator(seed=42)
    ts = pd.Timestamp("2024-01-01 10:00:00")

    batch, records = sim.step(
        timestamp=ts,
        temperature_c=25.0,
        precipitation_mm=0.0,
        relative_humidity_pct=55.0,
        weather_source="synthetic_fallback",
    )

    assert len(batch.zones) == 6
    assert len(records) == 6
    assert batch.central_reservoir_level_pct > 0.0
    assert batch.central_reservoir_volume_liters > 0.0
    
    zone_ids = [z.zone_id for z in batch.zones]
    for zid in CAMPUS_ZONES.keys():
        assert zid in zone_ids


def test_leak_scenarios_all_severities():
    """Verify triggering normal, minor, moderate, and major leak scenarios."""
    sim = CampusNetworkSimulator(seed=42)
    ts = pd.Timestamp("2024-01-01 11:00:00")

    # Minor leak
    sim.trigger_leak("zone_1_academic_north", severity="minor", start_time=str(ts), leak_rate_lph=200.0)
    batch_minor, recs_minor = sim.step(ts, 25.0, 0.0, 55.0, "open_meteo")
    z1_rec = next(r for r in recs_minor if r.telemetry.zone_id == "zone_1_academic_north")
    assert z1_rec.ground_truth.ground_truth_leak_status == 1
    assert z1_rec.ground_truth.ground_truth_leak_severity == "minor"

    # Moderate leak
    sim.trigger_leak("zone_2_research_labs", severity="moderate", start_time=str(ts), leak_rate_lph=800.0)
    batch_mod, recs_mod = sim.step(ts, 25.0, 0.0, 55.0, "open_meteo")
    z2_rec = next(r for r in recs_mod if r.telemetry.zone_id == "zone_2_research_labs")
    assert z2_rec.ground_truth.ground_truth_leak_status == 1
    assert z2_rec.ground_truth.ground_truth_leak_severity == "moderate"

    # Major leak
    sim.trigger_leak("zone_3_student_hostels", severity="major", start_time=str(ts), leak_rate_lph=3500.0)
    batch_maj, recs_maj = sim.step(ts, 25.0, 0.0, 55.0, "open_meteo")
    z3_rec = next(r for r in recs_maj if r.telemetry.zone_id == "zone_3_student_hostels")
    assert z3_rec.ground_truth.ground_truth_leak_status == 1
    assert z3_rec.ground_truth.ground_truth_leak_severity == "major"
    # Severe leak causes noticeable pressure drop
    assert z3_rec.telemetry.supply_pressure_bar < 2.5

    # Stop leak returns to normal
    sim.stop_leak("zone_1_academic_north")
    _, recs_stop = sim.step(ts, 25.0, 0.0, 55.0, "open_meteo")
    z1_stop = next(r for r in recs_stop if r.telemetry.zone_id == "zone_1_academic_north")
    assert z1_stop.ground_truth.ground_truth_leak_status == 0
    assert z1_stop.ground_truth.ground_truth_leak_severity == "none"


def test_sensor_fault_separated_from_real_leak():
    """Verify that sensor failures are distinct from physical leaks."""
    sim = CampusNetworkSimulator(seed=42)
    ts = pd.Timestamp("2024-01-01 14:00:00")

    # Inject sensor drift on outlet flow in Zone 4 (Dining)
    sim.trigger_sensor_fault(
        zone_id="zone_4_dining_cafeteria",
        fault_type="sensor_drift",
        affected_sensor="outlet_flow",
        drift_rate_pct_per_hour=3.0,
        duration_hours=6,
    )

    batch, recs = sim.step(ts, 26.0, 0.0, 50.0, "open_meteo")
    z4_rec = next(r for r in recs if r.telemetry.zone_id == "zone_4_dining_cafeteria")

    # The anomaly is a sensor fault, NOT a physical pipe leak!
    assert z4_rec.ground_truth.ground_truth_leak_status == 0
    assert z4_rec.ground_truth.ground_truth_anomaly_status == 1
    assert z4_rec.ground_truth.ground_truth_anomaly_type == "sensor_drift"


def test_json_streaming_interface_for_fastapi():
    """Verify that batch models serialize to valid JSON payloads."""
    runner = ContinuousSensorSimulator(seed=42)
    batch = runner.step_single_hour()
    json_str = batch.model_dump_json()

    parsed = json.loads(json_str)
    assert "batch_timestamp" in parsed
    assert "central_reservoir_level_pct" in parsed
    assert "zones" in parsed
    assert len(parsed["zones"]) == 6

