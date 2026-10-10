import React, { useState } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, DollarSign, Cloud, Zap, RefreshCw, ShieldAlert, Cpu, ExternalLink } from 'lucide-react';
import { AnimatedList, GlassSurface } from './ReactBits';

export default function RecommendationsView({ recommendations, onApplyRecommendation }) {
  const [applyingId, setApplyingId] = useState(null);
  const [activeFilter, setActiveFilter] = useState('aws_live'); // 'aws_live', 'all', 'sample'

  const handleApply = async (id) => {
    setApplyingId(id);
    await onApplyRecommendation(id);
    setApplyingId(null);
  };

  const awsRecs = recommendations.filter(r => r.isLiveAws || r.source === 'aws_live' || (r.id && r.id.includes('aws-live')));
  const sampleRecs = recommendations.filter(r => !r.isLiveAws && r.source !== 'aws_live' && (!r.id || !r.id.includes('aws-live')));

  const displayedRecs = activeFilter === 'aws_live'
    ? awsRecs
    : activeFilter === 'sample'
    ? sampleRecs
    : recommendations;

  const totalCarbonSavings = displayedRecs.reduce((acc, r) => acc + (r.applied ? 0 : r.estimatedMonthlyCarbonSavingsKg), 0);
  const totalCostSavings = displayedRecs.reduce((acc, r) => acc + (r.applied ? 0 : r.estimatedMonthlyCostSavingsUsd), 0);

  const awsCarbonSavings = awsRecs.reduce((acc, r) => acc + (r.applied ? 0 : r.estimatedMonthlyCarbonSavingsKg), 0);
  const awsCostSavings = awsRecs.reduce((acc, r) => acc + (r.applied ? 0 : r.estimatedMonthlyCostSavingsUsd), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-cyan-300">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
            AI Sustainability Optimization Engine
          </div>
          <h2 className="mt-1 flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-100">
            <Sparkles className="h-5 w-5 text-emerald-400" />
            <span>Infrastructure Rightsizing & Green Routing</span>
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Green AI engine correlates live CloudWatch metrics with regional grid emissions to eliminate idle wattage and lower cloud costs.
          </p>
        </div>
      </div>

      {/* Filter Tabs prioritizing Live AWS */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-2 backdrop-blur-xl">
        <button
          onClick={() => setActiveFilter('aws_live')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeFilter === 'aws_live'
              ? 'border border-cyan-500/50 bg-gradient-to-r from-cyan-500/20 to-teal-500/20 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
              : 'border border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cloud className="h-3.5 w-3.5 text-cyan-400" />
          <span>Live AWS Infrastructure (Mumbai)</span>
          <span className="ml-1 rounded-full border border-cyan-500/40 bg-cyan-950/80 px-2 py-0.5 font-mono text-[10px] text-cyan-300">
            {awsRecs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveFilter('all')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeFilter === 'all'
              ? 'border border-emerald-500/50 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
              : 'border border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>All Recommendations</span>
          <span className="ml-1 rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-slate-300">
            {recommendations.length}
          </span>
        </button>

        <button
          onClick={() => setActiveFilter('sample')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeFilter === 'sample'
              ? 'border border-slate-700 bg-slate-800 text-slate-200'
              : 'border border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Benchmark Workloads</span>
          <span className="ml-1 rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 font-mono text-[10px] text-slate-400">
            {sampleRecs.length}
          </span>
        </button>
      </div>

      {/* Impact Summary Banner */}
      <div className="flex flex-col items-center justify-between gap-6 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/30 via-slate-900/80 to-slate-900/80 p-6 shadow-xl md:flex-row">
        <div className="space-y-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-cyan-300 font-semibold">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            {activeFilter === 'aws_live' ? 'Live AWS Mumbai Grid Impact (ap-south-1)' : 'Potential Fleet Optimization Impact'}
          </div>
          <h3 className="text-lg font-bold text-slate-100">
            {activeFilter === 'aws_live'
              ? 'Immediate Rightsizing & Green Scheduling for Live AWS Assets'
              : 'Unlocking Sustainable Cloud Performance'}
          </h3>
          <p className="max-w-xl text-xs text-slate-400">
            {activeFilter === 'aws_live'
              ? `Applying these optimizations to your 4 live AWS resources will avoid ${awsCarbonSavings.toFixed(1)} kg CO₂ per month and save ~$${awsCostSavings.toFixed(2)}/mo on AWS billing.`
              : `Applying all recommendations will reduce monthly carbon footprint by ${totalCarbonSavings.toFixed(1)} kg CO₂ while lowering operational expenses.`}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="rounded-xl border border-emerald-500/30 bg-slate-900/70 px-4 py-3 text-center">
            <div className="font-mono text-2xl font-extrabold text-emerald-300">
              {totalCarbonSavings.toFixed(1)} <span className="text-xs font-sans text-slate-400">kg/mo</span>
            </div>
            <div className="text-[10px] uppercase tracking-[0.16em] text-slate-400">Carbon Reduction</div>
          </div>

          <div className="rounded-xl border border-cyan-500/30 bg-slate-900/70 px-4 py-3 text-center">
            <div className="font-mono text-2xl font-extrabold text-cyan-300">
              ${totalCostSavings.toFixed(2)} <span className="text-xs font-sans text-slate-400">/mo</span>
            </div>
            <div className="text-[10px] uppercase tracking-[0.16em] text-slate-400">Cost Savings</div>
          </div>
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <AnimatedList items={displayedRecs} className="space-y-4">
        {displayedRecs.length === 0 ? (
          <div className="p-12 text-center glass-card rounded-2xl text-gray-400">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-100">All Infrastructure Optimizations Applied!</h3>
            <p className="text-xs text-gray-400 mt-1">Your cloud resources are operating at peak Green AI sustainability efficiency.</p>
          </div>
        ) : (
          displayedRecs.map((rec) => {
            const isApplying = applyingId === rec.id;
            const isLive = rec.isLiveAws || rec.source === 'aws_live' || (rec.id && rec.id.includes('aws-live'));
            return (
              <GlassSurface
                key={rec.id}
                className={`glass-card glass-card-hover rounded-2xl border p-5 transition-all ${
                  rec.applied
                    ? 'border-slate-800/80 bg-slate-900/40 opacity-70'
                    : isLive
                    ? 'border-cyan-500/40 bg-gradient-to-r from-cyan-950/20 via-slate-900/60 to-slate-900/60 hover:border-cyan-500/70 shadow-[0_0_20px_rgba(6,182,212,0.1)]'
                    : 'border-slate-800/80 hover:border-emerald-500/40'
                }`}
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  {/* Left Metadata & Info */}
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      {isLive && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/50 bg-cyan-500/20 px-2.5 py-0.5 font-mono text-[9px] font-bold text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                          <Cloud className="h-3 w-3" />
                          LIVE AWS (ap-south-1)
                        </span>
                      )}

                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                          rec.severity === 'HIGH'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : rec.severity === 'MEDIUM'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                        }`}
                      >
                        {rec.severity} Impact · Score {rec.impactScore || 90}
                      </span>

                      <span className="text-xs text-gray-400 font-mono">
                        {rec.service} • {rec.resourceName}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                      <span>{rec.title}</span>
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed">{rec.description}</p>

                    <div className="flex items-center gap-2 rounded-lg border border-slate-800/80 bg-slate-900/70 p-2.5 font-mono text-xs text-emerald-300">
                      <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 text-emerald-300" />
                      <span>Recommended Action: {rec.action}</span>
                    </div>

                    <div className="text-[10px] font-mono text-slate-500 truncate" title={rec.resourceId}>
                      Target Asset ID: {rec.resourceId}
                    </div>
                  </div>

                  {/* Right Impact Metrics & Action Button */}
                  <div className="flex flex-col items-end space-y-3 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-gray-800">
                    <div className="flex items-center space-x-4 font-mono text-xs text-right">
                      <div>
                        <div className="text-emerald-400 font-bold text-sm">
                          -{rec.estimatedMonthlyCarbonSavingsKg} kg
                        </div>
                        <div className="text-[10px] text-gray-500">CO₂ / month</div>
                      </div>
                      <div>
                        <div className="text-cyan-400 font-bold text-sm">
                          +${rec.estimatedMonthlyCostSavingsUsd}
                        </div>
                        <div className="text-[10px] text-gray-500">USD / month</div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleApply(rec.id)}
                      disabled={rec.applied || isApplying}
                      className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition md:w-auto ${
                        rec.applied
                          ? 'cursor-not-allowed border border-slate-700 bg-slate-800 text-slate-500'
                          : isLive
                          ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-teal-400'
                          : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-400'
                      }`}
                    >
                      {isApplying ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin text-slate-950" />
                          <span>Applying Optimization...</span>
                        </>
                      ) : rec.applied ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Optimization Applied</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Simulate & Apply</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </GlassSurface>
            );
          })
        )}
      </AnimatedList>
    </div>
  );
}
