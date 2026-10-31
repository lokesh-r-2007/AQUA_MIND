"""
AQUAMIND Telemetry and Schema Definitions.
Defines strictly decoupled models for Observable Telemetry vs Ground-Truth Evaluation Labels
to prevent ML data leakage, along with FastAPI-ready payload contracts.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field, field_validator


class ZoneTelemetryReading(BaseModel):
    """
    Observable Sensor Telemetry.
    These fields represent realistic physically measured quantities available in real time.
    NO ground truth labels are included here to prevent data leakage in ML models.
    """
    timestamp: str = Field(..., description="ISO 8601 formatted timestamp (YYYY-MM-DD HH:MM:SS)")
    zone_id: str = Field(..., description="Unique campus zone identifier")
    zone_name: str = Field(..., description="Human-readable zone name")
    
    # Hydraulic & Flow Observations (Liters per hour)
    inlet_flow_rate_lph: float = Field(..., ge=0.0, description="Measured flow into zone storage tank (L/h)")
    outlet_flow_rate_lph: float = Field(..., ge=0.0, description="Measured flow exiting zone storage tank (L/h)")
    building_consumption_lph: float = Field(..., ge=0.0, description="Sum of internal building smart sub-meters (L/h)")
    
    # Pressure & Storage Observations
    supply_pressure_bar: float = Field(..., ge=0.0, le=10.0, description="Distribution line pressure (bar)")
    tank_level_pct: float = Field(..., ge=0.0, le=100.0, description="Current tank level percentage (0.0% to 100.0%)")
    tank_volume_liters: float = Field(..., ge=0.0, description="Current water volume stored in zone tank (Liters)")
    pump_status: int = Field(..., ge=0, le=1, description="Binary booster pump status (0: OFF, 1: ON)")
    
    # Ambient Weather Context
    temperature_c: float = Field(..., description="Ambient air temperature in Celsius")
    precipitation_mm: float = Field(..., ge=0.0, description="Precipitation/rainfall accumulation in mm")
    relative_humidity_pct: float = Field(..., ge=0.0, le=100.0, description="Relative humidity percentage")
    weather_data_source: str = Field(..., description="Source: 'open_meteo', 'cached_open_meteo', or 'synthetic_fallback'")
    
    # Temporal Context (Observable Calendar Features)
    hour_of_day: int = Field(..., ge=0, le=23)
    day_of_week: int = Field(..., ge=0, le=6)
    is_weekend: int = Field(..., ge=0, le=1)
    is_holiday: int = Field(..., ge=0, le=1)

    @field_validator("tank_level_pct")
    @classmethod
    def validate_tank_level_bounds(cls, v: float) -> float:
        if v < 0.0 or v > 100.0:
            raise ValueError(f"Tank level must be within [0.0, 100.0]%, received {v:.2f}%")
        return round(v, 2)


class ZoneGroundTruth(BaseModel):
    """
    Ground-Truth Target Labels.
    These fields must ONLY be used for evaluation, benchmark metrics, and supervised training labels.
    MUST NEVER be included in observable input feature sets.
    """
    timestamp: str = Field(..., description="Matching timestamp")
    zone_id: str = Field(..., description="Matching zone ID")
    
    # Leak Targets
    ground_truth_leak_status: int = Field(..., ge=0, le=1, description="Binary: 0=No Leak, 1=Active Leak")
    ground_truth_leak_severity: Literal["none", "minor", "moderate", "major"] = Field(
        ..., description="Leak severity tier"
    )
    ground_truth_leak_rate_lph: float = Field(..., ge=0.0, description="Actual physical leak rate (L/h)")
    
    # Anomaly Categorization (Distinguishes actual leaks from sensor glitches)
    ground_truth_anomaly_status: int = Field(..., ge=0, le=1, description="Binary: 0=Normal, 1=Any Anomaly")
    ground_truth_anomaly_type: Literal[
        "none", "pipe_leak", "sensor_drift", "sensor_freeze", "telemetry_spike", "meter_tampering"
    ] = Field(..., description="True underlying root cause")
    ground_truth_affected_component: str = Field(
        ..., description="Affected infrastructure asset (e.g. 'pipe_junction_Z3_B', 'smart_meter_M1')"
    )


class ZoneFullRecord(BaseModel):
    """
    Consolidated Record containing observable telemetry plus ground-truth labels.
    Facilitates storage in datasets while providing methods to safely decouple them.
    """
    telemetry: ZoneTelemetryReading
    ground_truth: ZoneGroundTruth

    def to_flat_dict(self) -> Dict[str, Any]:
        """Flattens observable and ground-truth into a single dictionary."""
        d = self.telemetry.model_dump()
        d.update(self.ground_truth.model_dump(exclude={"timestamp", "zone_id"}))
        return d

    @classmethod
    def observable_column_names(cls) -> List[str]:
        """List of all valid observable features that ML models are permitted to consume."""
        return list(ZoneTelemetryReading.model_fields.keys())

    @classmethod
    def ground_truth_column_names(cls) -> List[str]:
        """List of evaluation labels strictly forbidden from model input features."""
        return [
            k for k in ZoneGroundTruth.model_fields.keys() 
            if k not in ("timestamp", "zone_id")
        ]


class CampusTelemetryBatch(BaseModel):
    """
    Campus-wide batch telemetry at a single point in time.
    Suitable for real-time FastAPI ingestion endpoint.
    """
    batch_timestamp: str
    central_reservoir_level_pct: float
    central_reservoir_volume_liters: float
    zones: List[ZoneTelemetryReading]
    system_status: str = "ONLINE"


class LeakInjectionRequest(BaseModel):
    """Request payload to trigger a controlled physical leak scenario."""
    zone_id: str
    severity: Literal["minor", "moderate", "major"]
    leak_rate_lph: Optional[float] = None
    affected_component: Optional[str] = None
    duration_hours: Optional[int] = None


class SensorFaultRequest(BaseModel):
    """Request payload to trigger a sensor failure scenario (distinct from physical leak)."""
    zone_id: str
    fault_type: Literal["sensor_drift", "sensor_freeze", "telemetry_spike"]
    affected_sensor: Literal["inlet_flow", "outlet_flow", "pressure", "tank_level"]
    drift_rate_pct_per_hour: Optional[float] = 2.0
    duration_hours: Optional[int] = 12


class SimulatorControlResponse(BaseModel):
    """Response payload for simulator control actions."""
    success: bool
    message: str
    active_events: List[Dict[str, Any]]

