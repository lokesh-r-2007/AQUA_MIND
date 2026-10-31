import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
export const AlertsPage = ({ alerts, onAcknowledge, onResolve, }) => {
    const [filter, setFilter] = useState('ALL');
    const filtered = alerts.filter((a) => {
        if (filter === 'ALL')
            return true;
        return a.status === filter;
    });
    return (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '24px' }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }, children: [_jsxs("div", { children: [_jsx("h1", { style: { fontSize: '1.45rem', fontWeight: '700', color: '#29465B', margin: 0, letterSpacing: '-0.01em' }, children: "Infrastructure Alerts" }), _jsx("p", { style: { fontSize: '0.86rem', color: '#718096', margin: '4px 0 0 0' }, children: "Operational alerts for pipeline depressurization, flow spikes, and sensor irregularities." })] }), _jsx("div", { style: { display: 'flex', gap: '8px' }, children: ['ALL', 'ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'].map((s) => (_jsx("button", { onClick: () => setFilter(s), style: {
                                backgroundColor: filter === s ? '#E8F0F7' : '#FFFFFF',
                                color: filter === s ? '#29465B' : '#718096',
                                border: `1px solid ${filter === s ? '#DCE4EC' : '#E7EDF1'}`,
                                padding: '6px 14px',
                                borderRadius: '8px',
                                fontSize: '0.82rem',
                                fontWeight: filter === s ? '600' : '500',
                                cursor: 'pointer',
                                transition: 'background-color 0.12s ease',
                            }, onMouseEnter: (e) => {
                                if (filter !== s)
                                    e.currentTarget.style.backgroundColor = '#F6F8FA';
                            }, onMouseLeave: (e) => {
                                if (filter !== s)
                                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                            }, children: s }, s))) })] }), filtered.length === 0 ? (_jsxs("div", { style: {
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
                        }, children: _jsx(CheckCircle, { size: 22, color: "#54856D" }) }), _jsx("div", { style: { fontSize: '1.02rem', fontWeight: '600', color: '#29465B' }, children: "No Incidents Found" }), _jsx("p", { style: { fontSize: '0.84rem', margin: '4px 0 0 0' }, children: "All telemetry streams match normal baseline criteria." })] })) : (
            /* Alerts Table */
            _jsx("div", { style: {
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E7EDF1',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(41, 56, 69, 0.02)',
                }, children: _jsxs("table", { style: { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', color: '#293845' }, children: [_jsx("thead", { children: _jsxs("tr", { style: { backgroundColor: '#F6F8FA', borderBottom: '1px solid #E7EDF1', textAlign: 'left', color: '#718096' }, children: [_jsx("th", { style: { padding: '12px 16px', fontWeight: '600' }, children: "Timestamp" }), _jsx("th", { style: { padding: '12px 16px', fontWeight: '600' }, children: "Facility" }), _jsx("th", { style: { padding: '12px 16px', fontWeight: '600' }, children: "Category" }), _jsx("th", { style: { padding: '12px 16px', fontWeight: '600' }, children: "Priority Tier" }), _jsx("th", { style: { padding: '12px 16px', fontWeight: '600' }, children: "Problem Summary" }), _jsx("th", { style: { padding: '12px 16px', fontWeight: '600' }, children: "Status" }), _jsx("th", { style: { padding: '12px 16px', fontWeight: '600', textAlign: 'right' }, children: "Actions" })] }) }), _jsx("tbody", { children: filtered.map((alert) => (_jsxs("tr", { style: { borderBottom: '1px solid #F0F4F8' }, children: [_jsx("td", { style: { padding: '12px 16px', fontSize: '0.8rem', color: '#718096' }, children: alert.timestamp }), _jsx("td", { style: { padding: '12px 16px', fontWeight: '600', color: '#29465B' }, children: alert.building_name }), _jsx("td", { style: { padding: '12px 16px' }, children: _jsx("span", { style: {
                                                fontSize: '0.72rem',
                                                padding: '2px 8px',
                                                borderRadius: '5px',
                                                fontWeight: '600',
                                                backgroundColor: alert.category === 'LEAK' ? '#FDF2F2' : '#FDF8EE',
                                                color: alert.category === 'LEAK' ? '#C16D6D' : '#C39755',
                                                border: `1px solid ${alert.category === 'LEAK' ? '#F5D5D5' : '#F4E3C8'}`,
                                            }, children: alert.category }) }), _jsx("td", { style: { padding: '12px 16px', fontWeight: '600', color: alert.severity.includes('P1') ? '#C16D6D' : (alert.severity.includes('P2') ? '#C39755' : '#718096') }, children: alert.severity }), _jsx("td", { style: { padding: '12px 16px', color: '#293845' }, children: alert.message }), _jsx("td", { style: { padding: '12px 16px' }, children: _jsx("span", { style: {
                                                fontSize: '0.72rem',
                                                padding: '2px 8px',
                                                borderRadius: '5px',
                                                fontWeight: '600',
                                                backgroundColor: alert.status === 'ACTIVE' ? '#FDF2F2' : (alert.status === 'ACKNOWLEDGED' ? '#E8F0F7' : '#EBF5F0'),
                                                color: alert.status === 'ACTIVE' ? '#C16D6D' : (alert.status === 'ACKNOWLEDGED' ? '#29465B' : '#54856D'),
                                                border: `1px solid ${alert.status === 'ACTIVE' ? '#F5D5D5' : (alert.status === 'ACKNOWLEDGED' ? '#DCE4EC' : '#D2E8DD')}`,
                                            }, children: alert.status }) }), _jsxs("td", { style: { padding: '12px 16px', textAlign: 'right' }, children: [alert.status === 'ACTIVE' && (_jsx("button", { onClick: () => onAcknowledge(alert.id), style: {
                                                    backgroundColor: '#E8F0F7',
                                                    color: '#29465B',
                                                    border: '1px solid #DCE4EC',
                                                    padding: '5px 12px',
                                                    borderRadius: '6px',
                                                    fontSize: '0.76rem',
                                                    cursor: 'pointer',
                                                    fontWeight: '600',
                                                }, children: "Acknowledge" })), alert.status === 'ACKNOWLEDGED' && (_jsx("button", { onClick: () => onResolve(alert.id), style: {
                                                    backgroundColor: '#EBF5F0',
                                                    color: '#54856D',
                                                    border: '1px solid #D2E8DD',
                                                    padding: '5px 12px',
                                                    borderRadius: '6px',
                                                    fontSize: '0.76rem',
                                                    cursor: 'pointer',
                                                    fontWeight: '600',
                                                }, children: "Resolve" }))] })] }, alert.id))) })] }) }))] }));
};
