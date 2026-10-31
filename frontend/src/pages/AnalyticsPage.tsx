import React, { useEffect, useState } from 'react';
import { Droplets, TrendingUp, Zap, Leaf, CheckCircle } from 'lucide-react';
import { OverviewKPIs, Intervention } from '../types';
import { api } from '../services/api';

interface AnalyticsPageProps {
  kpis: OverviewKPIs | null;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ kpis }) => {
  const [interventions, setInterventions] = useState<Intervention[]>([]);

  useEffect(() => {
    api.getInterventions().then(setInterventions).catch(console.error);
  }, []);

  const totalSavedLiters = interventions.reduce((acc, i) => acc + (i.verified_water_saved_liters || 0), 0);
  const totalSavedInr = interventions.reduce((acc, i) => acc + (i.financial_savings_inr || 0), 0);
  const totalCo2Avoided = interventions.reduce((acc, i) => acc + (i.co2_emissions_avoided_kg || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.45rem', fontWeight: '700', color: '#29465B', margin: 0, letterSpacing: '-0.01em' }}>
          Resilience Analytics & Verified Impact
        </h1>
        <p style={{ fontSize: '0.86rem', color: '#718096', margin: '4px 0 0 0' }}>
          Longitudinal conservation metrics, verified post-repair water recovery, and environmental ESG performance.
        </p>
      </div>

      {/* 4 Impact Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          padding: '22px',
          borderRadius: '12px',
          border: '1px solid #E7EDF1',
          boxShadow: '0 1px 3px rgba(41, 56, 69, 0.02)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.78rem', color: '#718096', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Verified Water Conserved
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#EBF5F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Droplets size={16} color="#54856D" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#54856D', lineHeight: '1.2' }}>
            {totalSavedLiters.toLocaleString()} <span style={{ fontSize: '0.85rem', color: '#718096', fontWeight: '400' }}>L</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#718096', marginTop: '8px' }}>
            Post-repair confirmed savings across {interventions.length} interventions
          </div>
        </div>

        <div style={{
          backgroundColor: '#FFFFFF',
          padding: '22px',
          borderRadius: '12px',
          border: '1px solid #E7EDF1',
          boxShadow: '0 1px 3px rgba(41, 56, 69, 0.02)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.78rem', color: '#718096', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Financial Cost Avoidance
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#E8F0F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={16} color="#29465B" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#29465B', lineHeight: '1.2' }}>
            ₹ {totalSavedInr.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#718096', marginTop: '8px' }}>
            Based on campus utility tariff ₹ 45 / 1,000 Liters
          </div>
        </div>

        <div style={{
          backgroundColor: '#FFFFFF',
          padding: '22px',
          borderRadius: '12px',
          border: '1px solid #E7EDF1',
          boxShadow: '0 1px 3px rgba(41, 56, 69, 0.02)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.78rem', color: '#718096', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Pumping Energy Saved
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#FDF8EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={16} color="#C39755" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#C39755', lineHeight: '1.2' }}>
            {(totalSavedLiters * 0.00045).toFixed(1)} <span style={{ fontSize: '0.85rem', color: '#718096', fontWeight: '400' }}>kWh</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#718096', marginTop: '8px' }}>
            Booster pump lift and main distribution pumping
          </div>
        </div>

        <div style={{
          backgroundColor: '#FFFFFF',
          padding: '22px',
          borderRadius: '12px',
          border: '1px solid #E7EDF1',
          boxShadow: '0 1px 3px rgba(41, 56, 69, 0.02)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.78rem', color: '#718096', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Emissions Mitigated
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#DCEFED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Leaf size={16} color="#5C9992" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#5C9992', lineHeight: '1.2' }}>
            {totalCo2Avoided.toFixed(1)} <span style={{ fontSize: '0.85rem', color: '#718096', fontWeight: '400' }}>kg CO₂</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#718096', marginTop: '8px' }}>
            Grid carbon emissions averted via water conservation
          </div>
        </div>
      </div>

      {/* Intervention Log Table */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #E7EDF1',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(41, 56, 69, 0.02)',
      }}>
        <div style={{
          padding: '16px 20px',
          backgroundColor: '#F6F8FA',
          borderBottom: '1px solid #E7EDF1',
          fontSize: '0.94rem',
          fontWeight: '700',
          color: '#29465B',
        }}>
          Verified Maintenance Work Orders & Impact Log
        </div>

        {interventions.length === 0 ? (
          <div style={{ padding: '36px 24px', textAlign: 'center', color: '#718096', fontSize: '0.86rem' }}>
            No interventions logged yet. Trigger a simulated leak in Live Monitoring, approve the recommendation, and resolve it to observe verified savings!
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', color: '#293845' }}>
            <thead>
              <tr style={{ backgroundColor: '#F6F8FA', borderBottom: '1px solid #E7EDF1', textAlign: 'left', color: '#718096' }}>
                <th style={{ padding: '12px 16px', fontWeight: '600' }}>Work Order ID</th>
                <th style={{ padding: '12px 16px', fontWeight: '600' }}>Facility</th>
                <th style={{ padding: '12px 16px', fontWeight: '600' }}>Corrective Action</th>
                <th style={{ padding: '12px 16px', fontWeight: '600' }}>Start Timestamp</th>
                <th style={{ padding: '12px 16px', fontWeight: '600' }}>Water Conserved</th>
                <th style={{ padding: '12px 16px', fontWeight: '600' }}>Financial Saving</th>
                <th style={{ padding: '12px 16px', fontWeight: '600' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {interventions.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #F0F4F8' }}>
                  <td style={{ padding: '12px 16px', fontWeight: '600', color: '#29465B' }}>{item.id}</td>
                  <td style={{ padding: '12px 16px', fontWeight: '600', color: '#29465B' }}>{item.building_name}</td>
                  <td style={{ padding: '12px 16px', color: '#718096' }}>{item.action_taken}</td>
                  <td style={{ padding: '12px 16px', color: '#718096', fontSize: '0.8rem' }}>{item.start_timestamp}</td>
                  <td style={{ padding: '12px 16px', color: '#54856D', fontWeight: '600' }}>
                    {item.verified_water_saved_liters ? `${item.verified_water_saved_liters.toLocaleString()} Liters` : 'In Progress'}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#29465B', fontWeight: '600' }}>
                    {item.financial_savings_inr ? `₹ ${item.financial_savings_inr.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'Pending'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      fontSize: '0.72rem',
                      padding: '3px 8px',
                      borderRadius: '5px',
                      fontWeight: '600',
                      backgroundColor: item.status === 'RESOLVED' ? '#EBF5F0' : '#F5EEF8',
                      color: item.status === 'RESOLVED' ? '#54856D' : '#7E528F',
                      border: `1px solid ${item.status === 'RESOLVED' ? '#D2E8DD' : '#EADCF2'}`,
                    }}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
