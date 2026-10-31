"""
AquaMind AI - Core Configuration Module
Defines campus buildings, physical tank specifications, flow parameters,
weather settings, and application constants.
"""

from pathlib import Path
from dataclasses import dataclass
from typing import Dict, List

# Workspace Root & Data Paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
HISTORICAL_DATA_DIR = DATA_DIR / "historical"
PROCESSED_DATA_DIR = DATA_DIR / "processed"
WEATHER_CACHE_DIR = DATA_DIR / "weather_cache"
SAVED_MODELS_DIR = BASE_DIR / "ai" / "saved_models"
BACKEND_DIR = BASE_DIR / "backend"
DB_PATH = BACKEND_DIR / "aquamind.db"

# Create directories
for d in [HISTORICAL_DATA_DIR, PROCESSED_DATA_DIR, WEATHER_CACHE_DIR, SAVED_MODELS_DIR, BACKEND_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# Global Reproducible Seed
RANDOM_SEED: int = 42

# Campus Coordinates & Meteorological Reference (Bangalore Campus)
CAMPUS_NAME: str = "TCS Innovation Campus"
CAMPUS_LATITUDE: float = 12.9716
CAMPUS_LONGITUDE: float = 77.5946
CAMPUS_TIMEZONE: str = "Asia/Kolkata"

# Central Reservoir Physical Parameters
CENTRAL_RESERVOIR_CAPACITY_LITERS: float = 500_000.0  # 500 m3
CENTRAL_RESERVOIR_INITIAL_LEVEL_PCT: float = 85.0
MUNICIPAL_INFLOW_NOMINAL_LPM: float = 400.0          # ~24,000 L/h

# Water Cost and Tariff (INR per 1,000 Liters)
WATER_TARIFF_PER_KL: float = 45.0  # ₹45 per m³ (1,000 L)


@dataclass(frozen=True)
class BuildingConfig:
    """Physical and operational specification for a campus building."""
    building_id: str
    building_name: str
    category: str
    description: str
    max_occupancy: int
    tank_capacity_liters: float     # Overhead storage capacity
    initial_tank_level_pct: float   # Starting level %
    base_flow_lpm: float            # Baseline active fixture flow (L/min)
    night_flow_base_lpm: float      # Minimum night flow baseline (L/min)
    nominal_pressure_bar: float     # Standard line pressure (bar)
    max_inflow_lpm: float           # Max booster pump capacity (L/min)
    is_vulnerable_population: bool  # Guardrail: Residential / critical care
    is_essential_service: bool      # Guardrail: Essential drinking & sanitation priority


CAMPUS_BUILDINGS: Dict[str, BuildingConfig] = {
    "academic_block": BuildingConfig(
        building_id="academic_block",
        building_name="Academic Block",
        category="Academic",
        description="Main university academic complex, lecture halls, faculty offices, and auditoriums",
        max_occupancy=1200,
        tank_capacity_liters=45_000.0,
        initial_tank_level_pct=75.0,
        base_flow_lpm=35.0,             # ~2,100 L/h during active hours
        night_flow_base_lpm=2.0,        # ~120 L/h night standby
        nominal_pressure_bar=3.5,
        max_inflow_lpm=200.0,
        is_vulnerable_population=False,
        is_essential_service=False,
    ),
    "hostel_a": BuildingConfig(
        building_id="hostel_a",
        building_name="Hostel A",
        category="Residential",
        description="Undergraduate student residential hall (North Wing, Blocks 1-4)",
        max_occupancy=450,
        tank_capacity_liters=60_000.0,
        initial_tank_level_pct=72.0,
        base_flow_lpm=55.0,             # ~3,300 L/h morning/evening peaks
        night_flow_base_lpm=5.5,        # ~330 L/h night restroom usage
        nominal_pressure_bar=3.2,
        max_inflow_lpm=250.0,
        is_vulnerable_population=True,  # Guardrail: Student living welfare
        is_essential_service=True,
    ),
    "hostel_b": BuildingConfig(
        building_id="hostel_b",
        building_name="Hostel B",
        category="Residential",
        description="Postgraduate student residential hall and international scholar suites",
        max_occupancy=500,
        tank_capacity_liters=65_000.0,
        initial_tank_level_pct=70.0,
        base_flow_lpm=60.0,             # ~3,600 L/h peaks
        night_flow_base_lpm=6.0,        # ~360 L/h night usage
        nominal_pressure_bar=3.2,
        max_inflow_lpm=250.0,
        is_vulnerable_population=True,  # Guardrail: Student living welfare
        is_essential_service=True,
    ),
    "canteen": BuildingConfig(
        building_id="canteen",
        building_name="Canteen",
        category="Dining",
        description="Central campus dining hall, industrial kitchens, food courts, and dishwashing",
        max_occupancy=350,
        tank_capacity_liters=35_000.0,
        initial_tank_level_pct=85.0,
        base_flow_lpm=45.0,             # Heavy meal-time wash flow
        night_flow_base_lpm=1.5,        # Low night flow
        nominal_pressure_bar=3.4,
        max_inflow_lpm=180.0,
        is_vulnerable_population=False,
        is_essential_service=True,      # Food sanitation is essential
    ),
    "laboratory_block": BuildingConfig(
        building_id="laboratory_block",
        building_name="Laboratory Block",
        category="Research",
        description="Chemical wet labs, biotechnology clean rooms, and cooling tower chillers",
        max_occupancy=250,
        tank_capacity_liters=50_000.0,
        initial_tank_level_pct=80.0,
        base_flow_lpm=40.0,             # Lab equipment & process chillers
        night_flow_base_lpm=18.0,       # Continuous chiller baseline (~1,080 L/h)
        nominal_pressure_bar=3.8,
        max_inflow_lpm=220.0,
        is_vulnerable_population=False,
        is_essential_service=True,      # Essential lab baseline protected
    ),
    "sports_garden": BuildingConfig(
        building_id="sports_garden",
        building_name="Sports & Garden Area",
        category="Recreation & Landscape",
        description="Athletic grounds, sports pavilion, landscaping turf, and sprinkler irrigation",
        max_occupancy=150,
        tank_capacity_liters=40_000.0,
        initial_tank_level_pct=65.0,
        base_flow_lpm=30.0,             # Athletic usage
        night_flow_base_lpm=8.0,        # Scheduled overnight turf irrigation
        nominal_pressure_bar=3.6,
        max_inflow_lpm=200.0,
        is_vulnerable_population=False,
        is_essential_service=False,     # Non-essential: Can be throttled during drought
    ),
}

# Physical Leak Severity Ranges (in LPM)
LEAK_SEVERITIES = {
    "none": {"min_lpm": 0.0, "max_lpm": 0.0, "pressure_drop_pct": 0.0},
    "minor": {"min_lpm": 2.0, "max_lpm": 5.0, "pressure_drop_pct": 0.08},      # 120 - 300 L/h
    "moderate": {"min_lpm": 8.0, "max_lpm": 25.0, "pressure_drop_pct": 0.22},   # 480 - 1,500 L/h
    "major": {"min_lpm": 40.0, "max_lpm": 100.0, "pressure_drop_pct": 0.50},   # 2,400 - 6,000 L/h
}

