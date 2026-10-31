import React from 'react';
import { Activity, Database, Thermometer, Clock } from 'lucide-react';
import { OverviewKPIs } from '../types';

interface HeaderProps {
  kpis: OverviewKPIs | null;
  onStepSimulation: () => void;
  isStepping: boolean;
  weather: any;
}

export const Header: React.FC<HeaderProps> = ({
  kpis,
  onStepSimulation,
  isStepping,
  weather,
}) => {
  const currentTemp = weather?.temperature_c != null ? Math.round(weather.temperature_c) : 28;
  const storagePct = kpis ? Math.round(kpis.average_tank_level_pct) : 72;
  const flowRateLpm = kpis ? kpis.total_flow_rate_lpm.toFixed(1) : '129.0';

  return (
    <header style={{
      height: '70px',
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid #E2E8F0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      color: '#1E293B',
      flexShrink: 0,
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
      gap: '16px',
    }}>
      {/* Left: Operational Status Beacon */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        flexShrink: 0,
        whiteSpace: 'nowrap',
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: '#2563EB',
          boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.18)',
          display: 'inline-block',
        }}></div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#1E293B', lineHeight: '1.2' }}>
            Resilience Command Center
          </span>
          <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '500' }}>
            Campus Operational Network
          </span>
        </div>
      </div>

      {/* Right: Compact Status Indicators (Horizontally Aligned on Desktop) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        flexWrap: 'wrap',
      }}>
        {/* Widget 1: [ CampusFlow ] */}
        <div
          title={`Campus Aggregate Flow: ${flowRateLpm} LPM`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            backgroundColor: '#EFF6FF',
            border: '1px solid #DBEAFE',
            padding: '6px 13px',
            borderRadius: '7px',
            fontSize: '0.82rem',
            color: '#1E40AF',
            fontWeight: '600',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          <Activity size={14} color="#2563EB" />
          <span>CampusFlow</span>
          <span style={{ fontSize: '0.75rem', fontWeight: '500', color: '#3B82F6', marginLeft: '2px' }}>
            ({flowRateLpm} LPM)
          </span>
        </div>

        {/* Widget 2: [ Storage: XX% ] */}
        <div
          title={kpis ? `Total Available Storage: ${(kpis.total_storage_available_liters / 1000).toFixed(0)} m³` : 'Storage Buffer'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            padding: '6px 13px',
            borderRadius: '7px',
            fontSize: '0.82rem',
            color: '#334155',
            fontWeight: '600',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          <Database size={14} color="#2563EB" />
          <span>Storage: {storagePct}%</span>
        </div>

        {/* Widget 3: [ Temperature: XX°C ] */}
        <div
          title={weather ? `Precipitation: ${weather.precipitation_mm}mm (${weather.source})` : 'Ambient Weather'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            padding: '6px 13px',
            borderRadius: '7px',
            fontSize: '0.82rem',
            color: '#334155',
            fontWeight: '600',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          <Thermometer size={14} color="#2563EB" />
          <span>Temperature: {currentTemp}°C</span>
        </div>

        {/* Widget 4: [ +1 hr ] Interactive Button with Clock Icon */}
        <button
          onClick={onStepSimulation}
          disabled={isStepping}
          title="Advance simulation forward by 1 hour"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#2563EB',
            color: '#FFFFFF',
            border: '1px solid #1D4ED8',
            padding: '6px 14px',
            borderRadius: '7px',
            cursor: isStepping ? 'not-allowed' : 'pointer',
            fontSize: '0.82rem',
            fontWeight: '600',
            opacity: isStepping ? 0.7 : 1,
            transition: 'all 0.15s ease',
            boxShadow: '0 1px 2px rgba(37, 99, 235, 0.2)',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            if (!isStepping) {
              e.currentTarget.style.backgroundColor = '#1D4ED8';
            }
          }}
          onMouseLeave={(e) => {
            if (!isStepping) {
              e.currentTarget.style.backgroundColor = '#2563EB';
            }
          }}
        >
          <Clock size={14} color="#FFFFFF" />
          <span>{isStepping ? 'Advancing...' : '+1 hr'}</span>
        </button>
      </div>
    </header>
  );
};
