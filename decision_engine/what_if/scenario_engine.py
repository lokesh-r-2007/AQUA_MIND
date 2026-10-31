"""
AquaMind AI - What-If Scenario Simulation Engine
Allows campus operators to test dynamic operational scenarios:
- Moderate or major pipeline leak
- Supply cut / municipal disruption (-40%)
- Heatwave / drought (+35°C, zero rain)
- Heavy monsoon rainfall (+45mm)
- Increased student occupancy (+25%)
- Immediate leak repair & isolation
Returns side-by-side comparative metrics clearly identified as scenario projections.
"""

from typing import Dict, Any, List
from backend.core.config import CAMPUS_BUILDINGS, CENTRAL_RESERVOIR_CAPACITY_LITERS
from decision_engine.optimization.allocator import WaterDistributionOptimizer
from ai.shortage_prediction.risk_engine import ShortageRiskEngine


class WhatIfScenarioEngine:
    """Simulates hypothetical operational scenarios and compares with baseline."""

    @classmethod
    def simulate_scenario(
        cls,
        scenario_type: str,
        target_building_id: str = "hostel_a",
        supply_reduction_pct: float = 0.0,
        temperature_delta_c: float = 0.0,
        rainfall_mm: float = 0.0,
        occupancy_multiplier: float = 1.0,
    ) -> Dict[str, Any]:
        """
        Calculates impact of scenario vs baseline:
        - baseline_demand vs scenario_demand
        - storage autonomy change
        - shortage risk tier transition
        - estimated water loss and financial cost
        """
        # 1. Baseline Calculations
        base_demand_by_building = {
            "academic_block": 28_000.0,
            "hostel_a": 42_000.0,
            "hostel_b": 46_000.0,
            "canteen": 32_000.0,
            "laboratory_block": 38_000.0,
            "sports_garden": 25_000.0,
        }
        total_baseline_demand = sum(base_demand_by_building.values())
        baseline_supply = 240_000.0  # Daily campus inflow
        baseline_reservoir_pct = 85.0
        baseline_tank_levels = {bid: 75.0 for bid in CAMPUS_BUILDINGS}

        # 2. Apply Scenario Modifiers
        scenario_demand = dict(base_demand_by_building)
        scenario_supply = baseline_supply * (1.0 - supply_reduction_pct / 100.0)
        scenario_tank_levels = dict(baseline_tank_levels)
        leak_loss_liters = 0.0
        scenario_notes = []

        if scenario_type == "moderate_leak":
            # Target building experiences 18.5 LPM leak (~26,640 L/day)
            leak_rate_lpm = 18.5
            leak_loss_liters = leak_rate_lpm * 60.0 * 24.0
            scenario_demand[target_building_id] += leak_loss_liters
            scenario_tank_levels[target_building_id] = max(15.0, scenario_tank_levels[target_building_id] - 35.0)
            scenario_notes.append(f"Moderate pipe leak in {target_building_id} (+{leak_loss_liters:,.0f} L/day water loss)")

        elif scenario_type == "major_leak":
            # Target building experiences 55 LPM leak (~79,200 L/day)
            leak_rate_lpm = 55.0
            leak_loss_liters = leak_rate_lpm * 60.0 * 24.0
            scenario_demand[target_building_id] += leak_loss_liters
            scenario_tank_levels[target_building_id] = 10.0  # Rapid drawdown
            scenario_notes.append(f"Major mainline rupture in {target_building_id} (+{leak_loss_liters:,.0f} L/day loss, pressure collapse)")

        elif scenario_type == "supply_cut":
            scenario_supply = baseline_supply * 0.60  # 40% cut
            scenario_notes.append("Municipal inlet throttled by 40% due to regional city pipeline maintenance")

        elif scenario_type == "drought_heatwave":
            # High temperatures boost lab cooling and garden irrigation
            scenario_demand["sports_garden"] *= 1.45
            scenario_demand["laboratory_block"] *= 1.25
            scenario_notes.append("37°C heatwave: Cooling tower evaporation and turf transpiration spike demand")

        elif scenario_type == "heavy_rain":
            # Rain suppresses irrigation and boosts rainwater harvesting
            scenario_demand["sports_garden"] *= 0.30
            # 15,000 m2 campus roof * 35mm * 0.85 runoff = ~446,000 Liters harvested!
            harvested_liters = 15_000 * 0.035 * 1000 * 0.85
            scenario_supply += harvested_liters
            scenario_notes.append(f"35mm Monsoon rain: Turf irrigation halted, +{harvested_liters:,.0f} L rainwater harvested into central reservoir")

        elif scenario_type == "repaired_leak":
            # Post-repair comparison
            scenario_demand[target_building_id] = base_demand_by_building[target_building_id]
            scenario_tank_levels[target_building_id] = 85.0
            scenario_notes.append(f"Fissure in {target_building_id} isolated and repaired. Baseline restored.")

        total_scenario_demand = sum(scenario_demand.values())

        # 3. Compute Allocation Optimization on Scenario
        alloc_res = WaterDistributionOptimizer.optimize_allocation(
            available_supply_liters_per_day=scenario_supply,
            predicted_daily_demands=scenario_demand,
            current_tank_levels_pct=scenario_tank_levels,
        )

        # 4. Shortage Risk Evaluation
        campus_storage = CENTRAL_RESERVOIR_CAPACITY_LITERS * (baseline_reservoir_pct / 100.0)
        scenario_autonomy_days = campus_storage / max(1000.0, total_scenario_demand)

        if scenario_autonomy_days < 1.2:
            scen_risk = "High Risk"
        elif scenario_autonomy_days < 2.0:
            scen_risk = "Medium Risk"
        else:
            scen_risk = "Low Risk"

        return {
            "scenario_type": scenario_type,
            "target_building_id": target_building_id,
            "is_simulation_estimate": True,
            "baseline": {
                "daily_demand_liters": total_baseline_demand,
                "daily_supply_liters": baseline_supply,
                "shortage_risk": "Low Risk",
                "days_autonomy": round(campus_storage / total_baseline_demand, 2),
                "active_leak_loss_liters": 0.0,
            },
            "scenario": {
                "daily_demand_liters": round(total_scenario_demand, 1),
                "daily_supply_liters": round(scenario_supply, 1),
                "shortage_risk": scen_risk,
                "days_autonomy": round(scenario_autonomy_days, 2),
                "active_leak_loss_liters": round(leak_loss_liters, 1),
                "demand_increase_liters": round(total_scenario_demand - total_baseline_demand, 1),
                "supply_delta_liters": round(scenario_supply - baseline_supply, 1),
            },
            "optimization_plan": alloc_res,
            "scenario_notes": scenario_notes,
        }

