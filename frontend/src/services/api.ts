// AquaMind AI - Frontend API Service Client
import {
  Building,
  SensorReading,
  Alert,
  Recommendation,
  Intervention,
  OverviewKPIs,
  AllocationResult,
  ScenarioResult,
} from '../types';

const API_BASE = (typeof window !== 'undefined' && window.location.port === '5173') ? '/api' : 'http://127.0.0.1:8000/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error [${res.status}]: ${errorText}`);
  }
  return res.json();
}

export const api = {
  // Health
  getHealth: () => fetchJson<{ status: string; service: string }>('/health'),

  // Buildings
  getBuildings: () => fetchJson<Building[]>('/buildings'),
  getBuilding: (id: string) => fetchJson<Building>(`/buildings/${id}`),

  // Sensors & Simulator
  getLatestSensors: () => fetchJson<{ timestamp: string; buildings: SensorReading[] }>('/sensors/latest'),
  getSensorHistory: (buildingId?: string, limit = 50) =>
    fetchJson<SensorReading[]>(`/sensors/history?${buildingId ? `building_id=${buildingId}&` : ''}limit=${limit}`),
  stepSimulator: () => fetchJson<{ status: string; step_result: any }>('/simulator/step', { method: 'POST' }),
  startSimulator: () => fetchJson<{ status: string }>('/simulator/start', { method: 'POST' }),
  stopSimulator: () => fetchJson<{ status: string }>('/simulator/stop', { method: 'POST' }),
  triggerLeak: (buildingId: string, severity: 'minor' | 'moderate' | 'major' = 'moderate', leakLpm?: number) =>
    fetchJson<{ status: string; action: string; latest_step: any }>('/simulator/leak', {
      method: 'POST',
      body: JSON.stringify({ building_id: buildingId, severity, leak_lpm: leakLpm }),
    }),
  stopLeak: (buildingId: string) =>
    fetchJson<{ status: string; latest_step: any }>(`/simulator/leak/stop?building_id=${buildingId}`, { method: 'POST' }),
  triggerFault: (buildingId: string, faultType: string) =>
    fetchJson<{ status: string; action: string; latest_step: any }>('/simulator/fault', {
      method: 'POST',
      body: JSON.stringify({ building_id: buildingId, fault_type: faultType, affected_sensor: 'flow_rate' }),
    }),
  getSimulatorStatus: () => fetchJson<any>('/simulator/status'),

  // Weather
  getCurrentWeather: () => fetchJson<any>('/weather/current'),
  getWeatherForecast: (days = 5) => fetchJson<any>(`/weather/forecast?days=${days}`),

  // Alerts
  getAlerts: (status = 'ALL') => fetchJson<Alert[]>(`/alerts?status=${status}`),
  acknowledgeAlert: (id: number) => fetchJson<any>(`/alerts/${id}/acknowledge`, { method: 'POST' }),
  resolveAlert: (id: number) => fetchJson<any>(`/alerts/${id}/resolve`, { method: 'POST' }),

  // Predictions
  getPredictions: () => fetchJson<any[]>('/predictions'),
  getDemandForecast: (hours = 24) => fetchJson<any>(`/predictions/forecast?hours=${hours}`),
  getShortageRisk: () => fetchJson<any>('/predictions/shortage'),

  // Recommendations & Approval Workflow
  getRecommendations: (status?: string) =>
    fetchJson<Recommendation[]>(`/recommendations${status ? `?status=${status}` : ''}`),
  approveRecommendation: (id: number) => fetchJson<any>(`/recommendations/${id}/approve`, { method: 'POST' }),
  rejectRecommendation: (id: number) => fetchJson<any>(`/recommendations/${id}/reject`, { method: 'POST' }),
  progressRecommendation: (id: number, notes?: string) =>
    fetchJson<any>(`/recommendations/${id}/progress?operator_notes=${encodeURIComponent(notes || 'Dispatched')}`, {
      method: 'POST',
    }),
  resolveRecommendation: (id: number, notes?: string) =>
    fetchJson<any>(`/recommendations/${id}/resolve?operator_notes=${encodeURIComponent(notes || 'Repaired')}`, {
      method: 'POST',
    }),

  // Interventions
  getInterventions: () => fetchJson<Intervention[]>('/interventions'),

  // Optimization
  getAllocation: (supplyLiters = 220000) =>
    fetchJson<AllocationResult>(`/optimization/allocate?supply_liters=${supplyLiters}`),
  approveAllocation: (plan: any) =>
    fetchJson<any>('/optimization/approve', { method: 'POST', body: JSON.stringify(plan) }),

  // Scenario Simulator
  simulateScenario: (scenarioType: string, targetBuildingId = 'hostel_a', supplyReductionPct = 0, tempDelta = 0) =>
    fetchJson<ScenarioResult>('/scenario/simulate', {
      method: 'POST',
      body: JSON.stringify({
        scenario_type: scenarioType,
        target_building_id: targetBuildingId,
        supply_reduction_pct: supplyReductionPct,
        temperature_delta_c: tempDelta,
      }),
    }),

  // Analytics
  getOverview: () => fetchJson<OverviewKPIs>('/analytics/overview'),
  getConsumptionHistory: (buildingId = 'hostel_a', limit = 48) =>
    fetchJson<any[]>(`/analytics/consumption?building_id=${buildingId}&limit=${limit}`),
};

