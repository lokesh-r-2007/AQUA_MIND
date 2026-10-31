import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { OverviewPage } from './pages/OverviewPage';
import { LiveMonitoringPage } from './pages/LiveMonitoringPage';
import { PredictionsPage } from './pages/PredictionsPage';
import { AlertsPage } from './pages/AlertsPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { BuildingsPage } from './pages/BuildingsPage';
import { OptimizationPage } from './pages/OptimizationPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ScenarioSimulatorPage } from './pages/ScenarioSimulatorPage';
import { api } from './services/api';
export function App() {
    const [currentTab, setCurrentTab] = useState('overview');
    const [kpis, setKpis] = useState(null);
    const [buildings, setBuildings] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [predictions, setPredictions] = useState([]);
    const [forecast, setForecast] = useState(null);
    const [shortageRisk, setShortageRisk] = useState(null);
    const [weather, setWeather] = useState(null);
    const [simStatus, setSimStatus] = useState(null);
    const [isStepping, setIsStepping] = useState(false);
    const refreshAllData = async () => {
        try {
            const [kpiRes, bldRes, altRes, recRes, predRes, fcRes, shtRes, wthRes, simRes] = await Promise.all([
                api.getOverview().catch(() => null),
                api.getBuildings().catch(() => []),
                api.getAlerts().catch(() => []),
                api.getRecommendations().catch(() => []),
                api.getPredictions().catch(() => []),
                api.getDemandForecast(24).catch(() => null),
                api.getShortageRisk().catch(() => null),
                api.getCurrentWeather().catch(() => null),
                api.getSimulatorStatus().catch(() => null),
            ]);
            if (kpiRes)
                setKpis(kpiRes);
            if (bldRes)
                setBuildings(bldRes);
            if (altRes)
                setAlerts(altRes);
            if (recRes)
                setRecommendations(recRes);
            if (predRes)
                setPredictions(predRes);
            if (fcRes)
                setForecast(fcRes);
            if (shtRes)
                setShortageRisk(shtRes);
            if (wthRes)
                setWeather(wthRes);
            if (simRes)
                setSimStatus(simRes);
        }
        catch (err) {
            console.error('Data refresh error:', err);
        }
    };
    useEffect(() => {
        refreshAllData();
        // Poll every 8 seconds for real-time updates
        const interval = setInterval(refreshAllData, 8000);
        return () => clearInterval(interval);
    }, []);
    const handleStepSimulation = async () => {
        setIsStepping(true);
        try {
            await api.stepSimulator();
            await refreshAllData();
        }
        catch (err) {
            alert(`Simulation error: ${err.message}`);
        }
        finally {
            setIsStepping(false);
        }
    };
    const handleTriggerLeak = async (buildingId, severity) => {
        await api.triggerLeak(buildingId, severity);
        await refreshAllData();
    };
    const handleStopLeak = async (buildingId) => {
        await api.stopLeak(buildingId);
        await refreshAllData();
    };
    const handleTriggerFault = async (buildingId, faultType) => {
        await api.triggerFault(buildingId, faultType);
        await refreshAllData();
    };
    const handleApproveRec = async (id) => {
        await api.approveRecommendation(id);
        await refreshAllData();
    };
    const handleRejectRec = async (id) => {
        await api.rejectRecommendation(id);
        await refreshAllData();
    };
    const handleProgressRec = async (id) => {
        await api.progressRecommendation(id);
        await refreshAllData();
    };
    const handleResolveRec = async (id) => {
        await api.resolveRecommendation(id);
        await refreshAllData();
    };
    const handleAcknowledgeAlert = async (id) => {
        await api.acknowledgeAlert(id);
        await refreshAllData();
    };
    const handleResolveAlert = async (id) => {
        await api.resolveAlert(id);
        await refreshAllData();
    };
    const activeAlerts = alerts.filter((a) => a.status === 'ACTIVE').length;
    const activeRecs = recommendations.filter((r) => ['Detected', 'Under Review', 'In Progress'].includes(r.approval_status)).length;
    const latestReadings = kpis?.latest_readings || [];
    return (_jsxs("div", { style: { display: 'flex', width: '100vw', height: '100vh', backgroundColor: '#F8FAFC', color: '#1E293B', overflow: 'hidden', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }, children: [_jsx(Sidebar, { currentTab: currentTab, setCurrentTab: setCurrentTab, activeAlertsCount: activeAlerts, activeRecsCount: activeRecs }), _jsxs("div", { style: { flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', backgroundColor: '#F8FAFC' }, children: [_jsx(Header, { kpis: kpis, onStepSimulation: handleStepSimulation, isStepping: isStepping, weather: weather }), _jsxs("main", { style: { flex: 1, overflowY: 'auto', padding: '24px 30px' }, children: [currentTab === 'overview' && (_jsx(OverviewPage, { kpis: kpis, buildings: buildings, recommendations: recommendations, onNavigateTab: setCurrentTab })), currentTab === 'monitoring' && (_jsx(LiveMonitoringPage, { latestReadings: latestReadings, buildings: buildings, onTriggerLeak: handleTriggerLeak, onStopLeak: handleStopLeak, onTriggerFault: handleTriggerFault, onStepSimulation: handleStepSimulation, activeLeaks: simStatus?.active_leaks || [] })), currentTab === 'predictions' && (_jsx(PredictionsPage, { predictions: predictions, forecastData: forecast, shortageData: shortageRisk, buildings: buildings })), currentTab === 'alerts' && (_jsx(AlertsPage, { alerts: alerts, onAcknowledge: handleAcknowledgeAlert, onResolve: handleResolveAlert })), currentTab === 'recommendations' && (_jsx(RecommendationsPage, { recommendations: recommendations, onApprove: handleApproveRec, onReject: handleRejectRec, onProgress: handleProgressRec, onResolve: handleResolveRec })), currentTab === 'buildings' && (_jsx(BuildingsPage, { buildings: buildings, latestReadings: latestReadings })), currentTab === 'optimization' && (_jsx(OptimizationPage, {})), currentTab === 'analytics' && (_jsx(AnalyticsPage, { kpis: kpis })), currentTab === 'simulator' && (_jsx(ScenarioSimulatorPage, { buildings: buildings }))] })] })] }));
}
export default App;
