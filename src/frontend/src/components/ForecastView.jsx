import React from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';
import { TrendingDown, Sparkles, AlertCircle, CheckCircle, ShieldCheck, ArrowRight } from 'lucide-react';

export default function ForecastView({ forecastData, onNavigateToRecs }) {
  if (!forecastData) return null;

  const { summary, dailyForecast } = forecastData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 tracking-tight flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span>Green AI 7-Day Carbon Emission Predictive Forecast</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Machine Learning forecasting model anticipating grid intensity fluctuations and workload scheduling opportunities.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-xl border border-emerald-500/30">
          <ShieldCheck className="w-4 h-4" />
          <span>Model Accuracy: 94.2%</span>
        </div>
      </div>

      {/* Summary KPI Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl">
          <div className="text-xs text-gray-400 font-semibold uppercase">Baseline 7-Day Predicted CO₂</div>
          <div className="text-2xl font-extrabold font-mono text-slate-100 mt-2">
            {summary.predicted7DayTotalBaselineKg} <span className="text-xs font-sans text-gray-400 font-normal">kg CO₂</span>
          </div>
          <div className="text-[11px] text-gray-500 mt-1">Un-optimized standard execution</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-emerald-500/30">
          <div className="text-xs text-emerald-400 font-semibold uppercase">Green AI Optimized 7-Day CO₂</div>
          <div className="text-2xl font-extrabold font-mono text-emerald-400 mt-2">
            {summary.predicted7DayTotalOptimizedKg} <span className="text-xs font-sans text-gray-400 font-normal">kg CO₂</span>
          </div>
          <div className="text-[11px] text-emerald-400/80 mt-1 font-semibold flex items-center space-x-1">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>{summary.reductionPercentage}% Emissions Reduction</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="text-xs text-gray-400 font-semibold uppercase">Potential 7-Day Carbon Avoidance</div>
          <div className="text-2xl font-extrabold font-mono text-cyan-400 mt-2">
            {summary.totalPotentialSavingsKg} <span className="text-xs font-sans text-gray-400 font-normal">kg CO₂</span>
          </div>
          <div className="text-[11px] text-gray-400 mt-1">Achievable via workload shifting & right-sizing</div>
        </div>
      </div>

      {/* Predictive Forecast Chart */}
      <div className="glass-card p-6 rounded-2xl">
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
                contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px', fontSize: '12px' }}
                itemStyle={{ color: '#F3F4F6' }}
              />
              <Area type="monotone" dataKey="baselineEmissionsKg" name="Baseline (kg CO₂)" stroke="#F43F5E" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorBaseline)" />
              <Area type="monotone" dataKey="predictedOptimizedKg" name="AI Optimized (kg CO₂)" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorOptimized)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Day-by-day Breakdown Cards */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-slate-100">Daily Forecast & Confidence Breakdown</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {dailyForecast.map((day, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-dark-900 border border-gray-800 space-y-2">
              <div className="text-[11px] font-bold text-slate-200 truncate">{day.day}</div>
              <div className="space-y-1 font-mono text-xs">
                <div className="text-rose-400 font-semibold">{day.baselineEmissionsKg} kg</div>
                <div className="text-emerald-400 font-bold">{day.predictedOptimizedKg} kg</div>
              </div>
              <div className="pt-2 border-t border-gray-800 text-[10px] text-gray-500 font-mono flex justify-between">
                <span>Conf:</span>
                <span className="text-cyan-400">{day.confidenceIntervalPct.toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
