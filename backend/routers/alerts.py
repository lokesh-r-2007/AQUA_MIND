"""Alerts Management API Router."""
from fastapi import APIRouter, HTTPException
import json
from typing import List, Dict, Any
from backend.database import get_db_connection

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])


@router.get("")
def get_alerts(status: str = "ALL", limit: int = 50):
    conn = get_db_connection()
    cursor = conn.cursor()
    if status.upper() == "ALL":
        cursor.execute("""
        SELECT a.*, b.building_name 
        FROM alerts a
        JOIN buildings b ON a.building_id = b.building_id
        ORDER BY a.id DESC LIMIT ?
        """, (limit,))
    else:
        cursor.execute("""
        SELECT a.*, b.building_name 
        FROM alerts a
        JOIN buildings b ON a.building_id = b.building_id
        WHERE a.status = ?
        ORDER BY a.id DESC LIMIT ?
        """, (status.upper(), limit))

    raw_rows = [dict(r) for r in cursor.fetchall()]
    conn.close()

    for r in raw_rows:
        try:
            r["evidence"] = json.loads(r["evidence_json"]) if r.get("evidence_json") else []
        except Exception:
            r["evidence"] = []
    return raw_rows


@router.post("/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE alerts SET status = 'ACKNOWLEDGED' WHERE id = ?", (alert_id,))
    conn.commit()
    conn.close()
    return {"status": "SUCCESS", "alert_id": alert_id, "new_status": "ACKNOWLEDGED"}


@router.post("/{alert_id}/resolve")
def resolve_alert(alert_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE alerts SET status = 'RESOLVED' WHERE id = ?", (alert_id,))
    conn.commit()
    conn.close()
    return {"status": "SUCCESS", "alert_id": alert_id, "new_status": "RESOLVED"}

