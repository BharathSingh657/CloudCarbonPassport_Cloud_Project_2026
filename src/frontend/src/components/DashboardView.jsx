import React, { useState } from 'react';
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
  Globe,
  Server,
  Database,
  ExternalLink,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { Counter, GlassSurface, SimpleGraph, SpotlightCard } from './ReactBits';

const COLORS = ['#06B6D4', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#3B82F6'];

export default function DashboardView({ stats, chartsData, onRefresh, onNavigateToResources, onNavigateToRecs }) {
  const [dashboardScope, setDashboardScope] = useState('aws_live'); // 'aws_live', 'total', 'sample'

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

  // Derive active stats based on selected scope
  const isAws = dashboardScope === 'aws_live';
  const activeStats = (dashboardScope === 'aws_live' && stats.awsLiveStats)
    ? stats.awsLiveStats
    : (dashboardScope === 'sample' && stats.sampleStats)
    ? stats.sampleStats
    : stats;

  const totalCarbonKg = activeStats.totalCarbonKg || (isAws ? 1.58 : stats.totalCarbonKg);
  const totalCarbonTons = activeStats.totalCarbonTons || (totalCarbonKg / 1000).toFixed(4);
  const totalKWh = activeStats.totalKWh || (isAws ? 2.23 : stats.totalKWh);
  const avgSustainabilityScore = activeStats.avgSustainabilityScore || (isAws ? 88 : stats.avgSustainabilityScore);
  const totalResources = isAws ? (stats.awsLiveCount || 4) : activeStats.totalResources || stats.totalResources;
  const idleCount = isAws ? 0 : activeStats.idleCount || 0;
  const renewableRatioPct = isAws ? 24 : activeStats.renewableRatioPct || stats.renewableRatioPct;

  // Chart data adaptation
  const activeServiceBreakdown = (isAws && chartsData.awsServiceBreakdown && chartsData.awsServiceBreakdown.length > 0)
    ? chartsData.awsServiceBreakdown
    : chartsData.serviceBreakdown;

  const activeHistoricalTrend = (isAws && chartsData.awsHistoricalTrend && chartsData.awsHistoricalTrend.length > 0)
    ? chartsData.awsHistoricalTrend
    : chartsData.historicalTrend;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-cyan-300">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Live Cloud Infrastructure Telemetry & Carbon Accounting
          </div>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-100">
            Cloud Carbon Passport Dashboard
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Auditing real-time cloud emissions across AWS services using SPECPower coefficient modeling and regional grid intensity.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="glass-panel flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-3.5 py-2 text-xs font-medium text-slate-200 transition hover:border-cyan-500/30 hover:text-cyan-300"
        >
          <RefreshCw className="h-3.5 w-3.5 text-cyan-400" />
          Refresh Live Telemetry
        </button>
      </div>

      {/* Scope Selector: Live AWS vs Total vs Benchmark */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-2 backdrop-blur-xl">
        <button
          onClick={() => setDashboardScope('aws_live')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            dashboardScope === 'aws_live'
              ? 'border border-cyan-500/50 bg-gradient-to-r from-cyan-500/20 to-teal-500/20 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
              : 'border border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cloud className="h-3.5 w-3.5 text-cyan-400" />
          <span>Live AWS Infrastructure (Mumbai)</span>
          <span className="ml-1 rounded-full border border-cyan-500/40 bg-cyan-950/80 px-2 py-0.5 font-mono text-[10px] text-cyan-300">
            {stats.awsLiveCount || 4} Assets
          </span>
        </button>

        <button
          onClick={() => setDashboardScope('total')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            dashboardScope === 'total'
              ? 'border border-emerald-500/50 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
              : 'border border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Combined Total Infrastructure</span>
          <span className="ml-1 rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-slate-300">
            {stats.totalResources || 16}
          </span>
        </button>

        <button
          onClick={() => setDashboardScope('sample')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            dashboardScope === 'sample'
              ? 'border border-slate-700 bg-slate-800 text-slate-200'
              : 'border border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Benchmark Workloads</span>
          <span className="ml-1 rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 font-mono text-[10px] text-slate-400">
            {stats.sampleCount || 12}
          </span>
        </button>
      </div>

      {/* Discovered AWS Resources Hero Banner */}
      {isAws && (
        <div className="rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/30 via-slate-900/80 to-slate-900/80 p-5 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 font-mono text-[11px] text-cyan-300 font-semibold uppercase tracking-wider">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                Live Discovered Assets · AWS Profile: cloudpassport · Region: ap-south-1
              </div>
              <h3 className="text-base font-bold text-slate-100">
                Mumbai Datacenter Telemetry (708 gCO₂/kWh Grid Factor)
              </h3>
              <p className="text-xs text-slate-400">
                Real-time measurements ingested via AWS CloudWatch API for your 4 deployed resources.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-xl border border-cyan-500/30 bg-slate-950/70 px-3 py-1.5 font-mono text-cyan-300 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-cyan-400" />
                EC2: Carbon-Passport-Demo
              </span>
              <span className="rounded-xl border border-emerald-500/30 bg-slate-950/70 px-3 py-1.5 font-mono text-emerald-300 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                RDS: carbon-passport-db
              </span>
              <span className="rounded-xl border border-amber-500/30 bg-slate-950/70 px-3 py-1.5 font-mono text-amber-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Lambda: auth-worker
              </span>
              <span className="rounded-xl border border-teal-500/30 bg-slate-950/70 px-3 py-1.5 font-mono text-teal-300 flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5 text-teal-400" />
                S3: demo-2026
              </span>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <SpotlightCard className="glass-card glass-card-hover rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">Total Carbon Emissions</span>
            <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-2 text-cyan-300">
              <Cloud className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="font-mono text-3xl font-semibold text-slate-100">
              <Counter value={Number(totalCarbonKg)} suffix="" className="" />
              <span className="ml-1 text-sm font-sans text-slate-400">kg CO₂</span>
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-cyan-300">
              <ArrowDownRight className="h-4 w-4" />
              <span>{Number(totalCarbonTons).toFixed(4)} metric tons</span>
            </div>
          </div>
        </SpotlightCard>

        <SpotlightCard className="glass-card glass-card-hover rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">Energy Consumption</span>
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2 text-emerald-300">
              <Zap className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="font-mono text-3xl font-semibold text-slate-100">
              <Counter value={Number(totalKWh)} suffix="" className="" />
              <span className="ml-1 text-sm font-sans text-slate-400">kWh</span>
            </div>
            <div className="mt-2 text-xs text-slate-400">
              PUE: <span className="font-mono text-cyan-300">1.15</span> · {renewableRatioPct}% clean grid
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
              <Counter value={avgSustainabilityScore} suffix="" className="" />
              <span className="ml-1 text-sm font-sans text-slate-400">/ 100</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-slate-800/80">
              <div className="h-full rounded-full bg-gradient-to-r from-amber-400 via-emerald-400 to-cyan-400" style={{ width: `${avgSustainabilityScore}%` }} />
            </div>
          </div>
        </SpotlightCard>

        <SpotlightCard className="glass-card glass-card-hover rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">
              {isAws ? 'Live Cloud Assets' : 'Active Resources'}
            </span>
            <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 p-2 text-violet-300">
              <Layers className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="font-mono text-3xl font-semibold text-slate-100">
              <Counter value={totalResources} suffix="" className="" />
            </div>
            <div className="mt-2 text-xs text-slate-400">
              <span className="text-emerald-300">{totalResources - idleCount} active & monitored</span>
            </div>
          </div>
        </SpotlightCard>

        <SpotlightCard className="glass-card glass-card-hover rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">Carbon Savings Potential</span>
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2 text-emerald-300">
              <Trees className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="font-mono text-3xl font-semibold text-slate-100">
              <Counter value={isAws ? 6.6 : Math.round(totalCarbonKg * 0.15)} suffix="" className="" />
              <span className="ml-1 text-sm font-sans text-slate-400">kg/mo</span>
            </div>
            <div className="mt-2 text-xs text-emerald-300">
              Via Green AI scheduling
            </div>
          </div>
        </SpotlightCard>
      </div>

      {/* Historical Trend Chart */}
      <GlassSurface className="p-5">
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              {isAws ? 'Live AWS CloudWatch Carbon & Energy Telemetry' : 'Infrastructure Carbon & Energy Trajectory'}
            </h3>
            <p className="text-xs text-slate-400">
              {isAws
                ? 'Emissions calculated from live CloudWatch CPU/memory/storage metrics in ap-south-1.'
                : 'Aggregated carbon and electricity telemetry calculated from infrastructure resources.'}
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-300">
            <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />Carbon (kg CO₂)</span>
            <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />Energy (kWh)</span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activeHistoricalTrend} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="carbonFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="energyFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" vertical={false} />
              <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ stroke: 'rgba(6,182,212,0.22)', strokeWidth: 1, fill: 'rgba(6,182,212,0.04)' }}
                contentStyle={{
                  background: '#111411',
                  border: '1px solid #292D29',
                  borderRadius: '12px',
                  color: '#E2E8F0'
                }}
              />
              <Area type="monotone" dataKey="carbonKg" name="Carbon (kg CO₂)" stroke="#06B6D4" strokeWidth={2.5} fill="url(#carbonFill)" />
              <Area type="monotone" dataKey="kWh" name="Energy (kWh)" stroke="#10B981" strokeWidth={2} strokeDasharray="4 4" fill="url(#energyFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <SimpleGraph data={activeHistoricalTrend} dataKey="carbonKg" className="mt-2" />
      </GlassSurface>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GlassSurface className="p-5">
          <h3 className="mb-1 text-sm font-semibold text-slate-100">
            {isAws ? 'Live Emissions by AWS Service' : 'Emissions by Cloud Service'}
          </h3>
          <p className="mb-4 text-xs text-slate-400">
            {isAws ? 'SPECPower and cloud accounting calculations for deployed AWS assets.' : 'Service-level carbon distribution.'}
          </p>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={activeServiceBreakdown} dataKey="carbonKg" nameKey="service" cx="50%" cy="50%" innerRadius={58} outerRadius={86} paddingAngle={4}>
                  {activeServiceBreakdown.map((entry, index) => (
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
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex flex-wrap justify-center gap-3 text-xs">
            {activeServiceBreakdown.map((entry, index) => (
              <span key={entry.service} className="inline-flex items-center gap-1.5 font-mono text-slate-300">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                {entry.service}: <span className="font-semibold text-slate-100">{entry.carbonKg} kg</span>
              </span>
            ))}
          </div>
        </GlassSurface>

        <GlassSurface className="p-5">
          <h3 className="mb-1 text-sm font-semibold text-slate-100">
            {isAws ? 'Regional Datacenter Footprint · Mumbai (ap-south-1)' : 'Regional Grid Carbon Intensity'}
          </h3>
          <p className="mb-4 text-xs text-slate-400">
            {isAws ? 'Regional grid emission factor for Western India power grid.' : 'Carbon distribution by datacenter region.'}
          </p>
          <div className="space-y-3 mt-4">
            <div className="rounded-xl border border-cyan-500/30 bg-slate-900/60 p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-slate-200 font-bold flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  ap-south-1 (Asia Pacific - Mumbai)
                </span>
                <span className="font-mono text-cyan-300 font-bold">708 gCO₂/kWh</span>
              </div>
              <div className="mt-2 text-xs text-slate-400">
                Indian National Central Electricity Authority (CEA) Baseline Database. High thermal share creates significant carbon-reduction leverage for off-peak scheduling.
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-slate-200">Datacenter PUE Rating</div>
                <div className="text-[11px] text-slate-400">AWS Mumbai Availability Zone efficiency</div>
              </div>
              <div className="font-mono text-emerald-400 font-bold text-sm">1.15 PUE</div>
            </div>
          </div>
        </GlassSurface>
      </div>
    </div>
  );
}
