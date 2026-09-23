import React, { useState } from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';
import { TrendingDown, Sparkles, AlertCircle, CheckCircle, ShieldCheck, ArrowRight } from 'lucide-react';
import { GlassSurface, PillNav, SimpleGraph } from './ReactBits';

export default function ForecastView({ forecastData, onNavigateToRecs }) {
  const [activeSection, setActiveSection] = useState('overview');

  if (!forecastData) return null;

  const { summary, dailyForecast } = forecastData;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-emerald-300">Predictive Planning</p>
          <h2 className="mt-1 flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-100">
            <Sparkles className="h-5 w-5 text-emerald-400" />
            <span>Green AI 7-Day Forecast</span>
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Machine learning forecasting model anticipating grid intensity fluctuations and workload scheduling opportunities.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-mono text-emerald-300">
          <ShieldCheck className="h-4 w-4" />
          <span>Model Accuracy: 94.2%</span>
        </div>
      </div>

      <PillNav active={activeSection} onChange={setActiveSection} items={[{ id: 'overview', label: 'Overview' }, { id: 'forecast', label: 'Forecast' }, { id: 'trends', label: 'Trends' }, { id: 'insights', label: 'Insights' }]} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <GlassSurface className="glass-card-hover p-5">
          <div className="text-xs text-gray-400 font-semibold uppercase">Baseline 7-Day Predicted CO₂</div>
          <div className="text-2xl font-extrabold font-mono text-slate-100 mt-2">
            {summary.predicted7DayTotalBaselineKg} <span className="text-xs font-sans text-gray-400 font-normal">kg CO₂</span>
          </div>
          <div className="text-[11px] text-gray-500 mt-1">Un-optimized standard execution</div>
        </GlassSurface>

        <GlassSurface className="glass-card-hover border-emerald-500/30 p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">Green AI Optimized 7-Day CO₂</div>
          <div className="mt-2 font-mono text-2xl font-extrabold text-emerald-300">
            {summary.predicted7DayTotalOptimizedKg} <span className="text-xs font-sans font-normal text-slate-400">kg CO₂</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-300">
            <TrendingDown className="h-3.5 w-3.5" />
            <span>{summary.reductionPercentage}% Emissions Reduction</span>
          </div>
        </GlassSurface>

        <GlassSurface className="glass-card-hover p-5">
          <div className="text-xs text-gray-400 font-semibold uppercase">Potential 7-Day Carbon Avoidance</div>
          <div className="text-2xl font-extrabold font-mono text-cyan-400 mt-2">
            {summary.totalPotentialSavingsKg} <span className="text-xs font-sans text-gray-400 font-normal">kg CO₂</span>
          </div>
          <div className="text-[11px] text-gray-400 mt-1">Achievable via workload shifting & right-sizing</div>
        </GlassSurface>
      </div>

      {/* Predictive Forecast Chart */}
      <GlassSurface className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-100">7-Day Forward Emission Trajectory</h3>
            <p className="text-xs text-gray-400 mt-0.5">Comparing status-quo baseline vs Green AI carbon-aware scheduling curve.</p>
          </div>
          <div className="flex items-center space-x-4 text-xs font-medium">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-rose-400" />
              <span className="text-gray-300">Baseline Trajectory</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="text-gray-300">Green AI Optimized</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyForecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorOptimized" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
              <XAxis dataKey="day" stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{ stroke: 'rgba(163,230,53,0.22)', strokeWidth: 1, fill: 'rgba(163,230,53,0.04)' }}
                contentStyle={{ backgroundColor: '#111411', borderColor: '#292D29', borderRadius: '12px', fontSize: '12px' }}
                itemStyle={{ color: '#F2F4F0' }}
              />
              <Area type="monotone" dataKey="baselineEmissionsKg" name="Baseline (kg CO₂)" stroke="#F43F5E" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorBaseline)" />
              <Area type="monotone" dataKey="predictedOptimizedKg" name="AI Optimized (kg CO₂)" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorOptimized)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <SimpleGraph data={dailyForecast} dataKey="predictedOptimizedKg" className="mt-2" />
      </GlassSurface>

      {/* Day-by-day Breakdown Cards */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-slate-100">Daily Forecast & Confidence Breakdown</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {dailyForecast.map((day, idx) => (
            <div key={idx} className="space-y-2 rounded-xl border border-slate-800/80 bg-slate-900/60 p-3.5">
              <div className="truncate text-[11px] font-bold text-slate-200">{day.day}</div>
              <div className="space-y-1 font-mono text-xs">
                <div className="font-semibold text-rose-300">{day.baselineEmissionsKg} kg</div>
                <div className="font-bold text-emerald-300">{day.predictedOptimizedKg} kg</div>
              </div>
              <div className="flex items-center justify-between border-t border-slate-800 pt-2 font-mono text-[10px] text-slate-400">
                <span>Conf:</span>
                <span className="text-cyan-300">{day.confidenceIntervalPct.toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
