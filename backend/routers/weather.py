"""Weather Telemetry & Forecast API Router."""
from fastapi import APIRouter
from datetime import datetime, timedelta
from typing import Dict, Any, List
from src.weather.client import WeatherService

router = APIRouter(prefix="/api/weather", tags=["Weather"])
weather_service = WeatherService(seed=42)


@router.get("/current")
def get_current_weather():
    today_str = datetime.now().strftime("%Y-%m-%d")
    df = weather_service.fetch_weather(today_str, today_str)
    latest = df.iloc[-1].to_dict()
    return {
        "timestamp": latest["timestamp"],
        "temperature_c": latest["temperature_c"],
        "precipitation_mm": latest["precipitation_mm"],
        "relative_humidity_pct": latest["relative_humidity_pct"],
        "wind_speed_kmh": latest["wind_speed_kmh"],
        "source": latest["weather_data_source"],
    }


@router.get("/forecast")
def get_weather_forecast(days: int = 5):
    start = datetime.now()
    end = start + timedelta(days=days)
    s_str = start.strftime("%Y-%m-%d")
    e_str = end.strftime("%Y-%m-%d")

    df = weather_service.fetch_weather(s_str, e_str)
    # Aggregate to daily
    df["date"] = df["timestamp"].str[:10]
    daily = []
    for d, g in df.groupby("date"):
        daily.append({
            "date": d,
            "temp_max_c": round(float(g["temperature_c"].max()), 1),
            "temp_min_c": round(float(g["temperature_c"].min()), 1),
            "total_rainfall_mm": round(float(g["precipitation_mm"].sum()), 1),
            "avg_humidity_pct": round(float(g["relative_humidity_pct"].mean()), 1),
            "source": g["weather_data_source"].iloc[0],
        })
    return {"forecast_days": days, "daily": daily}
