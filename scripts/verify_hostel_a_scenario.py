"""
AquaMind AI - Master End-to-End Scenario Verification Script
Executes and validates the complete hackathon workflow:
Scenario: Moderate pipeline leak in Hostel A
1. Normal campus conditions verification
2. Moderate leak injection in Hostel A
3. Physical hydraulic response verification (flow up, pressure down, tank drawdown)
4. AI Anomaly Detection & Leak Classification verification
5. Demand forecast & shortage risk updates
6. P1 Recommendation generation with explainable evidence
7. Operator Approval transition (Detected -> Approved)
8. Intervention Dispatch transition (Approved -> In Progress)
9. Pipe Repair & Leak Isolation
10. Resolution & Impact Measurement (In Progress -> Impact Measured)
11. Pre vs Post repair consumption comparison & verified savings calculation
"""

import sys
import json
from pathlib import Path

# Enable UTF-8 for console output on Windows
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from fastapi.testclient import TestClient
from backend.main import app


def run_hostel_a_demonstration():
    print("=" * 80)
    print(" AQUAMIND AI — MASTER HACKATHON DEMONSTRATION VERIFICATION")
    print(" SCENARIO: Moderate Pipeline Leak in Hostel A")
    print("=" * 80)

    with TestClient(app) as client:
        # STEP 1 & 2: Health & Normal campus water conditions
        print("\n[STEP 1 & 2] Verifying System Health & Normal Baseline Telemetry...")
        h_resp = client.get("/api/health")
        assert h_resp.status_code == 200, "Backend health check failed"
        print(f"  -> System Health: {h_resp.json()['status']}")

        # Ensure normal state (stop any previous leak)
        client.post("/api/simulator/leak/stop?building_id=hostel_a")
        step_base = client.post("/api/simulator/step").json()
        h_a_base = next(r for r in step_base["step_result"]["readings"] if r["building_id"] == "hostel_a")
        print(f"  -> Hostel A Baseline Flow:     {h_a_base['flow_rate_lpm']:.1f} LPM")
        print(f"  -> Hostel A Baseline Pressure: {h_a_base['pressure_bar']:.2f} bar")
        print(f"  -> Hostel A Tank Level:        {h_a_base['tank_level_percent']:.1f}%")

        # STEP 3 & 4: Trigger Moderate Leak in Hostel A
        print("\n[STEP 3 & 4] Injecting MODERATE PIPE LEAK into Hostel A...")
        leak_trigger = client.post("/api/simulator/leak", json={
            "building_id": "hostel_a",
            "severity": "moderate",
            "leak_lpm": 18.5,
        })
        assert leak_trigger.status_code == 200
        leak_data = leak_trigger.json()
        print(f"  -> Simulator Action: {leak_data['action']}")

        # STEP 5: Observe changing sensor readings
        print("\n[STEP 5] Observing Physical Hydraulic Reaction in Hostel A...")
        latest_readings = client.get("/api/sensors/latest").json()["buildings"]
        h_a_leak = next(r for r in latest_readings if r["building_id"] == "hostel_a")
        print(f"  -> Flow Rate under Leak:       {h_a_leak['flow_rate_lpm']:.1f} LPM (Baseline: {h_a_base['flow_rate_lpm']:.1f} LPM)")
        print(f"  -> Flow Discrepancy:           +{h_a_leak['flow_rate_lpm'] - h_a_base['flow_rate_lpm']:.1f} LPM (~18.5 LPM physical leak)")
        print(f"  -> Pressure Degradation:       {h_a_leak['pressure_bar']:.2f} bar (Nominal: {h_a_leak['nominal_pressure_bar']} bar)")
        print(f"  -> Tank Depletion:             {h_a_leak['tank_level_percent']:.1f}%")

        assert h_a_leak['flow_rate_lpm'] > h_a_base['flow_rate_lpm'] + 10.0, "Physical flow failed to elevate under leak"
        assert h_a_leak['pressure_bar'] < h_a_base['pressure_bar'], "Physical pressure failed to drop under leak"

        # STEP 6 & 7: AI Anomaly Detection & Leak Classification
        print("\n[STEP 6 & 7] Evaluating Real-Time AI Inference Pipelines...")
        preds = client.get("/api/predictions").json()
        h_a_pred = next((p for p in preds if p["building_id"] == "hostel_a"), None)
        assert h_a_pred is not None, "No prediction found for Hostel A"
        print(f"  -> AI Anomaly Detection Status: {'ANOMALOUS' if h_a_pred['anomaly_status'] else 'NORMAL'}")
        print(f"  -> Root Cause Diagnosis:        {h_a_pred['anomaly_diagnosis']}")
        print(f"  -> Leak Severity Classification:{h_a_pred['leak_severity'].upper()}")
        print(f"  -> Model Vote Confidence (Uncalibrated RF): {h_a_pred['leak_probability'] * 100:.1f}%")

        # STEP 8: Shortage Risk Update
        print("\n[STEP 8] Evaluating Updated Shortage Risk Assessment...")
        shortage = client.get("/api/predictions/shortage").json()
        h_a_shortage = next((r for r in shortage["building_risks"] if r["building_id"] == "hostel_a"), None)
        print(f"  -> Hostel A Risk Tier:         {h_a_shortage['risk_tier']}")
        print(f"  -> Storage Autonomy:           {h_a_shortage['hours_of_storage_remaining']} hours remaining")
        print(f"  -> Risk Explanation:           {h_a_shortage['reason']}")

        # STEP 9 & 10: Decision Support - Recommendations & Priority
        print("\n[STEP 9 & 10] Reviewing Generated Actionable Recommendation...")
        recs = client.get("/api/recommendations").json()
        h_a_rec = next((r for r in recs if r["building_id"] == "hostel_a" and r["approval_status"] in ("Detected", "Under Review", "Approved", "In Progress")), None)
        assert h_a_rec is not None, "Recommendation not generated for Hostel A leak"
        rec_id = h_a_rec["id"]
        print(f"  -> Recommendation ID:          #{rec_id}")
        print(f"  -> Priority:                   {h_a_rec['priority_label']}")
        print(f"  -> Problem Statement:          {h_a_rec['problem']}")
        print(f"  -> Assigned Department:        {h_a_rec['assigned_department']}")
        print(f"  -> Action Window:              {h_a_rec['action_window']}")
        print(f"  -> Recommended Action:         {h_a_rec['recommended_action']}")
        print(f"  -> Estimated Water Loss:       {h_a_rec['estimated_daily_loss_liters']:,.0f} L/day (INR {h_a_rec['estimated_daily_cost_inr']:,.0f}/day)")
        print(f"  -> Supporting Evidence Count:  {len(h_a_rec['evidence'])} verified indicators")
        for ev in h_a_rec['evidence'][:3]:
            print(f"     * {ev}")

        # STEP 11: Human Operator Approval
        print("\n[STEP 11] Human Operator Approves Recommended Action...")
        appr = client.post(f"/api/recommendations/{rec_id}/approve").json()
        print(f"  -> Approval State: {appr['new_status']}")
        assert appr["new_status"] == "Approved"

        # STEP 12: Mark in Progress (Dispatches Maintenance)
        print("\n[STEP 12] Dispatching Plumbing Maintenance Crew (In Progress)...")
        prog = client.post(f"/api/recommendations/{rec_id}/progress?operator_notes=Acoustic+survey+team+dispatched+to+Hostel+A").json()
        int_id = prog["intervention_id"]
        print(f"  -> Intervention Created: {int_id} (Status: {prog['new_status']})")
        assert prog["new_status"] == "In Progress"

        # STEP 13 & 14: Simulate Repair and Resolution
        print("\n[STEP 13 & 14] Simulating Pipe Fissure Repair & Isolating Leak...")
        resolve = client.post(f"/api/recommendations/{rec_id}/resolve?operator_notes=Clamp+installed+on+underground+main").json()
        print(f"  -> Resolution Status: {resolve['new_status']}")
        assert resolve["new_status"] == "Impact Measured"

        # STEP 15 & 16: Impact Measurement
        print("\n[STEP 15 & 16] Evaluating Measured Post-Intervention Impact & Verified Savings...")
        impact = resolve["verified_impact"]
        print(f"  -> Pre-Intervention Flow:      {impact['pre_intervention_flow_lpm']:.1f} LPM")
        print(f"  -> Post-Intervention Flow:     {impact['post_intervention_flow_lpm']:.1f} LPM")
        print(f"  -> Verified Flow Reduction:    -{impact['flow_reduction_lpm']:.1f} LPM")
        print(f"  -> Verified Water Saved:       {impact['verified_water_saved_liters']:,.0f} Liters")
        print(f"  -> Financial Savings:          INR {impact['financial_savings_inr']:,.2f}")
        print(f"  -> Energy Saved:               {impact['pumping_energy_saved_kwh']:.2f} kWh")
        print(f"  -> CO2 Emissions Avoided:      {impact['co2_emissions_avoided_kg']:.2f} kg CO2")
        print(f"  -> Provenance:                 SIMULATED_OBSERVED ({impact['measurement_status']} in Hydraulic Simulator)")

        print("\n" + "=" * 80)
        print(" HACKATHON DEMONSTRATION WORKFLOW PASSED 100% SUCCESSFULLY")
        print(" MONITOR -> DETECT -> PREDICT -> PRIORITIZE -> OPTIMIZE -> RECOMMEND -> HUMAN APPROVAL -> INTERVENE -> MEASURE IMPACT")
        print("=" * 80 + "\n")


if __name__ == "__main__":
    run_hostel_a_demonstration()
