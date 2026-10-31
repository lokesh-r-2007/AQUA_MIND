import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Activity, Gauge, TrendingUp, AlertTriangle, ClipboardCheck, Building2, Cpu, BarChart3, Sliders, Droplets, ShieldCheck, } from 'lucide-react';
export const Sidebar = ({ currentTab, setCurrentTab, activeAlertsCount, activeRecsCount, }) => {
    const navItems = [
        { id: 'overview', label: 'Overview', icon: Activity },
        { id: 'monitoring', label: 'Live Monitoring', icon: Gauge },
        { id: 'predictions', label: 'Predictions', icon: TrendingUp },
        { id: 'alerts', label: 'Alerts', icon: AlertTriangle, badge: activeAlertsCount, badgeType: 'alert' },
        { id: 'recommendations', label: 'Recommendations', icon: ClipboardCheck, badge: activeRecsCount, badgeType: 'rec' },
        { id: 'buildings', label: 'Buildings', icon: Building2 },
        { id: 'optimization', label: 'Optimization', icon: Cpu },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'simulator', label: 'Scenario Simulator', icon: Sliders },
    ];
    return (_jsxs("aside", { style: {
            width: '252px',
            backgroundColor: '#20384B',
            color: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            borderRight: '1px solid #182C3B',
            flexShrink: 0,
            userSelect: 'none',
            boxSizing: 'border-box',
            overflow: 'hidden',
        }, children: [_jsxs("div", { style: {
                    height: '70px',
                    boxSizing: 'border-box',
                    padding: '0 20px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    flexShrink: 0,
                }, children: [_jsx("div", { style: {
                            width: '36px',
                            height: '36px',
                            borderRadius: '9px',
                            backgroundColor: '#EFF6FF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }, children: _jsx(Droplets, { size: 20, color: "#2563EB" }) }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column' }, children: [_jsx("div", { style: { fontWeight: '700', fontSize: '1.05rem', letterSpacing: '-0.01em', color: '#FFFFFF', lineHeight: '1.2' }, children: "AquaMind AI" }), _jsx("div", { style: { fontSize: '0.72rem', color: '#A0B8C8', fontWeight: '500' }, children: "Water Intelligence Platform" })] })] }), _jsx("nav", { style: {
                    padding: '16px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    flex: 1,
                    overflowY: 'auto',
                }, children: navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;
                    return (_jsxs("button", { onClick: () => setCurrentTab(item.id), style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '11px',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: isActive ? 'rgba(37, 99, 235, 0.25)' : 'transparent',
                            color: isActive ? '#FFFFFF' : '#A0B8C8',
                            cursor: 'pointer',
                            fontSize: '0.88rem',
                            fontWeight: isActive ? '600' : '500',
                            textAlign: 'left',
                            width: '100%',
                            transition: 'all 0.15s ease',
                            borderLeft: isActive ? '3px solid #3B82F6' : '3px solid transparent',
                        }, onMouseEnter: (e) => {
                            if (!isActive) {
                                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                                e.currentTarget.style.color = '#FFFFFF';
                            }
                        }, onMouseLeave: (e) => {
                            if (!isActive) {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = '#A0B8C8';
                            }
                        }, children: [_jsx(Icon, { size: 17, color: isActive ? '#60A5FA' : '#8EA4B5' }), _jsx("span", { style: { flex: 1 }, children: item.label }), item.badge && item.badge > 0 ? (_jsx("span", { style: {
                                    backgroundColor: item.badgeType === 'alert' ? '#C16D6D' : '#C39755',
                                    color: '#FFFFFF',
                                    fontSize: '0.72rem',
                                    fontWeight: '700',
                                    padding: '1px 8px',
                                    borderRadius: '10px',
                                }, children: item.badge })) : null] }, item.id));
                }) }), _jsxs("div", { style: {
                    padding: '16px 20px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    backgroundColor: '#192C3B',
                    fontSize: '0.78rem',
                    color: '#A0B8C8',
                    flexShrink: 0,
                }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }, children: [_jsx(ShieldCheck, { size: 15, color: "#3B82F6" }), _jsx("span", { style: { fontWeight: '600', color: '#FFFFFF' }, children: "Responsible AI Oversight" })] }), _jsx("div", { style: { fontSize: '0.72rem', color: '#8EA4B5', lineHeight: '1.4' }, children: "Residential welfare guardrails active. Autonomous throttling disabled." })] })] }));
};
