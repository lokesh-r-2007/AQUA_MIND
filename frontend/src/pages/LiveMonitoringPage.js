import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { AlertTriangle, CheckCircle, Sliders, Users, Wrench, } from 'lucide-react';
export const LiveMonitoringPage = ({ latestReadings, buildings, onTriggerLeak, onStopLeak, onTriggerFault, activeLeaks, }) => {
    const [selectedBuilding, setSelectedBuilding] = useState('hostel_a');
    const [selectedSeverity, setSelectedSeverity] = useState('moderate');
    const [isActing, setIsActing] = useState(false);
    const [statusMsg, setStatusMsg] = useState(null);
    const handleTrigger = async () => {
        setIsActing(true);
        try {
            await onTriggerLeak(selectedBuilding, selectedSeverity);
            setStatusMsg(`Triggered ${selectedSeverity} pipe fissure in ${selectedBuilding}. Observing physical hydraulic reaction.`);
        }
        catch (err) {
            setStatusMsg(`Error: ${err.message}`);
        }
        finally {
            setIsActing(false);
        }
    };
    const handleStop = async (bid) => {
        setIsActing(true);
        try {
            await onStopLeak(bid);
            setStatusMsg(`Pipe fissure isolated and repaired in ${bid}. Baseline pressure and flow restored.`);
        }
        catch (err) {
            setStatusMsg(`Error: ${err.message}`);
        }
        finally {
            setIsActing(false);
        }
    };
    const handleFault = async () => {
        setIsActing(true);
        try {
            await onTriggerFault(selectedBuilding, 'sensor_drift');
            setStatusMsg(`Injected transducer drift in ${selectedBuilding}. Physical hydraulics remain nominal.`);
        }
        catch (err) {
            setStatusMsg(`Error: ${err.message}`);
        }
        finally {
            setIsActing(false);
        }
    };
    return (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '24px' }, children: [_jsxs("div", { children: [_jsx("h1", { style: { fontSize: '1.45rem', fontWeight: '700', color: '#29465B', margin: 0, letterSpacing: '-0.01em' }, children: "Live Telemetry & Simulation Controls" }), _jsx("p", { style: { fontSize: '0.86rem', color: '#718096', margin: '4px 0 0 0' }, children: "Continuous digital-twin monitoring with live anomaly injection capabilities for testing network resilience." })] }), _jsxs("div", { style: {
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E7EDF1',
                    padding: '22px 24px',
                    boxShadow: '0 1px 3px rgba(41, 56, 69, 0.03)',
                }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }, children: [_jsx("div", { style: {
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    backgroundColor: '#DCEFED',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }, children: _jsx(Sliders, { size: 16, color: "#29465B" }) }), _jsxs("div", { children: [_jsx("h2", { style: { fontSize: '1.02rem', fontWeight: '700', color: '#29465B', margin: 0 }, children: "Physical Network Simulation & Anomaly Injector" }), _jsx("div", { style: { fontSize: '0.78rem', color: '#718096' }, children: "Simulate pipe wall ruptures or instrumentation drift to evaluate AI detection and decision support." })] })] }), statusMsg && (_jsxs("div", { style: {
                            backgroundColor: '#EBF5F0',
                            color: '#54856D',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            fontSize: '0.84rem',
                            marginBottom: '16px',
                            border: '1px solid #D2E8DD',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }, children: [_jsx(CheckCircle, { size: 15, color: "#54856D" }), _jsx("span", { children: statusMsg })] })), _jsxs("div", { style: { display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }, children: [_jsxs("div", { style: { minWidth: '220px', flex: '1 1 200px' }, children: [_jsx("label", { style: { display: 'block', fontSize: '0.78rem', fontWeight: '600', color: '#718096', marginBottom: '6px' }, children: "Target Facility" }), _jsx("select", { value: selectedBuilding, onChange: (e) => setSelectedBuilding(e.target.value), style: {
                                            backgroundColor: '#FFFFFF',
                                            color: '#293845',
                                            border: '1px solid #E7EDF1',
                                            borderRadius: '8px',
                                            padding: '9px 12px',
                                            fontSize: '0.85rem',
                                            width: '100%',
                                            outline: 'none',
                                        }, children: buildings.map((b) => (_jsxs("option", { value: b.building_id, children: [b.building_name, " (", b.category, ")"] }, b.building_id))) })] }), _jsxs("div", { style: { minWidth: '260px', flex: '1 1 240px' }, children: [_jsx("label", { style: { display: 'block', fontSize: '0.78rem', fontWeight: '600', color: '#718096', marginBottom: '6px' }, children: "Leak Severity Tier" }), _jsxs("select", { value: selectedSeverity, onChange: (e) => setSelectedSeverity(e.target.value), style: {
                                            backgroundColor: '#FFFFFF',
                                            color: '#293845',
                                            border: '1px solid #E7EDF1',
                                            borderRadius: '8px',
                                            padding: '9px 12px',
                                            fontSize: '0.85rem',
                                            width: '100%',
                                            outline: 'none',
                                        }, children: [_jsx("option", { value: "minor", children: "Minor Fixture Weepage (~3.5 LPM / 210 L/h)" }), _jsx("option", { value: "moderate", children: "Moderate Main Line Fissure (~18.5 LPM / 1,110 L/h)" }), _jsx("option", { value: "major", children: "Major Pipeline Catastrophic Burst (~55.0 LPM / 3,300 L/h)" })] })] }), _jsxs("div", { style: { display: 'flex', gap: '10px', flexWrap: 'wrap' }, children: [_jsxs("button", { onClick: handleTrigger, disabled: isActing, style: {
                                            backgroundColor: '#C16D6D',
                                            color: '#FFFFFF',
                                            border: 'none',
                                            padding: '9px 16px',
                                            borderRadius: '8px',
                                            fontWeight: '600',
                                            cursor: isActing ? 'not-allowed' : 'pointer',
                                            fontSize: '0.84rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            opacity: isActing ? 0.65 : 1,
                                            transition: 'background-color 0.15s ease',
                                        }, onMouseEnter: (e) => {
                                            if (!isActing)
                                                e.currentTarget.style.backgroundColor = '#B05B5B';
                                        }, onMouseLeave: (e) => {
                                            if (!isActing)
                                                e.currentTarget.style.backgroundColor = '#C16D6D';
                                        }, children: [_jsx(AlertTriangle, { size: 14 }), _jsx("span", { children: "Inject Pipe Leak" })] }), _jsx("button", { onClick: handleFault, disabled: isActing, style: {
                                            backgroundColor: '#FFFFFF',
                                            color: '#C39755',
                                            border: '1px solid #F4E3C8',
                                            padding: '9px 16px',
                                            borderRadius: '8px',
                                            fontWeight: '600',
                                            cursor: isActing ? 'not-allowed' : 'pointer',
                                            fontSize: '0.84rem',
                                            opacity: isActing ? 0.65 : 1,
                                            transition: 'background-color 0.15s ease',
                                        }, onMouseEnter: (e) => {
                                            if (!isActing)
                                                e.currentTarget.style.backgroundColor = '#FDF8EE';
                                        }, onMouseLeave: (e) => {
                                            if (!isActing)
                                                e.currentTarget.style.backgroundColor = '#FFFFFF';
                                        }, children: _jsx("span", { children: "Inject Sensor Drift" }) }), _jsxs("button", { onClick: () => handleStop(selectedBuilding), disabled: isActing, style: {
                                            backgroundColor: '#5C9992',
                                            color: '#FFFFFF',
                                            border: 'none',
                                            padding: '9px 16px',
                                            borderRadius: '8px',
                                            fontWeight: '600',
                                            cursor: isActing ? 'not-allowed' : 'pointer',
                                            fontSize: '0.84rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            opacity: isActing ? 0.65 : 1,
                                            transition: 'background-color 0.15s ease',
                                        }, onMouseEnter: (e) => {
                                            if (!isActing)
                                                e.currentTarget.style.backgroundColor = '#4A807A';
                                        }, onMouseLeave: (e) => {
                                            if (!isActing)
                                                e.currentTarget.style.backgroundColor = '#5C9992';
                                        }, children: [_jsx(CheckCircle, { size: 14 }), _jsx("span", { children: "Repair & Restore" })] })] })] })] }), _jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: '18px' }, children: latestReadings.map((b) => {
                    const isLeaking = activeLeaks.some((l) => l.building_id === b.building_id);
                    const leakInfo = activeLeaks.find((l) => l.building_id === b.building_id);
                    return (_jsxs("div", { style: {
                            backgroundColor: '#FFFFFF',
                            borderRadius: '12px',
                            border: isLeaking ? '1px solid #F5D5D5' : '1px solid #E7EDF1',
                            padding: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                            boxShadow: isLeaking ? '0 1px 4px rgba(193, 109, 109, 0.08)' : '0 1px 3px rgba(41, 56, 69, 0.02)',
                        }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }, children: [_jsxs("div", { children: [_jsx("h3", { style: { fontSize: '1.02rem', fontWeight: '700', color: '#29465B', margin: 0 }, children: b.building_name }), _jsxs("div", { style: { fontSize: '0.78rem', color: '#718096', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }, children: [_jsx(Users, { size: 13, color: "#718096" }), _jsxs("span", { children: ["Occupancy: ", b.occupancy, " occupants"] })] })] }), _jsx("span", { style: {
                                            padding: '3px 9px',
                                            borderRadius: '6px',
                                            fontSize: '0.72rem',
                                            fontWeight: '600',
                                            backgroundColor: isLeaking ? '#FDF2F2' : '#EBF5F0',
                                            color: isLeaking ? '#C16D6D' : '#54856D',
                                            border: `1px solid ${isLeaking ? '#F5D5D5' : '#D2E8DD'}`,
                                            textTransform: 'uppercase',
                                        }, children: isLeaking ? `${leakInfo.severity} Leak Active` : 'Nominal' })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }, children: [_jsxs("div", { style: { backgroundColor: '#F6F8FA', padding: '12px', borderRadius: '8px', border: '1px solid #E7EDF1' }, children: [_jsx("div", { style: { fontSize: '0.74rem', color: '#718096' }, children: "Pipeline Flow" }), _jsxs("div", { style: { fontSize: '1.25rem', fontWeight: '700', color: isLeaking ? '#C16D6D' : '#29465B', marginTop: '2px' }, children: [b.flow_rate_lpm.toFixed(1), " ", _jsx("span", { style: { fontSize: '0.75rem', color: '#718096', fontWeight: '400' }, children: "LPM" })] })] }), _jsxs("div", { style: { backgroundColor: '#F6F8FA', padding: '12px', borderRadius: '8px', border: '1px solid #E7EDF1' }, children: [_jsx("div", { style: { fontSize: '0.74rem', color: '#718096' }, children: "Line Pressure" }), _jsxs("div", { style: { fontSize: '1.25rem', fontWeight: '700', color: b.pressure_bar < 2.5 ? '#C16D6D' : '#54856D', marginTop: '2px' }, children: [b.pressure_bar.toFixed(2), " ", _jsx("span", { style: { fontSize: '0.75rem', color: '#718096', fontWeight: '400' }, children: "bar" })] })] }), _jsxs("div", { style: { backgroundColor: '#F6F8FA', padding: '12px', borderRadius: '8px', border: '1px solid #E7EDF1' }, children: [_jsx("div", { style: { fontSize: '0.74rem', color: '#718096' }, children: "Night Minimum Flow" }), _jsxs("div", { style: { fontSize: '1.25rem', fontWeight: '700', color: b.night_flow_lpm > 10.0 ? '#C39755' : '#29465B', marginTop: '2px' }, children: [b.night_flow_lpm.toFixed(1), " ", _jsx("span", { style: { fontSize: '0.75rem', color: '#718096', fontWeight: '400' }, children: "LPM" })] })] }), _jsxs("div", { style: { backgroundColor: '#F6F8FA', padding: '12px', borderRadius: '8px', border: '1px solid #E7EDF1' }, children: [_jsx("div", { style: { fontSize: '0.74rem', color: '#718096' }, children: "Hourly Volume" }), _jsxs("div", { style: { fontSize: '1.25rem', fontWeight: '700', color: '#29465B', marginTop: '2px' }, children: [b.water_consumption_liters.toLocaleString(), " ", _jsx("span", { style: { fontSize: '0.75rem', color: '#718096', fontWeight: '400' }, children: "L" })] })] })] }), _jsxs("div", { children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: '#718096', marginBottom: '5px' }, children: [_jsx("span", { children: "Overhead Tank Capacity" }), _jsxs("strong", { style: { color: '#29465B' }, children: [b.tank_level_percent.toFixed(1), "%"] })] }), _jsx("div", { style: { height: '7px', backgroundColor: '#E8F0F7', borderRadius: '4px', overflow: 'hidden' }, children: _jsx("div", { style: {
                                                height: '100%',
                                                width: `${Math.min(100, Math.max(0, b.tank_level_percent))}%`,
                                                backgroundColor: b.tank_level_percent < 30 ? '#C16D6D' : (b.tank_level_percent < 55 ? '#C39755' : '#5C9992'),
                                                borderRadius: '4px',
                                                transition: 'width 0.3s ease',
                                            } }) })] }), isLeaking && (_jsxs("button", { onClick: () => handleStop(b.building_id), style: {
                                    backgroundColor: '#5C9992',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    padding: '8px 14px',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    fontSize: '0.82rem',
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    transition: 'background-color 0.15s ease',
                                }, onMouseEnter: (e) => (e.currentTarget.style.backgroundColor = '#4A807A'), onMouseLeave: (e) => (e.currentTarget.style.backgroundColor = '#5C9992'), children: [_jsx(Wrench, { size: 14 }), _jsx("span", { children: "Isolate Fissure & Restore Flow" })] }))] }, b.building_id));
                }) })] }));
};
