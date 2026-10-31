import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle } from 'lucide-react';
import { api } from '../services/api';
export const OptimizationPage = () => {
    const [supplyLiters, setSupplyLiters] = useState(210000);
    const [allocation, setAllocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [approvedMsg, setApprovedMsg] = useState(null);
    const fetchAllocation = async (supply) => {
        setLoading(true);
        try {
            const res = await api.getAllocation(supply);
            setAllocation(res);
            setApprovedMsg(null);
        }
        catch (err) {
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchAllocation(supplyLiters);
    }, []);
    const handleApprove = async () => {
        if (!allocation)
            return;
        try {
            const res = await api.approveAllocation(allocation);
            setApprovedMsg(res.message);
        }
        catch (err) {
            alert(`Approval error: ${err.message}`);
        }
    };
    return (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '24px' }, children: [_jsxs("div", { children: [_jsx("h1", { style: { fontSize: '1.45rem', fontWeight: '700', color: '#29465B', margin: 0, letterSpacing: '-0.01em' }, children: "Fair Water Allocation & Supply Optimization" }), _jsx("p", { style: { fontSize: '0.86rem', color: '#718096', margin: '4px 0 0 0' }, children: "Constrained linear programming optimizer safeguarding vulnerable residential populations and essential lab processes." })] }), _jsxs("div", { style: {
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    padding: '22px 24px',
                    border: '1px solid #E7EDF1',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    boxShadow: '0 1px 3px rgba(41, 56, 69, 0.02)',
                }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsxs("div", { children: [_jsx("label", { style: { fontSize: '0.94rem', fontWeight: '700', color: '#29465B' }, children: "Simulated Daily Campus Municipal Inflow" }), _jsx("p", { style: { fontSize: '0.8rem', color: '#718096', margin: '2px 0 0 0' }, children: "Slide to stress-test ethical water rationing under municipal curtailment or regional drought." })] }), _jsxs("div", { style: { fontSize: '1.4rem', fontWeight: '700', color: '#29465B' }, children: [supplyLiters.toLocaleString(), " ", _jsx("span", { style: { fontSize: '0.82rem', color: '#718096', fontWeight: '400' }, children: "L/day" })] })] }), _jsx("input", { type: "range", min: 120000, max: 260000, step: 5000, value: supplyLiters, onChange: (e) => {
                            const val = Number(e.target.value);
                            setSupplyLiters(val);
                            fetchAllocation(val);
                        }, style: { width: '100%', cursor: 'pointer', accentColor: '#5C9992' } }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#718096' }, children: [_jsx("span", { children: "120,000 L (Severe Drought Deficit)" }), _jsx("span", { children: "180,000 L (Moderate Deficit)" }), _jsx("span", { children: "240,000 L (Nominal Full Campus Supply)" })] })] }), _jsxs("div", { style: {
                    backgroundColor: '#EBF5F0',
                    border: '1px solid #D2E8DD',
                    borderRadius: '10px',
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    color: '#293845',
                    fontSize: '0.84rem',
                }, children: [_jsx(ShieldCheck, { size: 22, color: "#54856D", style: { flexShrink: 0 } }), _jsxs("div", { children: [_jsx("strong", { style: { color: '#54856D' }, children: "Responsible AI Guardrail Active:" }), " Hostels (Student Residential Welfare) and Research Laboratories maintain hard essential floors. Non-essential landscape irrigation is curtailed first during deficits. Autonomous supply restrictions require human operator approval."] })] }), approvedMsg && (_jsxs("div", { style: {
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
                }, children: [_jsx(CheckCircle, { size: 16, color: "#54856D" }), _jsx("span", { children: approvedMsg })] })), allocation && (_jsxs("div", { style: {
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E7EDF1',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(41, 56, 69, 0.02)',
                }, children: [_jsxs("div", { style: {
                            padding: '16px 20px',
                            backgroundColor: '#F6F8FA',
                            borderBottom: '1px solid #E7EDF1',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '12px',
                        }, children: [_jsxs("div", { style: { fontSize: '0.9rem', fontWeight: '600', color: '#29465B' }, children: ["SciPy Linear Optimization Plan (", allocation.feasibility_status, ") \u2022 Campus Demand Satisfied: ", _jsxs("strong", { style: { color: '#54856D' }, children: [allocation.campus_satisfaction_pct, "%"] })] }), _jsxs("button", { onClick: handleApprove, style: {
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
                                }, onMouseEnter: (e) => (e.currentTarget.style.backgroundColor = '#1F3545'), onMouseLeave: (e) => (e.currentTarget.style.backgroundColor = '#29465B'), children: [_jsx(CheckCircle, { size: 14 }), _jsx("span", { children: "Approve Distribution Plan" })] })] }), _jsxs("table", { style: { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', color: '#293845' }, children: [_jsx("thead", { children: _jsxs("tr", { style: { backgroundColor: '#F6F8FA', borderBottom: '1px solid #E7EDF1', textAlign: 'left', color: '#718096' }, children: [_jsx("th", { style: { padding: '12px 16px', fontWeight: '600' }, children: "Facility / Zone" }), _jsx("th", { style: { padding: '12px 16px', fontWeight: '600' }, children: "Category" }), _jsx("th", { style: { padding: '12px 16px', fontWeight: '600' }, children: "Predicted Demand" }), _jsx("th", { style: { padding: '12px 16px', fontWeight: '600' }, children: "Allocated Supply" }), _jsx("th", { style: { padding: '12px 16px', fontWeight: '600' }, children: "Curtailment" }), _jsx("th", { style: { padding: '12px 16px', fontWeight: '600' }, children: "Demand Met (%)" }), _jsx("th", { style: { padding: '12px 16px', fontWeight: '600', minWidth: '180px' }, children: "Protection Tier" })] }) }), _jsx("tbody", { children: allocation.allocations.map((a) => (_jsxs("tr", { style: { borderBottom: '1px solid #F0F4F8' }, children: [_jsx("td", { style: { padding: '12px 16px', fontWeight: '600', color: '#29465B' }, children: a.building_name }), _jsx("td", { style: { padding: '12px 16px', color: '#718096' }, children: a.category }), _jsxs("td", { style: { padding: '12px 16px' }, children: [a.predicted_demand_liters.toLocaleString(), " L"] }), _jsxs("td", { style: { padding: '12px 16px', color: '#29465B', fontWeight: '600' }, children: [a.allocated_supply_liters.toLocaleString(), " L"] }), _jsx("td", { style: { padding: '12px 16px', color: a.curtailment_liters > 0 ? '#C16D6D' : '#718096' }, children: a.curtailment_liters > 0 ? `-${a.curtailment_liters.toLocaleString()} L` : '0 L' }), _jsx("td", { style: { padding: '12px 16px' }, children: _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsx("div", { style: { width: '60px', height: '6px', backgroundColor: '#E8F0F7', borderRadius: '3px', overflow: 'hidden' }, children: _jsx("div", { style: {
                                                                width: `${a.demand_satisfied_pct}%`,
                                                                height: '100%',
                                                                backgroundColor: a.demand_satisfied_pct > 80 ? '#54856D' : (a.demand_satisfied_pct > 50 ? '#C39755' : '#C16D6D'),
                                                            } }) }), _jsxs("strong", { style: { color: '#293845' }, children: [a.demand_satisfied_pct, "%"] })] }) }), _jsx("td", { style: { padding: '12px 16px', whiteSpace: 'nowrap' }, children: a.is_vulnerable ? (_jsx("span", { style: { fontSize: '0.74rem', backgroundColor: '#FEF3C7', color: '#92400E', padding: '5px 12px', borderRadius: '6px', fontWeight: '600', border: '1px solid #FCD34D', display: 'inline-block', whiteSpace: 'nowrap' }, children: "Vulnerable (Hostel)" })) : (a.is_essential ? (_jsx("span", { style: { fontSize: '0.74rem', backgroundColor: '#DBEAFE', color: '#1E40AF', padding: '5px 12px', borderRadius: '6px', fontWeight: '600', border: '1px solid #93C5FD', display: 'inline-block', whiteSpace: 'nowrap' }, children: "Essential Service" })) : (_jsx("span", { style: { fontSize: '0.74rem', backgroundColor: '#F1F5F9', color: '#475569', padding: '5px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', display: 'inline-block', fontWeight: '500', whiteSpace: 'nowrap' }, children: "Curtailable" }))) })] }, a.building_id))) })] })] }))] }));
};
