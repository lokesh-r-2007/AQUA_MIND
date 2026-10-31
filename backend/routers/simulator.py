"""Sensor Simulator Control API Router."""
from fastapi import APIRouter, HTTPException
from typing import Dict, Any, Optional
from backend.services.simulator_service import LiveSimulatorService
from backend.schemas import SimulatorLeakRequest, SimulatorFaultRequest

router = APIRouter(prefix="/api/simulator", tags=["Simulator"])
sim_service = LiveSimulatorService()


@router.post("/step")
def step_simulation():
    """Manually advances the physical simulation by 1 hour and runs AI processing."""
    res = sim_service.step()
    return {"status": "SUCCESS", "step_result": res}


@router.post("/start")
def start_simulator():
    sim_service.is_running = True
    return {"status": "STARTED", "message": "Simulator engine started."}


@router.post("/stop")
def stop_simulator():
    sim_service.is_running = False
    return {"status": "STOPPED", "message": "Simulator engine paused."}


@router.post("/leak")
def trigger_leak(req: SimulatorLeakRequest):
    """Triggers a simulated pipe leak in a specific building."""
    res = sim_service.trigger_leak(
        building_id=req.building_id,
        severity=req.severity,
        leak_lpm=req.leak_lpm,
    )
    # Immediately advance 1 step so new readings reflect the leak
    step_out = sim_service.step()
    return {
        "status": "SUCCESS",
        "action": f"Triggered {req.severity} leak in {req.building_id}",
        "leak_event": res,
        "latest_step": step_out,
    }


@router.post("/leak/stop")
def stop_leak(building_id: str = "hostel_a"):
    """Stops an active leak in a building (simulating repair)."""
    stopped = sim_service.stop_leak(building_id)
    step_out = sim_service.step()
    return {
        "status": "SUCCESS" if stopped else "NO_ACTIVE_LEAK",
        "building_id": building_id,
        "message": f"Leak stopped in {building_id}" if stopped else "No active leak found",
        "latest_step": step_out,
    }


@router.post("/fault")
def trigger_fault(req: SimulatorFaultRequest):
    """Injects a sensor telemetry anomaly (separate from physical leak)."""
    res = sim_service.trigger_sensor_fault(
        building_id=req.building_id,
        fault_type=req.fault_type,
        affected_sensor=req.affected_sensor,
    )
    step_out = sim_service.step()
    return {
        "status": "SUCCESS",
        "action": f"Injected {req.fault_type} on {req.building_id}",
        "fault_event": res,
        "latest_step": step_out,
    }


@router.post("/fault/stop")
def stop_fault(building_id: str):
    stopped = sim_service.stop_sensor_fault(building_id)
    step_out = sim_service.step()
    return {
        "status": "SUCCESS" if stopped else "NO_ACTIVE_FAULT",
        "building_id": building_id,
    }


@router.get("/status")
def get_status():
    return sim_service.get_status()

