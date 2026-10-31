import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Droplets, AlertTriangle, TrendingDown, CheckCircle, Database, Building2, ShieldAlert, ShieldCheck, Shield, ArrowUpRight, LayoutGrid, Table as TableIcon, TrendingUp, BarChart2, PieChart as PieIcon, } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, } from 'recharts';
export const OverviewPage = ({ kpis, buildings, recommendations, onNavigateTab, }) => {
    const [viewMode, setViewMode] = useState('table');
    if (!kpis) {
        return (_jsx("div", { style: {
                padding: '48px',
                textAlign: 'center',
                color: '#64748B',
                backgroundColor: '#FFFFFF',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
            }, children: _jsx("div", { style: { fontSize: '0.95rem', fontWeight: '500' }, children: "Loading campus telemetry..." }) }));
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
    const getProtectionTier = (buildingId) => {
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
    return (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '22px' }, children: [_jsx("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }, children: _jsxs("div", { children: [_jsx("h1", { style: { fontSize: '1.4rem', fontWeight: '700', color: '#1E293B', margin: 0, letterSpacing: '-0.01em' }, children: "Campus Water Overview" }), _jsx("p", { style: { fontSize: '0.84rem', color: '#64748B', margin: '3px 0 0 0' }, children: "Live telemetry, predictive shortage assessments, and ethical tier protections across 6 campus facilities." })] }) }), p1Recs.length > 0 && (_jsxs("div", { style: {
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
                }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '12px' }, children: [_jsx("div", { style: {
                                    width: '34px',
                                    height: '34px',
                                    borderRadius: '7px',
                                    backgroundColor: '#FEE2E2',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }, children: _jsx(AlertTriangle, { size: 17, color: "#DC2626" }) }), _jsxs("div", { children: [_jsxs("div", { style: { color: '#1E293B', fontWeight: '600', fontSize: '0.9rem' }, children: ["Attention Required: ", p1Recs[0].problem] }), _jsxs("div", { style: { color: '#64748B', fontSize: '0.78rem', marginTop: '2px' }, children: ["Estimated daily loss: ", _jsxs("strong", { style: { color: '#DC2626' }, children: [p1Recs[0].estimated_daily_loss_liters.toLocaleString(), " L/day"] }), " (\u20B9", p1Recs[0].estimated_daily_cost_inr.toLocaleString(), "/day) \u2022 ", p1Recs[0].action_window] })] })] }), _jsx("button", { onClick: () => onNavigateTab('recommendations'), style: {
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
                        }, onMouseEnter: (e) => (e.currentTarget.style.backgroundColor = '#1D4ED8'), onMouseLeave: (e) => (e.currentTarget.style.backgroundColor = '#2563EB'), children: "Review & Approve" })] })), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }, children: [_jsxs("div", { style: {
                            backgroundColor: '#FFFFFF',
                            padding: '18px 20px',
                            borderRadius: '10px',
                            border: '1px solid #E2E8F0',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
                        }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }, children: [_jsx("span", { style: { fontSize: '0.78rem', color: '#64748B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }, children: "Current Demand" }), _jsx("div", { style: { width: '30px', height: '30px', borderRadius: '7px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }, children: _jsx(Droplets, { size: 15, color: "#2563EB" }) })] }), _jsxs("div", { style: { fontSize: '1.65rem', fontWeight: '700', color: '#1E293B', lineHeight: '1.2' }, children: [kpis.total_consumption_lph.toLocaleString(), " ", _jsx("span", { style: { fontSize: '0.82rem', color: '#64748B', fontWeight: '400' }, children: "L/h" })] }), _jsxs("div", { style: { fontSize: '0.76rem', color: '#64748B', marginTop: '6px' }, children: ["Aggregate flow rate: ", _jsxs("strong", { style: { color: '#1E293B' }, children: [kpis.total_flow_rate_lpm.toFixed(1), " LPM"] })] })] }), _jsxs("div", { style: {
                            backgroundColor: '#FFFFFF',
                            padding: '18px 20px',
                            borderRadius: '10px',
                            border: '1px solid #E2E8F0',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
                        }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }, children: [_jsx("span", { style: { fontSize: '0.78rem', color: '#64748B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }, children: "Storage Buffer" }), _jsx("div", { style: { width: '30px', height: '30px', borderRadius: '7px', backgroundColor: '#F0F9FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }, children: _jsx(Database, { size: 15, color: "#0284C7" }) })] }), _jsxs("div", { style: { fontSize: '1.65rem', fontWeight: '700', color: '#1E293B', lineHeight: '1.2' }, children: [(kpis.total_storage_available_liters / 1000).toFixed(0), " ", _jsx("span", { style: { fontSize: '0.82rem', color: '#64748B', fontWeight: '400' }, children: "m\u00B3" })] }), _jsxs("div", { style: { fontSize: '0.76rem', color: '#64748B', marginTop: '6px' }, children: ["Avg Overhead Tank Level: ", _jsxs("strong", { style: { color: '#0284C7' }, children: [kpis.average_tank_level_pct.toFixed(1), "%"] })] })] }), _jsxs("div", { style: {
                            backgroundColor: '#FFFFFF',
                            padding: '18px 20px',
                            borderRadius: '10px',
                            border: '1px solid #E2E8F0',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
                        }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }, children: [_jsx("span", { style: { fontSize: '0.78rem', color: '#64748B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }, children: "Suspected Loss" }), _jsx("div", { style: {
                                            width: '30px',
                                            height: '30px',
                                            borderRadius: '7px',
                                            backgroundColor: kpis.potential_daily_loss_liters > 0 ? '#FEF2F2' : '#F0FDF4',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }, children: _jsx(TrendingDown, { size: 15, color: kpis.potential_daily_loss_liters > 0 ? '#DC2626' : '#16A34A' }) })] }), _jsxs("div", { style: {
                                    fontSize: '1.65rem',
                                    fontWeight: '700',
                                    color: kpis.potential_daily_loss_liters > 0 ? '#DC2626' : '#16A34A',
                                    lineHeight: '1.2',
                                }, children: [kpis.potential_daily_loss_liters.toLocaleString(), " ", _jsx("span", { style: { fontSize: '0.82rem', color: '#64748B', fontWeight: '400' }, children: "L/day" })] }), _jsx("div", { style: { fontSize: '0.76rem', color: '#64748B', marginTop: '6px' }, children: kpis.active_recommendations_count > 0 ? (_jsxs("span", { children: [_jsx("strong", { style: { color: '#1E293B' }, children: kpis.active_recommendations_count }), " active issue(s) under observation"] })) : (_jsx("span", { children: "Infrastructure operating nominally" })) })] }), _jsxs("div", { style: {
                            backgroundColor: '#FFFFFF',
                            padding: '18px 20px',
                            borderRadius: '10px',
                            border: '1px solid #E2E8F0',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
                        }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }, children: [_jsx("span", { style: { fontSize: '0.78rem', color: '#64748B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }, children: "Verified Water Saved" }), _jsx("div", { style: { width: '30px', height: '30px', borderRadius: '7px', backgroundColor: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }, children: _jsx(CheckCircle, { size: 15, color: "#16A34A" }) })] }), _jsxs("div", { style: {
                                    fontSize: kpis.verified_water_saved_liters > 99999 ? '1.5rem' : '1.65rem',
                                    fontWeight: '700',
                                    color: '#16A34A',
                                    lineHeight: '1.2',
                                    whiteSpace: 'nowrap',
                                }, children: [kpis.verified_water_saved_liters.toLocaleString(), " ", _jsx("span", { style: { fontSize: '0.82rem', color: '#64748B', fontWeight: '400' }, children: "L" })] }), _jsxs("div", { style: { fontSize: '0.76rem', color: '#64748B', marginTop: '6px', whiteSpace: 'nowrap' }, children: ["Financial cost saved: ", _jsxs("strong", { style: { color: '#1E293B' }, children: ["\u20B9 ", kpis.verified_financial_saved_inr.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })] })] })] })] }), _jsxs("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
                    gap: '16px',
                }, children: [_jsxs("div", { style: {
                            backgroundColor: '#FFFFFF',
                            borderRadius: '10px',
                            border: '1px solid #E2E8F0',
                            padding: '18px 20px',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
                            display: 'flex',
                            flexDirection: 'column',
                        }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsx(TrendingUp, { size: 16, color: "#2563EB" }), _jsxs("div", { children: [_jsx("h3", { style: { fontSize: '0.92rem', fontWeight: '700', color: '#1E293B', margin: 0 }, children: "Resource Usage Trend" }), _jsx("span", { style: { fontSize: '0.74rem', color: '#64748B' }, children: "Storage buffer & demand over time" })] })] }), _jsx("span", { style: { fontSize: '0.72rem', color: '#2563EB', fontWeight: '600', backgroundColor: '#EFF6FF', padding: '2px 8px', borderRadius: '5px' }, children: "24-Hour" })] }), _jsx("div", { style: { width: '100%', height: 190 }, children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(LineChart, { data: usageTrendData, margin: { top: 10, right: 12, left: -24, bottom: 0 }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#F1F5F9", vertical: false }), _jsx(XAxis, { dataKey: "time", stroke: "#94A3B8", tick: { fontSize: 11, fill: '#64748B' }, axisLine: { stroke: '#E2E8F0' }, tickLine: false }), _jsx(YAxis, { domain: [0, 100], ticks: [0, 25, 50, 75, 100], stroke: "#94A3B8", tick: { fontSize: 11, fill: '#64748B' }, axisLine: false, tickLine: false, tickFormatter: (v) => `${v}%` }), _jsx(Tooltip, { contentStyle: {
                                                    backgroundColor: '#FFFFFF',
                                                    border: '1px solid #E2E8F0',
                                                    borderRadius: '8px',
                                                    fontSize: '0.78rem',
                                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.08)',
                                                }, formatter: (value, name) => [`${value}%`, name === 'demandPct' ? 'Demand Load' : 'Storage Buffer'] }), _jsx(Line, { type: "monotone", dataKey: "demandPct", name: "demandPct", stroke: "#2563EB", strokeWidth: 2.2, dot: { r: 3, fill: '#2563EB' }, activeDot: { r: 5 } }), _jsx(Line, { type: "monotone", dataKey: "storagePct", name: "storagePct", stroke: "#0284C7", strokeWidth: 1.8, strokeDasharray: "4 4", dot: false })] }) }) }), _jsxs("div", { style: { display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '8px', fontSize: '0.74rem' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '6px' }, children: [_jsx("span", { style: { width: '12px', height: '3px', backgroundColor: '#2563EB', borderRadius: '2px', display: 'inline-block' } }), _jsx("span", { style: { color: '#475569', fontWeight: '500' }, children: "Demand Load" })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '6px' }, children: [_jsx("span", { style: { width: '12px', height: '2px', borderTop: '2px dashed #0284C7', display: 'inline-block' } }), _jsx("span", { style: { color: '#475569', fontWeight: '500' }, children: "Storage Buffer" })] })] })] }), _jsxs("div", { style: {
                            backgroundColor: '#FFFFFF',
                            borderRadius: '10px',
                            border: '1px solid #E2E8F0',
                            padding: '18px 20px',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
                            display: 'flex',
                            flexDirection: 'column',
                        }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsx(BarChart2, { size: 16, color: "#2563EB" }), _jsxs("div", { children: [_jsx("h3", { style: { fontSize: '0.92rem', fontWeight: '700', color: '#1E293B', margin: 0 }, children: "Campus Resource Status" }), _jsx("span", { style: { fontSize: '0.74rem', color: '#64748B' }, children: "Capacity & utilization percentages" })] })] }), _jsx("span", { style: { fontSize: '0.72rem', color: '#64748B', fontWeight: '500' }, children: "Real-Time" })] }), _jsx("div", { style: { width: '100%', height: 190 }, children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: resourceStatusData, margin: { top: 10, right: 12, left: -24, bottom: 0 }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#F1F5F9", vertical: false }), _jsx(XAxis, { dataKey: "resource", stroke: "#94A3B8", tick: { fontSize: 11, fill: '#64748B' }, axisLine: { stroke: '#E2E8F0' }, tickLine: false }), _jsx(YAxis, { domain: [0, 100], ticks: [0, 25, 50, 75, 100], stroke: "#94A3B8", tick: { fontSize: 11, fill: '#64748B' }, axisLine: false, tickLine: false, tickFormatter: (v) => `${v}%` }), _jsx(Tooltip, { contentStyle: {
                                                    backgroundColor: '#FFFFFF',
                                                    border: '1px solid #E2E8F0',
                                                    borderRadius: '8px',
                                                    fontSize: '0.78rem',
                                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.08)',
                                                }, formatter: (value) => [`${value}%`, 'Capacity / Level'] }), _jsx(Bar, { dataKey: "level", radius: [4, 4, 0, 0], children: resourceStatusData.map((entry, index) => (_jsx(Cell, { fill: entry.fill }, `bar-${index}`))) })] }) }) }), _jsxs("div", { style: { display: 'flex', justifyContent: 'center', gap: '14px', marginTop: '8px', fontSize: '0.74rem' }, children: [_jsxs("span", { style: { color: '#475569' }, children: ["Water: ", _jsxs("strong", { style: { color: '#1E293B' }, children: [resourceStatusData[0].level, "%"] })] }), _jsxs("span", { style: { color: '#475569' }, children: ["Energy: ", _jsx("strong", { style: { color: '#1E293B' }, children: "54%" })] }), _jsxs("span", { style: { color: '#475569' }, children: ["Storage: ", _jsxs("strong", { style: { color: '#1E293B' }, children: [currentStoragePct, "%"] })] })] })] }), _jsxs("div", { style: {
                            backgroundColor: '#FFFFFF',
                            borderRadius: '10px',
                            border: '1px solid #E2E8F0',
                            padding: '18px 20px',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
                            display: 'flex',
                            flexDirection: 'column',
                        }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsx(PieIcon, { size: 16, color: "#2563EB" }), _jsxs("div", { children: [_jsx("h3", { style: { fontSize: '0.92rem', fontWeight: '700', color: '#1E293B', margin: 0 }, children: "Protection Tier Distribution" }), _jsx("span", { style: { fontSize: '0.74rem', color: '#64748B' }, children: "Campus facility welfare classification" })] })] }), _jsx("span", { style: { fontSize: '0.72rem', color: '#2563EB', fontWeight: '600', backgroundColor: '#EFF6FF', padding: '2px 8px', borderRadius: '5px' }, children: "6 Facilities" })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', width: '100%', height: 190 }, children: [_jsx("div", { style: { flex: '1 1 55%', height: '100%' }, children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(PieChart, { margin: { top: 0, right: 0, bottom: 0, left: 0 }, children: [_jsx(Pie, { data: tierDistributionData, cx: "50%", cy: "50%", innerRadius: 42, outerRadius: 68, paddingAngle: 4, dataKey: "value", children: tierDistributionData.map((entry, index) => (_jsx(Cell, { fill: entry.color }, `tier-${index}`))) }), _jsx(Tooltip, { contentStyle: {
                                                            backgroundColor: '#FFFFFF',
                                                            border: '1px solid #E2E8F0',
                                                            borderRadius: '8px',
                                                            fontSize: '0.78rem',
                                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.08)',
                                                        }, formatter: (value, name) => [`${value} Facilities`, name] })] }) }) }), _jsx("div", { style: { flex: '1 1 45%', display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '8px' }, children: tierDistributionData.map((item) => (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '1px' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }, children: [_jsx("span", { style: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.color, flexShrink: 0 } }), _jsx("span", { style: { color: '#475569', fontWeight: '500', whiteSpace: 'nowrap' }, children: item.name })] }), _jsxs("span", { style: { fontSize: '0.74rem', color: '#1E293B', fontWeight: '700', paddingLeft: '14px' }, children: [item.value, " Facilities (", Math.round((item.value / 6) * 100), "%)"] })] }, item.name))) })] }), _jsx("div", { style: { textAlign: 'center', marginTop: '8px', fontSize: '0.72rem', color: '#64748B' }, children: "Hostels protected under non-curtailment guardrails" })] })] }), _jsxs("div", { style: {
                    backgroundColor: '#FFFFFF',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
                    overflow: 'hidden',
                }, children: [_jsxs("div", { style: {
                            padding: '16px 20px',
                            borderBottom: '1px solid #E2E8F0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '12px',
                        }, children: [_jsxs("div", { children: [_jsx("h2", { style: { fontSize: '1.05rem', fontWeight: '700', color: '#1E293B', margin: 0 }, children: "Campus Facilities & Protection Tiers" }), _jsx("p", { style: { fontSize: '0.78rem', color: '#64748B', margin: '2px 0 0 0' }, children: "Real-time flow, line pressure, storage reserves, and ethical tier protections across all 6 campus buildings." })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '10px' }, children: [_jsxs("div", { style: {
                                            display: 'inline-flex',
                                            backgroundColor: '#F8FAFC',
                                            borderRadius: '7px',
                                            border: '1px solid #E2E8F0',
                                            padding: '2px',
                                        }, children: [_jsxs("button", { onClick: () => setViewMode('table'), style: {
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
                                                }, children: [_jsx(TableIcon, { size: 13 }), _jsx("span", { children: "Table View" })] }), _jsxs("button", { onClick: () => setViewMode('cards'), style: {
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
                                                }, children: [_jsx(LayoutGrid, { size: 13 }), _jsx("span", { children: "Card View" })] })] }), _jsxs("button", { onClick: () => onNavigateTab('monitoring'), style: {
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
                                        }, onMouseEnter: (e) => (e.currentTarget.style.backgroundColor = '#DBEAFE'), onMouseLeave: (e) => (e.currentTarget.style.backgroundColor = '#EFF6FF'), children: [_jsx("span", { children: "Live Console" }), _jsx(ArrowUpRight, { size: 13, color: "#2563EB" })] })] })] }), viewMode === 'table' ? (_jsx("div", { style: { overflowX: 'auto' }, children: _jsxs("table", { style: { width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', color: '#1E293B', textAlign: 'left' }, children: [_jsx("thead", { children: _jsxs("tr", { style: { backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B' }, children: [_jsx("th", { style: { padding: '12px 20px', fontWeight: '600', minWidth: '220px' }, children: "Facility / Zone" }), _jsx("th", { style: { padding: '12px 16px', fontWeight: '600', minWidth: '190px' }, children: "Protection Tier" }), _jsx("th", { style: { padding: '12px 16px', fontWeight: '600', minWidth: '120px' }, children: "Flow Rate" }), _jsx("th", { style: { padding: '12px 16px', fontWeight: '600', minWidth: '120px' }, children: "Line Pressure" }), _jsx("th", { style: { padding: '12px 16px', fontWeight: '600', minWidth: '160px' }, children: "Overhead Storage" }), _jsx("th", { style: { padding: '12px 20px', fontWeight: '600', minWidth: '120px', textAlign: 'right' }, children: "Status" })] }) }), _jsx("tbody", { children: kpis.latest_readings.map((b) => {
                                        const tier = getProtectionTier(b.building_id);
                                        const TierIcon = tier.icon;
                                        const hasLeak = b.flow_rate_lpm > (b.building_id === 'hostel_a' ? 50 : 45);
                                        return (_jsxs("tr", { style: {
                                                borderBottom: '1px solid #F1F5F9',
                                                height: '56px',
                                                transition: 'background-color 0.1s ease',
                                            }, onMouseEnter: (e) => (e.currentTarget.style.backgroundColor = '#F8FAFC'), onMouseLeave: (e) => (e.currentTarget.style.backgroundColor = '#FFFFFF'), children: [_jsx("td", { style: { padding: '12px 20px', verticalAlign: 'middle' }, children: _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '10px' }, children: [_jsx("div", { style: {
                                                                    width: '30px',
                                                                    height: '30px',
                                                                    borderRadius: '7px',
                                                                    backgroundColor: '#F1F5F9',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    flexShrink: 0,
                                                                }, children: _jsx(Building2, { size: 15, color: "#2563EB" }) }), _jsxs("div", { children: [_jsx("div", { style: { fontWeight: '600', color: '#1E293B', fontSize: '0.86rem' }, children: b.building_name }), _jsxs("div", { style: { fontSize: '0.74rem', color: '#64748B' }, children: [b.occupancy, " occupants"] })] })] }) }), _jsx("td", { style: { padding: '12px 16px', verticalAlign: 'middle', whiteSpace: 'nowrap' }, children: _jsxs("span", { style: {
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
                                                        }, children: [_jsx(TierIcon, { size: 13, color: tier.color }), _jsx("span", { children: tier.label })] }) }), _jsxs("td", { style: { padding: '12px 16px', verticalAlign: 'middle', whiteSpace: 'nowrap' }, children: [_jsx("strong", { style: { color: '#1E293B' }, children: b.flow_rate_lpm.toFixed(1) }), _jsx("span", { style: { color: '#64748B', fontSize: '0.74rem', marginLeft: '4px' }, children: "LPM" })] }), _jsxs("td", { style: { padding: '12px 16px', verticalAlign: 'middle', whiteSpace: 'nowrap' }, children: [_jsx("strong", { style: { color: b.pressure_bar < 2.5 ? '#DC2626' : '#1E293B' }, children: b.pressure_bar.toFixed(2) }), _jsx("span", { style: { color: '#64748B', fontSize: '0.74rem', marginLeft: '4px' }, children: "bar" })] }), _jsx("td", { style: { padding: '12px 16px', verticalAlign: 'middle' }, children: _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', minWidth: '140px' }, children: [_jsx("div", { style: { flex: 1, height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }, children: _jsx("div", { style: {
                                                                        height: '100%',
                                                                        width: `${Math.min(100, Math.max(0, b.tank_level_percent))}%`,
                                                                        backgroundColor: b.tank_level_percent < 35 ? '#DC2626' : (b.tank_level_percent < 55 ? '#F59E0B' : '#2563EB'),
                                                                        borderRadius: '3px',
                                                                    } }) }), _jsxs("span", { style: { fontSize: '0.76rem', fontWeight: '600', color: '#1E293B', minWidth: '36px', textAlign: 'right' }, children: [b.tank_level_percent.toFixed(0), "%"] })] }) }), _jsx("td", { style: { padding: '12px 20px', verticalAlign: 'middle', textAlign: 'right', whiteSpace: 'nowrap' }, children: _jsx("span", { style: {
                                                            display: 'inline-block',
                                                            fontSize: '0.72rem',
                                                            fontWeight: '600',
                                                            padding: '3px 9px',
                                                            borderRadius: '5px',
                                                            backgroundColor: hasLeak ? '#FEF2F2' : '#F0FDF4',
                                                            color: hasLeak ? '#DC2626' : '#16A34A',
                                                            border: `1px solid ${hasLeak ? '#FECACA' : '#BBF7D0'}`,
                                                        }, children: hasLeak ? 'Elevated Flow' : 'Nominal' }) })] }, b.building_id));
                                    }) })] }) })) : (
                    /* View Mode 2: Card Grid (Cards with Consistent Badges & Equal Layouts) */
                    _jsx("div", { style: {
                            padding: '20px',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                            gap: '16px',
                        }, children: kpis.latest_readings.map((b) => {
                            const tier = getProtectionTier(b.building_id);
                            const TierIcon = tier.icon;
                            const hasLeak = b.flow_rate_lpm > (b.building_id === 'hostel_a' ? 50 : 45);
                            return (_jsxs("div", { style: {
                                    backgroundColor: '#FFFFFF',
                                    borderRadius: '10px',
                                    border: hasLeak ? '1px solid #FECACA' : '1px solid #E2E8F0',
                                    padding: '16px 18px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '12px',
                                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
                                }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '10px' }, children: [_jsx("div", { style: {
                                                            width: '32px',
                                                            height: '32px',
                                                            borderRadius: '7px',
                                                            backgroundColor: '#F8FAFC',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            border: '1px solid #E2E8F0',
                                                        }, children: _jsx(Building2, { size: 16, color: "#2563EB" }) }), _jsxs("div", { children: [_jsx("div", { style: { fontWeight: '600', color: '#1E293B', fontSize: '0.92rem' }, children: b.building_name }), _jsxs("div", { style: { fontSize: '0.74rem', color: '#64748B' }, children: [b.occupancy, " occupants"] })] })] }), _jsx("span", { style: {
                                                    fontSize: '0.72rem',
                                                    fontWeight: '600',
                                                    padding: '3px 8px',
                                                    borderRadius: '5px',
                                                    backgroundColor: hasLeak ? '#FEF2F2' : '#F0FDF4',
                                                    color: hasLeak ? '#DC2626' : '#16A34A',
                                                    border: `1px solid ${hasLeak ? '#FECACA' : '#BBF7D0'}`,
                                                }, children: hasLeak ? 'Elevated Flow' : 'Nominal' })] }), _jsx("div", { children: _jsxs("span", { style: {
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
                                            }, children: [_jsx(TierIcon, { size: 12, color: tier.color }), _jsx("span", { children: tier.label })] }) }), _jsxs("div", { style: {
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr',
                                            gap: '10px',
                                            fontSize: '0.8rem',
                                            backgroundColor: '#F8FAFC',
                                            padding: '10px 12px',
                                            borderRadius: '7px',
                                            border: '1px solid #E2E8F0',
                                        }, children: [_jsxs("div", { children: [_jsx("span", { style: { color: '#64748B', fontSize: '0.72rem', display: 'block' }, children: "Flow Rate" }), _jsxs("strong", { style: { color: '#1E293B' }, children: [b.flow_rate_lpm.toFixed(1), " LPM"] })] }), _jsxs("div", { children: [_jsx("span", { style: { color: '#64748B', fontSize: '0.72rem', display: 'block' }, children: "Line Pressure" }), _jsxs("strong", { style: { color: b.pressure_bar < 2.5 ? '#DC2626' : '#1E293B' }, children: [b.pressure_bar.toFixed(2), " bar"] })] })] }), _jsxs("div", { children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#64748B', marginBottom: '4px' }, children: [_jsx("span", { children: "Overhead Tank Storage" }), _jsxs("span", { style: { fontWeight: '600', color: '#1E293B' }, children: [b.tank_level_percent.toFixed(1), "%"] })] }), _jsx("div", { style: { height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }, children: _jsx("div", { style: {
                                                        height: '100%',
                                                        width: `${Math.min(100, Math.max(0, b.tank_level_percent))}%`,
                                                        backgroundColor: b.tank_level_percent < 35 ? '#DC2626' : (b.tank_level_percent < 55 ? '#F59E0B' : '#2563EB'),
                                                        borderRadius: '3px',
                                                    } }) })] })] }, b.building_id));
                        }) }))] })] }));
};
