import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Droplets, TrendingUp, Zap, Leaf } from 'lucide-react';
import { api } from '../services/api';
export const AnalyticsPage = ({ kpis }) => {
    const [interventions, setInterventions] = useState([]);
    useEffect(() => {
        api.getInterventions().then(setInterventions).catch(console.error);
    }, []);
    const totalSavedLiters = interventions.reduce((acc, i) => acc + (i.verified_water_saved_liters || 0), 0);
    const totalSavedInr = interventions.reduce((acc, i) => acc + (i.financial_savings_inr || 0), 0);
    const totalCo2Avoided = interventions.reduce((acc, i) => acc + (i.co2_emissions_avoided_kg || 0), 0);
    return (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '24px' }, children: [_jsxs("div", { children: [_jsx("h1", { style: { fontSize: '1.45rem', fontWeight: '700', color: '#29465B', margin: 0, letterSpacing: '-0.01em' }, children: "Resilience Analytics & Verified Impact" }), _jsx("p", { style: { fontSize: '0.86rem', color: '#718096', margin: '4px 0 0 0' }, children: "Longitudinal conservation metrics, verified post-repair water recovery, and environmental ESG performance." })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }, children: [_jsxs("div", { style: {
                            backgroundColor: '#FFFFFF',
                            padding: '22px',
                            borderRadius: '12px',
                            border: '1px solid #E7EDF1',
                            boxShadow: '0 1px 3px rgba(41, 56, 69, 0.02)',
                        }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }, children: [_jsx("span", { style: { fontSize: '0.78rem', color: '#718096', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }, children: "Verified Water Conserved" }), _jsx("div", { style: { width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#EBF5F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }, children: _jsx(Droplets, { size: 16, color: "#54856D" }) })] }), _jsxs("div", { style: { fontSize: '1.75rem', fontWeight: '700', color: '#54856D', lineHeight: '1.2' }, children: [totalSavedLiters.toLocaleString(), " ", _jsx("span", { style: { fontSize: '0.85rem', color: '#718096', fontWeight: '400' }, children: "L" })] }), _jsxs("div", { style: { fontSize: '0.78rem', color: '#718096', marginTop: '8px' }, children: ["Post-repair confirmed savings across ", interventions.length, " interventions"] })] }), _jsxs("div", { style: {
                            backgroundColor: '#FFFFFF',
                            padding: '22px',
                            borderRadius: '12px',
                            border: '1px solid #E7EDF1',
                            boxShadow: '0 1px 3px rgba(41, 56, 69, 0.02)',
                        }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }, children: [_jsx("span", { style: { fontSize: '0.78rem', color: '#718096', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }, children: "Financial Cost Avoidance" }), _jsx("div", { style: { width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#E8F0F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }, children: _jsx(TrendingUp, { size: 16, color: "#29465B" }) })] }), _jsxs("div", { style: { fontSize: '1.75rem', fontWeight: '700', color: '#29465B', lineHeight: '1.2' }, children: ["\u20B9 ", totalSavedInr.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })] }), _jsx("div", { style: { fontSize: '0.78rem', color: '#718096', marginTop: '8px' }, children: "Based on campus utility tariff \u20B9 45 / 1,000 Liters" })] }), _jsxs("div", { style: {
                            backgroundColor: '#FFFFFF',
                            padding: '22px',
                            borderRadius: '12px',
                            border: '1px solid #E7EDF1',
                            boxShadow: '0 1px 3px rgba(41, 56, 69, 0.02)',
                        }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }, children: [_jsx("span", { style: { fontSize: '0.78rem', color: '#718096', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }, children: "Pumping Energy Saved" }), _jsx("div", { style: { width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#FDF8EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }, children: _jsx(Zap, { size: 16, color: "#C39755" }) })] }), _jsxs("div", { style: { fontSize: '1.75rem', fontWeight: '700', color: '#C39755', lineHeight: '1.2' }, children: [(totalSavedLiters * 0.00045).toFixed(1), " ", _jsx("span", { style: { fontSize: '0.85rem', color: '#718096', fontWeight: '400' }, children: "kWh" })] }), _jsx("div", { style: { fontSize: '0.78rem', color: '#718096', marginTop: '8px' }, children: "Booster pump lift and main distribution pumping" })] }), _jsxs("div", { style: {
                            backgroundColor: '#FFFFFF',
                            padding: '22px',
                            borderRadius: '12px',
                            border: '1px solid #E7EDF1',
                            boxShadow: '0 1px 3px rgba(41, 56, 69, 0.02)',
                        }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }, children: [_jsx("span", { style: { fontSize: '0.78rem', color: '#718096', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }, children: "Emissions Mitigated" }), _jsx("div", { style: { width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#DCEFED', display: 'flex', alignItems: 'center', justifyContent: 'center' }, children: _jsx(Leaf, { size: 16, color: "#5C9992" }) })] }), _jsxs("div", { style: { fontSize: '1.75rem', fontWeight: '700', color: '#5C9992', lineHeight: '1.2' }, children: [totalCo2Avoided.toFixed(1), " ", _jsx("span", { style: { fontSize: '0.85rem', color: '#718096', fontWeight: '400' }, children: "kg CO\u2082" })] }), _jsx("div", { style: { fontSize: '0.78rem', color: '#718096', marginTop: '8px' }, children: "Grid carbon emissions averted via water conservation" })] })] }), _jsxs("div", { style: {
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E7EDF1',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(41, 56, 69, 0.02)',
                }, children: [_jsx("div", { style: {
                            padding: '16px 20px',
                            backgroundColor: '#F6F8FA',
                            borderBottom: '1px solid #E7EDF1',
                            fontSize: '0.94rem',
                            fontWeight: '700',
                            color: '#29465B',
                        }, children: "Verified Maintenance Work Orders & Impact Log" }), interventions.length === 0 ? (_jsx("div", { style: { padding: '36px 24px', textAlign: 'center', color: '#718096', fontSize: '0.86rem' }, children: "No interventions logged yet. Trigger a simulated leak in Live Monitoring, approve the recommendation, and resolve it to observe verified savings!" })) : (_jsxs("table", { style: { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', color: '#293845' }, children: [_jsx("thead", { children: _jsxs("tr", { style: { backgroundColor: '#F6F8FA', borderBottom: '1px solid #E7EDF1', textAlign: 'left', color: '#718096' }, children: [_jsx("th", { style: { padding: '12px 16px', fontWeight: '600' }, children: "Work Order ID" }), _jsx("th", { style: { padding: '12px 16px', fontWeight: '600' }, children: "Facility" }), _jsx("th", { style: { padding: '12px 16px', fontWeight: '600' }, children: "Corrective Action" }), _jsx("th", { style: { padding: '12px 16px', fontWeight: '600' }, children: "Start Timestamp" }), _jsx("th", { style: { padding: '12px 16px', fontWeight: '600' }, children: "Water Conserved" }), _jsx("th", { style: { padding: '12px 16px', fontWeight: '600' }, children: "Financial Saving" }), _jsx("th", { style: { padding: '12px 16px', fontWeight: '600' }, children: "Status" })] }) }), _jsx("tbody", { children: interventions.map((item) => (_jsxs("tr", { style: { borderBottom: '1px solid #F0F4F8' }, children: [_jsx("td", { style: { padding: '12px 16px', fontWeight: '600', color: '#29465B' }, children: item.id }), _jsx("td", { style: { padding: '12px 16px', fontWeight: '600', color: '#29465B' }, children: item.building_name }), _jsx("td", { style: { padding: '12px 16px', color: '#718096' }, children: item.action_taken }), _jsx("td", { style: { padding: '12px 16px', color: '#718096', fontSize: '0.8rem' }, children: item.start_timestamp }), _jsx("td", { style: { padding: '12px 16px', color: '#54856D', fontWeight: '600' }, children: item.verified_water_saved_liters ? `${item.verified_water_saved_liters.toLocaleString()} Liters` : 'In Progress' }), _jsx("td", { style: { padding: '12px 16px', color: '#29465B', fontWeight: '600' }, children: item.financial_savings_inr ? `₹ ${item.financial_savings_inr.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'Pending' }), _jsx("td", { style: { padding: '12px 16px' }, children: _jsx("span", { style: {
                                                    fontSize: '0.72rem',
                                                    padding: '3px 8px',
                                                    borderRadius: '5px',
                                                    fontWeight: '600',
                                                    backgroundColor: item.status === 'RESOLVED' ? '#EBF5F0' : '#F5EEF8',
                                                    color: item.status === 'RESOLVED' ? '#54856D' : '#7E528F',
                                                    border: `1px solid ${item.status === 'RESOLVED' ? '#D2E8DD' : '#EADCF2'}`,
                                                }, children: item.status }) })] }, item.id))) })] }))] })] }));
};
