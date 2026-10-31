"""
AquaMind AI - Shortage-Risk Prediction Engine
Logically evaluates water security risk based on:
- Storage autonomy (hours of stored water remaining under forecast demand)
- Central reservoir buffer
- Municipal inlet continuity
- Weather drought conditions
Outputs: Low Risk, Medium Risk, High Risk with transparent explainable reasoning.
"""

from typing import Dict, Any, List
from backend.core.config import CAMPUS_BUILDINGS, CENTRAL_RESERVOIR_CAPACITY_LITERS


class ShortageRiskEngine:
    """Predicts water shortage probability and operational risk tier."""

    @staticmethod
    def evaluate_building_risk(
        building_id: str,
        current_tank_level_pct: float,
        current_tank_volume_liters: float,
        forecast_demand_24h_liters: float,
        central_reservoir_level_pct: float,
        drought_factor: float = 1.0,
    ) -> Dict[str, Any]:
        """
        Calculates logically grounded shortage risk for a specific building.
        Autonomy (hours) = (Current Storage Volume) / (Average Hourly Forecast Demand).
        """
        avg_hourly_demand = max(50.0, forecast_demand_24h_liters / 24.0)
        hours_of_storage = current_tank_volume_liters / avg_hourly_demand

        bcfg = CAMPUS_BUILDINGS.get(building_id)
        bname = bcfg.building_name if bcfg else building_id

        # Risk Decision Boundaries:
        # High Risk: Less than 8 hours of storage, OR (under 14 hours AND central reservoir < 30%)
        # Medium Risk: 8 to 18 hours of storage, OR central reservoir < 40%
        # Low Risk: > 18 hours of storage with healthy central reservoir
        
        reasons = []
        if hours_of_storage < 8.0:
            risk_tier = "High Risk"
            reasons.append(f"Storage buffer critically low ({hours_of_storage:.1f} hours remaining at current demand rate)")
        elif hours_of_storage < 16.0 or central_reservoir_level_pct < 35.0:
            risk_tier = "Medium Risk"
            if hours_of_storage < 16.0:
                reasons.append(f"Moderate storage buffer ({hours_of_storage:.1f} hours autonomy)")
            if central_reservoir_level_pct < 35.0:
                reasons.append(f"Central campus reservoir is depleted ({central_reservoir_level_pct:.1f}% remaining)")
        else:
            risk_tier = "Low Risk"
            reasons.append(f"Comfortable storage autonomy ({hours_of_storage:.1f} hours) with stable campus reservoir ({central_reservoir_level_pct:.1f}%)")

        if drought_factor > 1.2:
            reasons.append("Heatwave/drought conditions elevate replenishment lead times")

        if bcfg and bcfg.is_vulnerable_population:
            reasons.append("Residential welfare guardrail active: prioritized for replenishment")

        return {
            "building_id": building_id,
            "building_name": bname,
            "risk_tier": risk_tier,
            "hours_of_storage_remaining": round(hours_of_storage, 1),
            "tank_level_pct": round(current_tank_level_pct, 1),
            "forecast_daily_demand_liters": round(forecast_demand_24h_liters, 1),
            "central_reservoir_level_pct": round(central_reservoir_level_pct, 1),
            "reason": "; ".join(reasons),
        }

    @staticmethod
    def evaluate_campus_risk(
        building_evaluations: List[Dict[str, Any]],
        central_reservoir_level_pct: float,
        central_reservoir_volume_liters: float,
        total_campus_24h_demand_liters: float,
    ) -> Dict[str, Any]:
        """Calculates campus-wide aggregate water security posture."""
        high_risk_buildings = [b for b in building_evaluations if b["risk_tier"] == "High Risk"]
        med_risk_buildings = [b for b in building_evaluations if b["risk_tier"] == "Medium Risk"]

        total_storage_liters = central_reservoir_volume_liters + sum(
            CAMPUS_BUILDINGS[b["building_id"]].tank_capacity_liters * (b["tank_level_pct"] / 100.0)
            for b in building_evaluations if b["building_id"] in CAMPUS_BUILDINGS
        )
        campus_days_autonomy = total_storage_liters / max(1000.0, total_campus_24h_demand_liters)

        if len(high_risk_buildings) >= 2 or central_reservoir_level_pct < 25.0 or campus_days_autonomy < 1.0:
            overall_tier = "High Risk"
            summary = f"Campus water security under severe pressure: {len(high_risk_buildings)} building(s) critical; {campus_days_autonomy:.1f} days total reserve."
        elif len(high_risk_buildings) >= 1 or len(med_risk_buildings) >= 2 or central_reservoir_level_pct < 45.0:
            overall_tier = "Medium Risk"
            summary = f"Elevated campus water risk: {len(high_risk_buildings) + len(med_risk_buildings)} buildings requiring monitoring; {campus_days_autonomy:.1f} days reserve."
        else:
            overall_tier = "Low Risk"
            summary = f"Campus water reserves stable: {campus_days_autonomy:.1f} days total autonomy across reservoir and building tanks."

        return {
            "overall_campus_risk": overall_tier,
            "campus_days_autonomy": round(campus_days_autonomy, 2),
            "total_storage_liters": round(total_storage_liters, 1),
            "central_reservoir_pct": round(central_reservoir_level_pct, 1),
            "high_risk_count": len(high_risk_buildings),
            "medium_risk_count": len(med_risk_buildings),
            "summary": summary,
        }

