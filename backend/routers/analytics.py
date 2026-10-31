"""Analytics & Aggregations API Router."""
from fastapi import APIRouter
from typing import Dict, Any, List, Optional
from backend.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/overview")
def get_overview():
    return AnalyticsService.get_overview_kpis()


@router.get("/consumption")
def get_consumption_history(building_id: str = "hostel_a", limit: int = 48):
    return AnalyticsService.get_building_consumption_history(building_id, limit)


@router.get("/impact")
def get_impact_summary():
    kpis = AnalyticsService.get_overview_kpis()
    return {
        "verified_water_saved_liters": kpis["verified_water_saved_liters"],
        "verified_financial_saved_inr": kpis["verified_financial_saved_inr"],
        "potential_daily_loss_liters": kpis["potential_daily_loss_liters"],
    }

