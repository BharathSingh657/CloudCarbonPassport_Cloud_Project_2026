import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import ResourceTable from './components/ResourceTable';
import PassportModal from './components/PassportModal';
import ForecastView from './components/ForecastView';
import RecommendationsView from './components/RecommendationsView';
import { DotGrid, Preloader } from './components/ReactBits';
import { LayoutDashboard, Server, TrendingDown, Sparkles, BellRing, ShieldAlert, SlidersHorizontal, FileText, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [chartsData, setChartsData] = useState(null);
  const [resources, setResources] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedPassportResource, setSelectedPassportResource] = useState(null);
  const [loading, setLoading] = useState(true);

  const requestJson = async (url, options = {}) => {
    const separator = url.includes('?') ? '&' : '?';
    const response = await fetch(`${url}${separator}refresh=${Date.now()}`, {
      ...options,
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        ...(options.headers || {})
      }
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return response.json();
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [statsRes, chartsRes, resourcesRes, forecastRes, recsRes] = await Promise.all([
        requestJson('/api/dashboard/stats'),
        requestJson('/api/dashboard/charts'),
        requestJson('/api/resources'),
        requestJson('/api/predictions'),
        requestJson('/api/recommendations')
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (chartsRes.success) setChartsData(chartsRes.data);
      if (resourcesRes.success) setResources(resourcesRes.data);
      if (forecastRes.success) setForecast(forecastRes.data);
      if (recsRes.success) setRecommendations(recsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard telemetry:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleApplyRecommendation = async (recId) => {
    try {
      const data = await requestJson(`/api/recommendations/${recId}/apply`, { method: 'POST' });
      if (data.success) {
        if (data.data) {
          setStats(data.data.stats);
          setResources(data.data.resources);
          setForecast(data.data.forecast);
          setRecommendations(data.data.recommendations);
        }
        await fetchAllData();
      }
    } catch (err) {
      console.error('Error applying recommendation:', err);
    }
  };

  const analyticsSummary = chartsData && stats ? [
    { label: 'Total carbon', value: `${stats.totalCarbonKg} kg CO₂`, tone: 'emerald' },
    { label: 'Renewable ratio', value: `${stats.renewableRatioPct}%`, tone: 'cyan' },
    { label: 'Sustainability score', value: `${stats.avgSustainabilityScore}/100`, tone: 'amber' },
    { label: 'Idle resources', value: `${stats.idleCount}`, tone: 'rose' }
  ] : [];

  const alertItems = recommendations.length
    ? recommendations.filter((rec) => !rec.applied)
    : [];

  return (
    <div className="app-shell premium-shell text-slate-100">
      <DotGrid className="fixed z-0" dotSize={1.5} gap={26} baseColor="#29352a" activeColor="#A3E635" />
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="ambient ambient-three" />

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} stats={stats} />

      <div className="flex flex-1 relative z-10">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          recommendationsCount={recommendations.filter(r => !r.applied).length}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1500px] mx-auto w-full">
          {!loading && stats && (
            <div className="pulse-banner mb-6 rounded-[28px] border border-slate-800/80 bg-slate-900/60 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.4)] backdrop-blur-xl md:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="pulse-kicker inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-emerald-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(163,230,53,0.8)]" />
                    Live optimization pulse
                  </div>
                  <h2 className="pulse-title mt-3 text-xl font-semibold text-slate-100 md:text-2xl">
                    Cloud emissions are trending <span className="gradient-text">below target</span>
                  </h2>
                </div>

                <div className="pulse-metrics flex flex-wrap items-center gap-2 text-[11px] text-slate-300">
                  <span className="rounded-full border border-slate-700 bg-slate-950/60 px-3 py-1.5">Renewables {stats.renewableRatioPct}%</span>
                  <span className="rounded-full border border-slate-700 bg-slate-950/60 px-3 py-1.5">Efficiency {stats.avgSustainabilityScore}/100</span>
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-emerald-300">Alerts {recommendations.filter(r => !r.applied).length}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex md:hidden items-center justify-around glass-panel p-2 rounded-2xl mb-6 border border-slate-800/80 text-xs">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`p-2 rounded-xl flex items-center space-x-1 ${activeTab === 'dashboard' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'text-slate-400'}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`p-2 rounded-xl flex items-center space-x-1 ${activeTab === 'resources' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'text-slate-400'}`}
            >
              <Server className="w-4 h-4" />
              <span>Resources</span>
            </button>
            <button
              onClick={() => setActiveTab('predictions')}
              className={`p-2 rounded-xl flex items-center space-x-1 ${activeTab === 'predictions' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'text-slate-400'}`}
            >
              <TrendingDown className="w-4 h-4" />
              <span>Forecast</span>
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`p-2 rounded-xl flex items-center space-x-1 ${activeTab === 'recommendations' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'text-slate-400'}`}
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Recs</span>
            </button>
          </div>

          {loading && !stats && !chartsData ? (
            <div className="glass-panel rounded-3xl border border-slate-800/80 p-10 text-center">
              <Preloader label="Preparing cloud carbon insights and passport data" />
            </div>
          ) : null}

          {activeTab === 'dashboard' && (
            <DashboardView
              stats={stats}
              chartsData={chartsData}
              onRefresh={fetchAllData}
              onNavigateToResources={() => setActiveTab('resources')}
              onNavigateToRecs={() => setActiveTab('recommendations')}
            />
          )}

          {activeTab === 'resources' && (
            <ResourceTable
              resources={resources}
              onSelectPassport={(res) => setSelectedPassportResource(res)}
            />
          )}

          {activeTab === 'predictions' && (
            <ForecastView
              forecastData={forecast}
              onNavigateToRecs={() => setActiveTab('recommendations')}
            />
          )}

          {activeTab === 'recommendations' && (
            <RecommendationsView
              recommendations={recommendations}
              onApplyRecommendation={handleApplyRecommendation}
            />
          )}

          {activeTab === 'analytics' && stats && chartsData && (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-emerald-300">Analytics</p>
                  <h2 className="mt-1 text-2xl font-semibold text-slate-100">Carbon Analytics</h2>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {analyticsSummary.map((item) => (
                  <div key={item.label} className="glass-card rounded-2xl p-5">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{item.label}</div>
                    <div className={`mt-3 font-mono text-2xl font-semibold ${item.tone === 'emerald' ? 'text-emerald-300' : item.tone === 'cyan' ? 'text-cyan-300' : item.tone === 'amber' ? 'text-amber-300' : 'text-rose-300'}`}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="glass-card rounded-2xl p-5">
                  <h3 className="mb-3 text-sm font-semibold text-slate-100">Service emissions</h3>
                  <div className="space-y-3">
                    {chartsData.serviceBreakdown.map((item) => (
                      <div key={item.service}>
                        <div className="mb-1 flex items-center justify-between text-[11px] text-slate-300">
                          <span>{item.service}</span>
                          <span className="font-mono text-slate-100">{item.carbonKg} kg</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-800">
                          <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" style={{ width: `${Math.min((item.carbonKg / stats.totalCarbonKg) * 100, 100)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-5">
                  <h3 className="mb-3 text-sm font-semibold text-slate-100">Regional footprint</h3>
                  <div className="space-y-3">
                    {chartsData.regionBreakdown.map((item) => (
                      <div key={item.region} className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-900/60 px-3 py-2 text-[11px] text-slate-300">
                        <span className="font-mono">{item.region}</span>
                        <span className="text-emerald-300">{item.carbonKg} kg</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'passport' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-emerald-400" />
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-emerald-300">Passport</p>
                  <h2 className="text-2xl font-semibold text-slate-100">Carbon Passport Registry</h2>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {resources.map((resource) => (
                  <div key={resource.id} className="glass-card rounded-2xl p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-slate-100">{resource.name}</div>
                        <div className="mt-1 font-mono text-[11px] text-slate-400">{resource.id}</div>
                      </div>
                      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[9px] font-medium text-emerald-300">
                        {resource.status}
                      </span>
                    </div>
                    <div className="space-y-2 text-[11px] text-slate-300">
                      <div className="flex justify-between"><span>Service</span><span className="font-mono text-slate-100">{resource.service}</span></div>
                      <div className="flex justify-between"><span>Region</span><span className="font-mono text-slate-100">{resource.region}</span></div>
                      <div className="flex justify-between"><span>Carbon</span><span className="font-mono text-emerald-300">{resource.metrics.carbonKgCO2} kg</span></div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedPassportResource(resource)}
                      className="mt-4 inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-[11px] font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
                    >
                      View passport
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <BellRing className="h-5 w-5 text-amber-400" />
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-amber-300">Alerts</p>
                  <h2 className="text-2xl font-semibold text-slate-100">Infrastructure Alerts</h2>
                </div>
              </div>

              <div className="space-y-4">
                {alertItems.length === 0 ? (
                  <div className="glass-card rounded-2xl p-8 text-center text-slate-300">
                    <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-emerald-400" />
                    <div className="text-lg font-semibold">No active alerts</div>
                    <div className="mt-1 text-sm text-slate-400">All monitored resources are within expected operating thresholds.</div>
                  </div>
                ) : (
                  alertItems.map((alert) => (
                    <div key={alert.id} className="glass-card rounded-2xl border border-amber-500/20 p-5">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-amber-300">
                            <ShieldAlert className="h-4 w-4" /> {alert.severity}
                          </div>
                          <h3 className="mt-2 text-lg font-semibold text-slate-100">{alert.title}</h3>
                          <p className="mt-1 text-sm text-slate-400">{alert.description}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveTab('recommendations')}
                          className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] font-semibold text-amber-300"
                        >
                          Review recommendation
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <SlidersHorizontal className="h-5 w-5 text-cyan-400" />
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-cyan-300">Settings</p>
                  <h2 className="text-2xl font-semibold text-slate-100">Platform Configuration</h2>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="glass-card rounded-2xl p-5">
                  <h3 className="text-sm font-semibold text-slate-100">Monitoring preferences</h3>
                  <div className="mt-4 space-y-3 text-sm text-slate-300">
                    <label className="flex items-center justify-between gap-3"><span>Live telemetry</span><input type="checkbox" defaultChecked className="h-4 w-4 accent-emerald-500" /></label>
                    <label className="flex items-center justify-between gap-3"><span>Carbon alerts</span><input type="checkbox" defaultChecked className="h-4 w-4 accent-emerald-500" /></label>
                    <label className="flex items-center justify-between gap-3"><span>AI recommendations</span><input type="checkbox" defaultChecked className="h-4 w-4 accent-emerald-500" /></label>
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-5">
                  <h3 className="text-sm font-semibold text-slate-100">Reporting policy</h3>
                  <div className="mt-4 space-y-3 text-sm text-slate-300">
                    <div className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-900/60 px-3 py-2"><span>Reporting interval</span><span className="font-mono text-slate-100">6 hours</span></div>
                    <div className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-900/60 px-3 py-2"><span>Baseline model</span><span className="font-mono text-slate-100">Green AI v2.4</span></div>
                    <div className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-900/60 px-3 py-2"><span>Compliance mode</span><span className="font-mono text-emerald-300">Active</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {selectedPassportResource && (
        <PassportModal
          resource={selectedPassportResource}
          onClose={() => setSelectedPassportResource(null)}
        />
      )}
    </div>
  );
}
