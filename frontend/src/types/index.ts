// AquaMind AI - Frontend TypeScript Definitions

export interface Building {
  building_id: string;
  building_name: string;
  category: string;
  description: string;
  max_occupancy: number;
  tank_capacity_liters: number;
  nominal_pressure_bar: number;
  base_flow_lpm: number;
  night_flow_base_lpm: number;
  is_vulnerable_population: boolean;
  is_essential_service: boolean;
}

export interface SensorReading {
  id?: number;
  timestamp: string;
  building_id: string;
  building_name?: string;
  water_consumption_liters: number;
  flow_rate_lpm: number;
  pressure_bar: number;
  tank_level_percent: number;
  night_flow_lpm: number;
  occupancy: number;
  temperature: number;
  rainfall: number;
  humidity: number;
}

export interface Alert {
  id: number;
  timestamp: string;
  building_id: string;
  building_name?: string;
  category: string;
  severity: string;
  message: string;
  evidence: string[];
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
}

export interface Recommendation {
  id: number;
  problem: string;
  building_id: string;
  building_name?: string;
  detection_timestamp: string;
  evidence: string[];
  baseline_comparison: {
    current_flow_lpm: number;
    baseline_flow_lpm: number;
    current_pressure_bar: number;
    nominal_pressure_bar: number;
    current_night_flow_lpm: number;
    baseline_night_flow_lpm: number;
    current_tank_pct: number;
  };
  ai_prediction: {
    display_label: string;
    severity: string;
    confidence_percent: number;
    anomaly_diagnosis: string;
  };
  severity: 'none' | 'minor' | 'moderate' | 'major';
  priority: 'P1' | 'P2' | 'P3';
  priority_label: string;
  risk_score: number;
  action_window: string;
  estimated_water_loss_lph: number;
  estimated_daily_loss_liters: number;
  estimated_hourly_cost_inr: number;
  estimated_daily_cost_inr: number;
  recommended_action: string;
  expected_outcome: string;
  assigned_department: string;
  approval_status: 'Detected' | 'Under Review' | 'Approved' | 'Rejected' | 'In Progress' | 'Resolved' | 'Impact Measured';
  intervention_id?: string;
}

export interface Intervention {
  id: string;
  recommendation_id?: number;
  building_id: string;
  building_name?: string;
  action_taken: string;
  operator_notes?: string;
  start_timestamp: string;
  completion_timestamp?: string;
  status: 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED';
  verified_water_saved_liters?: number;
  financial_savings_inr?: number;
  co2_emissions_avoided_kg?: number;
}

export interface OverviewKPIs {
  total_consumption_lph: number;
  total_flow_rate_lpm: number;
  total_storage_available_liters: number;
  average_tank_level_pct: number;
  active_alerts_count: number;
  active_recommendations_count: number;
  p1_critical_count: number;
  potential_daily_loss_liters: number;
  verified_water_saved_liters: number;
  verified_financial_saved_inr: number;
  building_count: number;
  latest_readings: SensorReading[];
}

export interface AllocationResult {
  feasibility_status: string;
  available_supply_liters: number;
  total_predicted_demand_liters: number;
  total_allocated_liters: number;
  total_curtailment_liters: number;
  campus_satisfaction_pct: number;
  allocations: {
    building_id: string;
    building_name: string;
    category: string;
    predicted_demand_liters: number;
    allocated_supply_liters: number;
    curtailment_liters: number;
    demand_satisfied_pct: number;
    is_vulnerable: boolean;
    is_essential: boolean;
  }[];
  notes: string;
  requires_human_approval: boolean;
  guardrail_status: string;
}

export interface ScenarioResult {
  scenario_type: string;
  target_building_id: string;
  is_simulation_estimate: boolean;
  baseline: {
    daily_demand_liters: number;
    daily_supply_liters: number;
    shortage_risk: string;
    days_autonomy: number;
    active_leak_loss_liters: number;
  };
  scenario: {
    daily_demand_liters: number;
    daily_supply_liters: number;
    shortage_risk: string;
    days_autonomy: number;
    active_leak_loss_liters: number;
    demand_increase_liters: number;
    supply_delta_liters: number;
  };
  optimization_plan: AllocationResult;
  scenario_notes: string[];
}

