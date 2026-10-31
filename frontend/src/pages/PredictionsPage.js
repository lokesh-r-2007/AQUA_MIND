import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Activity, BarChart2 } from 'lucide-react';
export const PredictionsPage = ({ forecastData, shortageData, buildings, }) => {
    const campusSummary = shortageData?.campus_summary;
    const buildingRisks = shortageData?.building_risks || [];
    return (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '24px' }, children: [_jsxs("div", { children: [_jsx("h1", { style: { fontSize: '1.45rem', fontWeight: '700', color: '#29465B', margin: 0, letterSpacing: '-0.01em' }, children: "Demand Forecasting & Water Security Risk" }), _jsx("p", { style: { fontSize: '0.86rem', color: '#718096', margin: '4px 0 0 0' }, children: "Multi-horizon Gradient Boosting demand projections and explainable storage autonomy assessments." })] }), campusSummary && (_jsxs("div", { style: {
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    padding: '22px 24px',
                    border: campusSummary.overall_campus_risk === 'High Risk' ? '1px solid #F5D5D5' : '1px solid #E7EDF1',
                    boxShadow: '0 1px 3px rgba(41, 56, 69, 0.03)',
                }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '10px' }, children: [_jsx("div", { style: {
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '8px',
                                            backgroundColor: '#DCEFED',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }, children: _jsx(Activity, { size: 16, color: "#29465B" }) }), _jsx("h2", { style: { fontSize: '1.05rem', fontWeight: '700', color: '#29465B', margin: 0 }, children: "Campus Storage Security Posture" })] }), _jsx("span", { style: {
                                    padding: '3px 10px',
                                    borderRadius: '6px',
                                    fontWeight: '600',
                                    fontSize: '0.74rem',
                                    backgroundColor: campusSummary.overall_campus_risk === 'High Risk' ? '#FDF2F2' : (campusSummary.overall_campus_risk === 'Medium Risk' ? '#FDF8EE' : '#EBF5F0'),
                                    color: campusSummary.overall_campus_risk === 'High Risk' ? '#C16D6D' : (campusSummary.overall_campus_risk === 'Medium Risk' ? '#C39755' : '#54856D'),
                                    border: `1px solid ${campusSummary.overall_campus_risk === 'High Risk' ? '#F5D5D5' : (campusSummary.overall_campus_risk === 'Medium Risk' ? '#F4E3C8' : '#D2E8DD')}`,
                                    textTransform: 'uppercase',
                                }, children: campusSummary.overall_campus_risk })] }), _jsx("div", { style: { fontSize: '0.88rem', color: '#718096', marginBottom: '16px', lineHeight: '1.5' }, children: campusSummary.summary }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }, children: [_jsxs("div", { style: { backgroundColor: '#F6F8FA', padding: '14px', borderRadius: '8px', border: '1px solid #E7EDF1' }, children: [_jsx("div", { style: { fontSize: '0.74rem', color: '#718096' }, children: "Campus Storage Autonomy" }), _jsxs("div", { style: { fontSize: '1.35rem', fontWeight: '700', color: '#29465B', marginTop: '2px' }, children: [campusSummary.campus_days_autonomy, " ", _jsx("span", { style: { fontSize: '0.8rem', color: '#718096', fontWeight: '400' }, children: "days" })] })] }), _jsxs("div", { style: { backgroundColor: '#F6F8FA', padding: '14px', borderRadius: '8px', border: '1px solid #E7EDF1' }, children: [_jsx("div", { style: { fontSize: '0.74rem', color: '#718096' }, children: "Total Water Reserve" }), _jsxs("div", { style: { fontSize: '1.35rem', fontWeight: '700', color: '#29465B', marginTop: '2px' }, children: [(campusSummary.total_storage_liters / 1000).toLocaleString(), " ", _jsx("span", { style: { fontSize: '0.8rem', color: '#718096', fontWeight: '400' }, children: "m\u00B3" })] })] }), _jsxs("div", { style: { backgroundColor: '#F6F8FA', padding: '14px', borderRadius: '8px', border: '1px solid #E7EDF1' }, children: [_jsx("div", { style: { fontSize: '0.74rem', color: '#718096' }, children: "Central Reservoir Level" }), _jsxs("div", { style: { fontSize: '1.35rem', fontWeight: '700', color: '#5C9992', marginTop: '2px' }, children: [campusSummary.central_reservoir_pct, "%"] })] })] })] })), forecastData && (_jsxs("div", { style: {
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    padding: '22px 24px',
                    border: '1px solid #E7EDF1',
                    boxShadow: '0 1px 3px rgba(41, 56, 69, 0.03)',
                }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }, children: [_jsx(BarChart2, { size: 18, color: "#5C9992" }), _jsx("h2", { style: { fontSize: '1.02rem', fontWeight: '700', color: '#29465B', margin: 0 }, children: "24-Hour Facility Demand Forecasts (Gradient Boosting Regressors)" })] }), _jsx("div", { style: { overflowX: 'auto' }, children: _jsxs("table", { style: { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', color: '#293845' }, children: [_jsx("thead", { children: _jsxs("tr", { style: { backgroundColor: '#F6F8FA', borderBottom: '1px solid #E7EDF1', textAlign: 'left', color: '#718096' }, children: [_jsx("th", { style: { padding: '12px 14px', fontWeight: '600' }, children: "Facility / Zone" }), _jsx("th", { style: { padding: '12px 14px', fontWeight: '600' }, children: "Category" }), _jsx("th", { style: { padding: '12px 14px', fontWeight: '600' }, children: "24h Forecast Demand" }), _jsx("th", { style: { padding: '12px 14px', fontWeight: '600' }, children: "Expected Peak" }), _jsx("th", { style: { padding: '12px 14px', fontWeight: '600' }, children: "Shortage Risk Status" })] }) }), _jsx("tbody", { children: buildings.map((b) => {
                                        const bHourly = forecastData.building_forecasts?.[b.building_id] || [];
                                        const total24h = bHourly.reduce((acc, val) => acc + val, 0);
                                        const maxPeak = Math.max(...(bHourly.length ? bHourly : [0]));
                                        const peakIndex = bHourly.indexOf(maxPeak);
                                        const riskObj = buildingRisks.find((r) => r.building_id === b.building_id);
                                        return (_jsxs("tr", { style: { borderBottom: '1px solid #F0F4F8' }, children: [_jsx("td", { style: { padding: '12px 14px', fontWeight: '600', color: '#29465B' }, children: b.building_name }), _jsx("td", { style: { padding: '12px 14px', color: '#718096' }, children: b.category }), _jsxs("td", { style: { padding: '12px 14px', color: '#29465B', fontWeight: '600' }, children: [total24h.toLocaleString(undefined, { maximumFractionDigits: 0 }), " Liters"] }), _jsx("td", { style: { padding: '12px 14px', color: '#718096' }, children: peakIndex >= 0 ? `+${peakIndex + 1}h (${maxPeak.toFixed(0)} L/h)` : 'Nominal' }), _jsx("td", { style: { padding: '12px 14px' }, children: _jsx("span", { style: {
                                                            fontSize: '0.72rem',
                                                            padding: '3px 8px',
                                                            borderRadius: '5px',
                                                            fontWeight: '600',
                                                            backgroundColor: riskObj?.risk_tier === 'High Risk' ? '#FDF2F2' : (riskObj?.risk_tier === 'Medium Risk' ? '#FDF8EE' : '#EBF5F0'),
                                                            color: riskObj?.risk_tier === 'High Risk' ? '#C16D6D' : (riskObj?.risk_tier === 'Medium Risk' ? '#C39755' : '#54856D'),
                                                            border: `1px solid ${riskObj?.risk_tier === 'High Risk' ? '#F5D5D5' : (riskObj?.risk_tier === 'Medium Risk' ? '#F4E3C8' : '#D2E8DD')}`,
                                                        }, children: riskObj?.risk_tier || 'Low Risk' }) })] }, b.building_id));
                                    }) })] }) })] })), _jsxs("div", { style: {
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    padding: '20px 24px',
                    border: '1px solid #E7EDF1',
                    boxShadow: '0 1px 3px rgba(41, 56, 69, 0.02)',
                }, children: [_jsx("h3", { style: { fontSize: '0.94rem', fontWeight: '700', color: '#29465B', margin: '0 0 14px 0' }, children: "AI Model Architecture & Verification Benchmarks" }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', fontSize: '0.82rem' }, children: [_jsxs("div", { style: { backgroundColor: '#F6F8FA', padding: '14px 16px', borderRadius: '8px', border: '1px solid #E7EDF1' }, children: [_jsx("div", { style: { color: '#29465B', fontWeight: '700', marginBottom: '3px' }, children: "Anomaly Detection (Isolation Forest)" }), _jsx("div", { style: { color: '#718096' }, children: "150 estimators \u2022 Contamination $c=0.035$" }), _jsx("div", { style: { color: '#718096', fontSize: '0.76rem', marginTop: '4px' }, children: "Coupled with hydraulic rule consensus to eliminate false alarms." })] }), _jsxs("div", { style: { backgroundColor: '#F6F8FA', padding: '14px 16px', borderRadius: '8px', border: '1px solid #E7EDF1' }, children: [_jsx("div", { style: { color: '#29465B', fontWeight: '700', marginBottom: '3px' }, children: "Leak Severity Classifier (Random Forest)" }), _jsx("div", { style: { color: '#718096' }, children: "180 trees \u2022 Balanced class weighting" }), _jsx("div", { style: { color: '#718096', fontSize: '0.76rem', marginTop: '4px' }, children: "100% precision on major pipeline ruptures; zero false alarms." })] }), _jsxs("div", { style: { backgroundColor: '#F6F8FA', padding: '14px 16px', borderRadius: '8px', border: '1px solid #E7EDF1' }, children: [_jsx("div", { style: { color: '#29465B', fontWeight: '700', marginBottom: '3px' }, children: "Demand Forecaster (Gradient Boosting)" }), _jsx("div", { style: { color: '#718096' }, children: "Campus MAE: 81.5 L/h \u2022 Rolling 24h: 82.2 L/h" }), _jsx("div", { style: { color: '#718096', fontSize: '0.76rem', marginTop: '4px' }, children: "Beats Naive Persistence by 72.7% across weekly schedule transitions." })] })] })] })] }));
};
