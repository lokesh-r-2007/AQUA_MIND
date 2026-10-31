"""
AquaMind AI - Evidence-Based Recommendation Engine
Synthesizes real-time telemetry, baseline deviations, and AI predictions into actionable,
human-reviewable operational recommendations.
Implements the full lifecycle:
Detected -> Under Review -> Approved/Rejected -> In Progress -> Resolved -> Impact Measured
"""

from datetime import datetime
from typing import Dict, Any, List, Optional
from backend.core.config import CAMPUS_BUILDINGS, WATER_TARIFF_PER_KL
from decision_engine.risk_scoring.scorer import RiskScorer


class RecommendationEngine:
    """Generates evidence-based operational recommendations from telemetry & predictions."""

    @staticmethod
    def generate_recommendation(
        building_id: str,
        current_reading: Dict[str, Any],
        ai_leak_prediction: Dict[str, Any],
        ai_anomaly_diagnosis: str,
        shortage_risk: Dict[str, Any],
        timestamp: Optional[str] = None,
    ) -> Optional[Dict[str, Any]]:
        """
        Produces a structured recommendation with clear evidence and baseline comparison.
        Returns None if building is operating completely normally without anomalies.
        """
        bcfg = CAMPUS_BUILDINGS.get(building_id)
        if not bcfg:
            return None

        flow_lpm = float(current_reading.get("flow_rate_lpm", 0.0))
        pressure_bar = float(current_reading.get("pressure_bar", bcfg.nominal_pressure_bar))
        tank_pct = float(current_reading.get("tank_level_percent", 70.0))
        night_flow_lpm = float(current_reading.get("night_flow_lpm", bcfg.night_flow_base_lpm))
        occupancy = int(current_reading.get("occupancy", 50))
        ts = timestamp or current_reading.get("timestamp", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

        is_leak = ai_leak_prediction.get("is_leak", False)
        severity = ai_leak_prediction.get("severity", "none")
        confidence = float(ai_leak_prediction.get("confidence_percent", 50.0))

        # Check if any actionable issue exists
        is_anomalous = (severity != "none") or ("Anomaly" in ai_anomaly_diagnosis) or (tank_pct < 25.0)
        if not is_anomalous and severity == "none":
            return None

        # Calculate estimated leak flow and water loss
        base_flow = bcfg.base_flow_lpm
        flow_deviation_lpm = max(0.0, flow_lpm - base_flow)
        
        if is_leak:
            est_leak_lpm = max(flow_deviation_lpm, 3.0 if severity == "minor" else (18.0 if severity == "moderate" else 55.0))
        else:
            est_leak_lpm = 0.0

        est_loss_liters_per_hour = round(est_leak_lpm * 60.0, 1)
        est_cost_inr_per_hour = round((est_loss_liters_per_hour / 1000.0) * WATER_TARIFF_PER_KL, 2)
        est_daily_loss_liters = round(est_loss_liters_per_hour * 24.0, 1)
        est_daily_cost_inr = round((est_daily_loss_liters / 1000.0) * WATER_TARIFF_PER_KL, 2)

        # Calculate Risk and Priority
        risk_info = RiskScorer.calculate_risk(
            building_id=building_id,
            leak_severity=severity,
            leak_flow_lpm=est_leak_lpm,
            tank_level_pct=tank_pct,
            pressure_bar=pressure_bar,
            shortage_risk_tier=shortage_risk.get("risk_tier", "Low Risk"),
            occupancy=occupancy,
        )

        # Assemble Evidence & Baselines
        evidence = []
        if is_leak:
            evidence.append(f"Measured flow rate is {flow_lpm:.1f} LPM vs normal baseline of {base_flow:.1f} LPM (+{flow_deviation_lpm:.1f} LPM deviation)")
            evidence.append(f"Supply line pressure degraded to {pressure_bar:.2f} bar (Nominal: {bcfg.nominal_pressure_bar:.2f} bar)")
            evidence.append(f"Night minimum flow elevated at {night_flow_lpm:.1f} LPM (Baseline: {bcfg.night_flow_base_lpm:.1f} LPM)")
        elif "Sensor" in ai_anomaly_diagnosis:
            evidence.append(f"Telemetry irregularity detected: {ai_anomaly_diagnosis}")
            evidence.append("Physical pressure and tank mass balance remain uncoupled from reported sensor values")
        else:
            evidence.append(f"Operating condition flagged: {ai_anomaly_diagnosis}")
            evidence.append(f"Tank storage level at {tank_pct:.1f}%")

        evidence.extend(risk_info["contributing_factors"])

        # Determine department assignment and recommended action
        if is_leak:
            if severity in ("major", "moderate"):
                action = f"Dispatch emergency plumbing team to inspect {bcfg.building_name}'s distribution main line. Verify acoustic leak detection at pipe joints."
                department = "Plumbing/Maintenance Team"
                expected_outcome = f"Isolate fissure to prevent loss of {est_daily_loss_liters:,.0f} L/day (₹{est_daily_cost_inr:,.0f}/day) and avert residential water outage."
                problem = f"Suspected {severity.capitalize()} Pipe Leak on {bcfg.building_name} Main Line"
            else:
                action = f"Schedule acoustic survey and valve inspection for {bcfg.building_name} supply riser."
                department = "Plumbing/Maintenance Team"
                expected_outcome = f"Prevent minor weepage from escalating into high-pressure blowout; save {est_daily_loss_liters:,.0f} L/day."
                problem = f"Minor Leak Detected on {bcfg.building_name} Fixtures"
        elif "Sensor" in ai_anomaly_diagnosis:
            action = f"Inspect IoT ultrasonic flow transducer and recalibrate telemetry module at {bcfg.building_name} inlet manifold."
            department = "Water Management Team"
            expected_outcome = "Restore verified telemetry transmission and prevent false alarm escalations."
            problem = f"Sensor Calibration / Telemetry Glitch in {bcfg.building_name}"
        elif bid_is_garden := (building_id == "sports_garden"):
            action = "Suspend daytime sprinkler cycle; switch to moisture-indexed night irrigation."
            department = "Garden/Maintenance Team"
            expected_outcome = "Optimize landscape water use; reduce evaporative losses by 40%."
            problem = "Irrigation Schedule Optimization Opportunity"
        else:
            action = f"Conduct facilities water audit and inspect float valves in {bcfg.building_name} overhead tank."
            department = "Facilities Management"
            expected_outcome = "Eliminate unnecessary tank drawdown and stabilize zone water head."
            problem = f"Abnormal Consumption in {bcfg.building_name}"

        return {
            "problem": problem,
            "building_id": building_id,
            "building_name": bcfg.building_name,
            "detection_timestamp": ts,
            "evidence": evidence,
            "baseline_comparison": {
                "current_flow_lpm": flow_lpm,
                "baseline_flow_lpm": base_flow,
                "current_pressure_bar": pressure_bar,
                "nominal_pressure_bar": bcfg.nominal_pressure_bar,
                "current_night_flow_lpm": night_flow_lpm,
                "baseline_night_flow_lpm": bcfg.night_flow_base_lpm,
                "current_tank_pct": tank_pct,
            },
            "ai_prediction": {
                "display_label": ai_leak_prediction.get("display_label", "Operational Alert"),
                "severity": severity,
                "confidence_percent": confidence,
                "anomaly_diagnosis": ai_anomaly_diagnosis,
            },
            "severity": severity,
            "priority": risk_info["priority"],
            "priority_label": risk_info["priority_label"],
            "risk_score": risk_info["risk_score"],
            "action_window": risk_info["action_window"],
            "estimated_water_loss_lph": est_loss_liters_per_hour,
            "estimated_daily_loss_liters": est_daily_loss_liters,
            "estimated_hourly_cost_inr": est_cost_inr_per_hour,
            "estimated_daily_cost_inr": est_daily_cost_inr,
            "recommended_action": action,
            "expected_outcome": expected_outcome,
            "assigned_department": department,
            "approval_status": "Detected",  # Initial state
        }

