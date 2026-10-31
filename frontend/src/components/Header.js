import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Activity, Database, Thermometer, Clock } from 'lucide-react';
export const Header = ({ kpis, onStepSimulation, isStepping, weather, }) => {
    const currentTemp = weather?.temperature_c != null ? Math.round(weather.temperature_c) : 28;
    const storagePct = kpis ? Math.round(kpis.average_tank_level_pct) : 72;
    const flowRateLpm = kpis ? kpis.total_flow_rate_lpm.toFixed(1) : '129.0';
    return (_jsxs("header", { style: {
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
        }, children: [_jsxs("div", { style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                }, children: [_jsx("div", { style: {
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: '#2563EB',
                            boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.18)',
                            display: 'inline-block',
                        } }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column' }, children: [_jsx("span", { style: { fontSize: '0.88rem', fontWeight: '700', color: '#1E293B', lineHeight: '1.2' }, children: "Resilience Command Center" }), _jsx("span", { style: { fontSize: '0.72rem', color: '#64748B', fontWeight: '500' }, children: "Campus Operational Network" })] })] }), _jsxs("div", { style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    flexWrap: 'wrap',
                }, children: [_jsxs("div", { title: `Campus Aggregate Flow: ${flowRateLpm} LPM`, style: {
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
                        }, children: [_jsx(Activity, { size: 14, color: "#2563EB" }), _jsx("span", { children: "CampusFlow" }), _jsxs("span", { style: { fontSize: '0.75rem', fontWeight: '500', color: '#3B82F6', marginLeft: '2px' }, children: ["(", flowRateLpm, " LPM)"] })] }), _jsxs("div", { title: kpis ? `Total Available Storage: ${(kpis.total_storage_available_liters / 1000).toFixed(0)} m³` : 'Storage Buffer', style: {
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
                        }, children: [_jsx(Database, { size: 14, color: "#2563EB" }), _jsxs("span", { children: ["Storage: ", storagePct, "%"] })] }), _jsxs("div", { title: weather ? `Precipitation: ${weather.precipitation_mm}mm (${weather.source})` : 'Ambient Weather', style: {
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
                        }, children: [_jsx(Thermometer, { size: 14, color: "#2563EB" }), _jsxs("span", { children: ["Temperature: ", currentTemp, "\u00B0C"] })] }), _jsxs("button", { onClick: onStepSimulation, disabled: isStepping, title: "Advance simulation forward by 1 hour", style: {
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
                        }, onMouseEnter: (e) => {
                            if (!isStepping) {
                                e.currentTarget.style.backgroundColor = '#1D4ED8';
                            }
                        }, onMouseLeave: (e) => {
                            if (!isStepping) {
                                e.currentTarget.style.backgroundColor = '#2563EB';
                            }
                        }, children: [_jsx(Clock, { size: 14, color: "#FFFFFF" }), _jsx("span", { children: isStepping ? 'Advancing...' : '+1 hr' })] })] })] }));
};
