"""
AquaMind AI - Impact Measurement Engine
Calculates verified water savings, financial cost avoidance,
pumping energy savings, and CO2 emissions reductions following an intervention.
Strictly distinguishes estimated potential savings from verified observed post-repair savings.
"""

from typing import Dict, Any
from backend.core.config import WATER_TARIFF_PER_KL


class ImpactEvaluator:
    """Measures physical and financial impact of campus water interventions."""

    PUMPING_ENERGY_KWH_PER_KL: float = 0.45    # ~0.45 kWh per m3 of pumped water
    GRID_EMISSION_FACTOR_KG_CO2_PER_KWH: float = 0.82  # India grid average

    @classmethod
    def calculate_impact(
        cls,
        intervention_id: str,
        building_id: str,
        leak_severity: str,
        pre_intervention_flow_lpm: float,
        post_intervention_flow_lpm: float,
        active_leak_hours: float,
        is_verified: bool = True,
    ) -> Dict[str, Any]:
        """
        Calculates verified water savings:
        Delta Flow (LPM) = Pre Flow - Post Flow.
        Water Saved (Liters) = Delta Flow * 60 mins/hr * active_leak_hours.
        """
        flow_reduction_lpm = max(0.0, pre_intervention_flow_lpm - post_intervention_flow_lpm)
        water_saved_liters = round(flow_reduction_lpm * 60.0 * active_leak_hours, 1)
        financial_savings_inr = round((water_saved_liters / 1000.0) * WATER_TARIFF_PER_KL, 2)

        energy_saved_kwh = round((water_saved_liters / 1000.0) * cls.PUMPING_ENERGY_KWH_PER_KL, 2)
        co2_avoided_kg = round(energy_saved_kwh * cls.GRID_EMISSION_FACTOR_KG_CO2_PER_KWH, 2)

        return {
            "intervention_id": intervention_id,
            "building_id": building_id,
            "leak_severity": leak_severity,
            "pre_intervention_flow_lpm": round(pre_intervention_flow_lpm, 2),
            "post_intervention_flow_lpm": round(post_intervention_flow_lpm, 2),
            "flow_reduction_lpm": round(flow_reduction_lpm, 2),
            "active_leak_hours": round(active_leak_hours, 1),
            "verified_water_saved_liters": water_saved_liters,
            "financial_savings_inr": financial_savings_inr,
            "pumping_energy_saved_kwh": energy_saved_kwh,
            "co2_emissions_avoided_kg": co2_avoided_kg,
            "is_verified": is_verified,
            "measurement_status": "VERIFIED_OBSERVED" if is_verified else "ESTIMATED_PROJECTION",
        }

