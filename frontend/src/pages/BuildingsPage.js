import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Building2 } from 'lucide-react';
export const BuildingsPage = ({ buildings, latestReadings }) => {
    return (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '24px' }, children: [_jsxs("div", { children: [_jsx("h1", { style: { fontSize: '1.45rem', fontWeight: '700', color: '#29465B', margin: 0, letterSpacing: '-0.01em' }, children: "Campus Facilities & Digital Twin Assets" }), _jsx("p", { style: { fontSize: '0.86rem', color: '#718096', margin: '4px 0 0 0' }, children: "Physical hydraulic specifications, storage tank capacities, and ethical student welfare classifications." })] }), _jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }, children: buildings.map((b) => {
                    const reading = latestReadings.find((r) => r.building_id === b.building_id);
                    return (_jsxs("div", { style: {
                            backgroundColor: '#FFFFFF',
                            borderRadius: '12px',
                            border: '1px solid #E7EDF1',
                            padding: '22px 24px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '14px',
                            boxShadow: '0 1px 3px rgba(41, 56, 69, 0.02)',
                        }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '10px' }, children: [_jsx("div", { style: {
                                                    width: '36px',
                                                    height: '36px',
                                                    borderRadius: '8px',
                                                    backgroundColor: '#E8F0F7',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }, children: _jsx(Building2, { size: 18, color: "#29465B" }) }), _jsxs("div", { children: [_jsx("h3", { style: { fontSize: '1.05rem', fontWeight: '700', color: '#29465B', margin: 0 }, children: b.building_name }), _jsxs("div", { style: { fontSize: '0.78rem', color: '#5C9992', fontWeight: '600' }, children: [b.category, " Facility"] })] })] }), b.is_vulnerable_population ? (_jsx("span", { style: {
                                            fontSize: '0.72rem',
                                            backgroundColor: '#FDF8EE',
                                            color: '#C39755',
                                            padding: '3px 9px',
                                            borderRadius: '6px',
                                            border: '1px solid #F4E3C8',
                                            fontWeight: '600',
                                        }, children: "Protected (Residential)" })) : (_jsx("span", { style: {
                                            fontSize: '0.72rem',
                                            backgroundColor: '#F6F8FA',
                                            color: '#718096',
                                            padding: '3px 9px',
                                            borderRadius: '6px',
                                            border: '1px solid #E7EDF1',
                                            fontWeight: '500',
                                        }, children: "Standard Academic" }))] }), _jsx("p", { style: { fontSize: '0.82rem', color: '#718096', margin: 0, lineHeight: '1.45' }, children: b.description }), _jsxs("div", { style: {
                                    backgroundColor: '#F6F8FA',
                                    padding: '12px 14px',
                                    borderRadius: '8px',
                                    border: '1px solid #E7EDF1',
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '8px',
                                    fontSize: '0.8rem',
                                }, children: [_jsxs("div", { children: [_jsx("span", { style: { color: '#718096', fontSize: '0.74rem', display: 'block' }, children: "Tank Capacity" }), _jsxs("strong", { style: { color: '#29465B' }, children: [b.tank_capacity_liters.toLocaleString(), " Liters"] })] }), _jsxs("div", { children: [_jsx("span", { style: { color: '#718096', fontSize: '0.74rem', display: 'block' }, children: "Nominal Head" }), _jsxs("strong", { style: { color: '#29465B' }, children: [b.nominal_pressure_bar, " bar"] })] }), _jsxs("div", { children: [_jsx("span", { style: { color: '#718096', fontSize: '0.74rem', display: 'block' }, children: "Max Capacity" }), _jsxs("strong", { style: { color: '#29465B' }, children: [b.max_occupancy, " occupants"] })] }), _jsxs("div", { children: [_jsx("span", { style: { color: '#718096', fontSize: '0.74rem', display: 'block' }, children: "Base Flow Rate" }), _jsxs("strong", { style: { color: '#29465B' }, children: [b.base_flow_lpm, " LPM"] })] })] }), reading && (_jsxs("div", { style: {
                                    borderTop: '1px solid #E7EDF1',
                                    paddingTop: '10px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: '0.78rem',
                                    color: '#718096',
                                }, children: [_jsxs("span", { children: ["Flow: ", _jsxs("strong", { style: { color: '#293845' }, children: [reading.flow_rate_lpm.toFixed(1), " LPM"] })] }), _jsxs("span", { children: ["Tank Level: ", _jsxs("strong", { style: { color: '#54856D' }, children: [reading.tank_level_percent.toFixed(1), "%"] })] }), _jsxs("span", { children: ["Pressure: ", _jsxs("strong", { style: { color: '#293845' }, children: [reading.pressure_bar.toFixed(2), " bar"] })] })] }))] }, b.building_id));
                }) })] }));
};
