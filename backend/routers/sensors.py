"""Sensors & Telemetry API Router."""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from backend.database import get_db_connection
from backend.schemas import SensorReadingCreate, SensorReadingResponse

router = APIRouter(prefix="/api/sensors", tags=["Sensors"])


@router.post("/readings")
def receive_sensor_reading(payload: SensorReadingCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO sensor_readings (
        timestamp, building_id, water_consumption_liters, flow_rate_lpm,
        pressure_bar, tank_level_percent, night_flow_lpm, occupancy,
        temperature, rainfall, humidity, weather_data_source
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        payload.timestamp, payload.building_id, payload.water_consumption_liters,
        payload.flow_rate_lpm, payload.pressure_bar, payload.tank_level_percent,
        payload.night_flow_lpm, payload.occupancy, payload.temperature,
        payload.rainfall, payload.humidity, payload.weather_data_source or "open_meteo"
    ))
    new_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return {"status": "SUCCESS", "reading_id": new_id}


@router.get("/latest")
def get_latest_readings():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT s.*, b.building_name, b.category, b.tank_capacity_liters, b.nominal_pressure_bar,
           b.base_flow_lpm, b.is_vulnerable_population
    FROM sensor_readings s
    JOIN buildings b ON s.building_id = b.building_id
    WHERE s.id IN (
        SELECT MAX(id) FROM sensor_readings GROUP BY building_id
    )
    ORDER BY b.building_name
    """)
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return {"timestamp": rows[0]["timestamp"] if rows else None, "buildings": rows}


@router.get("/history")
def get_sensor_history(
    building_id: Optional[str] = None,
    limit: int = Query(default=100, le=1000)
):
    conn = get_db_connection()
    cursor = conn.cursor()
    if building_id:
        cursor.execute("""
        SELECT * FROM sensor_readings WHERE building_id = ?
        ORDER BY id DESC LIMIT ?
        """, (building_id, limit))
    else:
        cursor.execute("SELECT * FROM sensor_readings ORDER BY id DESC LIMIT ?", (limit,))
    
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return list(reversed(rows))

