"""
AQUAMIND Configuration Module
Defines campus topology, physical tank capacities, flow limits, pressure boundaries,
and operational parameters for the AI Water Resilience System.
"""

from pathlib import Path
from dataclasses import dataclass, field
from typing import Dict, List

# Workspace Root & Data Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
WEATHER_CACHE_DIR = DATA_DIR / "weather_cache"
DOCS_DIR = BASE_DIR / "docs"

# Ensure directories exist
DATA_DIR.mkdir(parents=True, exist_ok=True)
WEATHER_CACHE_DIR.mkdir(parents=True, exist_ok=True)
DOCS_DIR.mkdir(parents=True, exist_ok=True)

# Default Global Random Seed for Bit-Exact Reproducibility
RANDOM_SEED: int = 42

# Campus Coordinates (IISc / Bangalore Academic & Research Campus)
CAMPUS_LATITUDE: float = 12.9716
CAMPUS_LONGITUDE: float = 77.5946
CAMPUS_TIMEZONE: str = "Asia/Kolkata"

# Sampling Configuration
DEFAULT_SAMPLING_INTERVAL_HOURS: float = 1.0  # Delta t = 1 hour
DEFAULT_HISTORY_TIMESTEPS: int = 2000         # 2,000 hours * 6 zones = 12,000 records


@dataclass(frozen=True)
class ZoneConfig:
    """Physical configuration for a campus zone."""
    zone_id: str
    zone_name: str
    description: str
    building_count: int
    tank_capacity_liters: float     # Building/Zone overhead storage capacity (Liters)
    initial_tank_level_pct: float   # Initial state (0% to 100%)
    max_inflow_rate_lph: float      # Maximum pump/inlet pipe delivery (Liters/hour)
    base_consumption_lph: float     # Average baseline usage during active hours (Liters/hour)
    night_consumption_lph: float    # Base overnight leakage/equipment consumption (Liters/hour)
    nominal_pressure_bar: float     # Standard operating water pressure (bar)
    min_operational_level_pct: float = 25.0  # Pump auto-start threshold (%)
    max_operational_level_pct: float = 95.0  # Pump auto-stop threshold (%)
    is_critical_vulnerable: bool = False     # Guardrail: Never autonomously restrict (e.g. Health/Hostel)


# Campus Topology: 6 Distinct Zones with Tailored Physical Profiles
CAMPUS_ZONES: Dict[str, ZoneConfig] = {
    "zone_1_academic_north": ZoneConfig(
        zone_id="zone_1_academic_north",
        zone_name="Academic Block North",
        description="Lecture halls, computer labs, seminar auditoriums, and faculty offices",
        building_count=4,
        tank_capacity_liters=45_000.0,
        initial_tank_level_pct=75.0,
        max_inflow_rate_lph=12_000.0,
        base_consumption_lph=2_200.0,
        night_consumption_lph=120.0,
        nominal_pressure_bar=3.5,
        is_critical_vulnerable=False,
    ),
    "zone_2_research_labs": ZoneConfig(
        zone_id="zone_2_research_labs",
        zone_name="Science & Engineering Labs",
        description="Chemical wet labs, clean rooms, cooling towers, and materials testing",
        building_count=3,
        tank_capacity_liters=65_000.0,
        initial_tank_level_pct=82.0,
        max_inflow_rate_lph=16_000.0,
        base_consumption_lph=3_800.0,
        night_consumption_lph=1_400.0,  # Critical continuous chiller & process cooling
        nominal_pressure_bar=3.8,
        is_critical_vulnerable=True,     # High-value research facilities require strict supply guarantee
    ),
    "zone_3_student_hostels": ZoneConfig(
        zone_id="zone_3_student_hostels",
        zone_name="Student Hostels Complex",
        description="Undergraduate and postgraduate residential halls (Blocks A-D)",
        building_count=4,
        tank_capacity_liters=80_000.0,
        initial_tank_level_pct=70.0,
        max_inflow_rate_lph=18_000.0,
        base_consumption_lph=4_200.0,
        night_consumption_lph=350.0,
        nominal_pressure_bar=3.2,
        is_critical_vulnerable=True,     # Guardrail: Residential human welfare - vulnerable population
    ),
    "zone_4_dining_cafeteria": ZoneConfig(
        zone_id="zone_4_dining_cafeteria",
        zone_name="Central Dining & Food Court",
        description="Industrial food prep, dishwashing facilities, and student mess halls",
        building_count=2,
        tank_capacity_liters=35_000.0,
        initial_tank_level_pct=85.0,
        max_inflow_rate_lph=10_000.0,
        base_consumption_lph=2_800.0,
        night_consumption_lph=80.0,
        nominal_pressure_bar=3.4,
        is_critical_vulnerable=False,
    ),
    "zone_5_sports_recreation": ZoneConfig(
        zone_id="zone_5_sports_recreation",
        zone_name="Sports & Recreation Complex",
        description="Athletic stadium, Olympic swimming pool top-up, gym, and grounds irrigation",
        building_count=2,
        tank_capacity_liters=50_000.0,
        initial_tank_level_pct=65.0,
        max_inflow_rate_lph=14_000.0,
        base_consumption_lph=2_500.0,
        night_consumption_lph=450.0,   # Scheduled night-time turf irrigation
        nominal_pressure_bar=3.6,
        is_critical_vulnerable=False,
    ),
    "zone_6_admin_facilities": ZoneConfig(
        zone_id="zone_6_admin_facilities",
        zone_name="Administration & Health Center",
        description="Administrative headquarters, central university library, and campus clinic",
        building_count=3,
        tank_capacity_liters=30_000.0,
        initial_tank_level_pct=78.0,
        max_inflow_rate_lph=8_000.0,
        base_consumption_lph=1_500.0,
        night_consumption_lph=90.0,
        nominal_pressure_bar=3.3,
        is_critical_vulnerable=True,     # Health Clinic requires uninterrupted sterile water
    ),
}

# Central Reservoir Physical Specification
CENTRAL_RESERVOIR_CAPACITY_LITERS: float = 500_000.0  # 500 m3
CENTRAL_RESERVOIR_INITIAL_LEVEL_PCT: float = 85.0

# Physical Leak Severity Classifications
LEAK_SEVERITY_RANGES = {
    "none": {"min_lph": 0.0, "max_lph": 0.0, "pressure_drop_pct": 0.0},
    "minor": {"min_lph": 100.0, "max_lph": 300.0, "pressure_drop_pct": 0.08},     # ~8% pressure drop
    "moderate": {"min_lph": 500.0, "max_lph": 1500.0, "pressure_drop_pct": 0.22}, # ~22% pressure drop
    "major": {"min_lph": 2500.0, "max_lph": 6000.0, "pressure_drop_pct": 0.50},  # ~50% burst pressure loss
}

# Physical Limits for Sanity & Anomaly Detection
PHYSICAL_LIMITS = {
    "tank_level_min_pct": 0.0,
    "tank_level_max_pct": 100.0,
    "pressure_min_bar": 0.5,    # Below 0.5 bar indicates catastrophic depressurization
    "pressure_max_bar": 6.0,    # Surge pressure limit
    "flow_min_lph": 0.0,
}

