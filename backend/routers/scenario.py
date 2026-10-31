"""What-If Scenario Simulation API Router."""
from fastapi import APIRouter
from backend.schemas import ScenarioSimulateRequest
from decision_engine.what_if.scenario_engine import WhatIfScenarioEngine

router = APIRouter(prefix="/api/scenario", tags=["Scenario Simulator"])


@router.post("/simulate")
def run_scenario(req: ScenarioSimulateRequest):
    """Executes hypothetical what-if scenario and returns side-by-side comparative analysis."""
    res = WhatIfScenarioEngine.simulate_scenario(
        scenario_type=req.scenario_type,
        target_building_id=req.target_building_id or "hostel_a",
        supply_reduction_pct=req.supply_reduction_pct or 0.0,
        temperature_delta_c=req.temperature_delta_c or 0.0,
    )
    return res

