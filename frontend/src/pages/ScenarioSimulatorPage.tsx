import React, { useState } from 'react';
import { Sliders, Play, AlertTriangle, CheckCircle, Database } from 'lucide-react';
import { ScenarioResult, Building } from '../types';
import { api } from '../services/api';

interface ScenarioSimulatorPageProps {
  buildings: Building[];
}

export const ScenarioSimulatorPage: React.FC<ScenarioSimulatorPageProps> = ({ buildings }) => {
  const [scenarioType, setScenarioType] = useState<string>('moderate_leak');
  const [targetBuilding, setTargetBuilding] = useState<string>('hostel_a');
  const [supplyReduction, setSupplyReduction] = useState<number>(30);
  const [tempDelta, setTempDelta] = useState<number>(5);
  const [result, setResult] = useState<ScenarioResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    setLoading(true);
    try {
      const res = await api.simulateScenario(scenarioType, targetBuilding, supplyReduction, tempDelta);
      setResult(res);
    } catch (err: any) {
      alert(`Simulation error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.45rem', fontWeight: '700', color: '#29465B', margin: 0, letterSpacing: '-0.01em' }}>
          What-If Resilience Scenario Simulator
        </h1>
        <p style={{ fontSize: '0.86rem', color: '#718096', margin: '4px 0 0 0' }}>
          Evaluate the resilience impact of pipeline ruptures, municipal droughts, and weather shocks on campus storage autonomy.
        </p>
      </div>

      {/* Scenario Controls Panel */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        padding: '22px 24px',
        border: '1px solid #E7EDF1',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: '0 1px 3px rgba(41, 56, 69, 0.02)',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: '#718096', marginBottom: '6px' }}>
              Select Hypothetical Scenario
            </label>
            <select
              value={scenarioType}
              onChange={(e) => setScenarioType(e.target.value)}
              style={{
                backgroundColor: '#FFFFFF',
                color: '#293845',
                border: '1px solid #E7EDF1',
                borderRadius: '8px',
                padding: '9px 12px',
                fontSize: '0.85rem',
                width: '100%',
                outline: 'none',
              }}
            >
              <option value="moderate_leak">Moderate Pipe Leak (~18.5 LPM loss)</option>
              <option value="major_leak">Major Main Line Burst (~55.0 LPM loss)</option>
              <option value="supply_cut">Municipal Supply Curtailment (-40%)</option>
              <option value="drought_heatwave">37°C Drought & Heatwave (Evaporative Peak)</option>
              <option value="heavy_rain">Heavy Monsoon Downpour (+Harvesting)</option>
              <option value="repaired_leak">Simulate Immediate Pipe Repair</option>
            </select>
          </div>

          {(scenarioType === 'moderate_leak' || scenarioType === 'major_leak' || scenarioType === 'repaired_leak') && (
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: '#718096', marginBottom: '6px' }}>
                Affected Facility
              </label>
              <select
                value={targetBuilding}
                onChange={(e) => setTargetBuilding(e.target.value)}
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#293845',
                  border: '1px solid #E7EDF1',
                  borderRadius: '8px',
                  padding: '9px 12px',
                  fontSize: '0.85rem',
                  width: '100%',
                  outline: 'none',
                }}
              >
                {buildings.map((b) => (
                  <option key={b.building_id} value={b.building_id}>
                    {b.building_name} ({b.category})
                  </option>
                ))}
              </select>
            </div>
          )}

          {scenarioType === 'supply_cut' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: '#718096', marginBottom: '6px' }}>
                Municipal Supply Reduction ({supplyReduction}%)
              </label>
              <input
                type="range"
                min={10}
                max={70}
                value={supplyReduction}
                onChange={(e) => setSupplyReduction(Number(e.target.value))}
                style={{ width: '100%', cursor: 'pointer', accentColor: '#5C9992' }}
              />
            </div>
          )}
        </div>

        <button
          onClick={handleRun}
          disabled={loading}
          style={{
            backgroundColor: '#29465B',
            color: '#FFFFFF',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '0.85rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '6px',
            width: 'fit-content',
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = '#1F3545';
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = '#29465B';
          }}
        >
          <Play size={14} fill="#FFFFFF" />
          <span>{loading ? 'Simulating Dynamic Scenario...' : 'Execute What-If Projection'}</span>
        </button>
      </div>

      {/* Results Comparison Grid */}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{
            fontSize: '0.78rem',
            color: '#C39755',
            backgroundColor: '#FDF8EE',
            padding: '10px 16px',
            borderRadius: '8px',
            border: '1px solid #F4E3C8',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <AlertTriangle size={15} color="#C39755" />
            <span><strong>PROJECTION ESTIMATE:</strong> Values below reflect model scenario estimates, not physical real-time measurements.</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {/* Baseline Column */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              padding: '22px',
              border: '1px solid #E7EDF1',
              boxShadow: '0 1px 3px rgba(41, 56, 69, 0.02)',
            }}>
              <div style={{ fontSize: '0.82rem', color: '#718096', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.03em', marginBottom: '14px' }}>
                Normal Baseline Conditions
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.88rem' }}>
                <div>
                  <span style={{ color: '#718096' }}>Daily Campus Demand:</span>{' '}
                  <strong style={{ color: '#293845' }}>{result.baseline.daily_demand_liters.toLocaleString()} Liters</strong>
                </div>
                <div>
                  <span style={{ color: '#718096' }}>Daily Supply Inflow:</span>{' '}
                  <strong style={{ color: '#293845' }}>{result.baseline.daily_supply_liters.toLocaleString()} Liters</strong>
                </div>
                <div>
                  <span style={{ color: '#718096' }}>Storage Autonomy:</span>{' '}
                  <strong style={{ color: '#54856D' }}>{result.baseline.days_autonomy} days</strong>
                </div>
                <div>
                  <span style={{ color: '#718096' }}>Shortage Risk:</span>{' '}
                  <span style={{ color: '#54856D', fontWeight: '600' }}>Low Risk</span>
                </div>
              </div>
            </div>

            {/* Scenario Column */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              padding: '22px',
              border: result.scenario.shortage_risk === 'High Risk' ? '1px solid #F5D5D5' : '1px solid #DCE4EC',
              boxShadow: '0 1px 3px rgba(41, 56, 69, 0.02)',
            }}>
              <div style={{ fontSize: '0.82rem', color: '#29465B', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.03em', marginBottom: '14px' }}>
                Simulated Scenario Projection
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.88rem' }}>
                <div>
                  <span style={{ color: '#718096' }}>Projected Demand:</span>{' '}
                  <strong style={{ color: '#293845' }}>{result.scenario.daily_demand_liters.toLocaleString()} Liters</strong>
                  {result.scenario.demand_increase_liters > 0 && (
                    <span style={{ color: '#C16D6D', fontSize: '0.8rem', marginLeft: '6px' }}>
                      (+{result.scenario.demand_increase_liters.toLocaleString()} L)
                    </span>
                  )}
                </div>
                <div>
                  <span style={{ color: '#718096' }}>Projected Supply:</span>{' '}
                  <strong style={{ color: '#293845' }}>{result.scenario.daily_supply_liters.toLocaleString()} Liters</strong>
                </div>
                <div>
                  <span style={{ color: '#718096' }}>Storage Autonomy:</span>{' '}
                  <strong style={{ color: result.scenario.days_autonomy < 1.2 ? '#C16D6D' : '#C39755' }}>
                    {result.scenario.days_autonomy} days
                  </strong>
                </div>
                <div>
                  <span style={{ color: '#718096' }}>Shortage Risk:</span>{' '}
                  <span style={{
                    color: result.scenario.shortage_risk === 'High Risk' ? '#C16D6D' : (result.scenario.shortage_risk === 'Medium Risk' ? '#C39755' : '#54856D'),
                    fontWeight: '600',
                  }}>
                    {result.scenario.shortage_risk}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Scenario Notes */}
          {result.scenario_notes.length > 0 && (
            <div style={{ backgroundColor: '#F6F8FA', padding: '16px 18px', borderRadius: '8px', border: '1px solid #E7EDF1' }}>
              <div style={{ fontSize: '0.78rem', color: '#718096', textTransform: 'uppercase', fontWeight: '700', marginBottom: '6px' }}>
                Scenario Analysis Insights:
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#293845', fontSize: '0.84rem', lineHeight: '1.5' }}>
                {result.scenario_notes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
