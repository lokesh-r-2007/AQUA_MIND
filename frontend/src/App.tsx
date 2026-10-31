import React, { useState, useEffect } from 'react';
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
import { Building, OverviewKPIs, Alert, Recommendation, SensorReading } from './types';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [kpis, setKpis] = useState<OverviewKPIs | null>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [forecast, setForecast] = useState<any>(null);
  const [shortageRisk, setShortageRisk] = useState<any>(null);
  const [weather, setWeather] = useState<any>(null);
  const [simStatus, setSimStatus] = useState<any>(null);
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

      if (kpiRes) setKpis(kpiRes);
      if (bldRes) setBuildings(bldRes);
      if (altRes) setAlerts(altRes);
      if (recRes) setRecommendations(recRes);
      if (predRes) setPredictions(predRes);
      if (fcRes) setForecast(fcRes);
      if (shtRes) setShortageRisk(shtRes);
      if (wthRes) setWeather(wthRes);
      if (simRes) setSimStatus(simRes);
    } catch (err) {
      console.error('Data refresh error:', err);
    }
  };

  useEffect(() => {
    refreshAllData();
    // Fast second sync after 1.5s to ensure instant population
    const quickTimer = setTimeout(refreshAllData, 1500);
    // Poll every 8 seconds for continuous live telemetry
    const interval = setInterval(refreshAllData, 8000);
    return () => {
      clearTimeout(quickTimer);
      clearInterval(interval);
    };
  }, []);

  const handleStepSimulation = async () => {
    setIsStepping(true);
    try {
      await api.stepSimulator();
      await refreshAllData();
    } catch (err: any) {
      alert(`Simulation error: ${err.message}`);
    } finally {
      setIsStepping(false);
    }
  };

  const handleTriggerLeak = async (buildingId: string, severity: 'minor' | 'moderate' | 'major') => {
    await api.triggerLeak(buildingId, severity);
    await refreshAllData();
  };

  const handleStopLeak = async (buildingId: string) => {
    await api.stopLeak(buildingId);
    await refreshAllData();
  };

  const handleTriggerFault = async (buildingId: string, faultType: string) => {
    await api.triggerFault(buildingId, faultType);
    await refreshAllData();
  };

  const handleApproveRec = async (id: number) => {
    await api.approveRecommendation(id);
    await refreshAllData();
  };

  const handleRejectRec = async (id: number) => {
    await api.rejectRecommendation(id);
    await refreshAllData();
  };

  const handleProgressRec = async (id: number) => {
    await api.progressRecommendation(id);
    await refreshAllData();
  };

  const handleResolveRec = async (id: number) => {
    await api.resolveRecommendation(id);
    await refreshAllData();
  };

  const handleAcknowledgeAlert = async (id: number) => {
    await api.acknowledgeAlert(id);
    await refreshAllData();
  };

  const handleResolveAlert = async (id: number) => {
    await api.resolveAlert(id);
    await refreshAllData();
  };

  const activeAlerts = alerts.filter((a) => a.status === 'ACTIVE').length;
  const activeRecs = recommendations.filter((r) => ['Detected', 'Under Review', 'In Progress'].includes(r.approval_status)).length;
  const latestReadings: SensorReading[] = kpis?.latest_readings || [];

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', backgroundColor: '#F8FAFC', color: '#1E293B', overflow: 'hidden', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        activeAlertsCount={activeAlerts}
        activeRecsCount={activeRecs}
      />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', backgroundColor: '#F8FAFC' }}>
        <Header
          kpis={kpis}
          onStepSimulation={handleStepSimulation}
          isStepping={isStepping}
          weather={weather}
        />

        <main style={{ flex: 1, overflowY: 'auto', padding: '24px 30px' }}>
          {currentTab === 'overview' && (
            <OverviewPage
              kpis={kpis}
              buildings={buildings}
              recommendations={recommendations}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'monitoring' && (
            <LiveMonitoringPage
              latestReadings={latestReadings}
              buildings={buildings}
              onTriggerLeak={handleTriggerLeak}
              onStopLeak={handleStopLeak}
              onTriggerFault={handleTriggerFault}
              onStepSimulation={handleStepSimulation}
              activeLeaks={simStatus?.active_leaks || []}
            />
          )}

          {currentTab === 'predictions' && (
            <PredictionsPage
              predictions={predictions}
              forecastData={forecast}
              shortageData={shortageRisk}
              buildings={buildings}
            />
          )}

          {currentTab === 'alerts' && (
            <AlertsPage
              alerts={alerts}
              onAcknowledge={handleAcknowledgeAlert}
              onResolve={handleResolveAlert}
            />
          )}

          {currentTab === 'recommendations' && (
            <RecommendationsPage
              recommendations={recommendations}
              onApprove={handleApproveRec}
              onReject={handleRejectRec}
              onProgress={handleProgressRec}
              onResolve={handleResolveRec}
            />
          )}

          {currentTab === 'buildings' && (
            <BuildingsPage
              buildings={buildings}
              latestReadings={latestReadings}
            />
          )}

          {currentTab === 'optimization' && (
            <OptimizationPage />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsPage kpis={kpis} />
          )}

          {currentTab === 'simulator' && (
            <ScenarioSimulatorPage buildings={buildings} />
          )}
        </main>
      </div>
    </div>
  );
}
export default App;
