import React, { useState } from 'react';
import {
  ClipboardCheck,
  Clock,
  CheckCircle,
  Wrench,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Recommendation } from '../types';

interface RecommendationsPageProps {
  recommendations: Recommendation[];
  onApprove: (id: number) => Promise<void>;
  onReject: (id: number) => Promise<void>;
  onProgress: (id: number) => Promise<void>;
  onResolve: (id: number) => Promise<void>;
}

export const RecommendationsPage: React.FC<RecommendationsPageProps> = ({
  recommendations,
  onApprove,
  onReject,
  onProgress,
  onResolve,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const filteredRecs = recommendations.filter((r) => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'ACTIVE') return ['Detected', 'Under Review', 'In Progress', 'Approved'].includes(r.approval_status);
    if (filterStatus === 'RESOLVED') return r.approval_status === 'Impact Measured' || r.approval_status === 'Resolved';
    return r.approval_status === filterStatus;
  });

  const handleAction = async (actionFn: () => Promise<void>, id: number) => {
    setActionLoadingId(id);
    try {
      await actionFn();
    } catch (err: any) {
      alert(`Action error: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const getPriorityBadge = (priority: string) => {
    if (priority === 'P1') {
      return {
        bg: '#FDF2F2',
        color: '#C16D6D',
        border: '#F5D5D5',
        label: 'P1 — CRITICAL',
      };
    } else if (priority === 'P2') {
      return {
        bg: '#FDF8EE',
        color: '#C39755',
        border: '#F4E3C8',
        label: 'P2 — HIGH',
      };
    } else {
      return {
        bg: '#E8F0F7',
        color: '#29465B',
        border: '#DCE4EC',
        label: 'P3 — MODERATE',
      };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Detected':
      case 'Under Review':
        return { bg: '#FDF8EE', color: '#C39755', border: '#F4E3C8' };
      case 'Approved':
        return { bg: '#E8F0F7', color: '#29465B', border: '#DCE4EC' };
      case 'In Progress':
        return { bg: '#F5EEF8', color: '#7E528F', border: '#EADCF2' };
      case 'Impact Measured':
      case 'Resolved':
        return { bg: '#EBF5F0', color: '#54856D', border: '#D2E8DD' };
      case 'Rejected':
        return { bg: '#F6F8FA', color: '#718096', border: '#E7EDF1' };
      default:
        return { bg: '#F6F8FA', color: '#293845', border: '#E7EDF1' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header and Filter Pills */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: '700', color: '#29465B', margin: 0, letterSpacing: '-0.01em' }}>
            Decision Intelligence & Human Approvals
          </h1>
          <p style={{ fontSize: '0.86rem', color: '#718096', margin: '4px 0 0 0' }}>
            Evidence-based operational actions synthesized from hydraulic telemetry and supervised ML inference.
          </p>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {['ALL', 'ACTIVE', 'Approved', 'In Progress', 'RESOLVED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                backgroundColor: filterStatus === status ? '#E8F0F7' : '#FFFFFF',
                color: filterStatus === status ? '#29465B' : '#718096',
                border: `1px solid ${filterStatus === status ? '#DCE4EC' : '#E7EDF1'}`,
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: filterStatus === status ? '600' : '500',
                cursor: 'pointer',
                transition: 'background-color 0.12s ease',
              }}
              onMouseEnter={(e) => {
                if (filterStatus !== status) e.currentTarget.style.backgroundColor = '#F6F8FA';
              }}
              onMouseLeave={(e) => {
                if (filterStatus !== status) e.currentTarget.style.backgroundColor = '#FFFFFF';
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations Cards List */}
      {filteredRecs.length === 0 ? (
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
          <div style={{ fontSize: '1.02rem', fontWeight: '600', color: '#29465B' }}>No Pending Corrective Actions</div>
          <p style={{ fontSize: '0.84rem', margin: '4px 0 0 0' }}>All campus facilities are currently operating within physical baselines.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {filteredRecs.map((rec) => {
            const pBadge = getPriorityBadge(rec.priority);
            const sBadge = getStatusBadge(rec.approval_status);
            const isExpanded = expandedId === rec.id;
            const isLoading = actionLoadingId === rec.id;

            return (
              <div
                key={rec.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: rec.priority === 'P1' ? '1px solid #F5D5D5' : '1px solid #E7EDF1',
                  padding: '22px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  boxShadow: '0 1px 3px rgba(41, 56, 69, 0.02)',
                }}
              >
                {/* Card Top Row: Badges & Loss Summary */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      backgroundColor: pBadge.bg,
                      color: pBadge.color,
                      border: `1px solid ${pBadge.border}`,
                      padding: '3px 9px',
                      borderRadius: '6px',
                      fontSize: '0.74rem',
                      fontWeight: '700',
                    }}>
                      {pBadge.label}
                    </span>

                    <span style={{
                      backgroundColor: sBadge.bg,
                      color: sBadge.color,
                      border: `1px solid ${sBadge.border}`,
                      padding: '3px 9px',
                      borderRadius: '6px',
                      fontSize: '0.74rem',
                      fontWeight: '600',
                    }}>
                      {rec.approval_status}
                    </span>

                    <span style={{ fontSize: '0.76rem', color: '#718096' }}>
                      Logged: {rec.detection_timestamp}
                    </span>
                  </div>

                  {/* Water & Cost Savings Badge */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.15rem', fontWeight: '700', color: '#C16D6D' }}>
                      {rec.estimated_daily_loss_liters.toLocaleString()} L/day
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#718096' }}>
                      Est. Financial Loss: ₹ {rec.estimated_daily_cost_inr.toLocaleString()}/day
                    </div>
                  </div>
                </div>

                {/* Problem Statement & Department */}
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#29465B', margin: '0 0 6px 0' }}>
                    {rec.problem}
                  </h3>
                  <div style={{ fontSize: '0.84rem', color: '#718096', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>Location: <strong style={{ color: '#29465B' }}>{rec.building_name}</strong></span>
                    <span>•</span>
                    <span>Assigned Department: <strong style={{ color: '#5C9992' }}>{rec.assigned_department}</strong></span>
                    <span>•</span>
                    <span>Risk Priority Score: <strong style={{ color: '#29465B' }}>{rec.risk_score} / 100</strong></span>
                  </div>
                </div>

                {/* Recommended Action Box */}
                <div style={{
                  backgroundColor: '#F6F8FA',
                  border: '1px solid #E7EDF1',
                  borderRadius: '8px',
                  padding: '14px 16px',
                }}>
                  <div style={{ fontSize: '0.74rem', color: '#5C9992', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.03em', marginBottom: '4px' }}>
                    Recommended Maintenance Action
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#293845', fontWeight: '600', lineHeight: '1.4' }}>
                    {rec.recommended_action}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#718096', marginTop: '6px' }}>
                    Target Outcome: {rec.expected_outcome}
                  </div>
                </div>

                {/* Expandable Supporting Evidence Section */}
                <div>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : rec.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#29465B',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 0',
                      fontWeight: '600',
                    }}
                  >
                    <span>{isExpanded ? 'Hide Supporting Evidence' : 'Inspect 6 Verified Evidence Points & Baseline Telemetry'}</span>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {isExpanded && (
                    <div style={{ marginTop: '12px', backgroundColor: '#F6F8FA', padding: '16px 18px', borderRadius: '8px', border: '1px solid #E7EDF1' }}>
                      <div style={{ fontSize: '0.76rem', color: '#718096', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>
                        Physical Sensor Discrepancy & Diagnostic Indicators:
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '20px', color: '#293845', fontSize: '0.83rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {rec.evidence.map((ev, idx) => (
                          <li key={idx}>{ev}</li>
                        ))}
                      </ul>

                      {/* AI Model Breakdown */}
                      <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #E7EDF1', display: 'flex', gap: '20px', fontSize: '0.78rem', color: '#718096' }}>
                        <div>AI Detection: <strong style={{ color: '#293845' }}>{rec.ai_prediction.display_label}</strong></div>
                        <div>Ensemble Confidence: <strong style={{ color: '#5C9992' }}>{rec.ai_prediction.confidence_percent}%</strong></div>
                        <div>Root Cause: <strong style={{ color: '#293845' }}>{rec.ai_prediction.anomaly_diagnosis}</strong></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Human Approval Action Toolbar */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '14px',
                  borderTop: '1px solid #E7EDF1',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}>
                  <div style={{ fontSize: '0.82rem', color: '#718096', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} color="#718096" />
                    <span>Response Window: <strong style={{ color: '#293845' }}>{rec.action_window}</strong></span>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    {rec.approval_status === 'Detected' && (
                      <>
                        <button
                          onClick={() => handleAction(() => onApprove(rec.id), rec.id)}
                          disabled={isLoading}
                          style={{
                            backgroundColor: '#29465B',
                            color: '#FFFFFF',
                            border: 'none',
                            padding: '8px 18px',
                            borderRadius: '8px',
                            fontWeight: '600',
                            fontSize: '0.84rem',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            transition: 'background-color 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            if (!isLoading) e.currentTarget.style.backgroundColor = '#1F3545';
                          }}
                          onMouseLeave={(e) => {
                            if (!isLoading) e.currentTarget.style.backgroundColor = '#29465B';
                          }}
                        >
                          Approve Action
                        </button>
                        <button
                          onClick={() => handleAction(() => onReject(rec.id), rec.id)}
                          disabled={isLoading}
                          style={{
                            backgroundColor: '#FFFFFF',
                            color: '#718096',
                            border: '1px solid #E7EDF1',
                            padding: '8px 14px',
                            borderRadius: '8px',
                            fontSize: '0.84rem',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                          }}
                        >
                          Dismiss
                        </button>
                      </>
                    )}

                    {rec.approval_status === 'Approved' && (
                      <button
                        onClick={() => handleAction(() => onProgress(rec.id), rec.id)}
                        disabled={isLoading}
                        style={{
                          backgroundColor: '#5C9992',
                          color: '#FFFFFF',
                          border: 'none',
                          padding: '8px 18px',
                          borderRadius: '8px',
                          fontWeight: '600',
                          fontSize: '0.84rem',
                          cursor: isLoading ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Wrench size={14} />
                        <span>Dispatch Maintenance (In Progress)</span>
                      </button>
                    )}

                    {rec.approval_status === 'In Progress' && (
                      <button
                        onClick={() => handleAction(() => onResolve(rec.id), rec.id)}
                        disabled={isLoading}
                        style={{
                          backgroundColor: '#54856D',
                          color: '#FFFFFF',
                          border: 'none',
                          padding: '8px 18px',
                          borderRadius: '8px',
                          fontWeight: '600',
                          fontSize: '0.84rem',
                          cursor: isLoading ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <CheckCircle size={14} />
                        <span>Confirm Repair & Verify Savings</span>
                      </button>
                    )}

                    {(rec.approval_status === 'Impact Measured' || rec.approval_status === 'Resolved') && (
                      <div style={{ color: '#54856D', fontWeight: '600', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle size={16} />
                        <span>Verified Impact Measured & Logged</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
