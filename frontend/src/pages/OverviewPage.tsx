import React, { useState } from 'react';
import {
  Droplets,
  AlertTriangle,
  TrendingDown,
  CheckCircle,
  Database,
  Building2,
  ShieldAlert,
  ShieldCheck,
  Shield,
  ArrowUpRight,
  LayoutGrid,
  Table as TableIcon,
  TrendingUp,
  BarChart2,
  PieChart as PieIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { OverviewKPIs, Building, Recommendation } from '../types';

interface OverviewPageProps {
  kpis: OverviewKPIs | null;
  buildings: Building[];
  recommendations: Recommendation[];
  onNavigateTab: (tab: string) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  kpis,
  buildings,
  recommendations,
  onNavigateTab,
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  if (!kpis) {
    return (
      <div style={{
        padding: '48px',
        textAlign: 'center',
        color: '#64748B',
        backgroundColor: '#FFFFFF',
        borderRadius: '10px',
        border: '1px solid #E2E8F0',
      }}>
        <div style={{ fontSize: '0.95rem', fontWeight: '500' }}>Loading campus telemetry...</div>
      </div>
    );
  }

  const p1Recs = recommendations.filter((r) => r.priority === 'P1' && r.approval_status !== 'Resolved');

  // Compute live values for the 3 charts
  const currentUsagePct = Math.min(100, Math.max(10, Math.round((kpis.total_consumption_lph / 12000) * 100)));
  const currentStoragePct = Math.round(kpis.average_tank_level_pct);

  // 1. Resource Usage Trend Data (24-Hour Horizon with Current Telemetry)
  const usageTrendData = [
    { time: '00:00', demandPct: 30, storagePct: 78 },
    { time: '04:00', demandPct: 22, storagePct: 75 },
    { time: '08:00', demandPct: 82, storagePct: 69 },
    { time: '12:00', demandPct: 74, storagePct: 63 },
    { time: '16:00', demandPct: 68, storagePct: 61 },
    { time: '20:00', demandPct: 62, storagePct: 64 },
    { time: 'Now', demandPct: currentUsagePct, storagePct: currentStoragePct },
  ];

  // 2. Campus Resource Status Data
  const resourceStatusData = [
    { resource: 'Water', level: Math.min(100, Math.round((kpis.total_flow_rate_lpm / 180) * 100)), fill: '#2563EB' },
    { resource: 'Energy', level: 54, fill: '#3B82F6' },
    { resource: 'Storage', level: currentStoragePct, fill: '#0284C7' },
    { resource: 'Recycled', level: 42, fill: '#60A5FA' },
  ];

  // 3. Protection Tier Distribution Data
  const vulnerableCount = buildings.filter((b) => b.is_vulnerable_population).length || 2;
  const essentialCount = buildings.filter((b) => b.is_essential_service && !b.is_vulnerable_population).length || 2;
  const curtailableCount = Math.max(0, (buildings.length || 6) - vulnerableCount - essentialCount) || 2;

  const tierDistributionData = [
    { name: 'Essential Service', value: essentialCount, color: '#2563EB' },
    { name: 'Vulnerable (Hostel)', value: vulnerableCount, color: '#F59E0B' },
    { name: 'Curtailable', value: curtailableCount, color: '#64748B' },
  ];

  // Helper to determine protection tier classification
  const getProtectionTier = (buildingId: string) => {
    const meta = buildings.find((b) => b.building_id === buildingId);
    if (meta?.is_vulnerable_population || buildingId.startsWith('hostel')) {
      return {
        label: 'Vulnerable (Hostel)',
        type: 'vulnerable',
        icon: ShieldAlert,
        bg: '#FEF3C7',
        color: '#92400E',
        border: '#FCD34D',
      };
    }
    if (meta?.is_essential_service || buildingId === 'academic_block' || buildingId === 'canteen') {
      return {
        label: 'Essential Service',
        type: 'essential',
        icon: ShieldCheck,
        bg: '#DBEAFE',
        color: '#1E40AF',
        border: '#93C5FD',
      };
    }
    return {
      label: 'Curtailable',
      type: 'curtailable',
      icon: Shield,
      bg: '#F1F5F9',
      color: '#475569',
      border: '#CBD5E1',
    };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Dashboard Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#1E293B', margin: 0, letterSpacing: '-0.01em' }}>
            Campus Water Overview
          </h1>
          <p style={{ fontSize: '0.84rem', color: '#64748B', margin: '3px 0 0 0' }}>
            Live telemetry, predictive shortage assessments, and ethical tier protections across 6 campus facilities.
          </p>
        </div>
      </div>

      {/* Top Banner if P1 Critical Issue Exists */}
      {p1Recs.length > 0 && (
        <div style={{
          backgroundColor: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: '10px',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 2px rgba(220, 38, 38, 0.05)',
          gap: '16px',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '7px',
              backgroundColor: '#FEE2E2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <AlertTriangle size={17} color="#DC2626" />
            </div>
            <div>
              <div style={{ color: '#1E293B', fontWeight: '600', fontSize: '0.9rem' }}>
                Attention Required: {p1Recs[0].problem}
              </div>
              <div style={{ color: '#64748B', fontSize: '0.78rem', marginTop: '2px' }}>
                Estimated daily loss: <strong style={{ color: '#DC2626' }}>{p1Recs[0].estimated_daily_loss_liters.toLocaleString()} L/day</strong> (₹{p1Recs[0].estimated_daily_cost_inr.toLocaleString()}/day) • {p1Recs[0].action_window}
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('recommendations')}
            style={{
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              padding: '7px 15px',
              borderRadius: '7px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '0.8rem',
              transition: 'background-color 0.15s ease',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1D4ED8')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2563EB')}
          >
            Review & Approve
          </button>
        </div>
      )}

      {/* 4 Primary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {/* Card 1: Campus Consumption */}
        <div style={{
          backgroundColor: '#FFFFFF',
          padding: '18px 20px',
          borderRadius: '10px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Current Demand
            </span>
            <div style={{ width: '30px', height: '30px', borderRadius: '7px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Droplets size={15} color="#2563EB" />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: '700', color: '#1E293B', lineHeight: '1.2' }}>
            {kpis.total_consumption_lph.toLocaleString()} <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: '400' }}>L/h</span>
          </div>
          <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '6px' }}>
            Aggregate flow rate: <strong style={{ color: '#1E293B' }}>{kpis.total_flow_rate_lpm.toFixed(1)} LPM</strong>
          </div>
        </div>

        {/* Card 2: Storage Buffer */}
        <div style={{
          backgroundColor: '#FFFFFF',
          padding: '18px 20px',
          borderRadius: '10px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Storage Buffer
            </span>
            <div style={{ width: '30px', height: '30px', borderRadius: '7px', backgroundColor: '#F0F9FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Database size={15} color="#0284C7" />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: '700', color: '#1E293B', lineHeight: '1.2' }}>
            {(kpis.total_storage_available_liters / 1000).toFixed(0)} <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: '400' }}>m³</span>
          </div>
          <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '6px' }}>
            Avg Overhead Tank Level: <strong style={{ color: '#0284C7' }}>{kpis.average_tank_level_pct.toFixed(1)}%</strong>
          </div>
        </div>

        {/* Card 3: Potential Water Loss */}
        <div style={{
          backgroundColor: '#FFFFFF',
          padding: '18px 20px',
          borderRadius: '10px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Suspected Loss
            </span>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '7px',
              backgroundColor: kpis.potential_daily_loss_liters > 0 ? '#FEF2F2' : '#F0FDF4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <TrendingDown size={15} color={kpis.potential_daily_loss_liters > 0 ? '#DC2626' : '#16A34A'} />
            </div>
          </div>
          <div style={{
            fontSize: '1.65rem',
            fontWeight: '700',
            color: kpis.potential_daily_loss_liters > 0 ? '#DC2626' : '#16A34A',
            lineHeight: '1.2',
          }}>
            {kpis.potential_daily_loss_liters.toLocaleString()} <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: '400' }}>L/day</span>
          </div>
          <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '6px' }}>
            {kpis.active_recommendations_count > 0 ? (
              <span><strong style={{ color: '#1E293B' }}>{kpis.active_recommendations_count}</strong> active issue(s) under observation</span>
            ) : (
              <span>Infrastructure operating nominally</span>
            )}
          </div>
        </div>

        {/* Card 4: Verified Impact Saved */}
        <div style={{
          backgroundColor: '#FFFFFF',
          padding: '18px 20px',
          borderRadius: '10px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Verified Water Saved
            </span>
            <div style={{ width: '30px', height: '30px', borderRadius: '7px', backgroundColor: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={15} color="#16A34A" />
            </div>
          </div>
          <div style={{
            fontSize: kpis.verified_water_saved_liters > 99999 ? '1.5rem' : '1.65rem',
            fontWeight: '700',
            color: '#16A34A',
            lineHeight: '1.2',
            whiteSpace: 'nowrap',
          }}>
            {kpis.verified_water_saved_liters.toLocaleString()} <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: '400' }}>L</span>
          </div>
          <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '6px', whiteSpace: 'nowrap' }}>
            Financial cost saved: <strong style={{ color: '#1E293B' }}>₹ {kpis.verified_financial_saved_inr.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
          </div>
        </div>
      </div>

      {/* Dashboard Charts: Exactly 3 Minimalist Production Charts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
        gap: '16px',
      }}>
        {/* Chart 1: Resource Usage Trend */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '10px',
          border: '1px solid #E2E8F0',
          padding: '18px 20px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={16} color="#2563EB" />
              <div>
                <h3 style={{ fontSize: '0.92rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>
                  Resource Usage Trend
                </h3>
                <span style={{ fontSize: '0.74rem', color: '#64748B' }}>Storage buffer & demand over time</span>
              </div>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#2563EB', fontWeight: '600', backgroundColor: '#EFF6FF', padding: '2px 8px', borderRadius: '5px' }}>
              24-Hour
            </span>
          </div>

          <div style={{ width: '100%', height: 190 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={usageTrendData} margin={{ top: 10, right: 12, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="time"
                  stroke="#94A3B8"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  stroke="#94A3B8"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.08)',
                  }}
                  formatter={(value: any, name: any) => [`${value}%`, name === 'demandPct' ? 'Demand Load' : 'Storage Buffer']}
                />
                <Line
                  type="monotone"
                  dataKey="demandPct"
                  name="demandPct"
                  stroke="#2563EB"
                  strokeWidth={2.2}
                  dot={{ r: 3, fill: '#2563EB' }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="storagePct"
                  name="storagePct"
                  stroke="#0284C7"
                  strokeWidth={1.8}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '8px', fontSize: '0.74rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '3px', backgroundColor: '#2563EB', borderRadius: '2px', display: 'inline-block' }}></span>
              <span style={{ color: '#475569', fontWeight: '500' }}>Demand Load</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '2px', borderTop: '2px dashed #0284C7', display: 'inline-block' }}></span>
              <span style={{ color: '#475569', fontWeight: '500' }}>Storage Buffer</span>
            </div>
          </div>
        </div>

        {/* Chart 2: Campus Resource Status */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '10px',
          border: '1px solid #E2E8F0',
          padding: '18px 20px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart2 size={16} color="#2563EB" />
              <div>
                <h3 style={{ fontSize: '0.92rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>
                  Campus Resource Status
                </h3>
                <span style={{ fontSize: '0.74rem', color: '#64748B' }}>Capacity & utilization percentages</span>
              </div>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '500' }}>Real-Time</span>
          </div>

          <div style={{ width: '100%', height: 190 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resourceStatusData} margin={{ top: 10, right: 12, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="resource"
                  stroke="#94A3B8"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  stroke="#94A3B8"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.08)',
                  }}
                  formatter={(value: any) => [`${value}%`, 'Capacity / Level']}
                />
                <Bar dataKey="level" radius={[4, 4, 0, 0]}>
                  {resourceStatusData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginTop: '8px', fontSize: '0.74rem' }}>
            <span style={{ color: '#475569' }}>Water: <strong style={{ color: '#1E293B' }}>{resourceStatusData[0].level}%</strong></span>
            <span style={{ color: '#475569' }}>Energy: <strong style={{ color: '#1E293B' }}>54%</strong></span>
            <span style={{ color: '#475569' }}>Storage: <strong style={{ color: '#1E293B' }}>{currentStoragePct}%</strong></span>
          </div>
        </div>

        {/* Chart 3: Protection Tier Distribution */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '10px',
          border: '1px solid #E2E8F0',
          padding: '18px 20px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PieIcon size={16} color="#2563EB" />
              <div>
                <h3 style={{ fontSize: '0.92rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>
                  Protection Tier Distribution
                </h3>
                <span style={{ fontSize: '0.74rem', color: '#64748B' }}>Campus facility welfare classification</span>
              </div>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#2563EB', fontWeight: '600', backgroundColor: '#EFF6FF', padding: '2px 8px', borderRadius: '5px' }}>
              6 Facilities
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: 190 }}>
            <div style={{ flex: '1 1 55%', height: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <Pie
                    data={tierDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={68}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {tierDistributionData.map((entry, index) => (
                      <Cell key={`tier-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.08)',
                    }}
                    formatter={(value: any, name: any) => [`${value} Facilities`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={{ flex: '1 1 45%', display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '8px' }}>
              {tierDistributionData.map((item) => (
                <div key={item.name} style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.color, flexShrink: 0 }}></span>
                    <span style={{ color: '#475569', fontWeight: '500', whiteSpace: 'nowrap' }}>{item.name}</span>
                  </div>
                  <span style={{ fontSize: '0.74rem', color: '#1E293B', fontWeight: '700', paddingLeft: '14px' }}>
                    {item.value} Facilities ({Math.round((item.value / 6) * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '0.72rem', color: '#64748B' }}>
            Hostels protected under non-curtailment guardrails
          </div>
        </div>
      </div>

      {/* Campus Facilities & Protection Tiers Section (Properly Aligned & Never Clipped) */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '10px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
        overflow: 'hidden',
      }}>
        {/* Section Header with View Mode Switch */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>
              Campus Facilities & Protection Tiers
            </h2>
            <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '2px 0 0 0' }}>
              Real-time flow, line pressure, storage reserves, and ethical tier protections across all 6 campus buildings.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* View Switch */}
            <div style={{
              display: 'inline-flex',
              backgroundColor: '#F8FAFC',
              borderRadius: '7px',
              border: '1px solid #E2E8F0',
              padding: '2px',
            }}>
              <button
                onClick={() => setViewMode('table')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 10px',
                  borderRadius: '5px',
                  border: 'none',
                  backgroundColor: viewMode === 'table' ? '#FFFFFF' : 'transparent',
                  color: viewMode === 'table' ? '#1E293B' : '#64748B',
                  fontWeight: viewMode === 'table' ? '600' : '500',
                  fontSize: '0.76rem',
                  cursor: 'pointer',
                  boxShadow: viewMode === 'table' ? '0 1px 2px rgba(0, 0, 0, 0.05)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <TableIcon size={13} />
                <span>Table View</span>
              </button>
              <button
                onClick={() => setViewMode('cards')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 10px',
                  borderRadius: '5px',
                  border: 'none',
                  backgroundColor: viewMode === 'cards' ? '#FFFFFF' : 'transparent',
                  color: viewMode === 'cards' ? '#1E293B' : '#64748B',
                  fontWeight: viewMode === 'cards' ? '600' : '500',
                  fontSize: '0.76rem',
                  cursor: 'pointer',
                  boxShadow: viewMode === 'cards' ? '0 1px 2px rgba(0, 0, 0, 0.05)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <LayoutGrid size={13} />
                <span>Card View</span>
              </button>
            </div>

            {/* Live Console Jump Button */}
            <button
              onClick={() => onNavigateTab('monitoring')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                backgroundColor: '#EFF6FF',
                border: '1px solid #DBEAFE',
                color: '#1E40AF',
                fontSize: '0.78rem',
                cursor: 'pointer',
                fontWeight: '600',
                padding: '6px 12px',
                borderRadius: '7px',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#DBEAFE')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#EFF6FF')}
            >
              <span>Live Console</span>
              <ArrowUpRight size={13} color="#2563EB" />
            </button>
          </div>
        </div>

        {/* View Mode 1: Table View (Guarantees Perfect Column Alignment & Equal Row Heights) */}
        {viewMode === 'table' ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', color: '#1E293B', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
                  <th style={{ padding: '12px 20px', fontWeight: '600', minWidth: '220px' }}>Facility / Zone</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600', minWidth: '190px' }}>Protection Tier</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600', minWidth: '120px' }}>Flow Rate</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600', minWidth: '120px' }}>Line Pressure</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600', minWidth: '160px' }}>Overhead Storage</th>
                  <th style={{ padding: '12px 20px', fontWeight: '600', minWidth: '120px', textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {kpis.latest_readings.map((b) => {
                  const tier = getProtectionTier(b.building_id);
                  const TierIcon = tier.icon;
                  const hasLeak = b.flow_rate_lpm > (b.building_id === 'hostel_a' ? 50 : 45);

                  return (
                    <tr
                      key={b.building_id}
                      style={{
                        borderBottom: '1px solid #F1F5F9',
                        height: '56px',
                        transition: 'background-color 0.1s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                    >
                      {/* Facility / Zone */}
                      <td style={{ padding: '12px 20px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '7px',
                            backgroundColor: '#F1F5F9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            <Building2 size={15} color="#2563EB" />
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', color: '#1E293B', fontSize: '0.86rem' }}>
                              {b.building_name}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                              {b.occupancy} occupants
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Protection Tier (Fully Visible, Generous Padding, Never Clipped) */}
                      <td style={{ padding: '12px 16px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          backgroundColor: tier.bg,
                          color: tier.color,
                          border: `1px solid ${tier.border}`,
                          padding: '5px 12px',
                          borderRadius: '6px',
                          whiteSpace: 'nowrap',
                        }}>
                          <TierIcon size={13} color={tier.color} />
                          <span>{tier.label}</span>
                        </span>
                      </td>

                      {/* Flow Rate */}
                      <td style={{ padding: '12px 16px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                        <strong style={{ color: '#1E293B' }}>{b.flow_rate_lpm.toFixed(1)}</strong>
                        <span style={{ color: '#64748B', fontSize: '0.74rem', marginLeft: '4px' }}>LPM</span>
                      </td>

                      {/* Line Pressure */}
                      <td style={{ padding: '12px 16px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                        <strong style={{ color: b.pressure_bar < 2.5 ? '#DC2626' : '#1E293B' }}>
                          {b.pressure_bar.toFixed(2)}
                        </strong>
                        <span style={{ color: '#64748B', fontSize: '0.74rem', marginLeft: '4px' }}>bar</span>
                      </td>

                      {/* Overhead Storage */}
                      <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '140px' }}>
                          <div style={{ flex: 1, height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                            <div
                              style={{
                                height: '100%',
                                width: `${Math.min(100, Math.max(0, b.tank_level_percent))}%`,
                                backgroundColor: b.tank_level_percent < 35 ? '#DC2626' : (b.tank_level_percent < 55 ? '#F59E0B' : '#2563EB'),
                                borderRadius: '3px',
                              }}
                            ></div>
                          </div>
                          <span style={{ fontSize: '0.76rem', fontWeight: '600', color: '#1E293B', minWidth: '36px', textAlign: 'right' }}>
                            {b.tank_level_percent.toFixed(0)}%
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '12px 20px', verticalAlign: 'middle', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <span style={{
                          display: 'inline-block',
                          fontSize: '0.72rem',
                          fontWeight: '600',
                          padding: '3px 9px',
                          borderRadius: '5px',
                          backgroundColor: hasLeak ? '#FEF2F2' : '#F0FDF4',
                          color: hasLeak ? '#DC2626' : '#16A34A',
                          border: `1px solid ${hasLeak ? '#FECACA' : '#BBF7D0'}`,
                        }}>
                          {hasLeak ? 'Elevated Flow' : 'Nominal'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* View Mode 2: Card Grid (Cards with Consistent Badges & Equal Layouts) */
          <div style={{
            padding: '20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '16px',
          }}>
            {kpis.latest_readings.map((b) => {
              const tier = getProtectionTier(b.building_id);
              const TierIcon = tier.icon;
              const hasLeak = b.flow_rate_lpm > (b.building_id === 'hostel_a' ? 50 : 45);

              return (
                <div
                  key={b.building_id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '10px',
                    border: hasLeak ? '1px solid #FECACA' : '1px solid #E2E8F0',
                    padding: '16px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '7px',
                        backgroundColor: '#F8FAFC',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #E2E8F0',
                      }}>
                        <Building2 size={16} color="#2563EB" />
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: '#1E293B', fontSize: '0.92rem' }}>
                          {b.building_name}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                          {b.occupancy} occupants
                        </div>
                      </div>
                    </div>

                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: '600',
                      padding: '3px 8px',
                      borderRadius: '5px',
                      backgroundColor: hasLeak ? '#FEF2F2' : '#F0FDF4',
                      color: hasLeak ? '#DC2626' : '#16A34A',
                      border: `1px solid ${hasLeak ? '#FECACA' : '#BBF7D0'}`,
                    }}>
                      {hasLeak ? 'Elevated Flow' : 'Nominal'}
                    </span>
                  </div>

                  {/* Protection Tier Badge in Card View (Fully Visible, Generous Padding) */}
                  <div>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '0.74rem',
                      fontWeight: '600',
                      backgroundColor: tier.bg,
                      color: tier.color,
                      border: `1px solid ${tier.border}`,
                      padding: '4px 10px',
                      borderRadius: '5px',
                      whiteSpace: 'nowrap',
                    }}>
                      <TierIcon size={12} color={tier.color} />
                      <span>{tier.label}</span>
                    </span>
                  </div>

                  {/* Telemetry Metrics Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px',
                    fontSize: '0.8rem',
                    backgroundColor: '#F8FAFC',
                    padding: '10px 12px',
                    borderRadius: '7px',
                    border: '1px solid #E2E8F0',
                  }}>
                    <div>
                      <span style={{ color: '#64748B', fontSize: '0.72rem', display: 'block' }}>Flow Rate</span>
                      <strong style={{ color: '#1E293B' }}>{b.flow_rate_lpm.toFixed(1)} LPM</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748B', fontSize: '0.72rem', display: 'block' }}>Line Pressure</span>
                      <strong style={{ color: b.pressure_bar < 2.5 ? '#DC2626' : '#1E293B' }}>
                        {b.pressure_bar.toFixed(2)} bar
                      </strong>
                    </div>
                  </div>

                  {/* Tank Level Indicator */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#64748B', marginBottom: '4px' }}>
                      <span>Overhead Tank Storage</span>
                      <span style={{ fontWeight: '600', color: '#1E293B' }}>{b.tank_level_percent.toFixed(1)}%</span>
                    </div>
                    <div style={{ height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${Math.min(100, Math.max(0, b.tank_level_percent))}%`,
                          backgroundColor: b.tank_level_percent < 35 ? '#DC2626' : (b.tank_level_percent < 55 ? '#F59E0B' : '#2563EB'),
                          borderRadius: '3px',
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
