"""
AquaMind AI - Live Sensor Simulator Service
Manages continuous campus hydraulic simulation, processes AI inference pipelines
in real-time (Anomaly Detection, Leak Classification, Shortage Risk),
and generates persisted Alerts and Recommendations.
"""

import json
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd

from backend.core.config import (
    CAMPUS_BUILDINGS,
    BuildingConfig,
    CENTRAL_RESERVOIR_CAPACITY_LITERS,
    CENTRAL_RESERVOIR_INITIAL_LEVEL_PCT,
    MUNICIPAL_INFLOW_NOMINAL_LPM,
    SAVED_MODELS_DIR,
    LEAK_SEVERITIES,
)
from backend.database import get_db_connection
from src.weather.client import WeatherService
from ai.anomaly_detection.detector import WaterAnomalyDetector
from ai.leak_prediction.classifier import LeakClassifier
from ai.demand_forecasting.forecaster import DemandForecaster
from ai.shortage_prediction.risk_engine import ShortageRiskEngine
from decision_engine.recommendations.generator import RecommendationEngine

logger = logging.getLogger("aquamind.simulator_service")


class LiveSimulatorService:
    """Singleton service driving the continuous campus simulation and real-time AI loop."""

    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(LiveSimulatorService, cls).__new__(cls)
            cls._instance._init_service()
        return cls._instance

    def _init_service(self):
        self.is_running = False
        self.current_sim_time = datetime(2024, 3, 25, 8, 0, 0)
        self.weather_service = WeatherService(seed=42)
        
        # Load AI models if available
        try:
            self.anomaly_detector = WaterAnomalyDetector.load(SAVED_MODELS_DIR)
            self.leak_classifier = LeakClassifier.load(SAVED_MODELS_DIR)
            self.demand_forecaster = DemandForecaster.load(SAVED_MODELS_DIR)
            self.ai_ready = True
        except Exception as e:
            logger.warning(f"AI models could not be loaded immediately: {e}")
            self.ai_ready = False

        # Physical Reservoir State
        self.central_reservoir_capacity_liters = CENTRAL_RESERVOIR_CAPACITY_LITERS
        self.central_reservoir_volume_liters = (
            self.central_reservoir_capacity_liters * (CENTRAL_RESERVOIR_INITIAL_LEVEL_PCT / 100.0)
        )

        # Building Tank Volumes & Pump States
        self.tank_volumes: Dict[str, float] = {
            bid: bcfg.tank_capacity_liters * (bcfg.initial_tank_level_pct / 100.0)
            for bid, bcfg in CAMPUS_BUILDINGS.items()
        }
        self.pump_states: Dict[str, int] = {bid: 0 for bid in CAMPUS_BUILDINGS}

        # Active injected events
        self.active_leaks: Dict[str, Dict[str, Any]] = {}
        self.active_faults: Dict[str, Dict[str, Any]] = {}

    @property
    def central_reservoir_level_pct(self) -> float:
        return float(np.clip(
            (self.central_reservoir_volume_liters / self.central_reservoir_capacity_liters) * 100.0,
            0.0, 100.0
        ))

    def trigger_leak(self, building_id: str, severity: str = "moderate", leak_lpm: Optional[float] = None) -> Dict[str, Any]:
        """Triggers a simulated physical pipe leak in a specific building."""
        if building_id not in CAMPUS_BUILDINGS:
            raise ValueError(f"Unknown building '{building_id}'")

        sev_spec = LEAK_SEVERITIES.get(severity, LEAK_SEVERITIES["moderate"])
        rate = leak_lpm if leak_lpm is not None else float(np.mean([sev_spec["min_lpm"], sev_spec["max_lpm"]]))
        if rate == 0.0:
            rate = 18.5  # sensible default for moderate leak

        self.active_leaks[building_id] = {
            "building_id": building_id,
            "severity": severity,
            "leak_lpm": round(rate, 2),
            "start_time": self.current_sim_time.strftime("%Y-%m-%d %H:%M:%S"),
        }
        logger.info(f"Triggered {severity} leak in {building_id} ({rate} LPM)")
        return self.active_leaks[building_id]

    def stop_leak(self, building_id: str) -> bool:
        """Stops an active leak in a specific building."""
        if building_id in self.active_leaks:
            del self.active_leaks[building_id]
            logger.info(f"Stopped leak in {building_id}")
            return True
        return False

    def trigger_sensor_fault(self, building_id: str, fault_type: str = "sensor_drift", affected_sensor: str = "flow_rate") -> Dict[str, Any]:
        """Injects a sensor fault into a building."""
        self.active_faults[building_id] = {
            "building_id": building_id,
            "fault_type": fault_type,
            "affected_sensor": affected_sensor,
            "start_time": self.current_sim_time.strftime("%Y-%m-%d %H:%M:%S"),
        }
        return self.active_faults[building_id]

    def stop_sensor_fault(self, building_id: str) -> bool:
        if building_id in self.active_faults:
            del self.active_faults[building_id]
            return True
        return False

    def step(self) -> Dict[str, Any]:
        """
        Executes a single 1-hour physical simulation step across all 6 buildings:
        - Advances hydraulics & mass balance
        - Runs real AI inference
        - Writes readings to SQLite
        - Generates/updates Alerts & Recommendations
        """
        ts_str = self.current_sim_time.strftime("%Y-%m-%d %H:%M:%S")
        hour = self.current_sim_time.hour
        dow = self.current_sim_time.weekday()
        is_weekend = 1 if dow >= 5 else 0
        is_holiday = 0

        # Retrieve weather
        date_str = self.current_sim_time.strftime("%Y-%m-%d")
        w_df = self.weather_service.fetch_weather(date_str, date_str)
        w_hour = w_df[w_df["timestamp"].str.endswith(f"{hour:02d}:00:00")]
        if not w_hour.empty:
            w_row = w_hour.iloc[0]
            temp = float(w_row["temperature_c"])
            rain = float(w_row["precipitation_mm"])
            humidity = float(w_row["relative_humidity_pct"])
            w_src = str(w_row["weather_data_source"])
        else:
            temp, rain, humidity, w_src = 26.0, 0.0, 55.0, "synthetic_fallback"

        conn = get_db_connection()
        cursor = conn.cursor()

        readings_batch = []
        total_inflow_demand_lpm = 0.0

        for bid, bcfg in CAMPUS_BUILDINGS.items():
            active_leak = self.active_leaks.get(bid)
            active_fault = self.active_faults.get(bid)

            leak_lpm = active_leak["leak_lpm"] if active_leak else 0.0
            leak_sev = active_leak["severity"] if active_leak else "none"

            # Compute occupancy
            if bid == "academic_block":
                occ = int(bcfg.max_occupancy * (0.85 if (9 <= hour <= 17 and not is_weekend) else 0.05))
            elif bid in ("hostel_a", "hostel_b"):
                occ = int(bcfg.max_occupancy * (0.92 if (hour < 8 or hour > 18 or is_weekend) else 0.28))
            elif bid == "canteen":
                occ = int(bcfg.max_occupancy * (0.85 if hour in (8, 13, 20) else 0.06))
            elif bid == "laboratory_block":
                occ = int(bcfg.max_occupancy * (0.75 if (9 <= hour <= 17 and not is_weekend) else 0.08))
            else:
                occ = int(bcfg.max_occupancy * (0.60 if hour in (7, 18) else 0.05))

            # Legitimate fixture flow
            occ_ratio = occ / max(1.0, bcfg.max_occupancy)
            if 2 <= hour <= 5:
                phys_fixture_lpm = bcfg.night_flow_base_lpm * (0.85 + 0.3 * occ_ratio)
            else:
                phys_fixture_lpm = bcfg.base_flow_lpm * occ_ratio + bcfg.night_flow_base_lpm * 0.5

            if temp > 28.0:
                phys_fixture_lpm *= (1.0 + 0.02 * (temp - 28.0))
            if bid == "sports_garden" and rain > 1.0:
                phys_fixture_lpm *= 0.35

            # Physical total flow
            phys_total_flow = phys_fixture_lpm + leak_lpm
            consumption_liters = phys_total_flow * 60.0

            # Mass Balance on Overhead Tank
            cur_vol = self.tank_volumes[bid]
            tank_cap = bcfg.tank_capacity_liters
            cur_pct = (cur_vol / tank_cap) * 100.0

            if cur_pct <= 30.0:
                self.pump_states[bid] = 1
            elif cur_pct >= 92.0:
                self.pump_states[bid] = 0

            pump_on = self.pump_states[bid]
            if pump_on:
                inflow_lpm = min(bcfg.max_inflow_lpm, (tank_cap - cur_vol) / 60.0 + phys_total_flow)
            else:
                inflow_lpm = 0.0

            total_inflow_demand_lpm += inflow_lpm
            new_vol = np.clip(cur_vol + (inflow_lpm - phys_total_flow) * 60.0, 0.0, tank_cap)
            self.tank_volumes[bid] = float(new_vol)
            tank_pct = round((new_vol / tank_cap) * 100.0, 1)

            # Hydraulic Pressure
            head_f = 0.85 + 0.15 * (tank_pct / 100.0)
            sev_meta = LEAK_SEVERITIES[leak_sev]
            leak_drop = sev_meta["pressure_drop_pct"]
            pressure = round(float(np.clip(
                bcfg.nominal_pressure_bar * head_f * (1.0 - leak_drop) - 0.05 * (phys_total_flow / bcfg.base_flow_lpm),
                1.0, 4.5
            )), 2)

            night_flow_lpm = round(bcfg.night_flow_base_lpm + leak_lpm, 2)
            obs_flow = round(phys_total_flow, 2)
            obs_cons = round(consumption_liters, 1)

            # Apply sensor faults
            if active_fault:
                if active_fault["fault_type"] == "sensor_drift":
                    obs_flow = round(obs_flow * 1.5, 2)
                    obs_cons = round(obs_flow * 60.0, 1)
                elif active_fault["fault_type"] == "sensor_freeze":
                    obs_flow = round(bcfg.base_flow_lpm * 0.9, 2)
                    obs_cons = round(obs_flow * 60.0, 1)

            # 1. Insert Reading into SQLite
            cursor.execute("""
            INSERT INTO sensor_readings (
                timestamp, building_id, water_consumption_liters, flow_rate_lpm,
                pressure_bar, tank_level_percent, night_flow_lpm, occupancy,
                temperature, rainfall, humidity, weather_data_source
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                ts_str, bid, obs_cons, obs_flow, pressure, tank_pct,
                night_flow_lpm, occ, temp, rain, humidity, w_src
            ))

            reading_dict = {
                "timestamp": ts_str,
                "building_id": bid,
                "building_name": bcfg.building_name,
                "water_consumption_liters": obs_cons,
                "flow_rate_lpm": obs_flow,
                "pressure_bar": pressure,
                "tank_level_percent": tank_pct,
                "night_flow_lpm": night_flow_lpm,
                "occupancy": occ,
                "temperature": temp,
                "rainfall": rain,
                "humidity": humidity,
            }
            readings_batch.append(reading_dict)

            # 2. Run Real AI Pipeline on this Reading
            row_df = pd.DataFrame([{
                "water_consumption_liters": obs_cons,
                "flow_rate_lpm": obs_flow,
                "pressure_bar": pressure,
                "tank_level_percent": tank_pct,
                "night_flow_lpm": night_flow_lpm,
                "occupancy": occ,
                "temperature": temp,
                "rainfall": rain,
                "humidity": humidity,
                "hour_of_day": hour,
                "day_of_week": dow,
                "is_weekend": is_weekend,
            }])

            if self.ai_ready:
                # Anomaly Detection
                is_anom, _ = self.anomaly_detector.predict(row_df)
                anom_status = int(is_anom[0])
                anom_diag = self.anomaly_detector.diagnose_category(row_df.iloc[0])

                # Leak Classification
                leak_preds, confs, _ = self.leak_classifier.predict(row_df)
                pred_sev = leak_preds[0]
                conf_val = float(confs[0])
                ai_leak_info = self.leak_classifier.format_status_label(pred_sev, conf_val)

                # Demand Forecasting (Next 24h)
                try:
                    df_24h = self.demand_forecaster.forecast_next_hours(
                        hours_ahead=24, start_timestamp=self.current_sim_time
                    )
                    b_24h_demand = sum(df_24h["building_forecasts"].get(bid, [25000.0]))
                except Exception:
                    b_24h_demand = obs_cons * 24.0

                # Shortage Risk Evaluation
                shortage_info = ShortageRiskEngine.evaluate_building_risk(
                    building_id=bid,
                    current_tank_level_pct=tank_pct,
                    current_tank_volume_liters=self.tank_volumes[bid],
                    forecast_demand_24h_liters=b_24h_demand,
                    central_reservoir_level_pct=self.central_reservoir_level_pct,
                )

                # Insert Prediction Record
                cursor.execute("""
                INSERT INTO predictions (
                    timestamp, building_id, demand_forecast_24h_liters,
                    leak_probability, leak_severity, anomaly_status,
                    anomaly_diagnosis, shortage_risk_tier
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    ts_str, bid, b_24h_demand, conf_val, pred_sev,
                    anom_status, anom_diag, shortage_info["risk_tier"]
                ))

                # 3. Trigger Recommendation & Alert if Issue Detected
                if anom_status == 1 or pred_sev != "none" or active_leak:
                    rec = RecommendationEngine.generate_recommendation(
                        building_id=bid,
                        current_reading=reading_dict,
                        ai_leak_prediction=ai_leak_info,
                        ai_anomaly_diagnosis=anom_diag,
                        shortage_risk=shortage_info,
                        timestamp=ts_str,
                    )
                    if rec:
                        # Check if active recommendation already exists for this building
                        cursor.execute("""
                        SELECT id, risk_score, approval_status FROM recommendations 
                        WHERE building_id = ? AND approval_status IN ('Detected', 'Under Review', 'In Progress')
                        ORDER BY id DESC LIMIT 1
                        """, (bid,))
                        existing = cursor.fetchone()

                        if not existing:
                            cursor.execute("""
                            INSERT INTO recommendations (
                                problem, building_id, detection_timestamp, evidence_json,
                                baseline_comparison_json, ai_prediction_json, severity,
                                priority, priority_label, risk_score, action_window,
                                estimated_water_loss_lph, estimated_daily_loss_liters,
                                estimated_hourly_cost_inr, estimated_daily_cost_inr,
                                recommended_action, expected_outcome, assigned_department,
                                approval_status, created_at, updated_at
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            """, (
                                rec["problem"], bid, ts_str,
                                json.dumps(rec["evidence"]),
                                json.dumps(rec["baseline_comparison"]),
                                json.dumps(rec["ai_prediction"]),
                                rec["severity"], rec["priority"], rec["priority_label"],
                                rec["risk_score"], rec["action_window"],
                                rec["estimated_water_loss_lph"], rec["estimated_daily_loss_liters"],
                                rec["estimated_hourly_cost_inr"], rec["estimated_daily_cost_inr"],
                                rec["recommended_action"], rec["expected_outcome"],
                                rec["assigned_department"], rec["approval_status"],
                                ts_str, ts_str
                            ))
                        elif existing["approval_status"] == "Detected" and rec["risk_score"] > existing["risk_score"]:
                            # Escalate / update unapproved recommendation to higher-priority detected event
                            cursor.execute("""
                            UPDATE recommendations SET
                                problem = ?, detection_timestamp = ?, evidence_json = ?,
                                baseline_comparison_json = ?, ai_prediction_json = ?, severity = ?,
                                priority = ?, priority_label = ?, risk_score = ?, action_window = ?,
                                estimated_water_loss_lph = ?, estimated_daily_loss_liters = ?,
                                estimated_hourly_cost_inr = ?, estimated_daily_cost_inr = ?,
                                recommended_action = ?, expected_outcome = ?, assigned_department = ?,
                                updated_at = ?
                            WHERE id = ?
                            """, (
                                rec["problem"], ts_str,
                                json.dumps(rec["evidence"]),
                                json.dumps(rec["baseline_comparison"]),
                                json.dumps(rec["ai_prediction"]),
                                rec["severity"], rec["priority"], rec["priority_label"],
                                rec["risk_score"], rec["action_window"],
                                rec["estimated_water_loss_lph"], rec["estimated_daily_loss_liters"],
                                rec["estimated_hourly_cost_inr"], rec["estimated_daily_cost_inr"],
                                rec["recommended_action"], rec["expected_outcome"],
                                rec["assigned_department"], ts_str, existing["id"]
                            ))

                        # Insert Alert
                        is_leak_alert = ai_leak_info.get("is_leak", False) or bool(active_leak)
                        cursor.execute("""
                        INSERT INTO alerts (timestamp, building_id, category, severity, message, evidence_json, status)
                        VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')
                        """, (
                            ts_str, bid,
                            "LEAK" if is_leak_alert else "ANOMALY",
                            rec["priority_label"],
                            rec["problem"],
                            json.dumps(rec["evidence"])
                        ))

        # Central Reservoir Hydraulic Balance
        # Municipal feed + Rainwater Harvesting
        rain_harvest_lpm = (15_000.0 * (rain / 1000.0) * 1000.0 * 0.85) / 60.0
        muni_feed_lpm = MUNICIPAL_INFLOW_NOMINAL_LPM if self.central_reservoir_level_pct < 95.0 else 50.0
        
        net_res_lpm = (muni_feed_lpm + rain_harvest_lpm) - total_inflow_demand_lpm
        new_res_vol = np.clip(
            self.central_reservoir_volume_liters + net_res_lpm * 60.0,
            0.0, self.central_reservoir_capacity_liters
        )
        self.central_reservoir_volume_liters = float(new_res_vol)

        conn.commit()
        conn.close()

        self.current_sim_time += timedelta(hours=1)

        return {
            "timestamp": ts_str,
            "central_reservoir_level_pct": round(self.central_reservoir_level_pct, 1),
            "central_reservoir_volume_liters": round(self.central_reservoir_volume_liters, 1),
            "readings": readings_batch,
            "active_leaks": list(self.active_leaks.values()),
            "active_faults": list(self.active_faults.values()),
        }

    def get_status(self) -> Dict[str, Any]:
        return {
            "is_running": self.is_running,
            "current_sim_time": self.current_sim_time.strftime("%Y-%m-%d %H:%M:%S"),
            "central_reservoir_level_pct": round(self.central_reservoir_level_pct, 1),
            "central_reservoir_volume_liters": round(self.central_reservoir_volume_liters, 1),
            "active_leaks_count": len(self.active_leaks),
            "active_leaks": list(self.active_leaks.values()),
            "active_faults": list(self.active_faults.values()),
            "ai_models_ready": self.ai_ready,
        }
