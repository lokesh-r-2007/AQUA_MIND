"""
Continuous Sensor Simulator Runner for AQUAMIND.
Provides CLI execution, real-time stepping, JSON streaming interface,
and scenario injection controls.
"""

import argparse
import json
import sys
import time
from datetime import datetime, timedelta
from typing import Optional, Generator, Dict, Any
import pandas as pd

from src.simulation.campus_network import CampusNetworkSimulator
from src.weather.client import WeatherService
from src.models.telemetry import CampusTelemetryBatch, SimulatorControlResponse
from src.config import RANDOM_SEED


class ContinuousSensorSimulator:
    """High-level runner managing the continuous campus simulation loop."""

    def __init__(self, seed: int = RANDOM_SEED, start_time: Optional[datetime] = None):
        self.simulator = CampusNetworkSimulator(seed=seed)
        self.weather_service = WeatherService(seed=seed)
        self.current_time = start_time or datetime(2024, 1, 15, 6, 0, 0)
        self.is_running = False

    def step_single_hour(self) -> CampusTelemetryBatch:
        """Executes a single 1-hour simulation step using available or fallback weather."""
        ts_str = self.current_time.strftime("%Y-%m-%d")
        weather_df = self.weather_service.fetch_weather(ts_str, ts_str)
        
        # Match current hour
        hour_match = weather_df[weather_df["timestamp"].str.endswith(f"{self.current_time.hour:02d}:00:00")]
        if not hour_match.empty:
            w_row = hour_match.iloc[0]
        else:
            w_row = weather_df.iloc[0]

        batch, _ = self.simulator.step(
            timestamp=pd.Timestamp(self.current_time),
            temperature_c=float(w_row["temperature_c"]),
            precipitation_mm=float(w_row["precipitation_mm"]),
            relative_humidity_pct=float(w_row["relative_humidity_pct"]),
            weather_source=str(w_row["weather_data_source"]),
        )
        self.current_time += timedelta(hours=1)
        return batch

    def stream_telemetry(self, n_steps: int = 24) -> Generator[str, None, None]:
        """Yields JSON-serialized CampusTelemetryBatch for integration with streaming HTTP/WebSockets."""
        for _ in range(n_steps):
            batch = self.step_single_hour()
            yield batch.model_dump_json()

    def trigger_leak(
        self,
        zone_id: str,
        severity: str,
        leak_rate_lph: Optional[float] = None,
        affected_component: Optional[str] = None,
        duration_hours: Optional[int] = None,
    ) -> SimulatorControlResponse:
        """Injects a physical pipe leak into the active simulation."""
        return self.simulator.trigger_leak(
            zone_id=zone_id,
            severity=severity,
            start_time=self.current_time.strftime("%Y-%m-%d %H:%M:%S"),
            leak_rate_lph=leak_rate_lph,
            affected_component=affected_component,
            duration_hours=duration_hours,
        )

    def stop_leak(self, zone_id: str) -> SimulatorControlResponse:
        """Stops leak in a zone."""
        return self.simulator.stop_leak(zone_id)

    def trigger_sensor_fault(
        self,
        zone_id: str,
        fault_type: str,
        affected_sensor: str,
        drift_rate_pct_per_hour: float = 2.0,
        duration_hours: Optional[int] = 12,
    ) -> SimulatorControlResponse:
        """Injects a sensor failure into the active simulation."""
        return self.simulator.trigger_sensor_fault(
            zone_id=zone_id,
            fault_type=fault_type,
            affected_sensor=affected_sensor,
            drift_rate_pct_per_hour=drift_rate_pct_per_hour,
            duration_hours=duration_hours,
        )


def main():
    parser = argparse.ArgumentParser(description="AQUAMIND Continuous Sensor Simulator")
    parser.add_argument("--steps", type=int, default=10, help="Number of hourly steps to simulate")
    parser.add_argument("--seed", type=int, default=RANDOM_SEED, help="Random seed for simulation")
    parser.add_argument("--trigger-leak-zone", type=str, default=None, help="Zone ID to trigger leak on start")
    parser.add_argument("--leak-severity", type=str, default="moderate", choices=["minor", "moderate", "major"])
    parser.add_argument("--json", action="store_true", help="Output pure JSON lines")
    args = parser.parse_args()

    sim = ContinuousSensorSimulator(seed=args.seed)

    if args.trigger_leak_zone:
        resp = sim.trigger_leak(zone_id=args.trigger_leak_zone, severity=args.leak_severity)
        if not args.json:
            print(f"[CONTROL] {resp.message}")

    if not args.json:
        print("=" * 80)
        print(f" AQUAMIND CONTINUOUS SENSOR SIMULATOR (Seed={args.seed}, Steps={args.steps})")
        print("=" * 80)

    for i in range(args.steps):
        batch = sim.step_single_hour()
        if args.json:
            print(batch.model_dump_json())
        else:
            print(f"\nStep {i+1:02d} | Timestamp: {batch.batch_timestamp} | Reservoir: {batch.central_reservoir_level_pct:.1f}% ({batch.central_reservoir_volume_liters:,.0f} L)")
            for z in batch.zones:
                print(
                    f"  [{z.zone_id:<24}] Inflow: {z.inlet_flow_rate_lph:>7.1f} L/h | "
                    f"Outflow: {z.outlet_flow_rate_lph:>7.1f} L/h | "
                    f"Tank: {z.tank_level_pct:>5.1f}% | "
                    f"Pressure: {z.supply_pressure_bar:>4.2f} bar | "
                    f"Pump: {'ON' if z.pump_status else 'OFF'}"
                )


if __name__ == "__main__":
    main()

