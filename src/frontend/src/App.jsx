import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import ResourceTable from './components/ResourceTable';
import PassportModal from './components/PassportModal';
import ForecastView from './components/ForecastView';
import RecommendationsView from './components/RecommendationsView';
import { LayoutDashboard, Server, TrendingDown, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [chartsData, setChartsData] = useState(null);
  const [resources, setResources] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedPassportResource, setSelectedPassportResource] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [statsRes, chartsRes, resourcesRes, forecastRes, recsRes] = await Promise.all([
        fetch('/api/dashboard/stats').then(r => r.json()),
        fetch('/api/dashboard/charts').then(r => r.json()),
        fetch('/api/resources').then(r => r.json()),
        fetch('/api/predictions').then(r => r.json()),
        fetch('/api/recommendations').then(r => r.json())
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
      const res = await fetch(`/api/recommendations/${recId}/apply`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        // Refresh all dashboard metrics & resource data live!
        await fetchAllData();
      }
    } catch (err) {
      console.error('Error applying recommendation:', err);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 text-slate-100 flex flex-col font-sans">
      {/* Navigation Header */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} stats={stats} />

      <div className="flex flex-1">
        {/* Left Sidebar */}
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          recommendationsCount={recommendations.filter(r => !r.applied).length} 
        />

        {/* Main Content View Container */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {/* Mobile Tab Navigation */}
          <div className="flex md:hidden items-center justify-around bg-dark-800 p-2 rounded-xl mb-6 border border-gray-800 text-xs">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`p-2 rounded-lg flex items-center space-x-1 ${activeTab === 'dashboard' ? 'bg-emerald-500 text-dark-900 font-bold' : 'text-gray-400'}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`p-2 rounded-lg flex items-center space-x-1 ${activeTab === 'resources' ? 'bg-emerald-500 text-dark-900 font-bold' : 'text-gray-400'}`}
            >
              <Server className="w-4 h-4" />
              <span>Resources</span>
            </button>
            <button
              onClick={() => setActiveTab('predictions')}
              className={`p-2 rounded-lg flex items-center space-x-1 ${activeTab === 'predictions' ? 'bg-emerald-500 text-dark-900 font-bold' : 'text-gray-400'}`}
            >
              <TrendingDown className="w-4 h-4" />
              <span>Forecast</span>
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`p-2 rounded-lg flex items-center space-x-1 ${activeTab === 'recommendations' ? 'bg-emerald-500 text-dark-900 font-bold' : 'text-gray-400'}`}
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Recs</span>
            </button>
          </div>

          {/* Active Tab Component Render */}
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
        </main>
      </div>

      {/* Digital Carbon Passport Modal */}
      {selectedPassportResource && (
        <PassportModal 
          resource={selectedPassportResource} 
          onClose={() => setSelectedPassportResource(null)} 
        />
      )}
    </div>
  );
}
