"""
Tests for AquaMind AI Decision Engine and Optimization Modules.
Verifies Risk Scoring, Recommendation Engine, Water Distribution Optimization,
Impact Measurement, and What-If Scenario Simulations.
"""

import pytest
from backend.core.config import CAMPUS_BUILDINGS
from decision_engine.risk_scoring.scorer import RiskScorer
from decision_engine.recommendations.generator import RecommendationEngine
from decision_engine.optimization.allocator import WaterDistributionOptimizer
from decision_engine.impact_measurement.evaluator import ImpactEvaluator
from decision_engine.what_if.scenario_engine import WhatIfScenarioEngine


def test_risk_scoring_prioritization():
    """Verify RiskScorer properly maps severity and pressure loss to P1, P2, P3."""
    # Major leak with depressurization => P1 Critical
    p1_res = RiskScorer.calculate_risk(
        building_id="hostel_a",
        leak_severity="major",
        leak_flow_lpm=55.0,
        tank_level_pct=20.0,
        pressure_bar=1.8,
        shortage_risk_tier="High Risk",
        occupancy=400,
    )
    assert p1_res["priority"] == "P1"
    assert p1_res["risk_score"] >= 65.0
    assert "Immediate" in p1_res["action_window"]

    # Minor leak with stable pressure => P3 or P2
    p3_res = RiskScorer.calculate_risk(
        building_id="academic_block",
        leak_severity="minor",
        leak_flow_lpm=2.5,
        tank_level_pct=75.0,
        pressure_bar=3.4,
        shortage_risk_tier="Low Risk",
        occupancy=300,
    )
    assert p3_res["priority"] in ("P2", "P3")
    assert p3_res["risk_score"] < 65.0


def test_recommendation_generation_hostel_a_leak():
    """Verify evidence-based recommendation for Hostel A moderate leak."""
    current_reading = {
        "flow_rate_lpm": 68.5,
        "pressure_bar": 2.25,
        "tank_level_percent": 55.0,
        "night_flow_lpm": 20.0,
        "occupancy": 420,
    }
    ai_leak = {
        "is_leak": True,
        "severity": "moderate",
        "confidence_percent": 91.2,
        "display_label": "Possible Moderate Leak — Inspection Required",
    }
    shortage_risk = {"risk_tier": "Medium Risk"}

    rec = RecommendationEngine.generate_recommendation(
        building_id="hostel_a",
        current_reading=current_reading,
        ai_leak_prediction=ai_leak,
        ai_anomaly_diagnosis="Infrastructure Anomaly (Suspected Physical Leak)",
        shortage_risk=shortage_risk,
    )

    assert rec is not None
    assert rec["building_id"] == "hostel_a"
    assert rec["severity"] == "moderate"
    assert rec["assigned_department"] == "Plumbing/Maintenance Team"
    assert len(rec["evidence"]) >= 3
    assert rec["estimated_water_loss_lph"] > 0
    assert rec["approval_status"] == "Detected"


def test_water_distribution_optimization_fairness():
    """Verify water optimization protects essential floors and residential hostels."""
    demands = {
        "academic_block": 30000.0,
        "hostel_a": 45000.0,
        "hostel_b": 50000.0,
        "canteen": 35000.0,
        "laboratory_block": 40000.0,
        "sports_garden": 30000.0,
    }
    levels = {bid: 70.0 for bid in demands}

    # Constrained supply: 180,000 L available for 230,000 L demand
    res = WaterDistributionOptimizer.optimize_allocation(
        available_supply_liters_per_day=180000.0,
        predicted_daily_demands=demands,
        current_tank_levels_pct=levels,
    )

    assert res["feasibility_status"] in ("OPTIMAL", "FALLBACK_MINIMUM")
    assert res["requires_human_approval"] is True
    
    alloc_map = {b["building_id"]: b for b in res["allocations"]}
    
    # Hostels must get higher satisfaction percentage than non-essential sports garden
    hostel_satisfaction = alloc_map["hostel_a"]["demand_satisfied_pct"]
    garden_satisfaction = alloc_map["sports_garden"]["demand_satisfied_pct"]
    assert hostel_satisfaction >= garden_satisfaction


def test_impact_measurement_savings_calculation():
    """Verify verified impact measurement accurately calculates water, money, and CO2 saved."""
    impact = ImpactEvaluator.calculate_impact(
        intervention_id="INT-TEST-01",
        building_id="hostel_a",
        leak_severity="moderate",
        pre_intervention_flow_lpm=55.0,
        post_intervention_flow_lpm=35.0,
        active_leak_hours=24.0,
        is_verified=True,
    )

    # 20 LPM reduction * 60 mins * 24 hrs = 28,800 Liters
    assert impact["flow_reduction_lpm"] == 20.0
    assert impact["verified_water_saved_liters"] == 28800.0
    assert impact["financial_savings_inr"] > 1000.0
    assert impact["pumping_energy_saved_kwh"] > 10.0
    assert impact["co2_emissions_avoided_kg"] > 8.0
    assert impact["measurement_status"] == "VERIFIED_OBSERVED"


def test_what_if_scenario_simulation():
    """Verify WhatIfScenarioEngine calculates baseline vs scenario comparison."""
    res = WhatIfScenarioEngine.simulate_scenario(
        scenario_type="moderate_leak",
        target_building_id="hostel_a",
    )

    assert res["is_simulation_estimate"] is True
    assert res["scenario"]["daily_demand_liters"] > res["baseline"]["daily_demand_liters"]
    assert res["scenario"]["active_leak_loss_liters"] > 20000.0
    assert len(res["scenario_notes"]) > 0

