"""
Tests for AquaMind AI FastAPI Backend Endpoints and Lifespan Workflows.
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


def test_health_check(client):
    resp = client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "HEALTHY"


def test_get_buildings(client):
    resp = client.get("/api/buildings")
    assert resp.status_code == 200
    buildings = resp.json()
    assert len(buildings) == 6
    b_ids = [b["building_id"] for b in buildings]
    assert "hostel_a" in b_ids
    assert "academic_block" in b_ids


def test_sensors_latest_and_step(client):
    resp = client.get("/api/sensors/latest")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["buildings"]) == 6

    # Test stepping simulator
    step_resp = client.post("/api/simulator/step")
    assert step_resp.status_code == 200
    step_data = step_resp.json()
    assert step_data["status"] == "SUCCESS"


def test_leak_trigger_and_recommendation_lifecycle(client):
    """
    Complete End-to-End Workflow Test:
    Trigger Leak -> Observe Anomaly/Prediction -> Recommendation Created ->
    Approve -> Progress -> Resolve & Measure Impact.
    """
    # 1. Trigger Moderate Leak in Hostel A
    leak_resp = client.post("/api/simulator/leak", json={
        "building_id": "hostel_a",
        "severity": "moderate",
        "leak_lpm": 18.5,
    })
    assert leak_resp.status_code == 200

    # 2. Verify Recommendations List
    recs_resp = client.get("/api/recommendations")
    assert recs_resp.status_code == 200
    recs = recs_resp.json()
    assert len(recs) > 0

    hostel_rec = next((r for r in recs if r["building_id"] == "hostel_a"), None)
    assert hostel_rec is not None
    rec_id = hostel_rec["id"]

    # 3. Approve Recommendation
    appr_resp = client.post(f"/api/recommendations/{rec_id}/approve")
    assert appr_resp.status_code == 200
    assert appr_resp.json()["new_status"] == "Approved"

    # 4. Mark In Progress
    prog_resp = client.post(f"/api/recommendations/{rec_id}/progress")
    assert prog_resp.status_code == 200
    assert prog_resp.json()["new_status"] == "In Progress"
    intervention_id = prog_resp.json()["intervention_id"]

    # 5. Resolve and Measure Impact
    res_resp = client.post(f"/api/recommendations/{rec_id}/resolve")
    assert res_resp.status_code == 200
    res_data = res_resp.json()
    assert res_data["new_status"] == "Impact Measured"
    assert "verified_impact" in res_data
    assert res_data["verified_impact"]["verified_water_saved_liters"] > 0

    # 6. Verify Intervention Record
    int_resp = client.get("/api/interventions")
    assert int_resp.status_code == 200
    ints = int_resp.json()
    matched_int = next((i for i in ints if i["id"] == intervention_id), None)
    assert matched_int is not None
    assert matched_int["status"] == "RESOLVED"


def test_water_distribution_optimization_endpoint(client):
    resp = client.get("/api/optimization/allocate?supply_liters=210000")
    assert resp.status_code == 200
    data = resp.json()
    assert data["feasibility_status"] in ("OPTIMAL", "FALLBACK_MINIMUM")
    assert len(data["allocations"]) == 6


def test_what_if_scenario_simulation_endpoint(client):
    resp = client.post("/api/scenario/simulate", json={
        "scenario_type": "supply_cut",
        "supply_reduction_pct": 30.0,
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["scenario"]["daily_supply_liters"] < data["baseline"]["daily_supply_liters"]


def test_analytics_overview_endpoint(client):
    resp = client.get("/api/analytics/overview")
    assert resp.status_code == 200
    data = resp.json()
    assert "total_consumption_lph" in data
    assert "total_storage_available_liters" in data
    assert "verified_water_saved_liters" in data

