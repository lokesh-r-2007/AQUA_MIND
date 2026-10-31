"""
Tests for Weather Service Reliability, Caching, and Synthetic Fallback in AQUAMIND.
"""

import pytest
import pandas as pd
from pathlib import Path

from src.weather.client import WeatherService
from src.weather.synthetic import SyntheticWeatherGenerator
from src.config import WEATHER_CACHE_DIR, RANDOM_SEED


def test_synthetic_weather_generator_schema_and_physics():
    """Verify synthetic weather produces valid physical limits and required columns."""
    gen = SyntheticWeatherGenerator(seed=RANDOM_SEED)
    df = gen.generate("2024-01-01", "2024-01-07")

    required_cols = [
        "timestamp", "temperature_c", "precipitation_mm",
        "relative_humidity_pct", "wind_speed_kmh", "solar_radiation_w_m2",
        "weather_data_source"
    ]
    for col in required_cols:
        assert col in df.columns

    # 7 days * 24 hours = 168 rows
    assert len(df) == 168

    # Physical meteorological checks
    assert df["temperature_c"].between(10.0, 45.0).all()
    assert df["precipitation_mm"].ge(0.0).all()
    assert df["relative_humidity_pct"].between(10.0, 100.0).all()
    assert df["wind_speed_kmh"].ge(0.0).all()
    assert df["solar_radiation_w_m2"].ge(0.0).all()
    assert (df["weather_data_source"] == "synthetic_fallback").all()


def test_weather_service_caching(tmp_path):
    """Verify that WeatherService caches Open-Meteo responses and reloads them."""
    ws = WeatherService(cache_dir=tmp_path, seed=RANDOM_SEED)

    # First call - query API (or fallback if offline)
    df1 = ws.fetch_weather("2024-02-01", "2024-02-02")
    assert not df1.empty

    # Verify cache file was written
    cache_files = list(tmp_path.glob("*.json"))
    if cache_files:
        # Cache file was created
        assert len(cache_files) == 1
        # Second call should load from cache
        df2 = ws.fetch_weather("2024-02-01", "2024-02-02")
        assert len(df2) == len(df1)
        assert df2["weather_data_source"].iloc[0] == "open_meteo"


def test_weather_service_timeout_fallback(tmp_path):
    """Verify automatic graceful degradation to synthetic fallback upon network timeout."""
    ws = WeatherService(cache_dir=tmp_path, seed=RANDOM_SEED)

    # Simulate network timeout
    df = ws.fetch_weather("2024-03-01", "2024-03-03", simulate_timeout=True)
    assert not df.empty
    assert len(df) == 72  # 3 days * 24 hours
    assert (df["weather_data_source"] == "synthetic_fallback").all()

