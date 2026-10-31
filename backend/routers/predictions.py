"""Predictions, Demand Forecasts, and Shortage Risk API Router."""
from fastapi import APIRouter
from typing import Dict, Any, List
import pandas as pd
from backend.database import get_db_connection
from backend.core.config import SAVED_MODELS_DIR, CAMPUS_BUILDINGS, CENTRAL_RESERVOIR_CAPACITY_LITERS
from ai.demand_forecasting.forecaster import DemandForecaster
from ai.shortage_prediction.risk_engine import ShortageRiskEngine

router = APIRouter(prefix="/api/predictions", tags=["Predictions"])


@router.get("")
def get_latest_predictions():
    """Returns latest AI predictions per building from database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT p.*, b.building_name 
    FROM predictions p
    JOIN buildings b ON p.building_id = b.building_id
    WHERE p.id IN (
        SELECT MAX(id) FROM predictions GROUP BY building_id
    )
    ORDER BY b.building_name
    """)
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows


@router.get("/forecast")
def get_demand_forecast(hours: int = 24):
    """Returns multi-horizon hourly demand forecasts for each building and campus total."""
    try:
        forecaster = DemandForecaster.load(SAVED_MODELS_DIR)
        res = forecaster.forecast_next_hours(hours_ahead=hours)
        return res
    except Exception as e:
        # Fallback projection if model loading encounters issue
        return {
            "error": str(e),
            "forecast_horizon_hours": hours,
            "campus_hourly_total_liters": [18000.0] * hours,
        }


@router.get("/shortage")
def get_shortage_risk_assessment():
    """Returns comprehensive shortage risk analysis for all buildings and campus overall."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT s.building_id, s.tank_level_percent, b.tank_capacity_liters
    FROM sensor_readings s
    JOIN buildings b ON s.building_id = b.building_id
    WHERE s.id IN (SELECT MAX(id) FROM sensor_readings GROUP BY building_id)
    """)
    latest_readings = [dict(r) for r in cursor.fetchall()]
    conn.close()

    building_evals = []
    total_forecast_24h = 0.0

    for r in latest_readings:
        bid = r["building_id"]
        cur_pct = r["tank_level_percent"]
        cap = r["tank_capacity_liters"]
        cur_vol = cap * (cur_pct / 100.0)
        daily_demand = 35000.0  # nominal
        total_forecast_24h += daily_demand

        eval_res = ShortageRiskEngine.evaluate_building_risk(
            building_id=bid,
            current_tank_level_pct=cur_pct,
            current_tank_volume_liters=cur_vol,
            forecast_demand_24h_liters=daily_demand,
            central_reservoir_level_pct=82.0,
        )
        building_evals.append(eval_res)

    campus_eval = ShortageRiskEngine.evaluate_campus_risk(
        building_evaluations=building_evals,
        central_reservoir_level_pct=82.0,
        central_reservoir_volume_liters=CENTRAL_RESERVOIR_CAPACITY_LITERS * 0.82,
        total_campus_24h_demand_liters=total_forecast_24h,
    )

    return {
        "campus_summary": campus_eval,
        "building_risks": building_evals,
    }

