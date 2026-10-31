import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Play, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
export const ScenarioSimulatorPage = ({ buildings }) => {
    const [scenarioType, setScenarioType] = useState('moderate_leak');
    const [targetBuilding, setTargetBuilding] = useState('hostel_a');
    const [supplyReduction, setSupplyReduction] = useState(30);
    const [tempDelta, setTempDelta] = useState(5);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const handleRun = async () => {
        setLoading(true);
        try {
            const res = await api.simulateScenario(scenarioType, targetBuilding, supplyReduction, tempDelta);
            setResult(res);
        }
        catch (err) {
            alert(`Simulation error: ${err.message}`);
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '24px' }, children: [_jsxs("div", { children: [_jsx("h1", { style: { fontSize: '1.45rem', fontWeight: '700', color: '#29465B', margin: 0, letterSpacing: '-0.01em' }, children: "What-If Resilience Scenario Simulator" }), _jsx("p", { style: { fontSize: '0.86rem', color: '#718096', margin: '4px 0 0 0' }, children: "Evaluate the resilience impact of pipeline ruptures, municipal droughts, and weather shocks on campus storage autonomy." })] }), _jsxs("div", { style: {
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    padding: '22px 24px',
                    border: '1px solid #E7EDF1',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    boxShadow: '0 1px 3px rgba(41, 56, 69, 0.02)',
                }, children: [_jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }, children: [_jsxs("div", { children: [_jsx("label", { style: { display: 'block', fontSize: '0.78rem', fontWeight: '600', color: '#718096', marginBottom: '6px' }, children: "Select Hypothetical Scenario" }), _jsxs("select", { value: scenarioType, onChange: (e) => setScenarioType(e.target.value), style: {
                                            backgroundColor: '#FFFFFF',
                                            color: '#293845',
                                            border: '1px solid #E7EDF1',
                                            borderRadius: '8px',
                                            padding: '9px 12px',
                                            fontSize: '0.85rem',
                                            width: '100%',
                                            outline: 'none',
                                        }, children: [_jsx("option", { value: "moderate_leak", children: "Moderate Pipe Leak (~18.5 LPM loss)" }), _jsx("option", { value: "major_leak", children: "Major Main Line Burst (~55.0 LPM loss)" }), _jsx("option", { value: "supply_cut", children: "Municipal Supply Curtailment (-40%)" }), _jsx("option", { value: "drought_heatwave", children: "37\u00B0C Drought & Heatwave (Evaporative Peak)" }), _jsx("option", { value: "heavy_rain", children: "Heavy Monsoon Downpour (+Harvesting)" }), _jsx("option", { value: "repaired_leak", children: "Simulate Immediate Pipe Repair" })] })] }), (scenarioType === 'moderate_leak' || scenarioType === 'major_leak' || scenarioType === 'repaired_leak') && (_jsxs("div", { children: [_jsx("label", { style: { display: 'block', fontSize: '0.78rem', fontWeight: '600', color: '#718096', marginBottom: '6px' }, children: "Affected Facility" }), _jsx("select", { value: targetBuilding, onChange: (e) => setTargetBuilding(e.target.value), style: {
                                            backgroundColor: '#FFFFFF',
                                            color: '#293845',
                                            border: '1px solid #E7EDF1',
                                            borderRadius: '8px',
                                            padding: '9px 12px',
                                            fontSize: '0.85rem',
                                            width: '100%',
                                            outline: 'none',
                                        }, children: buildings.map((b) => (_jsxs("option", { value: b.building_id, children: [b.building_name, " (", b.category, ")"] }, b.building_id))) })] })), scenarioType === 'supply_cut' && (_jsxs("div", { children: [_jsxs("label", { style: { display: 'block', fontSize: '0.78rem', fontWeight: '600', color: '#718096', marginBottom: '6px' }, children: ["Municipal Supply Reduction (", supplyReduction, "%)"] }), _jsx("input", { type: "range", min: 10, max: 70, value: supplyReduction, onChange: (e) => setSupplyReduction(Number(e.target.value)), style: { width: '100%', cursor: 'pointer', accentColor: '#5C9992' } })] }))] }), _jsxs("button", { onClick: handleRun, disabled: loading, style: {
                            backgroundColor: '#29465B',
                            color: '#FFFFFF',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            fontWeight: '600',
                            fontSize: '0.85rem',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            marginTop: '6px',
                            width: 'fit-content',
                            transition: 'background-color 0.15s ease',
                        }, onMouseEnter: (e) => {
                            if (!loading)
                                e.currentTarget.style.backgroundColor = '#1F3545';
                        }, onMouseLeave: (e) => {
                            if (!loading)
                                e.currentTarget.style.backgroundColor = '#29465B';
                        }, children: [_jsx(Play, { size: 14, fill: "#FFFFFF" }), _jsx("span", { children: loading ? 'Simulating Dynamic Scenario...' : 'Execute What-If Projection' })] })] }), result && (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '20px' }, children: [_jsxs("div", { style: {
                            fontSize: '0.78rem',
                            color: '#C39755',
                            backgroundColor: '#FDF8EE',
                            padding: '10px 16px',
                            borderRadius: '8px',
                            border: '1px solid #F4E3C8',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }, children: [_jsx(AlertTriangle, { size: 15, color: "#C39755" }), _jsxs("span", { children: [_jsx("strong", { children: "PROJECTION ESTIMATE:" }), " Values below reflect model scenario estimates, not physical real-time measurements."] })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }, children: [_jsxs("div", { style: {
                                    backgroundColor: '#FFFFFF',
                                    borderRadius: '12px',
                                    padding: '22px',
                                    border: '1px solid #E7EDF1',
                                    boxShadow: '0 1px 3px rgba(41, 56, 69, 0.02)',
                                }, children: [_jsx("div", { style: { fontSize: '0.82rem', color: '#718096', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.03em', marginBottom: '14px' }, children: "Normal Baseline Conditions" }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.88rem' }, children: [_jsxs("div", { children: [_jsx("span", { style: { color: '#718096' }, children: "Daily Campus Demand:" }), ' ', _jsxs("strong", { style: { color: '#293845' }, children: [result.baseline.daily_demand_liters.toLocaleString(), " Liters"] })] }), _jsxs("div", { children: [_jsx("span", { style: { color: '#718096' }, children: "Daily Supply Inflow:" }), ' ', _jsxs("strong", { style: { color: '#293845' }, children: [result.baseline.daily_supply_liters.toLocaleString(), " Liters"] })] }), _jsxs("div", { children: [_jsx("span", { style: { color: '#718096' }, children: "Storage Autonomy:" }), ' ', _jsxs("strong", { style: { color: '#54856D' }, children: [result.baseline.days_autonomy, " days"] })] }), _jsxs("div", { children: [_jsx("span", { style: { color: '#718096' }, children: "Shortage Risk:" }), ' ', _jsx("span", { style: { color: '#54856D', fontWeight: '600' }, children: "Low Risk" })] })] })] }), _jsxs("div", { style: {
                                    backgroundColor: '#FFFFFF',
                                    borderRadius: '12px',
                                    padding: '22px',
                                    border: result.scenario.shortage_risk === 'High Risk' ? '1px solid #F5D5D5' : '1px solid #DCE4EC',
                                    boxShadow: '0 1px 3px rgba(41, 56, 69, 0.02)',
                                }, children: [_jsx("div", { style: { fontSize: '0.82rem', color: '#29465B', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.03em', marginBottom: '14px' }, children: "Simulated Scenario Projection" }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.88rem' }, children: [_jsxs("div", { children: [_jsx("span", { style: { color: '#718096' }, children: "Projected Demand:" }), ' ', _jsxs("strong", { style: { color: '#293845' }, children: [result.scenario.daily_demand_liters.toLocaleString(), " Liters"] }), result.scenario.demand_increase_liters > 0 && (_jsxs("span", { style: { color: '#C16D6D', fontSize: '0.8rem', marginLeft: '6px' }, children: ["(+", result.scenario.demand_increase_liters.toLocaleString(), " L)"] }))] }), _jsxs("div", { children: [_jsx("span", { style: { color: '#718096' }, children: "Projected Supply:" }), ' ', _jsxs("strong", { style: { color: '#293845' }, children: [result.scenario.daily_supply_liters.toLocaleString(), " Liters"] })] }), _jsxs("div", { children: [_jsx("span", { style: { color: '#718096' }, children: "Storage Autonomy:" }), ' ', _jsxs("strong", { style: { color: result.scenario.days_autonomy < 1.2 ? '#C16D6D' : '#C39755' }, children: [result.scenario.days_autonomy, " days"] })] }), _jsxs("div", { children: [_jsx("span", { style: { color: '#718096' }, children: "Shortage Risk:" }), ' ', _jsx("span", { style: {
                                                            color: result.scenario.shortage_risk === 'High Risk' ? '#C16D6D' : (result.scenario.shortage_risk === 'Medium Risk' ? '#C39755' : '#54856D'),
                                                            fontWeight: '600',
                                                        }, children: result.scenario.shortage_risk })] })] })] })] }), result.scenario_notes.length > 0 && (_jsxs("div", { style: { backgroundColor: '#F6F8FA', padding: '16px 18px', borderRadius: '8px', border: '1px solid #E7EDF1' }, children: [_jsx("div", { style: { fontSize: '0.78rem', color: '#718096', textTransform: 'uppercase', fontWeight: '700', marginBottom: '6px' }, children: "Scenario Analysis Insights:" }), _jsx("ul", { style: { margin: 0, paddingLeft: '20px', color: '#293845', fontSize: '0.84rem', lineHeight: '1.5' }, children: result.scenario_notes.map((note, idx) => (_jsx("li", { children: note }, idx))) })] }))] }))] }));
};
