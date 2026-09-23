import React from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, BarChart, Bar, CartesianGrid 
} from 'recharts';
import { 
  Zap, Cloud, Award, AlertTriangle, Trees, Car, ArrowUpRight, ArrowDownRight, RefreshCw, Layers, Globe 
} from 'lucide-react';

const COLORS = ['#10B981', '#06B6D4', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];

export default function DashboardView({ stats, chartsData, onRefresh, onNavigateToResources, onNavigateToRecs }) {
  if (!stats || !chartsData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Sustainability Executive Dashboard
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Real-time carbon telemetry, energy consumption metrics, and environmental impact indicators.
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-dark-800 hover:bg-gray-800 border border-gray-700 text-xs font-medium text-gray-300 hover:text-white transition shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
          <span>Refresh Live Telemetry</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Carbon Footprint */}
        <div className="glass-card p-5 rounded-2xl glass-card-hover relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Carbon Footprint</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Cloud className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-100 font-mono tracking-tight">
              {stats.totalCarbonKg} <span className="text-sm font-sans font-normal text-gray-400">kg CO₂</span>
            </div>
            <div className="flex items-center space-x-1.5 mt-2 text-xs text-emerald-400">
              <ArrowDownRight className="w-4 h-4" />
              <span className="font-semibold">~{stats.totalCarbonTons} Metric Tons</span>
              <span className="text-gray-500">| Monthly</span>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Card 2: Energy Consumed */}
        <div className="glass-card p-5 rounded-2xl glass-card-hover relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Energy Consumed</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-100 font-mono tracking-tight">
              {stats.totalKWh} <span className="text-sm font-sans font-normal text-gray-400">kWh</span>
            </div>
            <div className="flex items-center space-x-1.5 mt-2 text-xs text-cyan-400">
              <span className="font-mono bg-cyan-500/10 px-2 py-0.5 rounded text-[11px] border border-cyan-500/20">
                PUE: 1.18
              </span>
              <span className="text-gray-400">({stats.renewableRatioPct}% Clean Energy)</span>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Card 3: Sustainability Index */}
        <div className="glass-card p-5 rounded-2xl glass-card-hover relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Fleet Sustainability Index</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-100 font-mono tracking-tight flex items-baseline space-x-2">
              <span>{stats.avgSustainabilityScore}</span>
              <span className="text-sm text-gray-400 font-sans font-normal">/ 100</span>
            </div>
            <div className="mt-2.5 w-full bg-dark-800 rounded-full h-2 overflow-hidden border border-gray-800">
              <div 
                className="bg-gradient-to-r from-amber-500 via-teal-400 to-emerald-400 h-full rounded-full transition-all duration-700" 
                style={{ width: `${stats.avgSustainabilityScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 4: Active vs Idle Infrastructure */}
        <div className="glass-card p-5 rounded-2xl glass-card-hover relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Cloud Resources</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-100 font-mono tracking-tight">
              {stats.totalResources} <span className="text-sm font-sans font-normal text-gray-400">Resources</span>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs">
              <span className="text-emerald-400 font-medium">{stats.totalResources - stats.idleCount} Optimal</span>
              {stats.idleCount > 0 ? (
                <span 
                  onClick={onNavigateToRecs} 
                  className="text-rose-400 font-semibold cursor-pointer hover:underline flex items-center space-x-1"
                >
                  <AlertTriangle className="w-3.5 h-3.5 inline" />
                  <span>{stats.idleCount} Idle / Inefficient</span>
                </span>
              ) : (
                <span className="text-gray-500">0 Idle</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Environmental Warning / Alert Banner */}
      {stats.idleCount > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/40 via-amber-950/20 to-dark-800 border border-rose-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100">
                Optimization Required: {stats.idleCount} idle resource(s) consuming excess power
              </h4>
              <p className="text-xs text-gray-400 mt-0.5">
                Green AI detected low CPU utilization on legacy instances in high carbon-intensity grids.
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToRecs}
            className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-md transition shadow-rose-500/20 whitespace-nowrap"
          >
            Apply AI Optimizations
          </button>
        </div>
      )}

      {/* Interactive Main Chart: 30-Day Historical Emissions & Energy */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <span>Cloud Carbon Emission & Energy Telemetry</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                30-Day Trend
              </span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Daily estimated carbon footprint ($kgCO_2$) vs energy consumption ($kWh$) across all active AWS regions.
            </p>
          </div>
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-gray-300">Carbon (kg CO₂)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-cyan-500" />
              <span className="text-gray-300">Energy (kWh)</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartsData.historicalTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCarbon" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
              <XAxis dataKey="date" stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px', fontSize: '12px' }}
                itemStyle={{ color: '#F3F4F6' }}
              />
              <Area type="monotone" dataKey="carbonKg" name="Carbon (kg CO₂)" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCarbon)" />
              <Area type="monotone" dataKey="kWh" name="Energy (kWh)" stroke="#06B6D4" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorEnergy)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two-Column Distribution Charts: By Service & By Region */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Breakdown Donut Chart */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-sm font-bold text-slate-100 mb-1">Emissions by Cloud Service Type</h3>
          <p className="text-xs text-gray-400 mb-4">Carbon distribution across AWS EC2, RDS, S3, Lambda, and ECS.</p>
          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartsData.serviceBreakdown}
                  dataKey="carbonKg"
                  nameKey="service"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                >
                  {chartsData.serviceBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '10px', fontSize: '12px' }}
                  formatter={(val) => [`${val} kg CO₂`, 'Carbon']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 pt-4 border-t border-gray-800 text-xs">
            {chartsData.serviceBreakdown.map((item, idx) => (
              <div key={item.service} className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-gray-400 truncate">{item.service}</span>
                <span className="font-mono text-slate-200 font-semibold">{item.carbonKg}kg</span>
              </div>
            ))}
          </div>
        </div>

        {/* Regional Breakdown Bar Chart */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-sm font-bold text-slate-100 mb-1 flex items-center space-x-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>Regional Carbon Intensity & Footprint</span>
          </h3>
          <p className="text-xs text-gray-400 mb-4">Comparison of grid emissions across active global AWS regions.</p>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartsData.regionBreakdown} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis dataKey="region" stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '10px', fontSize: '12px' }}
                  formatter={(val) => [`${val} kg CO₂`, 'Emissions']}
                />
                <Bar dataKey="carbonKg" radius={[6, 6, 0, 0]}>
                  {chartsData.regionBreakdown.map((entry, index) => (
                    <Cell 
                      key={`bar-${index}`} 
                      fill={entry.region === 'eu-north-1' || entry.region === 'us-west-2' ? '#10B981' : '#F59E0B'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-800 mt-1">
            <span className="flex items-center space-x-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Clean Hydro Grid (eu-north-1 / us-west-2)</span>
            </span>
            <span className="flex items-center space-x-1.5 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Fossil-heavy Grid (ap-south-1)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Environmental Real-world Impact Equivalence */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-dark-800 via-gray-900 to-dark-800 border border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div>
          <span className="text-xs uppercase font-mono tracking-wider text-emerald-400">Real-World Environmental Equivalence</span>
          <h4 className="text-lg font-bold text-slate-100 mt-1">Understanding Your Cloud Infrastructure Footprint</h4>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
            Based on EPA and GHG Protocol ICT factors, your cloud resources emit <strong className="text-emerald-400">{stats.totalCarbonKg} kg CO₂eq</strong> per month.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-dark-900/60 border border-gray-800 flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Trees className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-slate-100">{stats.impactEquivalents.treesRequiredToOffset}</div>
              <div className="text-[11px] text-gray-400">Trees needed for 1yr offset</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-dark-900/60 border border-gray-800 flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-slate-100">{stats.impactEquivalents.milesDrivenGasCar.toLocaleString()}</div>
              <div className="text-[11px] text-gray-400">Gas car miles equivalent</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
