"""
AquaMind AI - Risk Scoring & Prioritization Engine
Calculates an explainable multi-factor operational risk score (0 to 100)
and maps it to P1 (Critical), P2 (High), or P3 (Moderate) priority levels.
"""

from typing import Dict, Any, Tuple
from backend.core.config import CAMPUS_BUILDINGS, BuildingConfig


class RiskScorer:
    """Calculates explainable risk scores and priority tiers."""

    @staticmethod
    def calculate_risk(
        building_id: str,
        leak_severity: str,
        leak_flow_lpm: float,
        tank_level_pct: float,
        pressure_bar: float,
        shortage_risk_tier: str,
        occupancy: int,
    ) -> Dict[str, Any]:
        """
        Computes composite operational risk score (0-100) based on:
        - Leak severity & water loss rate (weight: 45)
        - Hydraulic pressure drop & tank drawdown (weight: 25)
        - Shortage risk & supply vulnerability (weight: 20)
        - Affected population & service criticality (weight: 10)
        """
        bcfg = CAMPUS_BUILDINGS.get(building_id)
        is_vulnerable = bcfg.is_vulnerable_population if bcfg else False
        is_essential = bcfg.is_essential_service if bcfg else False

        score = 0.0
        factors = []

        # 1. Leak Severity & Water Loss Rate (0 to 45 pts)
        sev = str(leak_severity).lower()
        if sev == "major":
            score += 45.0
            factors.append(f"Major leak active ({leak_flow_lpm:.1f} LPM discharge)")
        elif sev == "moderate":
            score += 32.0
            factors.append(f"Moderate leak active ({leak_flow_lpm:.1f} LPM discharge)")
        elif sev == "minor":
            score += 18.0
            factors.append(f"Minor leak detected ({leak_flow_lpm:.1f} LPM discharge)")
        elif leak_flow_lpm > 0:
            score += min(20.0, leak_flow_lpm * 1.2)
            factors.append(f"Elevated flow discrepancy ({leak_flow_lpm:.1f} LPM)")

        # 2. Hydraulic Pressure & Storage Depletion (0 to 25 pts)
        if pressure_bar < 2.0:
            score += 15.0
            factors.append(f"Severe line depressurization ({pressure_bar:.2f} bar)")
        elif pressure_bar < 2.8:
            score += 8.0
            factors.append(f"Abnormal pressure degradation ({pressure_bar:.2f} bar)")

        if tank_level_pct < 25.0:
            score += 10.0
            factors.append(f"Tank storage critically low ({tank_level_pct:.1f}%)")
        elif tank_level_pct < 45.0:
            score += 5.0
            factors.append(f"Tank level sub-optimal ({tank_level_pct:.1f}%)")

        # 3. Shortage Risk (0 to 20 pts)
        if shortage_risk_tier == "High Risk":
            score += 20.0
            factors.append("Campus/zone in High Shortage Risk state")
        elif shortage_risk_tier == "Medium Risk":
            score += 10.0
            factors.append("Campus/zone in Medium Shortage Risk state")

        # 4. Critical Service & Vulnerable Population (0 to 10 pts)
        if is_vulnerable and sev != "none":
            score += 10.0
            factors.append("Vulnerable residential population affected (Hostel guardrail)")
        elif is_essential and sev != "none":
            score += 7.0
            factors.append("Essential service building affected")

        final_score = round(min(100.0, score), 1)

        # Map to P1, P2, P3
        if final_score >= 65.0:
            priority = "P1"
            priority_label = "P1 — Critical"
            action_window = "Immediate response required (within 1 hour)"
        elif final_score >= 35.0:
            priority = "P2"
            priority_label = "P2 — High"
            action_window = "Action required within 6 hours"
        else:
            priority = "P3"
            priority_label = "P3 — Moderate"
            action_window = "Scheduled inspection within 24 hours"

        return {
            "risk_score": final_score,
            "priority": priority,
            "priority_label": priority_label,
            "action_window": action_window,
            "contributing_factors": factors,
        }

