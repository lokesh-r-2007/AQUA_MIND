"""Interventions Management API Router."""
from fastapi import APIRouter
from typing import List, Dict, Any
from backend.database import get_db_connection

router = APIRouter(prefix="/api/interventions", tags=["Interventions"])


@router.get("")
def get_interventions():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT i.*, b.building_name, m.verified_water_saved_liters, m.financial_savings_inr,
           m.co2_emissions_avoided_kg
    FROM interventions i
    JOIN buildings b ON i.building_id = b.building_id
    LEFT JOIN impact_measurements m ON i.id = m.intervention_id
    ORDER BY i.start_timestamp DESC
    """)
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

