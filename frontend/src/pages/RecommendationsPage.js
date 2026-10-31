import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Clock, CheckCircle, Wrench, ChevronDown, ChevronUp, } from 'lucide-react';
export const RecommendationsPage = ({ recommendations, onApprove, onReject, onProgress, onResolve, }) => {
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [expandedId, setExpandedId] = useState(null);
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const filteredRecs = recommendations.filter((r) => {
        if (filterStatus === 'ALL')
            return true;
        if (filterStatus === 'ACTIVE')
            return ['Detected', 'Under Review', 'In Progress', 'Approved'].includes(r.approval_status);
        if (filterStatus === 'RESOLVED')
            return r.approval_status === 'Impact Measured' || r.approval_status === 'Resolved';
        return r.approval_status === filterStatus;
    });
    const handleAction = async (actionFn, id) => {
        setActionLoadingId(id);
        try {
            await actionFn();
        }
        catch (err) {
            alert(`Action error: ${err.message}`);
        }
        finally {
            setActionLoadingId(null);
        }
    };
    const getPriorityBadge = (priority) => {
        if (priority === 'P1') {
            return {
                bg: '#FDF2F2',
                color: '#C16D6D',
                border: '#F5D5D5',
                label: 'P1 — CRITICAL',
            };
        }
        else if (priority === 'P2') {
            return {
                bg: '#FDF8EE',
                color: '#C39755',
                border: '#F4E3C8',
                label: 'P2 — HIGH',
            };
        }
        else {
            return {
                bg: '#E8F0F7',
                color: '#29465B',
                border: '#DCE4EC',
                label: 'P3 — MODERATE',
            };
        }
    };
    const getStatusBadge = (status) => {
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
    return (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '24px' }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }, children: [_jsxs("div", { children: [_jsx("h1", { style: { fontSize: '1.45rem', fontWeight: '700', color: '#29465B', margin: 0, letterSpacing: '-0.01em' }, children: "Decision Intelligence & Human Approvals" }), _jsx("p", { style: { fontSize: '0.86rem', color: '#718096', margin: '4px 0 0 0' }, children: "Evidence-based operational actions synthesized from hydraulic telemetry and supervised ML inference." })] }), _jsx("div", { style: { display: 'flex', gap: '8px' }, children: ['ALL', 'ACTIVE', 'Approved', 'In Progress', 'RESOLVED'].map((status) => (_jsx("button", { onClick: () => setFilterStatus(status), style: {
                                backgroundColor: filterStatus === status ? '#E8F0F7' : '#FFFFFF',
                                color: filterStatus === status ? '#29465B' : '#718096',
                                border: `1px solid ${filterStatus === status ? '#DCE4EC' : '#E7EDF1'}`,
                                padding: '6px 14px',
                                borderRadius: '8px',
                                fontSize: '0.82rem',
                                fontWeight: filterStatus === status ? '600' : '500',
                                cursor: 'pointer',
                                transition: 'background-color 0.12s ease',
                            }, onMouseEnter: (e) => {
                                if (filterStatus !== status)
                                    e.currentTarget.style.backgroundColor = '#F6F8FA';
                            }, onMouseLeave: (e) => {
                                if (filterStatus !== status)
                                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                            }, children: status }, status))) })] }), filteredRecs.length === 0 ? (_jsxs("div", { style: {
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    padding: '48px 24px',
                    textAlign: 'center',
                    color: '#718096',
                    border: '1px solid #E7EDF1',
                    boxShadow: '0 1px 3px rgba(41, 56, 69, 0.02)',
                }, children: [_jsx("div", { style: {
                            width: '44px',
                            height: '44px',
                            borderRadius: '10px',
                            backgroundColor: '#EBF5F0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 14px auto',
                        }, children: _jsx(CheckCircle, { size: 22, color: "#54856D" }) }), _jsx("div", { style: { fontSize: '1.02rem', fontWeight: '600', color: '#29465B' }, children: "No Pending Corrective Actions" }), _jsx("p", { style: { fontSize: '0.84rem', margin: '4px 0 0 0' }, children: "All campus facilities are currently operating within physical baselines." })] })) : (_jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '18px' }, children: filteredRecs.map((rec) => {
                    const pBadge = getPriorityBadge(rec.priority);
                    const sBadge = getStatusBadge(rec.approval_status);
                    const isExpanded = expandedId === rec.id;
                    const isLoading = actionLoadingId === rec.id;
                    return (_jsxs("div", { style: {
                            backgroundColor: '#FFFFFF',
                            borderRadius: '12px',
                            border: rec.priority === 'P1' ? '1px solid #F5D5D5' : '1px solid #E7EDF1',
                            padding: '22px 24px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                            boxShadow: '0 1px 3px rgba(41, 56, 69, 0.02)',
                        }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '10px' }, children: [_jsx("span", { style: {
                                                    backgroundColor: pBadge.bg,
                                                    color: pBadge.color,
                                                    border: `1px solid ${pBadge.border}`,
                                                    padding: '3px 9px',
                                                    borderRadius: '6px',
                                                    fontSize: '0.74rem',
                                                    fontWeight: '700',
                                                }, children: pBadge.label }), _jsx("span", { style: {
                                                    backgroundColor: sBadge.bg,
                                                    color: sBadge.color,
                                                    border: `1px solid ${sBadge.border}`,
                                                    padding: '3px 9px',
                                                    borderRadius: '6px',
                                                    fontSize: '0.74rem',
                                                    fontWeight: '600',
                                                }, children: rec.approval_status }), _jsxs("span", { style: { fontSize: '0.76rem', color: '#718096' }, children: ["Logged: ", rec.detection_timestamp] })] }), _jsxs("div", { style: { textAlign: 'right' }, children: [_jsxs("div", { style: { fontSize: '1.15rem', fontWeight: '700', color: '#C16D6D' }, children: [rec.estimated_daily_loss_liters.toLocaleString(), " L/day"] }), _jsxs("div", { style: { fontSize: '0.76rem', color: '#718096' }, children: ["Est. Financial Loss: \u20B9 ", rec.estimated_daily_cost_inr.toLocaleString(), "/day"] })] })] }), _jsxs("div", { children: [_jsx("h3", { style: { fontSize: '1.15rem', fontWeight: '700', color: '#29465B', margin: '0 0 6px 0' }, children: rec.problem }), _jsxs("div", { style: { fontSize: '0.84rem', color: '#718096', display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsxs("span", { children: ["Location: ", _jsx("strong", { style: { color: '#29465B' }, children: rec.building_name })] }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: ["Assigned Department: ", _jsx("strong", { style: { color: '#5C9992' }, children: rec.assigned_department })] }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: ["Risk Priority Score: ", _jsxs("strong", { style: { color: '#29465B' }, children: [rec.risk_score, " / 100"] })] })] })] }), _jsxs("div", { style: {
                                    backgroundColor: '#F6F8FA',
                                    border: '1px solid #E7EDF1',
                                    borderRadius: '8px',
                                    padding: '14px 16px',
                                }, children: [_jsx("div", { style: { fontSize: '0.74rem', color: '#5C9992', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.03em', marginBottom: '4px' }, children: "Recommended Maintenance Action" }), _jsx("div", { style: { fontSize: '0.9rem', color: '#293845', fontWeight: '600', lineHeight: '1.4' }, children: rec.recommended_action }), _jsxs("div", { style: { fontSize: '0.8rem', color: '#718096', marginTop: '6px' }, children: ["Target Outcome: ", rec.expected_outcome] })] }), _jsxs("div", { children: [_jsxs("button", { onClick: () => setExpandedId(isExpanded ? null : rec.id), style: {
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
                                        }, children: [_jsx("span", { children: isExpanded ? 'Hide Supporting Evidence' : 'Inspect 6 Verified Evidence Points & Baseline Telemetry' }), isExpanded ? _jsx(ChevronUp, { size: 14 }) : _jsx(ChevronDown, { size: 14 })] }), isExpanded && (_jsxs("div", { style: { marginTop: '12px', backgroundColor: '#F6F8FA', padding: '16px 18px', borderRadius: '8px', border: '1px solid #E7EDF1' }, children: [_jsx("div", { style: { fontSize: '0.76rem', color: '#718096', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }, children: "Physical Sensor Discrepancy & Diagnostic Indicators:" }), _jsx("ul", { style: { margin: 0, paddingLeft: '20px', color: '#293845', fontSize: '0.83rem', display: 'flex', flexDirection: 'column', gap: '6px' }, children: rec.evidence.map((ev, idx) => (_jsx("li", { children: ev }, idx))) }), _jsxs("div", { style: { marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #E7EDF1', display: 'flex', gap: '20px', fontSize: '0.78rem', color: '#718096' }, children: [_jsxs("div", { children: ["AI Detection: ", _jsx("strong", { style: { color: '#293845' }, children: rec.ai_prediction.display_label })] }), _jsxs("div", { children: ["Ensemble Confidence: ", _jsxs("strong", { style: { color: '#5C9992' }, children: [rec.ai_prediction.confidence_percent, "%"] })] }), _jsxs("div", { children: ["Root Cause: ", _jsx("strong", { style: { color: '#293845' }, children: rec.ai_prediction.anomaly_diagnosis })] })] })] }))] }), _jsxs("div", { style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    paddingTop: '14px',
                                    borderTop: '1px solid #E7EDF1',
                                    flexWrap: 'wrap',
                                    gap: '12px',
                                }, children: [_jsxs("div", { style: { fontSize: '0.82rem', color: '#718096', display: 'flex', alignItems: 'center', gap: '6px' }, children: [_jsx(Clock, { size: 14, color: "#718096" }), _jsxs("span", { children: ["Response Window: ", _jsx("strong", { style: { color: '#293845' }, children: rec.action_window })] })] }), _jsxs("div", { style: { display: 'flex', gap: '10px' }, children: [rec.approval_status === 'Detected' && (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => handleAction(() => onApprove(rec.id), rec.id), disabled: isLoading, style: {
                                                            backgroundColor: '#29465B',
                                                            color: '#FFFFFF',
                                                            border: 'none',
                                                            padding: '8px 18px',
                                                            borderRadius: '8px',
                                                            fontWeight: '600',
                                                            fontSize: '0.84rem',
                                                            cursor: isLoading ? 'not-allowed' : 'pointer',
                                                            transition: 'background-color 0.15s ease',
                                                        }, onMouseEnter: (e) => {
                                                            if (!isLoading)
                                                                e.currentTarget.style.backgroundColor = '#1F3545';
                                                        }, onMouseLeave: (e) => {
                                                            if (!isLoading)
                                                                e.currentTarget.style.backgroundColor = '#29465B';
                                                        }, children: "Approve Action" }), _jsx("button", { onClick: () => handleAction(() => onReject(rec.id), rec.id), disabled: isLoading, style: {
                                                            backgroundColor: '#FFFFFF',
                                                            color: '#718096',
                                                            border: '1px solid #E7EDF1',
                                                            padding: '8px 14px',
                                                            borderRadius: '8px',
                                                            fontSize: '0.84rem',
                                                            cursor: isLoading ? 'not-allowed' : 'pointer',
                                                        }, children: "Dismiss" })] })), rec.approval_status === 'Approved' && (_jsxs("button", { onClick: () => handleAction(() => onProgress(rec.id), rec.id), disabled: isLoading, style: {
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
                                                }, children: [_jsx(Wrench, { size: 14 }), _jsx("span", { children: "Dispatch Maintenance (In Progress)" })] })), rec.approval_status === 'In Progress' && (_jsxs("button", { onClick: () => handleAction(() => onResolve(rec.id), rec.id), disabled: isLoading, style: {
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
                                                }, children: [_jsx(CheckCircle, { size: 14 }), _jsx("span", { children: "Confirm Repair & Verify Savings" })] })), (rec.approval_status === 'Impact Measured' || rec.approval_status === 'Resolved') && (_jsxs("div", { style: { color: '#54856D', fontWeight: '600', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '6px' }, children: [_jsx(CheckCircle, { size: 16 }), _jsx("span", { children: "Verified Impact Measured & Logged" })] }))] })] })] }, rec.id));
                }) }))] }));
};
