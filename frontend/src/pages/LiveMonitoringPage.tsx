import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Sliders,
  Gauge,
  Users,
  Wrench,
} from 'lucide-react';
import { SensorReading, Building } from '../types';

interface LiveMonitoringPageProps {
  latestReadings: SensorReading[];
  buildings: Building[];
  onTriggerLeak: (buildingId: string, severity: 'minor' | 'moderate' | 'major') => Promise<void>;
  onStopLeak: (buildingId: string) => Promise<void>;
  onTriggerFault: (buildingId: string, faultType: string) => Promise<void>;
  onStepSimulation: () => Promise<void>;
  activeLeaks: any[];
}

export const LiveMonitoringPage: React.FC<LiveMonitoringPageProps> = ({
  latestReadings,
  buildings,
  onTriggerLeak,
  onStopLeak,
  onTriggerFault,
  activeLeaks,
}) => {
  const [selectedBuilding, setSelectedBuilding] = useState<string>('hostel_a');
  const [selectedSeverity, setSelectedSeverity] = useState<'minor' | 'moderate' | 'major'>('moderate');
  const [isActing, setIsActing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleTrigger = async () => {
    setIsActing(true);
    try {
      await onTriggerLeak(selectedBuilding, selectedSeverity);
      setStatusMsg(`Triggered ${selectedSeverity} pipe fissure in ${selectedBuilding}. Observing physical hydraulic reaction.`);
    } catch (err: any) {
      setStatusMsg(`Error: ${err.message}`);
    } finally {
      setIsActing(false);
    }
  };

  const handleStop = async (bid: string) => {
    setIsActing(true);
    try {
      await onStopLeak(bid);
      setStatusMsg(`Pipe fissure isolated and repaired in ${bid}. Baseline pressure and flow restored.`);
    } catch (err: any) {
      setStatusMsg(`Error: ${err.message}`);
    } finally {
      setIsActing(false);
    }
  };

  const handleFault = async () => {
    setIsActing(true);
    try {
      await onTriggerFault(selectedBuilding, 'sensor_drift');
      setStatusMsg(`Injected transducer drift in ${selectedBuilding}. Physical hydraulics remain nominal.`);
    } catch (err: any) {
      setStatusMsg(`Error: ${err.message}`);
    } finally {
      setIsActing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: '1.45rem', fontWeight: '700', color: '#29465B', margin: 0, letterSpacing: '-0.01em' }}>
          Live Telemetry & Simulation Controls
        </h1>
        <p style={{ fontSize: '0.86rem', color: '#718096', margin: '4px 0 0 0' }}>
          Continuous digital-twin monitoring with live anomaly injection capabilities for testing network resilience.
        </p>
      </div>

      {/* Interactive Control Console Card */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #E7EDF1',
        padding: '22px 24px',
        boxShadow: '0 1px 3px rgba(41, 56, 69, 0.03)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: '#DCEFED',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Sliders size={16} color="#29465B" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.02rem', fontWeight: '700', color: '#29465B', margin: 0 }}>
              Physical Network Simulation & Anomaly Injector
            </h2>
            <div style={{ fontSize: '0.78rem', color: '#718096' }}>
              Simulate pipe wall ruptures or instrumentation drift to evaluate AI detection and decision support.
            </div>
          </div>
        </div>

        {statusMsg && (
          <div style={{
            backgroundColor: '#EBF5F0',
            color: '#54856D',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '0.84rem',
            marginBottom: '16px',
            border: '1px solid #D2E8DD',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <CheckCircle size={15} color="#54856D" />
            <span>{statusMsg}</span>
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
          {/* Target Building Selector */}
          <div style={{ minWidth: '220px', flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: '#718096', marginBottom: '6px' }}>
              Target Facility
            </label>
            <select
              value={selectedBuilding}
              onChange={(e) => setSelectedBuilding(e.target.value)}
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

          {/* Severity Selector */}
          <div style={{ minWidth: '260px', flex: '1 1 240px' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: '#718096', marginBottom: '6px' }}>
              Leak Severity Tier
            </label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value as any)}
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
              <option value="minor">Minor Fixture Weepage (~3.5 LPM / 210 L/h)</option>
              <option value="moderate">Moderate Main Line Fissure (~18.5 LPM / 1,110 L/h)</option>
              <option value="major">Major Pipeline Catastrophic Burst (~55.0 LPM / 3,300 L/h)</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={handleTrigger}
              disabled={isActing}
              style={{
                backgroundColor: '#C16D6D',
                color: '#FFFFFF',
                border: 'none',
                padding: '9px 16px',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: isActing ? 'not-allowed' : 'pointer',
                fontSize: '0.84rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                opacity: isActing ? 0.65 : 1,
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!isActing) e.currentTarget.style.backgroundColor = '#B05B5B';
              }}
              onMouseLeave={(e) => {
                if (!isActing) e.currentTarget.style.backgroundColor = '#C16D6D';
              }}
            >
              <AlertTriangle size={14} />
              <span>Inject Pipe Leak</span>
            </button>

            <button
              onClick={handleFault}
              disabled={isActing}
              style={{
                backgroundColor: '#FFFFFF',
                color: '#C39755',
                border: '1px solid #F4E3C8',
                padding: '9px 16px',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: isActing ? 'not-allowed' : 'pointer',
                fontSize: '0.84rem',
                opacity: isActing ? 0.65 : 1,
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!isActing) e.currentTarget.style.backgroundColor = '#FDF8EE';
              }}
              onMouseLeave={(e) => {
                if (!isActing) e.currentTarget.style.backgroundColor = '#FFFFFF';
              }}
            >
              <span>Inject Sensor Drift</span>
            </button>

            <button
              onClick={() => handleStop(selectedBuilding)}
              disabled={isActing}
              style={{
                backgroundColor: '#5C9992',
                color: '#FFFFFF',
                border: 'none',
                padding: '9px 16px',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: isActing ? 'not-allowed' : 'pointer',
                fontSize: '0.84rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                opacity: isActing ? 0.65 : 1,
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!isActing) e.currentTarget.style.backgroundColor = '#4A807A';
              }}
              onMouseLeave={(e) => {
                if (!isActing) e.currentTarget.style.backgroundColor = '#5C9992';
              }}
            >
              <CheckCircle size={14} />
              <span>Repair & Restore</span>
            </button>
          </div>
        </div>
      </div>

      {/* Buildings Live Telemetry Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: '18px' }}>
        {latestReadings.map((b) => {
          const isLeaking = activeLeaks.some((l) => l.building_id === b.building_id);
          const leakInfo = activeLeaks.find((l) => l.building_id === b.building_id);

          return (
            <div
              key={b.building_id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: isLeaking ? '1px solid #F5D5D5' : '1px solid #E7EDF1',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                boxShadow: isLeaking ? '0 1px 4px rgba(193, 109, 109, 0.08)' : '0 1px 3px rgba(41, 56, 69, 0.02)',
              }}
            >
              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '1.02rem', fontWeight: '700', color: '#29465B', margin: 0 }}>
                    {b.building_name}
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: '#718096', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                    <Users size={13} color="#718096" />
                    <span>Occupancy: {b.occupancy} occupants</span>
                  </div>
                </div>

                <span style={{
                  padding: '3px 9px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: '600',
                  backgroundColor: isLeaking ? '#FDF2F2' : '#EBF5F0',
                  color: isLeaking ? '#C16D6D' : '#54856D',
                  border: `1px solid ${isLeaking ? '#F5D5D5' : '#D2E8DD'}`,
                  textTransform: 'uppercase',
                }}>
                  {isLeaking ? `${leakInfo.severity} Leak Active` : 'Nominal'}
                </span>
              </div>

              {/* 4 Telemetry Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ backgroundColor: '#F6F8FA', padding: '12px', borderRadius: '8px', border: '1px solid #E7EDF1' }}>
                  <div style={{ fontSize: '0.74rem', color: '#718096' }}>Pipeline Flow</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', color: isLeaking ? '#C16D6D' : '#29465B', marginTop: '2px' }}>
                    {b.flow_rate_lpm.toFixed(1)} <span style={{ fontSize: '0.75rem', color: '#718096', fontWeight: '400' }}>LPM</span>
                  </div>
                </div>

                <div style={{ backgroundColor: '#F6F8FA', padding: '12px', borderRadius: '8px', border: '1px solid #E7EDF1' }}>
                  <div style={{ fontSize: '0.74rem', color: '#718096' }}>Line Pressure</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', color: b.pressure_bar < 2.5 ? '#C16D6D' : '#54856D', marginTop: '2px' }}>
                    {b.pressure_bar.toFixed(2)} <span style={{ fontSize: '0.75rem', color: '#718096', fontWeight: '400' }}>bar</span>
                  </div>
                </div>

                <div style={{ backgroundColor: '#F6F8FA', padding: '12px', borderRadius: '8px', border: '1px solid #E7EDF1' }}>
                  <div style={{ fontSize: '0.74rem', color: '#718096' }}>Night Minimum Flow</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', color: b.night_flow_lpm > 10.0 ? '#C39755' : '#29465B', marginTop: '2px' }}>
                    {b.night_flow_lpm.toFixed(1)} <span style={{ fontSize: '0.75rem', color: '#718096', fontWeight: '400' }}>LPM</span>
                  </div>
                </div>

                <div style={{ backgroundColor: '#F6F8FA', padding: '12px', borderRadius: '8px', border: '1px solid #E7EDF1' }}>
                  <div style={{ fontSize: '0.74rem', color: '#718096' }}>Hourly Volume</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#29465B', marginTop: '2px' }}>
                    {b.water_consumption_liters.toLocaleString()} <span style={{ fontSize: '0.75rem', color: '#718096', fontWeight: '400' }}>L</span>
                  </div>
                </div>
              </div>

              {/* Tank Level Progress Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: '#718096', marginBottom: '5px' }}>
                  <span>Overhead Tank Capacity</span>
                  <strong style={{ color: '#29465B' }}>{b.tank_level_percent.toFixed(1)}%</strong>
                </div>
                <div style={{ height: '7px', backgroundColor: '#E8F0F7', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(100, Math.max(0, b.tank_level_percent))}%`,
                      backgroundColor: b.tank_level_percent < 30 ? '#C16D6D' : (b.tank_level_percent < 55 ? '#C39755' : '#5C9992'),
                      borderRadius: '4px',
                      transition: 'width 0.3s ease',
                    }}
                  ></div>
                </div>
              </div>

              {/* Quick Repair Button if leaking */}
              {isLeaking && (
                <button
                  onClick={() => handleStop(b.building_id)}
                  style={{
                    backgroundColor: '#5C9992',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#4A807A')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#5C9992')}
                >
                  <Wrench size={14} />
                  <span>Isolate Fissure & Restore Flow</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
