"""
Synthetic Weather Generator for AQUAMIND.
Provides high-fidelity, physically consistent meteorological fallback data
incorporating seasonal trends, diurnal temperature cycles, and monsoon rainfall dynamics.
Used when external APIs (Open-Meteo) encounter timeouts, outages, or offline conditions.
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Optional


class SyntheticWeatherGenerator:
    """Generates realistic synthetic hourly weather for campus water resilience modeling."""

    def __init__(
        self,
        seed: int = 42,
        latitude: float = 12.9716,
        longitude: float = 77.5946,
        climate_region: Optional[str] = None,
    ):
        self.seed = seed
        self.rng = np.random.default_rng(seed)
        self.latitude = latitude
        self.longitude = longitude
        
        # Determine climate zone:
        # Tamil Nadu (e.g., Chennai / Siruseri / Coimbatore): Lat 8.0-13.5 N, Lon 78.5-80.5 E
        if climate_region:
            self.climate_region = climate_region.lower()
        elif 8.0 <= latitude <= 13.5 and 78.5 <= longitude <= 80.5:
            self.climate_region = "tamil_nadu"
        else:
            self.climate_region = "bangalore"

    def generate(self, start_date: str, end_date: str) -> pd.DataFrame:
        """
        Generate synthetic hourly weather dataframe between start_date and end_date (inclusive).
        
        Args:
            start_date: "YYYY-MM-DD"
            end_date: "YYYY-MM-DD"
            
        Returns:
            pd.DataFrame with columns:
            [timestamp, temperature_c, precipitation_mm, relative_humidity_pct, 
             wind_speed_kmh, solar_radiation_w_m2, weather_data_source]
        """
        start_dt = pd.to_datetime(start_date)
        end_dt = pd.to_datetime(end_date) + pd.Timedelta(hours=23)
        timestamps = pd.date_range(start=start_dt, end=end_dt, freq="1h")
        n = len(timestamps)

        day_of_year = timestamps.dayofyear.values
        hour_of_day = timestamps.hour.values

        # 1. Base Seasonal Temperature & Diurnal Curve
        if self.climate_region == "tamil_nadu":
            # Tamil Nadu (Chennai/Siruseri): tropical plains/coastal, peak heat in May/June (~35-41C),
            # mild winter in Dec/Jan (~24-28C). Diurnal swing is damped by coastal moisture (~4.2C).
            seasonal_temp_base = 28.5 + 4.5 * np.cos(2 * np.pi * (day_of_year - 145) / 365.25)
            diurnal_temp = 4.2 * np.sin(2 * np.pi * (hour_of_day - 8) / 24.0)
            temp_clip_min, temp_clip_max = 18.0, 43.0
        else:
            # Bangalore (altitude ~920m ASL): moderate plateau climate, peak heat April (~34C),
            # cool Dec/Jan (~15-20C). Diurnal swing ~5.5C.
            seasonal_temp_base = 24.0 + 4.0 * np.cos(2 * np.pi * (day_of_year - 110) / 365.25)
            diurnal_temp = 5.5 * np.sin(2 * np.pi * (hour_of_day - 8) / 24.0)
            temp_clip_min, temp_clip_max = 12.0, 39.0

        # 2. Add smooth AR(1) autoregressive noise to mimic natural multi-day weather fronts
        temp_noise = np.zeros(n)
        white_noise = self.rng.normal(0, 0.4, n)
        for i in range(1, n):
            temp_noise[i] = 0.92 * temp_noise[i - 1] + white_noise[i]
        
        temperature_c = seasonal_temp_base + diurnal_temp + temp_noise
        temperature_c = np.round(np.clip(temperature_c, temp_clip_min, temp_clip_max), 2)

        # 3. Seasonal Monsoon Rainfall Pattern
        if self.climate_region == "tamil_nadu":
            # Tamil Nadu: dominated by Northeast Monsoon (October to December, days ~274-355),
            # accounting for 50-60% of annual rainfall through Bay of Bengal depressions/cyclones.
            # Southwest Monsoon (June-Sept) is largely blocked by Western Ghats rain shadow.
            ne_monsoon_intensity = np.clip(np.sin(np.pi * (day_of_year - 270) / 90.0), 0.0, 1.0)
            sw_monsoon_intensity = 0.25 * np.clip(np.sin(np.pi * (day_of_year - 150) / 110.0), 0.0, 1.0)
            monsoon_intensity = np.maximum(ne_monsoon_intensity, sw_monsoon_intensity)
            afternoon_rain_boost = np.where((hour_of_day >= 13) & (hour_of_day <= 22), 1.7, 0.5)
            rain_prob = 0.12 * monsoon_intensity * afternoon_rain_boost
            rain_events = self.rng.uniform(0.0, 1.0, n) < rain_prob
            raw_rain = self.rng.gamma(shape=1.8, scale=5.2, size=n) * rain_events
        else:
            # Bangalore: dominated by Southwest Monsoon (June to Sept, days 152 to 273),
            # with secondary showers in October (NE transition).
            monsoon_intensity = np.clip(np.sin(np.pi * (day_of_year - 140) / 160.0), 0.0, 1.0)
            afternoon_rain_boost = np.where((hour_of_day >= 14) & (hour_of_day <= 20), 1.8, 0.6)
            rain_prob = 0.08 * monsoon_intensity * afternoon_rain_boost
            rain_events = self.rng.uniform(0.0, 1.0, n) < rain_prob
            raw_rain = self.rng.gamma(shape=1.5, scale=4.0, size=n) * rain_events

        precipitation_mm = np.round(np.where(rain_events, raw_rain, 0.0), 2)

        # 4. Relative Humidity: higher in coastal Tamil Nadu (~70-85%) than Bangalore (~50-70%)
        if self.climate_region == "tamil_nadu":
            base_humidity = 72.0 - 1.2 * (temperature_c - 28.0)
            rain_humidity_boost = np.where(precipitation_mm > 0, 18.0, 0.0)
        else:
            base_humidity = 65.0 - 1.8 * (temperature_c - 24.0)
            rain_humidity_boost = np.where(precipitation_mm > 0, 22.0, 0.0)

        humidity_noise = self.rng.normal(0, 3.0, n)
        relative_humidity = base_humidity + rain_humidity_boost + humidity_noise
        relative_humidity_pct = np.round(np.clip(relative_humidity, 20.0, 98.0), 1)

        # 5. Wind Speed (km/h)
        base_wind = 10.0 + 3.0 * np.sin(2 * np.pi * hour_of_day / 24.0)
        wind_gusts = np.where(precipitation_mm > 2.0, self.rng.uniform(8.0, 25.0, n), 0.0)
        wind_speed_kmh = np.round(np.clip(base_wind + wind_gusts + self.rng.normal(0, 1.5, n), 1.0, 55.0), 1)

        # 6. Solar Radiation (W/m2)
        daylight = (hour_of_day >= 6) & (hour_of_day <= 18)
        solar_potential = np.where(
            daylight,
            850.0 * np.maximum(0.0, np.sin(np.pi * (hour_of_day - 6) / 12.0)),
            0.0
        )
        cloud_factor = np.where(precipitation_mm > 0, 0.25, 1.0 - 0.3 * (relative_humidity_pct / 100.0))
        solar_radiation_w_m2 = np.round(np.maximum(0.0, solar_potential * cloud_factor), 1)

        df = pd.DataFrame({
            "timestamp": timestamps.strftime("%Y-%m-%d %H:%M:%S"),
            "temperature_c": temperature_c,
            "precipitation_mm": precipitation_mm,
            "relative_humidity_pct": relative_humidity_pct,
            "wind_speed_kmh": wind_speed_kmh,
            "solar_radiation_w_m2": solar_radiation_w_m2,
            "weather_data_source": "synthetic_fallback"
        })

        return df

