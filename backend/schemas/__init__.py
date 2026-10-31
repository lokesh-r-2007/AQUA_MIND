"""Pydantic API schemas for AquaMind AI."""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


class BuildingResponse(BaseModel):
    building_id: str
    building_name: str
    category: str
    description: Optional[str] = None
    max_occupancy: int
    tank_capacity_liters: float
    nominal_pressure_bar: float
    base_flow_lpm: float
    night_flow_base_lpm: float
    is_vulnerable_population: bool
    is_essential_service: bool


class SensorReadingCreate(BaseModel):
    timestamp: str
    building_id: str
    water_consumption_liters: float = Field(..., ge=0.0)
    flow_rate_lpm: float = Field(..., ge=0.0)
    pressure_bar: float = Field(..., ge=0.0)
    tank_level_percent: float = Field(..., ge=0.0, le=100.0)
    night_flow_lpm: float = Field(..., ge=0.0)
    occupancy: int = Field(..., ge=0)
    temperature: float
    rainfall: float = Field(..., ge=0.0)
    humidity: float = Field(..., ge=0.0, le=100.0)
    weather_data_source: Optional[str] = "open_meteo"


class SensorReadingResponse(SensorReadingCreate):
    id: int


class SensorBatchCreate(BaseModel):
    timestamp: str
    central_reservoir_level_pct: float
    central_reservoir_volume_liters: float
    readings: List[SensorReadingCreate]


class AlertResponse(BaseModel):
    id: int
    timestamp: str
    building_id: str
    category: str
    severity: str
    message: str
    evidence: Optional[List[str]] = []
    status: str


class RecommendationResponse(BaseModel):
    id: int
    problem: str
    building_id: str
    detection_timestamp: str
    evidence: List[str]
    baseline_comparison: Dict[str, Any]
    ai_prediction: Dict[str, Any]
    severity: str
    priority: str
    priority_label: str
    risk_score: float
    action_window: str
    estimated_water_loss_lph: float
    estimated_daily_loss_liters: float
    estimated_hourly_cost_inr: float
    estimated_daily_cost_inr: float
    recommended_action: str
    expected_outcome: str
    assigned_department: str
    approval_status: str
    intervention_id: Optional[str] = None
    created_at: str
    updated_at: str


class InterventionCreate(BaseModel):
    recommendation_id: int
    building_id: str
    action_taken: str
    operator_notes: Optional[str] = None


class InterventionResponse(BaseModel):
    id: str
    recommendation_id: Optional[int]
    building_id: str
    action_taken: str
    operator_notes: Optional[str]
    start_timestamp: str
    completion_timestamp: Optional[str]
    status: str


class ImpactMeasurementResponse(BaseModel):
    id: int
    intervention_id: str
    building_id: str
    leak_severity: str
    pre_intervention_flow_lpm: float
    post_intervention_flow_lpm: float
    flow_reduction_lpm: float
    active_leak_hours: float
    verified_water_saved_liters: float
    financial_savings_inr: float
    pumping_energy_saved_kwh: float
    co2_emissions_avoided_kg: float
    measured_timestamp: str


class SimulatorLeakRequest(BaseModel):
    building_id: str = "hostel_a"
    severity: str = "moderate"  # minor, moderate, major
    leak_lpm: Optional[float] = None


class SimulatorFaultRequest(BaseModel):
    building_id: str
    fault_type: str = "sensor_drift"  # sensor_drift, sensor_freeze, telemetry_spike
    affected_sensor: str = "flow_rate"


class ScenarioSimulateRequest(BaseModel):
    scenario_type: str  # moderate_leak, major_leak, supply_cut, drought_heatwave, heavy_rain, repaired_leak
    target_building_id: Optional[str] = "hostel_a"
    supply_reduction_pct: Optional[float] = 0.0
    temperature_delta_c: Optional[float] = 0.0

