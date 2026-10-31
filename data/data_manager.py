"""
AquaMind AI - Data Foundation Manager
Generates 12,000 high-quality records across the 6 campus buildings,
integrates Open-Meteo weather with caching and fallback,
enforces physical mass balance, and produces clean ML datasets without leakage.
"""

import math
import sys
from pathlib import Path

# Ensure root workspace directory is in python path
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from typing import Dict, List, Tuple, Any
import numpy as np
import pandas as pd

from backend.core.config import (
    CAMPUS_BUILDINGS,
    BuildingConfig,
    RANDOM_SEED,
    HISTORICAL_DATA_DIR,
    PROCESSED_DATA_DIR,
    DATA_DIR,
    LEAK_SEVERITIES,
)
from src.weather.client import WeatherService


class CampusDataGenerator:
    """Generates physically consistent, non-spurious campus water history."""

    def __init__(self, seed: int = RANDOM_SEED, timesteps: int = 2000, start_date: str = "2024-01-01"):
        self.seed = seed
        self.rng = np.random.default_rng(seed)
        self.timesteps = timesteps
        self.start_date = start_date
        self.weather_service = WeatherService(seed=seed)

        # Persistent tank volume state per building
        self.tank_volumes: Dict[str, float] = {
            bid: bcfg.tank_capacity_liters * (bcfg.initial_tank_level_pct / 100.0)
            for bid, bcfg in CAMPUS_BUILDINGS.items()
        }
        self.pump_states: Dict[str, int] = {bid: 0 for bid in CAMPUS_BUILDINGS}

    def _get_occupancy(self, bcfg: BuildingConfig, hour: int, is_weekend: int, is_holiday: int) -> int:
        """Computes realistic building-specific occupancy based on schedules."""
        bid = bcfg.building_id
        max_occ = bcfg.max_occupancy

        if bid == "academic_block":
            if is_holiday:
                return int(self.rng.integers(0, 15))
            if is_weekend:
                return int(self.rng.integers(20, 80))
            if 8 <= hour <= 17:
                # Active lecture hours
                curve = math.sin(math.pi * (hour - 8) / 9.0)
                base = 0.5 + 0.45 * max(0.0, curve)
                return int(max_occ * base * self.rng.uniform(0.9, 1.05))
            elif 18 <= hour <= 21:
                return int(max_occ * 0.15)
            else:
                return int(self.rng.integers(5, 20))

        elif bid in ("hostel_a", "hostel_b"):
            # Residential occupancy: High at night & weekends, dips during classes
            if is_weekend or is_holiday:
                occ_factor = 0.85 + 0.12 * math.sin(math.pi * (hour - 6) / 12.0)
                return int(np.clip(max_occ * occ_factor, max_occ * 0.7, max_occ))
            else:
                if 9 <= hour <= 16:
                    # Students attending lectures
                    return int(max_occ * self.rng.uniform(0.20, 0.35))
                elif (6 <= hour <= 8) or (17 <= hour <= 23):
                    # Morning prep & evening study
                    return int(max_occ * self.rng.uniform(0.85, 0.98))
                else:
                    # Sleeping
                    return int(max_occ * self.rng.uniform(0.92, 1.0))

        elif bid == "canteen":
            if is_holiday:
                meal_mult = 0.2
            elif is_weekend:
                meal_mult = 0.7
            else:
                meal_mult = 1.0

            # Three meal waves
            breakfast = math.exp(-0.5 * ((hour - 8.5) / 1.0) ** 2)
            lunch = 1.25 * math.exp(-0.5 * ((hour - 13.0) / 1.1) ** 2)
            dinner = 1.10 * math.exp(-0.5 * ((hour - 20.0) / 1.0) ** 2)
            wave = max(breakfast, lunch, dinner)
            occ = max_occ * wave * meal_mult * self.rng.uniform(0.85, 1.05)
            return int(np.clip(occ, 0, max_occ))

        elif bid == "laboratory_block":
            if is_holiday:
                return int(self.rng.integers(5, 15))
            if is_weekend:
                return int(self.rng.integers(15, 45))
            if 8 <= hour <= 18:
                curve = math.sin(math.pi * (hour - 8) / 10.0)
                return int(max_occ * (0.45 + 0.5 * max(0.0, curve)) * self.rng.uniform(0.9, 1.05))
            else:
                return int(self.rng.integers(8, 25))

        elif bid == "sports_garden":
            # Athletic ground activity
            morning = math.exp(-0.5 * ((hour - 7.0) / 1.0) ** 2)
            evening = 1.2 * math.exp(-0.5 * ((hour - 17.5) / 1.5) ** 2)
            activity = max(morning, evening)
            occ_boost = 1.3 if is_weekend else 1.0
            return int(np.clip(max_occ * activity * occ_boost * self.rng.uniform(0.8, 1.1), 0, max_occ))

        return int(max_occ * 0.5)

    def _get_scheduled_events(self) -> List[Dict[str, Any]]:
        """Schedules realistic leaks and sensor faults across the 2,000-hour timeline."""
        return [
            # Week 2 (Hour 216): Minor joint leak in Academic Block
            {
                "hour_start": 216,
                "duration": 48,
                "building_id": "academic_block",
                "type": "leak",
                "severity": "minor",
                "leak_lpm": 3.5,
                "component": "Academic Block supply pipe flange A4",
            },
            # Week 3 (Hour 480): Moderate underground main leak in Hostel A (Crucial Hackathon Demo!)
            {
                "hour_start": 480,
                "duration": 40,
                "building_id": "hostel_a",
                "type": "leak",
                "severity": "moderate",
                "leak_lpm": 18.5,
                "component": "Hostel A main underground distribution pipe",
            },
            # Week 4 (Hour 720): Sensor drift in Canteen (NOT a leak - sensor calibration fault)
            {
                "hour_start": 720,
                "duration": 48,
                "building_id": "canteen",
                "type": "sensor_fault",
                "fault_type": "sensor_drift",
                "affected_sensor": "flow_rate",
                "drift_factor": 1.45,
            },
            # Week 6 (Hour 1056): Major irrigation main pipe break in Sports & Garden Area
            {
                "hour_start": 1056,
                "duration": 24,
                "building_id": "sports_garden",
                "type": "leak",
                "severity": "major",
                "leak_lpm": 55.0,
                "component": "Sports & Garden irrigation mainline valve",
            },
            # Week 7 (Hour 1248): Sensor freeze in Laboratory Block
            {
                "hour_start": 1248,
                "duration": 30,
                "building_id": "laboratory_block",
                "type": "sensor_fault",
                "fault_type": "sensor_freeze",
                "affected_sensor": "flow_rate",
            },
            # Week 9 (Hour 1512): Moderate leak in Hostel B
            {
                "hour_start": 1512,
                "duration": 36,
                "building_id": "hostel_b",
                "type": "leak",
                "severity": "moderate",
                "leak_lpm": 14.0,
                "component": "Hostel B riser junction 2",
            },
            # Week 10 (Hour 1720): Telemetry spike glitch in Academic Block (1-hour electrical noise)
            {
                "hour_start": 1720,
                "duration": 1,
                "building_id": "academic_block",
                "type": "sensor_fault",
                "fault_type": "telemetry_spike",
                "affected_sensor": "flow_rate",
            },
            # Week 11 (Hour 1840): Minor valve weeping in Laboratory Block
            {
                "hour_start": 1840,
                "duration": 36,
                "building_id": "laboratory_block",
                "type": "leak",
                "severity": "minor",
                "leak_lpm": 2.8,
                "component": "Laboratory Block chiller bypass valve",
            },
        ]

    def generate(self) -> pd.DataFrame:
        """
        Executes data generation across 2,000 hourly timesteps x 6 buildings = 12,000 records.
        Returns a single master DataFrame with observable features and ground truth labels.
        """
        start_dt = pd.to_datetime(self.start_date)
        end_dt = start_dt + pd.Timedelta(hours=self.timesteps - 1)
        start_str = start_dt.strftime("%Y-%m-%d")
        end_str = end_dt.strftime("%Y-%m-%d")

        # Fetch weather data
        df_weather = self.weather_service.fetch_weather(start_str, end_str)
        weather_map = {row["timestamp"]: row for _, row in df_weather.iterrows()}

        # Schedule scenarios
        scenarios = self._get_scheduled_events()
        scenario_by_start = {}
        for sc in scenarios:
            scenario_by_start.setdefault(sc["hour_start"], []).append(sc)

        active_events: List[Dict[str, Any]] = []
        rows = []

        for step_idx in range(self.timesteps):
            ts = start_dt + pd.Timedelta(hours=step_idx)
            ts_str = ts.strftime("%Y-%m-%d %H:%M:%S")
            hour = ts.hour
            day_of_week = ts.dayofweek
            is_weekend = 1 if day_of_week >= 5 else 0

            # Academic calendar holiday detection
            month, day = ts.month, ts.day
            is_holiday = 1 if (
                (month == 1 and day == 26) or
                (month == 8 and day == 15) or
                (month == 10 and day == 2) or
                (month in (6, 7))  # Summer break
            ) else 0

            # Check new events starting this hour
            if step_idx in scenario_by_start:
                for sc in scenario_by_start[step_idx]:
                    ev = dict(sc)
                    ev["remaining_hours"] = sc["duration"]
                    active_events.append(ev)

            # Retrieve weather
            w_row = weather_map.get(ts_str)
            if w_row is not None:
                temp = float(w_row["temperature_c"])
                rainfall = float(w_row["precipitation_mm"])
                humidity = float(w_row["relative_humidity_pct"])
                w_source = str(w_row["weather_data_source"])
            else:
                temp, rainfall, humidity, w_source = 24.0, 0.0, 60.0, "synthetic_fallback"

            # Simulate each of the 6 buildings
            for bid, bcfg in CAMPUS_BUILDINGS.items():
                # Check if this building has an active event
                building_leak = next(
                    (e for e in active_events if e["building_id"] == bid and e["type"] == "leak"), None
                )
                building_fault = next(
                    (e for e in active_events if e["building_id"] == bid and e["type"] == "sensor_fault"), None
                )

                leak_flow_lpm = building_leak["leak_lpm"] if building_leak else 0.0
                leak_severity = building_leak["severity"] if building_leak else "none"
                has_leak = 1 if building_leak else 0

                # Compute occupancy
                occupancy = self._get_occupancy(bcfg, hour, is_weekend, is_holiday)

                # Compute legitimate physical fixture consumption (LPM)
                occ_ratio = occupancy / max(1.0, bcfg.max_occupancy)
                if 2 <= hour <= 5:
                    # Night minimum flow
                    phys_fixture_lpm = bcfg.night_flow_base_lpm * (0.8 + 0.4 * occ_ratio)
                else:
                    phys_fixture_lpm = bcfg.base_flow_lpm * occ_ratio + bcfg.night_flow_base_lpm * 0.5

                # Weather temperature & rainfall adjustments
                if temp > 28.0:
                    phys_fixture_lpm *= (1.0 + 0.02 * (temp - 28.0))
                if bid == "sports_garden" and rainfall > 1.0:
                    phys_fixture_lpm *= 0.35  # Lawn irrigation suppressed by rain

                # Add small natural measurement noise (+/- 1.5%)
                phys_fixture_lpm *= self.rng.normal(1.0, 0.015)
                phys_fixture_lpm = max(0.5, phys_fixture_lpm)

                # Total physical flow leaving the tank includes leak
                phys_total_flow_lpm = phys_fixture_lpm + leak_flow_lpm

                # Water consumption in liters over this 1-hour interval (Delta t = 60 mins)
                # Building internal meters only measure fixture usage; total tank discharge includes leak
                consumption_liters = phys_total_flow_lpm * 60.0

                # Tank mass balance
                current_vol = self.tank_volumes[bid]
                tank_cap = bcfg.tank_capacity_liters
                current_pct = (current_vol / tank_cap) * 100.0

                # Booster pump auto-fill hysteresis (ON at <= 30%, OFF at >= 92%)
                if current_pct <= 30.0:
                    self.pump_states[bid] = 1
                elif current_pct >= 92.0:
                    self.pump_states[bid] = 0

                pump_on = self.pump_states[bid]
                if pump_on:
                    inflow_lpm = min(bcfg.max_inflow_lpm, (tank_cap - current_vol) / 60.0 + phys_total_flow_lpm)
                    inflow_lpm = max(0.0, inflow_lpm)
                else:
                    inflow_lpm = 0.0

                # Update tank volume
                net_volume_change = (inflow_lpm - phys_total_flow_lpm) * 60.0
                new_volume = np.clip(current_vol + net_volume_change, 0.0, tank_cap)
                self.tank_volumes[bid] = float(new_volume)
                final_tank_pct = round((new_volume / tank_cap) * 100.0, 1)

                # Physical pressure calculation
                head_factor = 0.85 + 0.15 * (final_tank_pct / 100.0)
                sev_meta = LEAK_SEVERITIES[leak_severity]
                leak_p_drop = sev_meta["pressure_drop_pct"]
                flow_drop = 0.06 * (phys_total_flow_lpm / bcfg.base_flow_lpm)
                pressure = (
                    bcfg.nominal_pressure_bar * head_factor * (1.0 - leak_p_drop) - flow_drop + self.rng.normal(0, 0.015)
                )
                pressure_bar = round(float(np.clip(pressure, 1.0, 4.5)), 2)

                # Night flow calculation (representative minimum night flow)
                if 2 <= hour <= 5:
                    night_flow_lpm = round(phys_total_flow_lpm, 2)
                else:
                    # Rolling estimate based on base plus active leak
                    night_flow_lpm = round(bcfg.night_flow_base_lpm + leak_flow_lpm * self.rng.normal(1.0, 0.02), 2)

                # Observable sensor readings
                obs_flow_lpm = round(phys_total_flow_lpm, 2)
                obs_consumption_liters = round(consumption_liters, 1)
                anomaly_status = 1 if has_leak else 0
                anomaly_type = "pipe_leak" if has_leak else "none"

                # Apply sensor faults if active
                if building_fault:
                    anomaly_status = 1
                    anomaly_type = building_fault["fault_type"]
                    if building_fault["fault_type"] == "sensor_drift":
                        obs_flow_lpm = round(obs_flow_lpm * building_fault["drift_factor"], 2)
                        obs_consumption_liters = round(obs_consumption_liters * building_fault["drift_factor"], 1)
                    elif building_fault["fault_type"] == "sensor_freeze":
                        obs_flow_lpm = round(bcfg.base_flow_lpm * 0.9, 2)  # Stuck reading
                        obs_consumption_liters = round(obs_flow_lpm * 60.0, 1)
                    elif building_fault["fault_type"] == "telemetry_spike":
                        obs_flow_lpm = round(obs_flow_lpm * 3.8, 2)
                        obs_consumption_liters = round(obs_consumption_liters * 3.8, 1)

                rows.append({
                    "timestamp": ts_str,
                    "building": bcfg.building_name,
                    "building_id": bcfg.building_id,
                    "occupancy": occupancy,
                    "water_consumption_liters": obs_consumption_liters,
                    "flow_rate_lpm": obs_flow_lpm,
                    "pressure_bar": pressure_bar,
                    "tank_level_percent": final_tank_pct,
                    "night_flow_lpm": night_flow_lpm,
                    "temperature": round(temp, 1),
                    "rainfall": round(rainfall, 1),
                    "humidity": round(humidity, 1),
                    "is_weekend": is_weekend,
                    "is_holiday": is_holiday,
                    # Target ground-truth labels
                    "leak_status": has_leak,
                    "anomaly_status": anomaly_status,
                    "leak_severity": leak_severity,
                    "leak_flow_lpm": round(leak_flow_lpm, 2),
                    "anomaly_type": anomaly_type,
                    "weather_data_source": w_source,
                })

            # Decrement active events
            for ev in active_events:
                ev["remaining_hours"] -= 1
            active_events = [ev for ev in active_events if ev["remaining_hours"] > 0]

        df = pd.DataFrame(rows)
        return df

    def save_and_split(self) -> Dict[str, Path]:
        """
        Saves full historical dataset and produces chronologically split ML datasets
        with strict prevention of temporal and label leakage.
        """
        df = self.generate()

        # 1. Full historical campus water dataset
        hist_path = HISTORICAL_DATA_DIR / "campus_water_history_12k.csv"
        df.to_csv(hist_path, index=False)

        # 2. Separate Weather Dataset
        weather_df = df[[
            "timestamp", "temperature", "rainfall", "humidity", "weather_data_source"
        ]].drop_duplicates(subset=["timestamp"]).reset_index(drop=True)
        weather_path = DATA_DIR / "weather_history.csv"
        weather_df.to_csv(weather_path, index=False)

        # 3. Chronological Train/Test Split (First 80% Train ~1600 hours, Last 20% Test ~400 hours)
        # Prevents temporal data leakage!
        unique_timestamps = sorted(df["timestamp"].unique())
        split_idx = int(len(unique_timestamps) * 0.8)
        split_time = unique_timestamps[split_idx]

        train_mask = df["timestamp"] < split_time
        test_mask = df["timestamp"] >= split_time

        df_train = df[train_mask].copy()
        df_test = df[test_mask].copy()

        # Observable feature columns (strictly NO ground truth labels!)
        feature_cols = [
            "timestamp", "building", "building_id", "occupancy",
            "water_consumption_liters", "flow_rate_lpm", "pressure_bar",
            "tank_level_percent", "night_flow_lpm", "temperature",
            "rainfall", "humidity", "is_weekend", "is_holiday",
            "weather_data_source",
        ]

        target_cols = [
            "timestamp", "building_id", "leak_status", "anomaly_status",
            "leak_severity", "leak_flow_lpm", "anomaly_type",
        ]

        train_feat_path = PROCESSED_DATA_DIR / "ml_features_train.csv"
        test_feat_path = PROCESSED_DATA_DIR / "ml_features_test.csv"
        train_gt_path = PROCESSED_DATA_DIR / "ground_truth_train.csv"
        test_gt_path = PROCESSED_DATA_DIR / "ground_truth_test.csv"

        df_train[feature_cols].to_csv(train_feat_path, index=False)
        df_test[feature_cols].to_csv(test_feat_path, index=False)
        df_train[target_cols].to_csv(train_gt_path, index=False)
        df_test[target_cols].to_csv(test_gt_path, index=False)

        return {
            "historical": hist_path,
            "weather": weather_path,
            "train_features": train_feat_path,
            "test_features": test_feat_path,
            "train_ground_truth": train_gt_path,
            "test_ground_truth": test_gt_path,
        }


if __name__ == "__main__":
    gen = CampusDataGenerator(seed=RANDOM_SEED, timesteps=2000)
    paths = gen.save_and_split()
    print("Data Foundation successfully initialized:")
    for k, p in paths.items():
        print(f"  {k}: {p}")
