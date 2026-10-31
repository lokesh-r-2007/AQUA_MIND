const API_BASE = (typeof window !== 'undefined' && window.location.port === '5173') ? '/api' : 'http://127.0.0.1:8000/api';
async function fetchJson(url, options) {
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
    getHealth: () => fetchJson('/health'),
    // Buildings
    getBuildings: () => fetchJson('/buildings'),
    getBuilding: (id) => fetchJson(`/buildings/${id}`),
    // Sensors & Simulator
    getLatestSensors: () => fetchJson('/sensors/latest'),
    getSensorHistory: (buildingId, limit = 50) => fetchJson(`/sensors/history?${buildingId ? `building_id=${buildingId}&` : ''}limit=${limit}`),
    stepSimulator: () => fetchJson('/simulator/step', { method: 'POST' }),
    startSimulator: () => fetchJson('/simulator/start', { method: 'POST' }),
    stopSimulator: () => fetchJson('/simulator/stop', { method: 'POST' }),
    triggerLeak: (buildingId, severity = 'moderate', leakLpm) => fetchJson('/simulator/leak', {
        method: 'POST',
        body: JSON.stringify({ building_id: buildingId, severity, leak_lpm: leakLpm }),
    }),
    stopLeak: (buildingId) => fetchJson(`/simulator/leak/stop?building_id=${buildingId}`, { method: 'POST' }),
    triggerFault: (buildingId, faultType) => fetchJson('/simulator/fault', {
        method: 'POST',
        body: JSON.stringify({ building_id: buildingId, fault_type: faultType, affected_sensor: 'flow_rate' }),
    }),
    getSimulatorStatus: () => fetchJson('/simulator/status'),
    // Weather
    getCurrentWeather: () => fetchJson('/weather/current'),
    getWeatherForecast: (days = 5) => fetchJson(`/weather/forecast?days=${days}`),
    // Alerts
    getAlerts: (status = 'ALL') => fetchJson(`/alerts?status=${status}`),
    acknowledgeAlert: (id) => fetchJson(`/alerts/${id}/acknowledge`, { method: 'POST' }),
    resolveAlert: (id) => fetchJson(`/alerts/${id}/resolve`, { method: 'POST' }),
    // Predictions
    getPredictions: () => fetchJson('/predictions'),
    getDemandForecast: (hours = 24) => fetchJson(`/predictions/forecast?hours=${hours}`),
    getShortageRisk: () => fetchJson('/predictions/shortage'),
    // Recommendations & Approval Workflow
    getRecommendations: (status) => fetchJson(`/recommendations${status ? `?status=${status}` : ''}`),
    approveRecommendation: (id) => fetchJson(`/recommendations/${id}/approve`, { method: 'POST' }),
    rejectRecommendation: (id) => fetchJson(`/recommendations/${id}/reject`, { method: 'POST' }),
    progressRecommendation: (id, notes) => fetchJson(`/recommendations/${id}/progress?operator_notes=${encodeURIComponent(notes || 'Dispatched')}`, {
        method: 'POST',
    }),
    resolveRecommendation: (id, notes) => fetchJson(`/recommendations/${id}/resolve?operator_notes=${encodeURIComponent(notes || 'Repaired')}`, {
        method: 'POST',
    }),
    // Interventions
    getInterventions: () => fetchJson('/interventions'),
    // Optimization
    getAllocation: (supplyLiters = 220000) => fetchJson(`/optimization/allocate?supply_liters=${supplyLiters}`),
    approveAllocation: (plan) => fetchJson('/optimization/approve', { method: 'POST', body: JSON.stringify(plan) }),
    // Scenario Simulator
    simulateScenario: (scenarioType, targetBuildingId = 'hostel_a', supplyReductionPct = 0, tempDelta = 0) => fetchJson('/scenario/simulate', {
        method: 'POST',
        body: JSON.stringify({
            scenario_type: scenarioType,
            target_building_id: targetBuildingId,
            supply_reduction_pct: supplyReductionPct,
            temperature_delta_c: tempDelta,
        }),
    }),
    // Analytics
    getOverview: () => fetchJson('/analytics/overview'),
    getConsumptionHistory: (buildingId = 'hostel_a', limit = 48) => fetchJson(`/analytics/consumption?building_id=${buildingId}&limit=${limit}`),
};
