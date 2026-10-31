import React from 'react';
import { Building2, ShieldCheck, Users, Droplets } from 'lucide-react';
import { Building, SensorReading } from '../types';

interface BuildingsPageProps {
  buildings: Building[];
  latestReadings: SensorReading[];
}

export const BuildingsPage: React.FC<BuildingsPageProps> = ({ buildings, latestReadings }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.45rem', fontWeight: '700', color: '#29465B', margin: 0, letterSpacing: '-0.01em' }}>
          Campus Facilities & Digital Twin Assets
        </h1>
        <p style={{ fontSize: '0.86rem', color: '#718096', margin: '4px 0 0 0' }}>
          Physical hydraulic specifications, storage tank capacities, and ethical student welfare classifications.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        {buildings.map((b) => {
          const reading = latestReadings.find((r) => r.building_id === b.building_id);

          return (
            <div
              key={b.building_id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E7EDF1',
                padding: '22px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                boxShadow: '0 1px 3px rgba(41, 56, 69, 0.02)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: '#E8F0F7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Building2 size={18} color="#29465B" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#29465B', margin: 0 }}>
                      {b.building_name}
                    </h3>
                    <div style={{ fontSize: '0.78rem', color: '#5C9992', fontWeight: '600' }}>
                      {b.category} Facility
                    </div>
                  </div>
                </div>

                {b.is_vulnerable_population ? (
                  <span style={{
                    fontSize: '0.72rem',
                    backgroundColor: '#FDF8EE',
                    color: '#C39755',
                    padding: '3px 9px',
                    borderRadius: '6px',
                    border: '1px solid #F4E3C8',
                    fontWeight: '600',
                  }}>
                    Protected (Residential)
                  </span>
                ) : (
                  <span style={{
                    fontSize: '0.72rem',
                    backgroundColor: '#F6F8FA',
                    color: '#718096',
                    padding: '3px 9px',
                    borderRadius: '6px',
                    border: '1px solid #E7EDF1',
                    fontWeight: '500',
                  }}>
                    Standard Academic
                  </span>
                )}
              </div>

              <p style={{ fontSize: '0.82rem', color: '#718096', margin: 0, lineHeight: '1.45' }}>
                {b.description}
              </p>

              {/* Physical Specifications */}
              <div style={{
                backgroundColor: '#F6F8FA',
                padding: '12px 14px',
                borderRadius: '8px',
                border: '1px solid #E7EDF1',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                fontSize: '0.8rem',
              }}>
                <div>
                  <span style={{ color: '#718096', fontSize: '0.74rem', display: 'block' }}>Tank Capacity</span>
                  <strong style={{ color: '#29465B' }}>{b.tank_capacity_liters.toLocaleString()} Liters</strong>
                </div>
                <div>
                  <span style={{ color: '#718096', fontSize: '0.74rem', display: 'block' }}>Nominal Head</span>
                  <strong style={{ color: '#29465B' }}>{b.nominal_pressure_bar} bar</strong>
                </div>
                <div>
                  <span style={{ color: '#718096', fontSize: '0.74rem', display: 'block' }}>Max Capacity</span>
                  <strong style={{ color: '#29465B' }}>{b.max_occupancy} occupants</strong>
                </div>
                <div>
                  <span style={{ color: '#718096', fontSize: '0.74rem', display: 'block' }}>Base Flow Rate</span>
                  <strong style={{ color: '#29465B' }}>{b.base_flow_lpm} LPM</strong>
                </div>
              </div>

              {/* Live Reading Summary */}
              {reading && (
                <div style={{
                  borderTop: '1px solid #E7EDF1',
                  paddingTop: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.78rem',
                  color: '#718096',
                }}>
                  <span>Flow: <strong style={{ color: '#293845' }}>{reading.flow_rate_lpm.toFixed(1)} LPM</strong></span>
                  <span>Tank Level: <strong style={{ color: '#54856D' }}>{reading.tank_level_percent.toFixed(1)}%</strong></span>
                  <span>Pressure: <strong style={{ color: '#293845' }}>{reading.pressure_bar.toFixed(2)} bar</strong></span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
