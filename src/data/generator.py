"""
Historical Data Generator for AQUAMIND.
Generates a reproducible 12,000-record benchmark dataset across 6 campus zones,
injecting realistic weekday/weekend patterns, seasonal weather variations,
and carefully scheduled minor, moderate, and major leak scenarios alongside sensor faults.
Strictly separates observable sensor telemetry from ground-truth evaluation labels.
"""

import argparse
import logging
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Tuple
import numpy as np
import pandas as pd

from src.config import (
    CAMPUS_ZONES,
    DATA_DIR,
    RANDOM_SEED,
    DEFAULT_HISTORY_TIMESTEPS,
)
from src.simulation.campus_network import CampusNetworkSimulator
from src.weather.client import WeatherService
from src.models.telemetry import ZoneFullRecord

logger = logging.getLogger("aquamind.data_generator")
logging.basicConfig(level=logging.INFO)


class HistoricalDataGenerator:
    """
    Generates high-fidelity historical campus water dataset.
    Ensures reproducibility, physical mass balance consistency,
    and strict isolation of ground-truth labels from observable features.
    """

    def __init__(
        self,
        seed: int = RANDOM_SEED,
        timesteps: int = DEFAULT_HISTORY_TIMESTEPS,
        start_date: str = "2024-01-01",
    ):
        self.seed = seed
        self.rng = np.random.default_rng(seed)
        self.timesteps = timesteps
        self.start_date = start_date
        self.simulator = CampusNetworkSimulator(seed=seed)
        self.weather_service = WeatherService(seed=seed)

    def _schedule_scenarios(self, total_hours: int) -> List[Dict]:
        """
        Plans leak and sensor fault scenarios distributed across time and zones.
        Ensures representation of:
        - Normal baseline periods
        - Minor leaks (100 - 300 L/h)
        - Moderate leaks (500 - 1500 L/h)
        - Major bursts (2500 - 6000 L/h)
        - Sensor drift, freeze, and telemetry glitches
        """
        # Deterministic scenario schedule based on simulation hour
        scenarios = [
            # Week 2: Minor leak in Zone 1 (Academic North) - hairline joint crack
            {
                "hour_start": 216,
                "duration": 48,
                "zone_id": "zone_1_academic_north",
                "type": "leak",
                "severity": "minor",
                "leak_rate_lph": 220.0,
                "component": "zone_1_pipe_flange_A4",
            },
            # Week 3: Moderate leak in Zone 3 (Student Hostels) - underground service line rupture
            {
                "hour_start": 480,
                "duration": 36,
                "zone_id": "zone_3_student_hostels",
                "type": "leak",
                "severity": "moderate",
                "leak_rate_lph": 1150.0,
                "component": "zone_3_dorm_block_c_feed",
            },
            # Week 4: Sensor drift in Zone 4 (Dining) - flow meter scaling degradation (NOT a physical leak)
            {
                "hour_start": 720,
                "duration": 48,
                "zone_id": "zone_4_dining_cafeteria",
                "type": "sensor_fault",
                "fault_type": "sensor_drift",
                "affected_sensor": "outlet_flow",
                "drift_rate_pct_per_hour": 1.5,
            },
            # Week 6: Major pipe burst in Zone 5 (Sports Complex) - irrigation main break
            {
                "hour_start": 1056,
                "duration": 24,
                "zone_id": "zone_5_sports_recreation",
                "type": "leak",
                "severity": "major",
                "leak_rate_lph": 3800.0,
                "component": "zone_5_irrigation_main_line",
            },
            # Week 7: Sensor freeze in Zone 2 (Research Labs) - telemetry card lockup
            {
                "hour_start": 1248,
                "duration": 30,
                "zone_id": "zone_2_research_labs",
                "type": "sensor_fault",
                "fault_type": "sensor_freeze",
                "affected_sensor": "outlet_flow",
            },
            # Week 9: Moderate leak in Zone 6 (Admin & Clinic)
            {
                "hour_start": 1512,
                "duration": 40,
                "zone_id": "zone_6_admin_facilities",
                "type": "leak",
                "severity": "moderate",
                "leak_rate_lph": 850.0,
                "component": "zone_6_clinic_riser_3",
            },
            # Week 10: Intermittent telemetry spikes in Zone 1 (Academic North)
            {
                "hour_start": 1720,
                "duration": 1,
                "zone_id": "zone_1_academic_north",
                "type": "sensor_fault",
                "fault_type": "telemetry_spike",
                "affected_sensor": "outlet_flow",
            },
            # Week 11: Minor leak in Zone 2 (Research Labs) - cooling tower valve weeping
            {
                "hour_start": 1840,
                "duration": 36,
                "zone_id": "zone_2_research_labs",
                "type": "leak",
                "severity": "minor",
                "leak_rate_lph": 180.0,
                "component": "zone_2_chiller_purge_valve",
            },
        ]
        return scenarios

    def generate(self) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        """
        Generates approximately 12,000 records (2,000 time steps x 6 zones = 12,000 records).
        
        Returns:
            Tuple of:
            - df_observable: Observable sensor features (for training & operations)
            - df_ground_truth: Ground truth evaluation targets (for scoring & evaluation)
            - df_weather: Separately stored meteorological history
        """
        start_dt = pd.to_datetime(self.start_date)
        end_dt = start_dt + pd.Timedelta(hours=self.timesteps - 1)
        start_str = start_dt.strftime("%Y-%m-%d")
        end_str = end_dt.strftime("%Y-%m-%d")

        logger.info(
            "Generating historical dataset: %d timesteps x %d zones = %d total records (%s to %s)",
            self.timesteps,
            len(CAMPUS_ZONES),
            self.timesteps * len(CAMPUS_ZONES),
            start_str,
            end_str,
        )

        # 1. Fetch / Cache meteorological dataset
        df_weather = self.weather_service.fetch_weather(start_str, end_str)
        weather_lookup = {
            row["timestamp"]: row for _, row in df_weather.iterrows()
        }

        # 2. Plan Scenarios
        scenario_schedule = self._schedule_scenarios(self.timesteps)
        
        all_records: List[ZoneFullRecord] = []
        current_time = start_dt

        # Index active scheduled scenarios by trigger hour
        active_scenarios_by_start = {}
        for sc in scenario_schedule:
            active_scenarios_by_start.setdefault(sc["hour_start"], []).append(sc)

        for step_idx in range(self.timesteps):
            ts = current_time + pd.Timedelta(hours=step_idx)
            ts_str = ts.strftime("%Y-%m-%d %H:%M:%S")

            # Check if any scenario starts this hour
            if step_idx in active_scenarios_by_start:
                for sc in active_scenarios_by_start[step_idx]:
                    if sc["type"] == "leak":
                        self.simulator.trigger_leak(
                            zone_id=sc["zone_id"],
                            severity=sc["severity"],
                            start_time=ts_str,
                            leak_rate_lph=sc["leak_rate_lph"],
                            affected_component=sc["component"],
                            duration_hours=sc["duration"],
                        )
                        logger.info("Triggered %s leak on %s at step %d", sc["severity"], sc["zone_id"], step_idx)
                    elif sc["type"] == "sensor_fault":
                        self.simulator.trigger_sensor_fault(
                            zone_id=sc["zone_id"],
                            fault_type=sc["fault_type"],
                            affected_sensor=sc["affected_sensor"],
                            drift_rate_pct_per_hour=sc.get("drift_rate_pct_per_hour", 2.0),
                            duration_hours=sc["duration"],
                        )
                        logger.info("Triggered %s on %s at step %d", sc["fault_type"], sc["zone_id"], step_idx)

            # Retrieve weather for this hour
            w_row = weather_lookup.get(ts_str)
            if w_row is None:
                # Use fallback defaults if timestamp not exact in weather table
                temp = 24.0
                precip = 0.0
                humidity = 60.0
                w_source = "synthetic_fallback"
            else:
                temp = float(w_row["temperature_c"])
                precip = float(w_row["precipitation_mm"])
                humidity = float(w_row["relative_humidity_pct"])
                w_source = str(w_row["weather_data_source"])

            # Advance simulation across all zones
            _, full_recs = self.simulator.step(
                timestamp=ts,
                temperature_c=temp,
                precipitation_mm=precip,
                relative_humidity_pct=humidity,
                weather_source=w_source,
            )
            all_records.extend(full_recs)

        # 3. Assemble and decouple DataFrames
        observable_rows = [r.telemetry.model_dump() for r in all_records]
        ground_truth_rows = [r.ground_truth.model_dump() for r in all_records]

        df_observable = pd.DataFrame(observable_rows)
        df_ground_truth = pd.DataFrame(ground_truth_rows)

        return df_observable, df_ground_truth, df_weather

    def save_datasets(
        self,
        output_dir: Path = DATA_DIR,
    ) -> Dict[str, Path]:
        """
        Generates and saves the datasets into designated paths:
        - data/historical_sensor_readings.csv (Observable features only)
        - data/ground_truth_labels.csv (Evaluation labels only)
        - data/weather_history.csv (Meteorological data only)
        - data/master_benchmark_dataset.csv (Convenience combined file for evaluation)
        """
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)

        df_obs, df_gt, df_weather = self.generate()

        obs_path = output_dir / "historical_sensor_readings.csv"
        gt_path = output_dir / "ground_truth_labels.csv"
        weather_path = output_dir / "weather_history.csv"
        master_path = output_dir / "master_benchmark_dataset.csv"

        df_obs.to_csv(obs_path, index=False)
        df_gt.to_csv(gt_path, index=False)
        df_weather.to_csv(weather_path, index=False)

        # Merge for master benchmark file
        df_master = pd.merge(df_obs, df_gt, on=["timestamp", "zone_id"], how="inner")
        df_master.to_csv(master_path, index=False)

        logger.info("Successfully generated and saved historical datasets:")
        logger.info("  Observable Sensor Readings: %s (%d rows)", obs_path, len(df_obs))
        logger.info("  Ground Truth Labels:        %s (%d rows)", gt_path, len(df_gt))
        logger.info("  Weather History:            %s (%d rows)", weather_path, len(df_weather))
        logger.info("  Master Combined:            %s (%d rows)", master_path, len(df_master))

        return {
            "observable": obs_path,
            "ground_truth": gt_path,
            "weather": weather_path,
            "master": master_path,
        }


def main():
    parser = argparse.ArgumentParser(description="Generate AQUAMIND Historical Sensor Dataset")
    parser.add_argument("--timesteps", type=int, default=DEFAULT_HISTORY_TIMESTEPS, help="Number of hourly timesteps (default: 2000 => 12,000 zone records)")
    parser.add_argument("--seed", type=int, default=RANDOM_SEED, help="Reproducible random seed")
    parser.add_argument("--output-dir", type=str, default=str(DATA_DIR), help="Output directory")
    args = parser.parse_args()

    gen = HistoricalDataGenerator(seed=args.seed, timesteps=args.timesteps)
    gen.save_datasets(output_dir=Path(args.output_dir))


if __name__ == "__main__":
    main()

