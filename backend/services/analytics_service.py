"""
AquaMind AI - Analytics Service
Aggregates campus KPIs, historical trends, demand summaries, and impact metrics.
"""

import json
from typing import Dict, Any, List
import pandas as pd
from backend.database import get_db_connection
from backend.core.config import CAMPUS_BUILDINGS, CENTRAL_RESERVOIR_CAPACITY_LITERS


class AnalyticsService:
    """Provides high-level analytical metrics for dashboard and overview pages."""

    @staticmethod
    def get_overview_kpis() -> Dict[str, Any]:
        """Calculates current campus-wide operational metrics."""
        conn = get_db_connection()
        cursor = conn.cursor()

        # Latest reading per building
        cursor.execute("""
        SELECT s.*, b.building_name, b.category, b.tank_capacity_liters
        FROM sensor_readings s
        JOIN buildings b ON s.building_id = b.building_id
        WHERE s.id IN (
            SELECT MAX(id) FROM sensor_readings GROUP BY building_id
        )
        """)
        latest_rows = [dict(r) for r in cursor.fetchall()]

        # Active Alerts
        cursor.execute("SELECT COUNT(*) FROM alerts WHERE status = 'ACTIVE'")
        active_alerts_count = cursor.fetchone()[0]

        # Active Recommendations
        cursor.execute("""
        SELECT COUNT(*), SUM(estimated_daily_loss_liters) 
        FROM recommendations 
        WHERE approval_status IN ('Detected', 'Under Review', 'In Progress')
        """)
        rec_row = cursor.fetchone()
        active_recs_count = rec_row[0] or 0
        potential_daily_loss = rec_row[1] or 0.0

        # High priority issues
        cursor.execute("SELECT COUNT(*) FROM recommendations WHERE priority = 'P1' AND approval_status NOT IN ('Resolved', 'Rejected')")
        p1_count = cursor.fetchone()[0]

        # Verified impact totals
        cursor.execute("SELECT SUM(verified_water_saved_liters), SUM(financial_savings_inr) FROM impact_measurements")
        impact_row = cursor.fetchone()
        total_water_saved = impact_row[0] or 0.0
        total_financial_saved = impact_row[1] or 0.0

        conn.close()

        # Compute aggregates
        total_current_flow_lpm = sum(r["flow_rate_lpm"] for r in latest_rows)
        total_current_consumption_lph = sum(r["water_consumption_liters"] for r in latest_rows)
        avg_tank_level_pct = (sum(r["tank_level_percent"] for r in latest_rows) / max(1, len(latest_rows))) if latest_rows else 75.0
        
        # Campus storage capacity
        total_tank_storage = sum(
            r["tank_capacity_liters"] * (r["tank_level_percent"] / 100.0) for r in latest_rows
        )
        total_storage_available = total_tank_storage + (CENTRAL_RESERVOIR_CAPACITY_LITERS * 0.85)

        return {
            "total_consumption_lph": round(total_current_consumption_lph, 1),
            "total_flow_rate_lpm": round(total_current_flow_lpm, 1),
            "total_storage_available_liters": round(total_storage_available, 1),
            "average_tank_level_pct": round(avg_tank_level_pct, 1),
            "active_alerts_count": active_alerts_count,
            "active_recommendations_count": active_recs_count,
            "p1_critical_count": p1_count,
            "potential_daily_loss_liters": round(potential_daily_loss, 1),
            "verified_water_saved_liters": round(total_water_saved, 1),
            "verified_financial_saved_inr": round(total_financial_saved, 2),
            "building_count": len(latest_rows),
            "latest_readings": latest_rows,
        }

    @staticmethod
    def get_building_consumption_history(building_id: str, limit: int = 48) -> List[Dict[str, Any]]:
        """Returns recent consumption time-series for a building."""
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
        SELECT timestamp, water_consumption_liters, flow_rate_lpm, pressure_bar, tank_level_percent, night_flow_lpm, occupancy
        FROM sensor_readings
        WHERE building_id = ?
        ORDER BY id DESC LIMIT ?
        """, (building_id, limit))
        rows = [dict(r) for r in cursor.fetchall()]
        conn.close()
        return list(reversed(rows))

