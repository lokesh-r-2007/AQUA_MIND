import React, { useState, useEffect } from 'react';
import { Cpu, ShieldCheck, CheckCircle } from 'lucide-react';
import { AllocationResult } from '../types';
import { api } from '../services/api';

export const OptimizationPage: React.FC = () => {
  const [supplyLiters, setSupplyLiters] = useState<number>(210000);
  const [allocation, setAllocation] = useState<AllocationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [approvedMsg, setApprovedMsg] = useState<string | null>(null);

  const fetchAllocation = async (supply: number) => {
    setLoading(true);
    try {
      const res = await api.getAllocation(supply);
      setAllocation(res);
      setApprovedMsg(null);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllocation(supplyLiters);
  }, []);

  const handleApprove = async () => {
    if (!allocation) return;
    try {
      const res = await api.approveAllocation(allocation);
      setApprovedMsg(res.message);
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.45rem', fontWeight: '700', color: '#29465B', margin: 0, letterSpacing: '-0.01em' }}>
          Fair Water Allocation & Supply Optimization
        </h1>
        <p style={{ fontSize: '0.86rem', color: '#718096', margin: '4px 0 0 0' }}>
          Constrained linear programming optimizer safeguarding vulnerable residential populations and essential lab processes.
        </p>
      </div>

      {/* Supply Slider Control */}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <label style={{ fontSize: '0.94rem', fontWeight: '700', color: '#29465B' }}>
              Simulated Daily Campus Municipal Inflow
            </label>
            <p style={{ fontSize: '0.8rem', color: '#718096', margin: '2px 0 0 0' }}>
              Slide to stress-test ethical water rationing under municipal curtailment or regional drought.
            </p>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#29465B' }}>
            {supplyLiters.toLocaleString()} <span style={{ fontSize: '0.82rem', color: '#718096', fontWeight: '400' }}>L/day</span>
          </div>
        </div>

        <input
          type="range"
          min={120000}
          max={260000}
          step={5000}
          value={supplyLiters}
          onChange={(e) => {
            const val = Number(e.target.value);
            setSupplyLiters(val);
            fetchAllocation(val);
          }}
          style={{ width: '100%', cursor: 'pointer', accentColor: '#5C9992' }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#718096' }}>
          <span>120,000 L (Severe Drought Deficit)</span>
          <span>180,000 L (Moderate Deficit)</span>
          <span>240,000 L (Nominal Full Campus Supply)</span>
        </div>
      </div>

      {/* Ethical Guardrail Banner */}
      <div style={{
        backgroundColor: '#EBF5F0',
        border: '1px solid #D2E8DD',
        borderRadius: '10px',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        color: '#293845',
        fontSize: '0.84rem',
      }}>
        <ShieldCheck size={22} color="#54856D" style={{ flexShrink: 0 }} />
        <div>
          <strong style={{ color: '#54856D' }}>Responsible AI Guardrail Active:</strong> Hostels (Student Residential Welfare) and Research Laboratories maintain hard essential floors. Non-essential landscape irrigation is curtailed first during deficits. Autonomous supply restrictions require human operator approval.
        </div>
      </div>

      {approvedMsg && (
        <div style={{
          backgroundColor: '#E8F0F7',
          border: '1px solid #DCE4EC',
          color: '#29465B',
          padding: '12px 18px',
          borderRadius: '8px',
          fontSize: '0.85rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <CheckCircle size={16} color="#54856D" />
          <span>{approvedMsg}</span>
        </div>
      )}

      {/* Allocation Table */}
      {allocation && (
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
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}>
            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#29465B' }}>
              SciPy Linear Optimization Plan ({allocation.feasibility_status}) • Campus Demand Satisfied: <strong style={{ color: '#54856D' }}>{allocation.campus_satisfaction_pct}%</strong>
            </div>

            <button
              onClick={handleApprove}
              style={{
                backgroundColor: '#29465B',
                color: '#FFFFFF',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1F3545')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#29465B')}
            >
              <CheckCircle size={14} />
              <span>Approve Distribution Plan</span>
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', color: '#293845' }}>
            <thead>
              <tr style={{ backgroundColor: '#F6F8FA', borderBottom: '1px solid #E7EDF1', textAlign: 'left', color: '#718096' }}>
                <th style={{ padding: '12px 16px', fontWeight: '600' }}>Facility / Zone</th>
                <th style={{ padding: '12px 16px', fontWeight: '600' }}>Category</th>
                <th style={{ padding: '12px 16px', fontWeight: '600' }}>Predicted Demand</th>
                <th style={{ padding: '12px 16px', fontWeight: '600' }}>Allocated Supply</th>
                <th style={{ padding: '12px 16px', fontWeight: '600' }}>Curtailment</th>
                <th style={{ padding: '12px 16px', fontWeight: '600' }}>Demand Met (%)</th>
                <th style={{ padding: '12px 16px', fontWeight: '600', minWidth: '180px' }}>Protection Tier</th>
              </tr>
            </thead>
            <tbody>
              {allocation.allocations.map((a) => (
                <tr key={a.building_id} style={{ borderBottom: '1px solid #F0F4F8' }}>
                  <td style={{ padding: '12px 16px', fontWeight: '600', color: '#29465B' }}>{a.building_name}</td>
                  <td style={{ padding: '12px 16px', color: '#718096' }}>{a.category}</td>
                  <td style={{ padding: '12px 16px' }}>{a.predicted_demand_liters.toLocaleString()} L</td>
                  <td style={{ padding: '12px 16px', color: '#29465B', fontWeight: '600' }}>
                    {a.allocated_supply_liters.toLocaleString()} L
                  </td>
                  <td style={{ padding: '12px 16px', color: a.curtailment_liters > 0 ? '#C16D6D' : '#718096' }}>
                    {a.curtailment_liters > 0 ? `-${a.curtailment_liters.toLocaleString()} L` : '0 L'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '60px', height: '6px', backgroundColor: '#E8F0F7', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${a.demand_satisfied_pct}%`,
                          height: '100%',
                          backgroundColor: a.demand_satisfied_pct > 80 ? '#54856D' : (a.demand_satisfied_pct > 50 ? '#C39755' : '#C16D6D'),
                        }}></div>
                      </div>
                      <strong style={{ color: '#293845' }}>{a.demand_satisfied_pct}%</strong>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                    {a.is_vulnerable ? (
                      <span style={{ fontSize: '0.74rem', backgroundColor: '#FEF3C7', color: '#92400E', padding: '5px 12px', borderRadius: '6px', fontWeight: '600', border: '1px solid #FCD34D', display: 'inline-block', whiteSpace: 'nowrap' }}>
                        Vulnerable (Hostel)
                      </span>
                    ) : (a.is_essential ? (
                      <span style={{ fontSize: '0.74rem', backgroundColor: '#DBEAFE', color: '#1E40AF', padding: '5px 12px', borderRadius: '6px', fontWeight: '600', border: '1px solid #93C5FD', display: 'inline-block', whiteSpace: 'nowrap' }}>
                        Essential Service
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.74rem', backgroundColor: '#F1F5F9', color: '#475569', padding: '5px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', display: 'inline-block', fontWeight: '500', whiteSpace: 'nowrap' }}>
                        Curtailable
                      </span>
                    ))}
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
