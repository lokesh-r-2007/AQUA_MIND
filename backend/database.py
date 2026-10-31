"""
AquaMind AI - Database Layer (SQLite)
Manages connection pooling, schema initialization, table creation, and queries.
"""

import sqlite3
import json
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from typing import Dict, Any, List, Optional
from datetime import datetime

from backend.core.config import DB_PATH, CAMPUS_BUILDINGS


def get_db_connection() -> sqlite3.Connection:
    """Returns a SQLite connection with row factory enabled."""
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initializes SQLite database schema and seeds initial building records."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Buildings Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS buildings (
        building_id TEXT PRIMARY KEY,
        building_name TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        max_occupancy INTEGER NOT NULL,
        tank_capacity_liters REAL NOT NULL,
        nominal_pressure_bar REAL NOT NULL,
        base_flow_lpm REAL NOT NULL,
        night_flow_base_lpm REAL NOT NULL,
        is_vulnerable_population INTEGER NOT NULL,
        is_essential_service INTEGER NOT NULL
    );
    """)

    # 2. Sensor Readings Table (Live & Historical)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sensor_readings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        building_id TEXT NOT NULL,
        water_consumption_liters REAL NOT NULL,
        flow_rate_lpm REAL NOT NULL,
        pressure_bar REAL NOT NULL,
        tank_level_percent REAL NOT NULL,
        night_flow_lpm REAL NOT NULL,
        occupancy INTEGER NOT NULL,
        temperature REAL NOT NULL,
        rainfall REAL NOT NULL,
        humidity REAL NOT NULL,
        weather_data_source TEXT DEFAULT 'open_meteo',
        FOREIGN KEY (building_id) REFERENCES buildings (building_id)
    );
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_sensor_bld_ts ON sensor_readings(building_id, timestamp);")

    # 3. Alerts Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        building_id TEXT NOT NULL,
        category TEXT NOT NULL,
        severity TEXT NOT NULL,
        message TEXT NOT NULL,
        evidence_json TEXT,
        status TEXT NOT NULL DEFAULT 'ACTIVE',  -- ACTIVE, ACKNOWLEDGED, RESOLVED
        FOREIGN KEY (building_id) REFERENCES buildings (building_id)
    );
    """)

    # 4. Predictions Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        building_id TEXT NOT NULL,
        demand_forecast_24h_liters REAL NOT NULL,
        leak_probability REAL NOT NULL,
        leak_severity TEXT NOT NULL,
        anomaly_status INTEGER NOT NULL,
        anomaly_diagnosis TEXT,
        shortage_risk_tier TEXT NOT NULL,
        FOREIGN KEY (building_id) REFERENCES buildings (building_id)
    );
    """)

    # 5. Recommendations Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS recommendations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        problem TEXT NOT NULL,
        building_id TEXT NOT NULL,
        detection_timestamp TEXT NOT NULL,
        evidence_json TEXT NOT NULL,
        baseline_comparison_json TEXT NOT NULL,
        ai_prediction_json TEXT NOT NULL,
        severity TEXT NOT NULL,
        priority TEXT NOT NULL,
        priority_label TEXT NOT NULL,
        risk_score REAL NOT NULL,
        action_window TEXT NOT NULL,
        estimated_water_loss_lph REAL NOT NULL,
        estimated_daily_loss_liters REAL NOT NULL,
        estimated_hourly_cost_inr REAL NOT NULL,
        estimated_daily_cost_inr REAL NOT NULL,
        recommended_action TEXT NOT NULL,
        expected_outcome TEXT NOT NULL,
        assigned_department TEXT NOT NULL,
        approval_status TEXT NOT NULL DEFAULT 'Detected', -- Detected, Under Review, Approved, Rejected, In Progress, Resolved, Impact Measured
        intervention_id TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (building_id) REFERENCES buildings (building_id)
    );
    """)

    # 6. Interventions Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS interventions (
        id TEXT PRIMARY KEY,
        recommendation_id INTEGER,
        building_id TEXT NOT NULL,
        action_taken TEXT NOT NULL,
        operator_notes TEXT,
        start_timestamp TEXT NOT NULL,
        completion_timestamp TEXT,
        status TEXT NOT NULL DEFAULT 'IN_PROGRESS', -- IN_PROGRESS, RESOLVED, CANCELLED
        FOREIGN KEY (building_id) REFERENCES buildings (building_id)
    );
    """)

    # 7. Impact Measurements Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS impact_measurements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        intervention_id TEXT NOT NULL,
        building_id TEXT NOT NULL,
        leak_severity TEXT NOT NULL,
        pre_intervention_flow_lpm REAL NOT NULL,
        post_intervention_flow_lpm REAL NOT NULL,
        flow_reduction_lpm REAL NOT NULL,
        active_leak_hours REAL NOT NULL,
        verified_water_saved_liters REAL NOT NULL,
        financial_savings_inr REAL NOT NULL,
        pumping_energy_saved_kwh REAL NOT NULL,
        co2_emissions_avoided_kg REAL NOT NULL,
        measured_timestamp TEXT NOT NULL,
        FOREIGN KEY (intervention_id) REFERENCES interventions (id)
    );
    """)

    # Seed Buildings if table is empty
    cursor.execute("SELECT COUNT(*) FROM buildings")
    if cursor.fetchone()[0] == 0:
        for bid, bcfg in CAMPUS_BUILDINGS.items():
            cursor.execute("""
            INSERT INTO buildings (
                building_id, building_name, category, description,
                max_occupancy, tank_capacity_liters, nominal_pressure_bar,
                base_flow_lpm, night_flow_base_lpm,
                is_vulnerable_population, is_essential_service
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                bcfg.building_id, bcfg.building_name, bcfg.category, bcfg.description,
                bcfg.max_occupancy, bcfg.tank_capacity_liters, bcfg.nominal_pressure_bar,
                bcfg.base_flow_lpm, bcfg.night_flow_base_lpm,
                1 if bcfg.is_vulnerable_population else 0,
                1 if bcfg.is_essential_service else 0
            ))

    conn.commit()
    conn.close()


if __name__ == "__main__":
    init_db()
    print("AquaMind AI SQLite database successfully initialized at:", DB_PATH)
