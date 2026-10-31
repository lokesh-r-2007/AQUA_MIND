"""
Tests for Physical Consistency and Hydraulic Constraints in AQUAMIND.
Verifies that tank levels remain in [0%, 100%], mass balance is conserved,
and flows/pressures adhere to real-world physics.
"""

import pytest
import numpy as np
import pandas as pd
from datetime import datetime

from src.config import CAMPUS_ZONES, ZoneConfig
from src.simulation.zone_simulator import ZoneSimulator
from src.simulation.campus_network import CampusNetworkSimulator


def test_zone_tank_bounds_under_heavy_load():
    """Verify tank never drops below 0% or exceeds 100% even under severe demand."""
    cfg = CAMPUS_ZONES["zone_1_academic_north"]
    sim = ZoneSimulator(config=cfg, rng=np.random.default_rng(42))

    # Manually drain the tank to near empty
    sim.current_tank_volume_liters = 50.0  # almost empty

    # Step forward with heavy consumption
    ts = pd.Timestamp("2024-01-15 12:00:00")
    rec = sim.step(
        timestamp=ts,
        temperature_c=35.0,
        precipitation_mm=0.0,
        relative_humidity_pct=40.0,
        weather_source="synthetic_fallback",
        delta_t_hours=1.0,
    )

    assert 0.0 <= rec.telemetry.tank_level_pct <= 100.0
    assert rec.telemetry.tank_volume_liters >= 0.0
    # Low water level must have triggered booster pump ON
    assert rec.telemetry.pump_status == 1


def test_zone_tank_bounds_under_overfill():
    """Verify tank cannot exceed 100% when booster pump runs near full capacity."""
    cfg = CAMPUS_ZONES["zone_4_dining_cafeteria"]
    sim = ZoneSimulator(config=cfg, rng=np.random.default_rng(42))

    # Set volume right at capacity
    sim.current_tank_volume_liters = cfg.tank_capacity_liters
    sim.pump_status = 1  # Force pump ON

    ts = pd.Timestamp("2024-01-15 03:00:00")  # Night idle
    rec = sim.step(
        timestamp=ts,
        temperature_c=18.0,
        precipitation_mm=0.0,
        relative_humidity_pct=70.0,
        weather_source="synthetic_fallback",
        delta_t_hours=1.0,
    )

    assert rec.telemetry.tank_level_pct <= 100.0
    assert rec.telemetry.tank_volume_liters <= cfg.tank_capacity_liters
    # Pump must automatically shut OFF when tank reaches full capacity
    assert rec.telemetry.pump_status == 0


def test_physical_mass_balance_conservation():
    """Verify mass balance equation: Delta V = (Inflow - Outflow) * Delta t."""
    cfg = CAMPUS_ZONES["zone_3_student_hostels"]
    sim = ZoneSimulator(config=cfg, rng=np.random.default_rng(123))

    initial_vol = sim.current_tank_volume_liters
    ts = pd.Timestamp("2024-01-15 08:00:00")
    
    rec = sim.step(
        timestamp=ts,
        temperature_c=22.0,
        precipitation_mm=0.0,
        relative_humidity_pct=60.0,
        weather_source="synthetic_fallback",
        delta_t_hours=1.0,
    )

    expected_delta_v = (rec.telemetry.inlet_flow_rate_lph - rec.telemetry.outlet_flow_rate_lph) * 1.0
    actual_delta_v = rec.telemetry.tank_volume_liters - initial_vol

    # Accounting for realistic sensor noise (+/- 1%), discrepancy should be small (< 35 L)
    assert abs(actual_delta_v - expected_delta_v) < 35.0


def test_leak_discrepancy_between_pipe_and_building_submeter():
    """Verify that during a leak, pipeline outflow exceeds building smart sub-meters by leak rate."""
    cfg = CAMPUS_ZONES["zone_5_sports_recreation"]
    sim = ZoneSimulator(config=cfg, rng=np.random.default_rng(99))

    leak_rate = 1200.0  # Moderate leak
    sim.trigger_leak(
        severity="moderate",
        start_time="2024-01-15 10:00:00",
        leak_rate_lph=leak_rate,
        affected_component="main_feeder_pipe",
    )

    ts = pd.Timestamp("2024-01-15 10:00:00")
    rec = sim.step(
        timestamp=ts,
        temperature_c=25.0,
        precipitation_mm=0.0,
        relative_humidity_pct=50.0,
        weather_source="synthetic_fallback",
        delta_t_hours=1.0,
    )

    # Observable difference between pipe outlet flow and internal building smart meter
    flow_discrepancy = rec.telemetry.outlet_flow_rate_lph - rec.telemetry.building_consumption_lph
    
    # Should closely approximate the physical leak rate (accounting for sensor noise)
    assert abs(flow_discrepancy - leak_rate) < 40.0
    assert rec.ground_truth.ground_truth_leak_status == 1
    assert rec.ground_truth.ground_truth_leak_severity == "moderate"

