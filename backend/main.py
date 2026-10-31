"""
AquaMind AI - Main FastAPI Application
Campus Water Intelligence & Resilience Platform
Theme: THEME 3: AI for Impact - Sustainability
"""

import sys
from pathlib import Path

# Ensure root workspace directory is in python path
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from backend.database import init_db, get_db_connection
from backend.services.simulator_service import LiveSimulatorService

# Import routers
from backend.routers import (
    buildings,
    sensors,
    simulator,
    weather,
    alerts,
    predictions,
    recommendations,
    interventions,
    optimization,
    scenario,
    analytics,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize database tables and seed baseline telemetry
    init_db()
    
    # Check if sensor readings table has data; if empty, run 2 initial simulation steps
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM sensor_readings")
    count = cursor.fetchone()[0]
    conn.close()

    if count == 0:
        sim = LiveSimulatorService()
        sim.step()
        sim.step()

    yield
    # Shutdown logic if needed


app = FastAPI(
    title="AquaMind AI — Campus Water Intelligence & Resilience API",
    description="Intelligent Decision-Support Platform for Campus Water Security, Leak Detection, and Fair Allocation",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Configuration for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local hackathon development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(buildings.router)
app.include_router(sensors.router)
app.include_router(simulator.router)
app.include_router(weather.router)
app.include_router(alerts.router)
app.include_router(predictions.router)
app.include_router(recommendations.router)
app.include_router(interventions.router)
app.include_router(optimization.router)
app.include_router(scenario.router)
app.include_router(analytics.router)


@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "HEALTHY",
        "service": "AquaMind AI Platform Backend",
        "version": "1.0.0",
        "theme": "TCS AI Hackathon 2026 - AI for Impact (Sustainability)",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)

