"""
Zone Physical State Machine and Hydraulic Simulator for AQUAMIND.
Maintains continuous persistent state for tank storage, booster pumps, flow valves,
and pipeline pressures according to mass balance conservation laws.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, Dict, Any, Tuple
import numpy as np
import pandas as pd

from src.config import (
    ZoneConfig,
    LEAK_SEVERITY_RANGES,
    PHYSICAL_LIMITS,
    DEFAULT_SAMPLING_INTERVAL_HOURS,
)
from src.models.telemetry import ZoneTelemetryReading, ZoneGroundTruth, ZoneFullRecord
from src.data.patterns import calculate_building_consumption, get_academic_calendar_factor


@dataclass
class ActiveLeakEvent:
    """Tracks an ongoing physical pipe leak event."""
    severity: str                      # 'minor', 'moderate', 'major'
    leak_rate_lph: float               # L/h
    start_time: str                    # ISO 8601
    affected_component: str            # e.g., 'supply_manifold_z3'
    remaining_hours: Optional[int] = None


@dataclass
class ActiveSensorFault:
    """Tracks an active sensor failure/glitch (decoupled from physical hydraulic state)."""
    fault_type: str                    # 'sensor_drift', 'sensor_freeze', 'telemetry_spike'
    affected_sensor: str               # 'inlet_flow', 'outlet_flow', 'pressure', 'tank_level'
    drift_rate_pct_per_hour: float = 2.0
    elapsed_fault_hours: int = 0
    frozen_value: Optional[float] = None
    remaining_hours: Optional[int] = None


class ZoneSimulator:
    """
    Simulates physical water balance and sensor telemetry for a single campus zone.
    Guarantees physical mass balance continuity:
        V(t) = V(t-1) + [ Q_in(t) - Q_out(t) ] * delta_t
    where Q_out(t) = BuildingConsumption(t) + LeakRate(t).
    """

    def __init__(self, config: ZoneConfig, rng: Optional[np.random.Generator] = None):
        self.config = config
        self.rng = rng if rng is not None else np.random.default_rng()

        # Persistent Physical State
        self.tank_capacity_liters = float(config.tank_capacity_liters)
        self.current_tank_volume_liters = float(
            self.tank_capacity_liters * (config.initial_tank_level_pct / 100.0)
        )
        self.pump_status: int = 0  # 0: OFF, 1: ON
        self.current_pressure_bar: float = config.nominal_pressure_bar

        # Active injected events
        self.active_leak: Optional[ActiveLeakEvent] = None
        self.active_fault: Optional[ActiveSensorFault] = None

    @property
    def current_tank_level_pct(self) -> float:
        """Returns bounded tank level percentage [0.0, 100.0]%."""
        pct = (self.current_tank_volume_liters / self.tank_capacity_liters) * 100.0
        return float(np.clip(pct, PHYSICAL_LIMITS["tank_level_min_pct"], PHYSICAL_LIMITS["tank_level_max_pct"]))

    def trigger_leak(
        self,
        severity: str,
        start_time: str,
        leak_rate_lph: Optional[float] = None,
        affected_component: Optional[str] = None,
        duration_hours: Optional[int] = None,
    ) -> ActiveLeakEvent:
        """Triggers a controlled physical pipe leak."""
        if severity not in LEAK_SEVERITY_RANGES or severity == "none":
            self.stop_leak()
            return None

        sev_spec = LEAK_SEVERITY_RANGES[severity]
        if leak_rate_lph is None:
            # Sample within physical range
            rate = self.rng.uniform(sev_spec["min_lph"], sev_spec["max_lph"])
        else:
            rate = leak_rate_lph

        comp = affected_component or f"{self.config.zone_id}_main_feed_pipe"
        self.active_leak = ActiveLeakEvent(
            severity=severity,
            leak_rate_lph=round(rate, 1),
            start_time=start_time,
            affected_component=comp,
            remaining_hours=duration_hours,
        )
        return self.active_leak

    def stop_leak(self) -> None:
        """Stops any active physical leak."""
        self.active_leak = None

    def trigger_sensor_fault(
        self,
        fault_type: str,
        affected_sensor: str,
        drift_rate_pct_per_hour: float = 2.0,
        duration_hours: Optional[int] = 12,
    ) -> ActiveSensorFault:
        """Injects a sensor failure/telemetry glitch."""
        self.active_fault = ActiveSensorFault(
            fault_type=fault_type,
            affected_sensor=affected_sensor,
            drift_rate_pct_per_hour=drift_rate_pct_per_hour,
            remaining_hours=duration_hours,
        )
        return self.active_fault

    def stop_sensor_fault(self) -> None:
        """Clears active sensor fault."""
        self.active_fault = None

    def step(
        self,
        timestamp: pd.Timestamp,
        temperature_c: float,
        precipitation_mm: float,
        relative_humidity_pct: float,
        weather_source: str,
        delta_t_hours: float = DEFAULT_SAMPLING_INTERVAL_HOURS,
    ) -> ZoneFullRecord:
        """
        Advances the physical simulation by delta_t_hours.
        Enforces strict mass balance conservation and generates observable telemetry
        and ground truth evaluation labels.
        """
        ts_str = timestamp.strftime("%Y-%m-%d %H:%M:%S")

        # 1. Update active leak event countdown
        if self.active_leak and self.active_leak.remaining_hours is not None:
            self.active_leak.remaining_hours -= 1
            if self.active_leak.remaining_hours <= 0:
                self.active_leak = None

        # 2. Determine actual physical leak discharge rate
        if self.active_leak is not None:
            actual_leak_lph = self.active_leak.leak_rate_lph
            leak_severity = self.active_leak.severity
            affected_comp = self.active_leak.affected_component
            has_leak = 1
        else:
            actual_leak_lph = 0.0
            leak_severity = "none"
            affected_comp = f"{self.config.zone_id}_pipeline_nominal"
            has_leak = 0

        # 3. Calculate building legitimate consumption
        # This is measured internally by building sub-meters
        building_consumption_lph = calculate_building_consumption(
            zone_config=self.config,
            timestamp=timestamp,
            temperature_c=temperature_c,
            precipitation_mm=precipitation_mm,
            noise_std=0.015,
            rng=self.rng,
        )

        # 4. Physical Total Outlet Flow (What leaves the tank through the distribution pipe)
        # Q_out = Building_Consumption + Leak_Discharge
        physical_outlet_flow_lph = building_consumption_lph + actual_leak_lph

        # 5. Booster Pump Controller with Hysteresis (Prevent chatter)
        current_pct = self.current_tank_level_pct
        if current_pct <= self.config.min_operational_level_pct:
            self.pump_status = 1  # Low water level -> start pump
        elif current_pct >= self.config.max_operational_level_pct:
            self.pump_status = 0  # Tank full -> stop pump

        # 6. Physical Inflow Calculation
        # Inflow cannot overfill tank beyond physical capacity
        if self.pump_status == 1:
            max_headroom_liters = max(0.0, self.tank_capacity_liters - self.current_tank_volume_liters)
            max_possible_inflow_lph = max_headroom_liters / delta_t_hours
            nominal_inflow = self.config.max_inflow_rate_lph * self.rng.normal(1.0, 0.01)
            physical_inlet_flow_lph = min(nominal_inflow, max_possible_inflow_lph + physical_outlet_flow_lph)
            physical_inlet_flow_lph = max(0.0, physical_inlet_flow_lph)
        else:
            physical_inlet_flow_lph = 0.0

        # 7. Mass Balance Step (Physics Conservation Law)
        # Delta V = (Q_in - Q_out) * delta_t
        delta_volume = (physical_inlet_flow_lph - physical_outlet_flow_lph) * delta_t_hours
        new_tank_volume = self.current_tank_volume_liters + delta_volume

        # Enforce physical constraints: tank cannot be negative or exceed physical capacity
        if new_tank_volume > self.tank_capacity_liters:
            # Overfill clamped (overflow / valve cutoff)
            physical_inlet_flow_lph = max(
                0.0,
                (self.tank_capacity_liters - self.current_tank_volume_liters) / delta_t_hours + physical_outlet_flow_lph
            )
            new_tank_volume = self.tank_capacity_liters
            self.pump_status = 0
        elif new_tank_volume < 0.0:
            # Tank run dry: consumption throttled to available volume
            physical_outlet_flow_lph = max(0.0, self.current_tank_volume_liters / delta_t_hours + physical_inlet_flow_lph)
            new_tank_volume = 0.0

        self.current_tank_volume_liters = round(new_tank_volume, 2)
        final_tank_level_pct = self.current_tank_level_pct

        # 8. Physical Hydraulic Pressure Calculation
        # Pressure decreases when flow/leakage increases, and drops with tank drawdown
        head_pressure_factor = 0.85 + 0.15 * (final_tank_level_pct / 100.0)
        sev_meta = LEAK_SEVERITY_RANGES[leak_severity]
        leak_pressure_drop = sev_meta["pressure_drop_pct"]
        
        # Hydraulic friction drop based on total flow rate
        flow_friction_drop = 0.05 * (physical_outlet_flow_lph / max(1.0, self.config.base_consumption_lph))
        
        pressure = (
            self.config.nominal_pressure_bar 
            * head_pressure_factor 
            * (1.0 - leak_pressure_drop) 
            - flow_friction_drop
            + self.rng.normal(0, 0.02)
        )
        self.current_pressure_bar = float(np.clip(pressure, PHYSICAL_LIMITS["pressure_min_bar"], PHYSICAL_LIMITS["pressure_max_bar"]))

        # 9. Apply Observable Sensor Readings & Potential Sensor Faults
        # Start with realistic sensor noise (+/- 0.8%)
        obs_inlet_flow = round(physical_inlet_flow_lph * self.rng.normal(1.0, 0.008), 1)
        obs_outlet_flow = round(physical_outlet_flow_lph * self.rng.normal(1.0, 0.008), 1)
        obs_building_cons = round(building_consumption_lph * self.rng.normal(1.0, 0.008), 1)
        obs_pressure = round(self.current_pressure_bar, 2)
        obs_tank_level = round(final_tank_level_pct, 2)
        obs_tank_vol = round(self.current_tank_volume_liters, 1)

        # Ground truth tracking for anomalies
        anomaly_status = 1 if has_leak else 0
        anomaly_type = "pipe_leak" if has_leak else "none"

        # Apply Sensor Fault if active
        if self.active_fault is not None:
            anomaly_status = 1
            anomaly_type = self.active_fault.fault_type
            affected_comp = f"{self.config.zone_id}_{self.active_fault.affected_sensor}_sensor"
            self.active_fault.elapsed_fault_hours += 1

            if self.active_fault.fault_type == "sensor_drift":
                drift_factor = 1.0 + (self.active_fault.drift_rate_pct_per_hour / 100.0) * self.active_fault.elapsed_fault_hours
                if self.active_fault.affected_sensor == "outlet_flow":
                    obs_outlet_flow = round(obs_outlet_flow * drift_factor, 1)
                elif self.active_fault.affected_sensor == "inlet_flow":
                    obs_inlet_flow = round(obs_inlet_flow * drift_factor, 1)
                elif self.active_fault.affected_sensor == "pressure":
                    obs_pressure = round(obs_pressure * drift_factor, 2)

            elif self.active_fault.fault_type == "sensor_freeze":
                if self.active_fault.frozen_value is None:
                    # Capture current reading as frozen state
                    if self.active_fault.affected_sensor == "outlet_flow":
                        self.active_fault.frozen_value = obs_outlet_flow
                    elif self.active_fault.affected_sensor == "tank_level":
                        self.active_fault.frozen_value = obs_tank_level
                
                if self.active_fault.affected_sensor == "outlet_flow":
                    obs_outlet_flow = self.active_fault.frozen_value
                elif self.active_fault.affected_sensor == "tank_level":
                    obs_tank_level = self.active_fault.frozen_value

            elif self.active_fault.fault_type == "telemetry_spike":
                # Single isolated telemetry electrical spike (e.g., 3.5x multiplier)
                if self.active_fault.affected_sensor == "outlet_flow":
                    obs_outlet_flow = round(obs_outlet_flow * 3.5, 1)
                elif self.active_fault.affected_sensor == "pressure":
                    obs_pressure = round(min(PHYSICAL_LIMITS["pressure_max_bar"], obs_pressure * 2.2), 2)
                
                # Auto-clear spike after 1 step
                self.active_fault = None

            if self.active_fault and self.active_fault.remaining_hours is not None:
                self.active_fault.remaining_hours -= 1
                if self.active_fault.remaining_hours <= 0:
                    self.active_fault = None

        cal = get_academic_calendar_factor(timestamp)

        # Assemble Observable Telemetry (NO TARGET LABELS)
        telemetry = ZoneTelemetryReading(
            timestamp=ts_str,
            zone_id=self.config.zone_id,
            zone_name=self.config.zone_name,
            inlet_flow_rate_lph=max(0.0, obs_inlet_flow),
            outlet_flow_rate_lph=max(0.0, obs_outlet_flow),
            building_consumption_lph=max(0.0, obs_building_cons),
            supply_pressure_bar=obs_pressure,
            tank_level_pct=obs_tank_level,
            tank_volume_liters=obs_tank_vol,
            pump_status=self.pump_status,
            temperature_c=round(temperature_c, 2),
            precipitation_mm=round(precipitation_mm, 2),
            relative_humidity_pct=round(relative_humidity_pct, 1),
            weather_data_source=weather_source,
            hour_of_day=timestamp.hour,
            day_of_week=timestamp.dayofweek,
            is_weekend=cal["is_weekend"],
            is_holiday=cal["is_holiday"],
        )

        # Assemble Ground Truth Target Labels (FOR EVALUATION ONLY)
        ground_truth = ZoneGroundTruth(
            timestamp=ts_str,
            zone_id=self.config.zone_id,
            ground_truth_leak_status=has_leak,
            ground_truth_leak_severity=leak_severity,
            ground_truth_leak_rate_lph=round(actual_leak_lph, 1),
            ground_truth_anomaly_status=anomaly_status,
            ground_truth_anomaly_type=anomaly_type,
            ground_truth_affected_component=affected_comp,
        )

        return ZoneFullRecord(telemetry=telemetry, ground_truth=ground_truth)

