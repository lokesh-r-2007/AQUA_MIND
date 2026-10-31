import React, { useState } from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { Alert } from '../types';

interface AlertsPageProps {
  alerts: Alert[];
  onAcknowledge: (id: number) => Promise<void>;
  onResolve: (id: number) => Promise<void>;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({
  alerts,
  onAcknowledge,
  onResolve,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED'>('ALL');

  const filtered = alerts.filter((a) => {
    if (filter === 'ALL') return true;
    return a.status === filter;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header and Filter Pills */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: '700', color: '#29465B', margin: 0, letterSpacing: '-0.01em' }}>
            Infrastructure Alerts
          </h1>
          <p style={{ fontSize: '0.86rem', color: '#718096', margin: '4px 0 0 0' }}>
            Operational alerts for pipeline depressurization, flow spikes, and sensor irregularities.
          </p>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['ALL', 'ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                backgroundColor: filter === s ? '#E8F0F7' : '#FFFFFF',
                color: filter === s ? '#29465B' : '#718096',
                border: `1px solid ${filter === s ? '#DCE4EC' : '#E7EDF1'}`,
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: filter === s ? '600' : '500',
                cursor: 'pointer',
                transition: 'background-color 0.12s ease',
              }}
              onMouseEnter={(e) => {
                if (filter !== s) e.currentTarget.style.backgroundColor = '#F6F8FA';
              }}
              onMouseLeave={(e) => {
                if (filter !== s) e.currentTarget.style.backgroundColor = '#FFFFFF';
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 ? (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '48px 24px',
          textAlign: 'center',
          color: '#718096',
          border: '1px solid #E7EDF1',
          boxShadow: '0 1px 3px rgba(41, 56, 69, 0.02)',
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            backgroundColor: '#EBF5F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px auto',
          }}>
            <CheckCircle size={22} color="#54856D" />
          </div>
          <div style={{ fontSize: '1.02rem', fontWeight: '600', color: '#29465B' }}>No Incidents Found</div>
          <p style={{ fontSize: '0.84rem', margin: '4px 0 0 0' }}>All telemetry streams match normal baseline criteria.</p>
        </div>
      ) : (
        /* Alerts Table */
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E7EDF1',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(41, 56, 69, 0.02)',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', color: '#293845' }}>
            <thead>
              <tr style={{ backgroundColor: '#F6F8FA', borderBottom: '1px solid #E7EDF1', textAlign: 'left', color: '#718096' }}>
                <th style={{ padding: '12px 16px', fontWeight: '600' }}>Timestamp</th>
                <th style={{ padding: '12px 16px', fontWeight: '600' }}>Facility</th>
                <th style={{ padding: '12px 16px', fontWeight: '600' }}>Category</th>
                <th style={{ padding: '12px 16px', fontWeight: '600' }}>Priority Tier</th>
                <th style={{ padding: '12px 16px', fontWeight: '600' }}>Problem Summary</th>
                <th style={{ padding: '12px 16px', fontWeight: '600' }}>Status</th>
                <th style={{ padding: '12px 16px', fontWeight: '600', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((alert) => (
                <tr key={alert.id} style={{ borderBottom: '1px solid #F0F4F8' }}>
                  <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#718096' }}>
                    {alert.timestamp}
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: '600', color: '#29465B' }}>
                    {alert.building_name}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      fontSize: '0.72rem',
                      padding: '2px 8px',
                      borderRadius: '5px',
                      fontWeight: '600',
                      backgroundColor: alert.category === 'LEAK' ? '#FDF2F2' : '#FDF8EE',
                      color: alert.category === 'LEAK' ? '#C16D6D' : '#C39755',
                      border: `1px solid ${alert.category === 'LEAK' ? '#F5D5D5' : '#F4E3C8'}`,
                    }}>
                      {alert.category}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: '600', color: alert.severity.includes('P1') ? '#C16D6D' : (alert.severity.includes('P2') ? '#C39755' : '#718096') }}>
                    {alert.severity}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#293845' }}>
                    {alert.message}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      fontSize: '0.72rem',
                      padding: '2px 8px',
                      borderRadius: '5px',
                      fontWeight: '600',
                      backgroundColor: alert.status === 'ACTIVE' ? '#FDF2F2' : (alert.status === 'ACKNOWLEDGED' ? '#E8F0F7' : '#EBF5F0'),
                      color: alert.status === 'ACTIVE' ? '#C16D6D' : (alert.status === 'ACKNOWLEDGED' ? '#29465B' : '#54856D'),
                      border: `1px solid ${alert.status === 'ACTIVE' ? '#F5D5D5' : (alert.status === 'ACKNOWLEDGED' ? '#DCE4EC' : '#D2E8DD')}`,
                    }}>
                      {alert.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    {alert.status === 'ACTIVE' && (
                      <button
                        onClick={() => onAcknowledge(alert.id)}
                        style={{
                          backgroundColor: '#E8F0F7',
                          color: '#29465B',
                          border: '1px solid #DCE4EC',
                          padding: '5px 12px',
                          borderRadius: '6px',
                          fontSize: '0.76rem',
                          cursor: 'pointer',
                          fontWeight: '600',
                        }}
                      >
                        Acknowledge
                      </button>
                    )}
                    {alert.status === 'ACKNOWLEDGED' && (
                      <button
                        onClick={() => onResolve(alert.id)}
                        style={{
                          backgroundColor: '#EBF5F0',
                          color: '#54856D',
                          border: '1px solid #D2E8DD',
                          padding: '5px 12px',
                          borderRadius: '6px',
                          fontSize: '0.76rem',
                          cursor: 'pointer',
                          fontWeight: '600',
                        }}
                      >
                        Resolve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
