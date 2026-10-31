"""
Campus Network Simulator for AQUAMIND.
Coordinates multi-zone physical water balance across all 6 campus zones
and manages the central 500,000-liter storage reservoir.
"""

from typing import Dict, List, Optional, Any
import numpy as np
import pandas as pd

from src.config import (
    CAMPUS_ZONES,
    CENTRAL_RESERVOIR_CAPACITY_LITERS,
    CENTRAL_RESERVOIR_INITIAL_LEVEL_PCT,
    PHYSICAL_LIMITS,
    DEFAULT_SAMPLING_INTERVAL_HOURS,
    RANDOM_SEED,
)
from src.simulation.zone_simulator import ZoneSimulator
from src.models.telemetry import (
    CampusTelemetryBatch,
    ZoneFullRecord,
    ZoneTelemetryReading,
    SimulatorControlResponse,
)


class CampusNetworkSimulator:
    """
    Simulates the campus-wide water distribution network:
    - 6 Zone sub-networks with overhead storage and booster pumps.
    - Central Campus Reservoir (500,000 Liters).
    - Rainwater harvesting recovery.
    - Persistent state tracking across arbitrary time steps.
    """

    def __init__(self, seed: int = RANDOM_SEED):
        self.seed = seed
        self.rng = np.random.default_rng(seed)
        
        # Initialize zone simulators
        self.zone_simulators: Dict[str, ZoneSimulator] = {
            zone_id: ZoneSimulator(config=cfg, rng=self.rng)
            for zone_id, cfg in CAMPUS_ZONES.items()
        }

        # Central Reservoir State
        self.central_reservoir_capacity_liters = CENTRAL_RESERVOIR_CAPACITY_LITERS
        self.central_reservoir_volume_liters = (
            self.central_reservoir_capacity_liters * (CENTRAL_RESERVOIR_INITIAL_LEVEL_PCT / 100.0)
        )
        self.municipal_inflow_nominal_lph = 25_000.0  # Main municipal line feed
        self.last_timestamp: Optional[str] = None

    @property
    def central_reservoir_level_pct(self) -> float:
        """Returns bounded percentage level of central campus reservoir."""
        pct = (self.central_reservoir_volume_liters / self.central_reservoir_capacity_liters) * 100.0
        return float(np.clip(pct, 0.0, 100.0))

    def trigger_leak(
        self,
        zone_id: str,
        severity: str,
        start_time: str,
        leak_rate_lph: Optional[float] = None,
        affected_component: Optional[str] = None,
        duration_hours: Optional[int] = None,
    ) -> SimulatorControlResponse:
        """Triggers a physical leak in the specified campus zone."""
        if zone_id not in self.zone_simulators:
            return SimulatorControlResponse(
                success=False,
                message=f"Zone '{zone_id}' not found. Valid zones: {list(self.zone_simulators.keys())}",
                active_events=self.get_active_events(),
            )

        sim = self.zone_simulators[zone_id]
        event = sim.trigger_leak(
            severity=severity,
            start_time=start_time,
            leak_rate_lph=leak_rate_lph,
            affected_component=affected_component,
            duration_hours=duration_hours,
        )

        msg = (
            f"Successfully triggered {severity} leak in {zone_id} "
            f"({event.leak_rate_lph} L/h on {event.affected_component})"
            if event else f"Stopped leak in {zone_id}"
        )
        return SimulatorControlResponse(
            success=True,
            message=msg,
            active_events=self.get_active_events(),
        )

    def stop_leak(self, zone_id: str) -> SimulatorControlResponse:
        """Stops an active leak in a specified campus zone."""
        if zone_id not in self.zone_simulators:
            return SimulatorControlResponse(
                success=False,
                message=f"Zone '{zone_id}' not found.",
                active_events=self.get_active_events(),
            )
        self.zone_simulators[zone_id].stop_leak()
        return SimulatorControlResponse(
            success=True,
            message=f"Leak stopped in {zone_id}.",
            active_events=self.get_active_events(),
        )

    def trigger_sensor_fault(
        self,
        zone_id: str,
        fault_type: str,
        affected_sensor: str,
        drift_rate_pct_per_hour: float = 2.0,
        duration_hours: Optional[int] = 12,
    ) -> SimulatorControlResponse:
        """Injects a sensor failure into a zone's telemetry stream."""
        if zone_id not in self.zone_simulators:
            return SimulatorControlResponse(
                success=False,
                message=f"Zone '{zone_id}' not found.",
                active_events=self.get_active_events(),
            )
        sim = self.zone_simulators[zone_id]
        fault = sim.trigger_sensor_fault(
            fault_type=fault_type,
            affected_sensor=affected_sensor,
            drift_rate_pct_per_hour=drift_rate_pct_per_hour,
            duration_hours=duration_hours,
        )
        return SimulatorControlResponse(
            success=True,
            message=f"Injected {fault_type} on {zone_id} [{affected_sensor}].",
            active_events=self.get_active_events(),
        )

    def get_active_events(self) -> List[Dict[str, Any]]:
        """Returns list of all active leaks and sensor faults currently running."""
        events = []
        for zid, sim in self.zone_simulators.items():
            if sim.active_leak:
                events.append({
                    "zone_id": zid,
                    "event_type": "physical_leak",
                    "severity": sim.active_leak.severity,
                    "leak_rate_lph": sim.active_leak.leak_rate_lph,
                    "affected_component": sim.active_leak.affected_component,
                    "start_time": sim.active_leak.start_time,
                    "remaining_hours": sim.active_leak.remaining_hours,
                })
            if sim.active_fault:
                events.append({
                    "zone_id": zid,
                    "event_type": "sensor_fault",
                    "fault_type": sim.active_fault.fault_type,
                    "affected_sensor": sim.active_fault.affected_sensor,
                    "remaining_hours": sim.active_fault.remaining_hours,
                })
        return events

    def step(
        self,
        timestamp: pd.Timestamp,
        temperature_c: float,
        precipitation_mm: float,
        relative_humidity_pct: float,
        weather_source: str,
        delta_t_hours: float = DEFAULT_SAMPLING_INTERVAL_HOURS,
    ) -> Tuple[CampusTelemetryBatch, List[ZoneFullRecord]]:
        """
        Advances the entire campus simulation by delta_t_hours.
        Returns both observable CampusTelemetryBatch (for API) and full records (for diagnostics/training).
        """
        self.last_timestamp = timestamp.strftime("%Y-%m-%d %H:%M:%S")

        zone_telemetries: List[ZoneTelemetryReading] = []
        full_records: List[ZoneFullRecord] = []
        total_zone_inflow_demand_lph = 0.0

        for zid, sim in self.zone_simulators.items():
            rec = sim.step(
                timestamp=timestamp,
                temperature_c=temperature_c,
                precipitation_mm=precipitation_mm,
                relative_humidity_pct=relative_humidity_pct,
                weather_source=weather_source,
                delta_t_hours=delta_t_hours,
            )
            full_records.append(rec)
            zone_telemetries.append(rec.telemetry)
            total_zone_inflow_demand_lph += rec.telemetry.inlet_flow_rate_lph

        # Central Reservoir Hydraulic Balance
        # Rainwater harvesting catchment: ~15,000 m2 campus roof area * precip mm * 0.85 runoff coeff
        rain_harvest_lph = (15_000.0 * (precipitation_mm / 1000.0) * 1000.0 * 0.85) / delta_t_hours
        
        # Municipal inflow modulated by reservoir fullness
        if self.central_reservoir_level_pct < 30.0:
            muni_inflow = self.municipal_inflow_nominal_lph * 1.5
        elif self.central_reservoir_level_pct > 92.0:
            muni_inflow = self.municipal_inflow_nominal_lph * 0.2
        else:
            muni_inflow = self.municipal_inflow_nominal_lph

        central_delta_v = (muni_inflow + rain_harvest_lph - total_zone_inflow_demand_lph) * delta_t_hours
        new_res_vol = np.clip(
            self.central_reservoir_volume_liters + central_delta_v,
            0.0,
            self.central_reservoir_capacity_liters,
        )
        self.central_reservoir_volume_liters = round(float(new_res_vol), 1)

        batch = CampusTelemetryBatch(
            batch_timestamp=self.last_timestamp,
            central_reservoir_level_pct=round(self.central_reservoir_level_pct, 2),
            central_reservoir_volume_liters=round(self.central_reservoir_volume_liters, 1),
            zones=zone_telemetries,
            system_status="ONLINE",
        )

        return batch, full_records

