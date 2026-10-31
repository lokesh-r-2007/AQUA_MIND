"""Buildings API Router."""
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from backend.database import get_db_connection
from backend.schemas import BuildingResponse

router = APIRouter(prefix="/api/buildings", tags=["Buildings"])


@router.get("", response_model=List[BuildingResponse])
def get_all_buildings():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM buildings ORDER BY building_name")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows


@router.get("/{building_id}", response_model=BuildingResponse)
def get_building(building_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM buildings WHERE building_id = ?", (building_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail=f"Building '{building_id}' not found.")
    return dict(row)

