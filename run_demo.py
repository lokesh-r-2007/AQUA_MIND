"""
AQUAMIND Phase 1 End-to-End Demonstration Script.
Executes data generation, physical sensor simulation, real-time leak injection,
and physical consistency validation audit.
"""

import sys
import time
from pathlib import Path
import pandas as pd

from src.config import DATA_DIR, CAMPUS_ZONES, RANDOM_SEED
from src.data.generator import HistoricalDataGenerator
from src.simulation.campus_network import CampusNetworkSimulator
from src.weather.client import WeatherService
from src.validation.validator import PhysicalConsistencyValidator


def main():
    print("=" * 80)
    print(" AQUAMIND: AI-POWERED WATER RESILIENCE SYSTEM (PHASE 1 DEMONSTRATION)")
    print("=" * 80)
    print("Theme: THEME 3: AI for Impact - Sustainability")
    print("Topology: Educational & Research Campus (6 Zones + 500,000L Central Reservoir)")
    print("-" * 80)

    # 1. Check or Generate Historical Dataset
    obs_file = DATA_DIR / "historical_sensor_readings.csv"
    if not obs_file.exists():
        print("\n[STEP 1] Generating 12,000 historical records...")
        gen = HistoricalDataGenerator(seed=RANDOM_SEED, timesteps=2000)
        gen.save_datasets()
    else:
        print(f"\n[STEP 1] Found existing 12,000-record historical dataset at {obs_file}")

    df_obs = pd.read_csv(obs_file)
    print(f"  -> Total records: {len(df_obs):,} rows across {df_obs['zone_id'].nunique()} zones.")
    print(f"  -> Features: {list(df_obs.columns[:7])} ... ({len(df_obs.columns)} total observable features)")

    # 2. Weather Provenance and Fallback Demo
    print("\n[STEP 2] Demonstrating Weather Resilience & Fallback Engine...")
    ws = WeatherService(seed=RANDOM_SEED)
    w_live = ws.fetch_weather("2024-01-01", "2024-01-02")
    print(f"  -> Live/Cached query source: {w_live['weather_data_source'].iloc[0]} ({len(w_live)} hours)")
    
    w_fallback = ws.fetch_weather("2024-01-01", "2024-01-02", simulate_timeout=True)
    print(f"  -> Simulated timeout fallback source: {w_fallback['weather_data_source'].iloc[0]} ({len(w_fallback)} hours)")

    # 3. Continuous Multi-Zone Hydraulic Simulation
    print("\n[STEP 3] Running Multi-Zone Continuous Simulation (Normal State)...")
    sim = CampusNetworkSimulator(seed=RANDOM_SEED)
    ts = pd.Timestamp("2024-01-15 08:00:00")
    batch, _ = sim.step(ts, temperature_c=24.5, precipitation_mm=0.0, relative_humidity_pct=52.0, weather_source="open_meteo")
    
    print(f"  Timestamp: {batch.batch_timestamp} | Central Reservoir: {batch.central_reservoir_level_pct:.1f}% ({batch.central_reservoir_volume_liters:,.0f} L)")
    for z in batch.zones[:3]:
        print(f"    * {z.zone_name:<30} Flow: {z.outlet_flow_rate_lph:>6.1f} L/h | Tank: {z.tank_level_pct:>5.1f}% | Press: {z.supply_pressure_bar:>4.2f} bar")

    # 4. Inject Moderate Leak Scenario
    print("\n[STEP 4] Injecting MODERATE LEAK in Zone 3 (Student Hostels Complex)...")
    leak_resp = sim.trigger_leak(
        zone_id="zone_3_student_hostels",
        severity="moderate",
        start_time=str(ts),
        leak_rate_lph=1250.0,
        affected_component="hostel_block_c_flange",
    )
    print(f"  -> Control Action: {leak_resp.message}")

    ts_leak = pd.Timestamp("2024-01-15 09:00:00")
    batch_leak, recs_leak = sim.step(ts_leak, temperature_c=25.0, precipitation_mm=0.0, relative_humidity_pct=50.0, weather_source="open_meteo")
    
    z3_rec = next(r for r in recs_leak if r.telemetry.zone_id == "zone_3_student_hostels")
    print(f"  -> Hydraulic Reaction in Zone 3:")
    print(f"     * Pipe Outlet Flow:        {z3_rec.telemetry.outlet_flow_rate_lph:>7.1f} L/h")
    print(f"     * Building Smart Submeter: {z3_rec.telemetry.building_consumption_lph:>7.1f} L/h")
    print(f"     * Flow Discrepancy:        {z3_rec.telemetry.outlet_flow_rate_lph - z3_rec.telemetry.building_consumption_lph:>7.1f} L/h (Actual Leak: {z3_rec.ground_truth.ground_truth_leak_rate_lph} L/h)")
    print(f"     * Supply Pressure:         {z3_rec.telemetry.supply_pressure_bar:>7.2f} bar (Noticeable pressure drop)")
    print(f"     * Tank Level:              {z3_rec.telemetry.tank_level_pct:>7.1f}%")

    # 5. Stop Leak & Recover
    print("\n[STEP 5] Repairing Pipe & Stopping Leak...")
    stop_resp = sim.stop_leak("zone_3_student_hostels")
    print(f"  -> Control Action: {stop_resp.message}")
    ts_recov = pd.Timestamp("2024-01-15 10:00:00")
    batch_recov, recs_recov = sim.step(ts_recov, temperature_c=25.5, precipitation_mm=0.0, relative_humidity_pct=48.0, weather_source="open_meteo")
    z3_recov = next(r for r in recs_recov if r.telemetry.zone_id == "zone_3_student_hostels")
    print(f"  -> Zone 3 Post-Repair Flow: {z3_recov.telemetry.outlet_flow_rate_lph:.1f} L/h | Pressure restored: {z3_recov.telemetry.supply_pressure_bar:.2f} bar")

    # 6. Run Full Validation Audit
    print("\n[STEP 6] Running Phase 1 Physical Consistency & Integrity Audit...")
    validator = PhysicalConsistencyValidator(data_dir=DATA_DIR)
    report = validator.run_all_validations()
    report.print_summary()

    print("Phase 1 implementation and validation complete!")


if __name__ == "__main__":
    main()

