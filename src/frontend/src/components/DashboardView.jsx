import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  CartesianGrid
} from 'recharts';
import {
  Zap,
  Cloud,
  Award,
  AlertTriangle,
  Trees,
  Car,
  ArrowDownRight,
  RefreshCw,
  Layers,
  Globe
} from 'lucide-react';
import { Counter, GlassSurface, SimpleGraph, SpotlightCard } from './ReactBits';

const COLORS = ['#A3E635', '#BEF264', '#84A93B', '#67E8F9', '#EAB308', '#EF4444'];

export default function DashboardView({ stats, chartsData, onRefresh, onNavigateToResources, onNavigateToRecs }) {
  if (!stats || !chartsData) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-slate-800/80 bg-slate-900/40">
        <div className="flex flex-col items-center gap-3 text-slate-300">
          <RefreshCw className="h-8 w-8 animate-spin text-emerald-400" />
          <span className="text-sm">Loading sustainability metrics…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-emerald-300">Executive Overview</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-100">Sustainability Executive Dashboard</h2>
          <p className="mt-1 text-xs text-slate-400">
            Real-time carbon telemetry, energy usage, and environmental impact indicators across cloud infrastructure.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="glass-panel flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-3.5 py-2 text-xs font-medium text-slate-200 transition hover:border-emerald-500/30 hover:text-emerald-300"
        >
          <RefreshCw className="h-3.5 w-3.5 text-emerald-400" />
          Refresh Live Telemetry
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <SpotlightCard className="glass-card glass-card-hover rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">Total Carbon Emissions</span>
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2 text-emerald-300">
              <Cloud className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="font-mono text-3xl font-semibold text-slate-100">
              <Counter value={stats.totalCarbonKg} suffix="" className="" />
              <span className="ml-1 text-sm font-sans text-slate-400">kg CO₂</span>
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-emerald-300">
              <ArrowDownRight className="h-4 w-4" />
              <span>{Number(stats.totalCarbonTons).toFixed(2)} metric tons</span>
            </div>
          </div>
        </SpotlightCard>

        <SpotlightCard className="glass-card glass-card-hover rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">Energy Consumption</span>
            <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-2 text-cyan-300">
              <Zap className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="font-mono text-3xl font-semibold text-slate-100">
              <Counter value={stats.totalKWh} suffix="" className="" />
              <span className="ml-1 text-sm font-sans text-slate-400">kWh</span>
            </div>
            <div className="mt-2 text-xs text-slate-400">
              PUE: <span className="font-mono text-cyan-300">1.18</span> · {stats.renewableRatioPct}% clean energy
            </div>
          </div>
        </SpotlightCard>

        <SpotlightCard className="glass-card glass-card-hover rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">Sustainability Score</span>
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2 text-amber-300">
              <Award className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="font-mono text-3xl font-semibold text-slate-100">
              <Counter value={stats.avgSustainabilityScore} suffix="" className="" />
              <span className="ml-1 text-sm font-sans text-slate-400">/ 100</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-slate-800/80">
              <div className="h-full rounded-full bg-gradient-to-r from-amber-400 via-emerald-400 to-cyan-400" style={{ width: `${stats.avgSustainabilityScore}%` }} />
            </div>
          </div>
        </SpotlightCard>

        <SpotlightCard className="glass-card glass-card-hover rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">Active Resources</span>
            <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 p-2 text-violet-300">
              <Layers className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="font-mono text-3xl font-semibold text-slate-100">
              <Counter value={stats.totalResources} suffix="" className="" />
            </div>
            <div className="mt-2 text-xs text-slate-400">
              <span className="text-emerald-300">{stats.totalResources - stats.idleCount} optimal</span>
              {stats.idleCount > 0 && (
                <span className="ml-2 inline-flex cursor-pointer items-center gap-1 text-rose-300" onClick={onNavigateToRecs}>
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {stats.idleCount} idle
                </span>
              )}
            </div>
          </div>
        </SpotlightCard>

        <SpotlightCard className="glass-card glass-card-hover rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">Carbon Saved</span>
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2 text-emerald-300">
              <Trees className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="font-mono text-3xl font-semibold text-slate-100">
              <Counter value={Math.round(stats.totalCarbonKg * 0.12)} suffix="" className="" />
              <span className="ml-1 text-sm font-sans text-slate-400">kg</span>
            </div>
            <div className="mt-2 text-xs text-emerald-300">
              Estimated savings potential
            </div>
          </div>
        </SpotlightCard>
      </div>

      {stats.idleCount > 0 && (
        <div className="glass-panel flex flex-col items-start justify-between gap-3 rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-950/25 via-slate-900/40 to-slate-900/60 p-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-2 text-rose-300">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-100">Optimization required</h4>
              <p className="mt-1 text-xs text-slate-400">
                {stats.idleCount} idle resource(s) are driving unnecessary power draw and carbon intensity.
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToRecs}
            className="rounded-xl bg-rose-500 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-rose-400"
          >
            Apply AI Optimizations
          </button>
        </div>
      )}

      <GlassSurface className="p-5">
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-base font-semibold text-slate-100">Cloud Carbon Emission & Energy Telemetry</h3>
            <p className="text-xs text-slate-400">Daily carbon footprint and energy usage across active cloud regions.</p>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-300">
            <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />Carbon</span>
            <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />Energy</span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartsData.historicalTrend} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="carbonFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="energyFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#84A93B" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#84A93B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" vertical={false} />
              <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ stroke: 'rgba(163,230,53,0.22)', strokeWidth: 1, fill: 'rgba(163,230,53,0.04)' }}
                contentStyle={{
                  background: '#111411',
                  border: '1px solid #292D29',
                  borderRadius: '12px',
                  color: '#E2E8F0'
                }}
              />
              <Area type="monotone" dataKey="carbonKg" name="Carbon (kg CO₂)" stroke="#10B981" strokeWidth={2.5} fill="url(#carbonFill)" />
              <Area type="monotone" dataKey="kWh" name="Energy (kWh)" stroke="#84A93B" strokeWidth={2} strokeDasharray="4 4" fill="url(#energyFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <SimpleGraph data={chartsData.historicalTrend} dataKey="carbonKg" className="mt-2" />
      </GlassSurface>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GlassSurface className="p-5">
          <h3 className="mb-1 text-sm font-semibold text-slate-100">Emissions by Cloud Service Type</h3>
          <p className="mb-4 text-xs text-slate-400">Carbon contribution by workload/service profile.</p>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartsData.serviceBreakdown} dataKey="carbonKg" nameKey="service" cx="50%" cy="50%" innerRadius={58} outerRadius={86} paddingAngle={4}>
                  {chartsData.serviceBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  cursor={{ fill: 'rgba(163,230,53,0.04)' }}
                  contentStyle={{
                    background: '#111411',
                    border: '1px solid #292D29',
                    borderRadius: '12px',
                    color: '#E2E8F0'
                  }}
                  formatter={(val) => [`${val} kg CO₂`, 'Carbon']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-300">
            {chartsData.serviceBreakdown.map((item, idx) => (
              <div key={item.service} className="flex items-center gap-2 rounded-lg border border-slate-800/80 bg-slate-900/40 px-2 py-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="truncate">{item.service}</span>
                <span className="ml-auto font-mono text-slate-100">{item.carbonKg}kg</span>
              </div>
            ))}
          </div>
        </GlassSurface>

        <GlassSurface className="p-5">
          <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-100">
            <Globe className="h-4 w-4 text-cyan-400" /> Regional Carbon Intensity
          </h3>
          <p className="mb-4 text-xs text-slate-400">Grid emissions across active AWS regions.</p>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartsData.regionBreakdown} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" vertical={false} />
                <XAxis dataKey="region" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(163,230,53,0.04)' }}
                  contentStyle={{
                    background: '#111411',
                    border: '1px solid #292D29',
                    borderRadius: '12px',
                    color: '#E2E8F0'
                  }}
                  formatter={(val) => [`${val} kg CO₂`, 'Emissions']}
                />
                <Bar dataKey="carbonKg" radius={[8, 8, 0, 0]}>
                  {chartsData.regionBreakdown.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.region === 'eu-north-1' || entry.region === 'us-west-2' ? '#10B981' : '#F59E0B'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassSurface>
      </div>

      <div className="glass-panel flex flex-col gap-4 rounded-2xl border border-slate-800/80 p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-emerald-300">Environmental Impact</p>
          <h4 className="mt-1 text-lg font-semibold text-slate-100">Understanding your cloud footprint</h4>
        </div>

        <div className="grid grid-cols-2 gap-3 md:min-w-[380px]">
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3">
            <div className="flex items-center gap-2 text-emerald-300">
              <Trees className="h-5 w-5" />
              <span className="text-[10px] uppercase tracking-[0.16em] text-slate-400">Trees offset</span>
            </div>
            <div className="mt-2 font-mono text-xl font-semibold text-slate-100">{stats.impactEquivalents.treesRequiredToOffset}</div>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3">
            <div className="flex items-center gap-2 text-cyan-300">
              <Car className="h-5 w-5" />
              <span className="text-[10px] uppercase tracking-[0.16em] text-slate-400">Gas car miles</span>
            </div>
            <div className="mt-2 font-mono text-xl font-semibold text-slate-100">{stats.impactEquivalents.milesDrivenGasCar.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
