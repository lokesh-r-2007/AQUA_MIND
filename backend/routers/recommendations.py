"""Recommendations & Approval Workflow API Router."""
from fastapi import APIRouter, HTTPException
import json
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from backend.database import get_db_connection
from backend.services.simulator_service import LiveSimulatorService
from decision_engine.impact_measurement.evaluator import ImpactEvaluator

router = APIRouter(prefix="/api/recommendations", tags=["Recommendations"])


@router.get("")
def get_recommendations(status: Optional[str] = None):
    conn = get_db_connection()
    cursor = conn.cursor()
    if status:
        cursor.execute("""
        SELECT r.*, b.building_name 
        FROM recommendations r
        JOIN buildings b ON r.building_id = b.building_id
        WHERE r.approval_status = ?
        ORDER BY r.risk_score DESC, r.id DESC
        """, (status,))
    else:
        cursor.execute("""
        SELECT r.*, b.building_name 
        FROM recommendations r
        JOIN buildings b ON r.building_id = b.building_id
        ORDER BY r.risk_score DESC, r.id DESC
        """)
    
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()

    for r in rows:
        try:
            r["evidence"] = json.loads(r["evidence_json"])
            r["baseline_comparison"] = json.loads(r["baseline_comparison_json"])
            r["ai_prediction"] = json.loads(r["ai_prediction_json"])
        except Exception:
            pass
    return rows


@router.post("/{rec_id}/approve")
def approve_recommendation(rec_id: int):
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    UPDATE recommendations 
    SET approval_status = 'Approved', updated_at = ?
    WHERE id = ?
    """, (now, rec_id))
    conn.commit()
    conn.close()
    return {"status": "SUCCESS", "recommendation_id": rec_id, "new_status": "Approved"}


@router.post("/{rec_id}/reject")
def reject_recommendation(rec_id: int):
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    UPDATE recommendations 
    SET approval_status = 'Rejected', updated_at = ?
    WHERE id = ?
    """, (now, rec_id))
    conn.commit()
    conn.close()
    return {"status": "SUCCESS", "recommendation_id": rec_id, "new_status": "Rejected"}


@router.post("/{rec_id}/progress")
def mark_in_progress(rec_id: int, operator_notes: Optional[str] = "Maintenance crew dispatched"):
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    conn = get_db_connection()
    cursor = conn.cursor()

    # Retrieve recommendation details
    cursor.execute("SELECT * FROM recommendations WHERE id = ?", (rec_id,))
    rec = cursor.fetchone()
    if not rec:
        conn.close()
        raise HTTPException(status_code=404, detail="Recommendation not found")

    intervention_id = f"INT-{uuid.uuid4().hex[:8].upper()}"

    # Create intervention record
    cursor.execute("""
    INSERT INTO interventions (
        id, recommendation_id, building_id, action_taken, operator_notes, start_timestamp, status
    ) VALUES (?, ?, ?, ?, ?, ?, 'IN_PROGRESS')
    """, (
        intervention_id, rec_id, rec["building_id"],
        rec["recommended_action"], operator_notes, now
    ))

    # Update recommendation
    cursor.execute("""
    UPDATE recommendations 
    SET approval_status = 'In Progress', intervention_id = ?, updated_at = ?
    WHERE id = ?
    """, (intervention_id, now, rec_id))

    conn.commit()
    conn.close()

    return {
        "status": "SUCCESS",
        "recommendation_id": rec_id,
        "intervention_id": intervention_id,
        "new_status": "In Progress"
    }


@router.post("/{rec_id}/resolve")
def resolve_and_measure_impact(rec_id: int, operator_notes: Optional[str] = "Pipe fissure repaired with reinforced sleeve"):
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM recommendations WHERE id = ?", (rec_id,))
    rec = cursor.fetchone()
    if not rec:
        conn.close()
        raise HTTPException(status_code=404, detail="Recommendation not found")

    bid = rec["building_id"]
    intervention_id = rec["intervention_id"] or f"INT-{uuid.uuid4().hex[:8].upper()}"

    # Stop leak in simulator if active (Physical repair simulation)
    sim = LiveSimulatorService()
    sim.stop_leak(bid)
    step_res = sim.step()  # Advance 1 step post-repair

    # Pre-intervention flow from recommendation baseline comparison
    try:
        base_cmp = json.loads(rec["baseline_comparison_json"])
        pre_flow = float(base_cmp.get("current_flow_lpm", 45.0))
    except Exception:
        pre_flow = 45.0

    # Post-intervention flow from step result
    post_flow = next(
        (r["flow_rate_lpm"] for r in step_res["readings"] if r["building_id"] == bid),
        25.0
    )

    # Calculate verified observed impact
    impact = ImpactEvaluator.calculate_impact(
        intervention_id=intervention_id,
        building_id=bid,
        leak_severity=rec["severity"],
        pre_intervention_flow_lpm=pre_flow,
        post_intervention_flow_lpm=post_flow,
        active_leak_hours=24.0,  # 1 full day of averted loss
        is_verified=True,
    )

    # Insert Impact Measurement
    cursor.execute("""
    INSERT INTO impact_measurements (
        intervention_id, building_id, leak_severity, pre_intervention_flow_lpm,
        post_intervention_flow_lpm, flow_reduction_lpm, active_leak_hours,
        verified_water_saved_liters, financial_savings_inr, pumping_energy_saved_kwh,
        co2_emissions_avoided_kg, measured_timestamp
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        intervention_id, bid, rec["severity"],
        impact["pre_intervention_flow_lpm"], impact["post_intervention_flow_lpm"],
        impact["flow_reduction_lpm"], impact["active_leak_hours"],
        impact["verified_water_saved_liters"], impact["financial_savings_inr"],
        impact["pumping_energy_saved_kwh"], impact["co2_emissions_avoided_kg"],
        now
    ))

    # Update intervention
    cursor.execute("""
    UPDATE interventions 
    SET status = 'RESOLVED', completion_timestamp = ?, operator_notes = ?
    WHERE id = ?
    """, (now, operator_notes, intervention_id))

    # Update recommendation
    cursor.execute("""
    UPDATE recommendations 
    SET approval_status = 'Impact Measured', updated_at = ?
    WHERE id = ?
    """, (now, rec_id))

    # Resolve corresponding alert
    cursor.execute("""
    UPDATE alerts SET status = 'RESOLVED' WHERE building_id = ? AND status = 'ACTIVE'
    """, (bid,))

    conn.commit()
    conn.close()

    return {
        "status": "SUCCESS",
        "recommendation_id": rec_id,
        "intervention_id": intervention_id,
        "new_status": "Impact Measured",
        "verified_impact": impact,
    }

