"""
Campus Demand Patterns and Profiles for AQUAMIND.
Defines diurnal occupancy curves, academic calendar schedules, and temperature sensitivity
for all 6 campus zones to ensure realistic, non-spurious physical dynamics.
"""

import numpy as np
import pandas as pd
from typing import Dict, Any


def get_academic_calendar_factor(timestamp: pd.Timestamp) -> Dict[str, float]:
    """
    Returns holiday and academic calendar load adjustment factors.
    Recognizes weekends, semester breaks, exam weeks, and national holidays.
    """
    month = timestamp.month
    day = timestamp.day
    day_of_week = timestamp.dayofweek  # 0=Monday, 6=Sunday
    is_weekend = 1 if day_of_week >= 5 else 0

    # Semester break: June-July (summer break), late December
    is_semester_break = (month in [6, 7]) or (month == 12 and day >= 18)
    
    # Major National Holidays (Republic Day, Independence Day, Gandhi Jayanti, etc.)
    is_public_holiday = (
        (month == 1 and day == 26) or
        (month == 8 and day == 15) or
        (month == 10 and day == 2) or
        (month == 5 and day == 1) or
        (month == 11 and day == 1)
    )

    is_holiday = 1 if (is_public_holiday or (is_weekend and not is_semester_break)) else 0

    return {
        "is_weekend": is_weekend,
        "is_holiday": 1 if (is_public_holiday or is_semester_break) else 0,
        "is_semester_break": 1 if is_semester_break else 0,
        "academic_activity_factor": 0.25 if is_semester_break else (0.45 if is_weekend else 1.0),
        "hostel_occupancy_factor": 0.40 if is_semester_break else (1.10 if is_weekend else 1.0),
        "dining_load_factor": 0.30 if is_semester_break else (0.85 if is_weekend else 1.0),
        "sports_load_factor": 0.70 if is_semester_break else (1.40 if is_weekend else 1.0),
        "lab_continuous_factor": 0.85 if is_semester_break else 1.0,  # Research labs operate continuously
    }


def get_zone_diurnal_factor(zone_id: str, hour: int, cal: Dict[str, float]) -> float:
    """
    Calculates normalized hourly demand multiplier for a given zone based on
    human occupancy rhythms and specialized zone functions.
    """
    h = hour

    if zone_id == "zone_1_academic_north":
        # Academic block: Active from 08:00 to 18:00, lunch dip at 13:00, minimal at night
        if 8 <= h <= 18:
            hourly_curve = 0.8 + 0.4 * np.sin(np.pi * (h - 8) / 10.0)
            if h == 13:
                hourly_curve *= 0.75  # Lunch break dip
        else:
            hourly_curve = 0.05
        return float(hourly_curve * cal["academic_activity_factor"])

    elif zone_id == "zone_2_research_labs":
        # Research labs: High continuous 24/7 baseline (chillers, autoclaves, scrubbers),
        # with working hour experimental peaks
        base = 0.55 * cal["lab_continuous_factor"]
        day_peak = 0.45 * np.sin(np.pi * (h - 8) / 12.0) if 8 <= h <= 20 else 0.0
        return float(base + max(0.0, day_peak))

    elif zone_id == "zone_3_student_hostels":
        # Student housing: Distinct dual-peak distribution (Morning showers 06:30-09:30, Evening 18:30-22:30)
        # Shifted slightly later on weekends
        morning_peak_h = 9 if cal["is_weekend"] else 7
        evening_peak_h = 21 if cal["is_weekend"] else 20
        
        morning_peak = np.exp(-0.5 * ((h - morning_peak_h) / 1.5) ** 2)
        evening_peak = 0.85 * np.exp(-0.5 * ((h - evening_peak_h) / 2.0) ** 2)
        midday_lull = 0.15
        return float((0.9 * morning_peak + 0.75 * evening_peak + midday_lull) * cal["hostel_occupancy_factor"])

    elif zone_id == "zone_4_dining_cafeteria":
        # Dining halls: Three distinct culinary prep & washing waves
        # Breakfast: 07:00-09:00, Lunch: 12:00-14:30, Dinner: 19:00-21:30
        breakfast = np.exp(-0.5 * ((h - 8) / 0.9) ** 2)
        lunch = 1.25 * np.exp(-0.5 * ((h - 13) / 1.1) ** 2)
        dinner = 1.10 * np.exp(-0.5 * ((h - 20) / 1.1) ** 2)
        idle = 0.04
        return float((breakfast + lunch + dinner + idle) * cal["dining_load_factor"])

    elif zone_id == "zone_5_sports_recreation":
        # Sports: Morning workout 06:00-08:00, evening athletics 16:00-20:00,
        # plus night lawn irrigation 23:00-02:00
        morning_gym = 0.4 * np.exp(-0.5 * ((h - 7) / 1.0) ** 2)
        evening_sports = 0.9 * np.exp(-0.5 * ((h - 18) / 1.5) ** 2)
        night_irrigation = 0.6 if (h >= 23 or h <= 2) else 0.0
        return float((morning_gym + evening_sports + night_irrigation + 0.05) * cal["sports_load_factor"])

    elif zone_id == "zone_6_admin_facilities":
        # Administration & Clinic: 09:00-17:00 weekdays, clinic 24/7 low trickle
        if 9 <= h <= 17 and not cal["is_weekend"]:
            hourly_curve = 0.85 + 0.2 * np.sin(np.pi * (h - 9) / 8.0)
        else:
            hourly_curve = 0.08  # Clinic night standby
        return float(hourly_curve * cal["academic_activity_factor"])

    return 0.5


def calculate_building_consumption(
    zone_config: Any,
    timestamp: pd.Timestamp,
    temperature_c: float,
    precipitation_mm: float,
    noise_std: float = 0.02,
    rng: np.random.Generator = None,
) -> float:
    """
    Computes mathematically consistent building consumption (Liters/hour)
    accounting for zone baseline, diurnal rhythms, ambient temperature (cooling demand),
    and precipitation (reduces sports irrigation demand).
    """
    if rng is None:
        rng = np.random.default_rng()

    cal = get_academic_calendar_factor(timestamp)
    diurnal_mult = get_zone_diurnal_factor(zone_config.zone_id, timestamp.hour, cal)

    # Base active consumption
    consumption = zone_config.base_consumption_lph * diurnal_mult + zone_config.night_consumption_lph

    # Weather adjustments:
    # 1. Hot days (> 28C) increase cooling tower and drinking water load
    temp_excess = max(0.0, temperature_c - 28.0)
    temp_multiplier = 1.0 + 0.025 * temp_excess
    consumption *= temp_multiplier

    # 2. Rain suppresses outdoor irrigation (Zone 5)
    if zone_config.zone_id == "zone_5_sports_recreation" and precipitation_mm > 1.0:
        consumption *= 0.45  # Irrigation cancelled when raining

    # Add realistic non-spurious physical measurement noise (e.g. +/- 2%)
    noise = rng.normal(1.0, noise_std)
    final_consumption = max(10.0, consumption * noise)

    return float(round(final_consumption, 1))

