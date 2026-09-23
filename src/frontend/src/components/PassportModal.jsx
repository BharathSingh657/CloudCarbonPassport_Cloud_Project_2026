import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Download, Leaf, Clock, Zap, CheckCircle2 } from 'lucide-react';
import { ReflectiveCard } from './ReactBits';

export default function PassportModal({ resource, onClose }) {
  const [passportData, setPassportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    if (resource) {
      setLoading(true);
      fetch(`/api/resources/${resource.id}/passport`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setPassportData(data.data);
        })
        .catch((err) => console.error('Error fetching passport:', err))
        .finally(() => setLoading(false));
    }
  }, [resource]);

  if (!resource) return null;

  const handleDownloadJson = () => {
    if (!passportData) return;
    const jsonStr = JSON.stringify(passportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${passportData.passportId}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  return (
    <div className="passport-overlay fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="passport-theme glass-modal reflective-card relative my-6 w-full max-w-4xl overflow-hidden rounded-[32px] border border-emerald-500/20 bg-slate-950/90 shadow-[0_30px_80px_rgba(0,0,0,0.7)]">
        <div className="passport-header border-b border-slate-800/80 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 shadow-lg shadow-emerald-500/20">
                <Leaf className="h-6 w-6 text-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-slate-100">Digital Carbon Passport</h3>
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.16em] text-emerald-300">
                    ISO 14064
                  </span>
                </div>
                <p className="text-xs text-slate-400">Verifiable cloud sustainability identity</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-700 bg-slate-900/80 p-2 text-slate-300 transition hover:border-slate-600 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {loading || !passportData ? (
          <div className="flex min-h-[220px] items-center justify-center p-12 text-center">
            <div className="flex flex-col items-center gap-3 text-slate-300">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
              <div className="text-sm font-medium">Generating passport…</div>
            </div>
          </div>
        ) : (
          <div className="max-h-[75vh] overflow-y-auto p-5 sm:p-6">
            <ReflectiveCard className="p-5 sm:p-6">
              <div className="mb-5 flex flex-col gap-4 border-b border-slate-800/80 pb-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-emerald-300">Passport Serial</div>
                  <div className="mt-1 font-mono text-xl font-semibold text-slate-100">{passportData.passportId}</div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white">
                    <div className="grid grid-cols-4 gap-[2px] p-1">
                      {Array.from({ length: 16 }).map((_, i) => (
                        <span key={i} className={`h-1.5 w-1.5 rounded-sm ${i % 2 === 0 ? 'bg-slate-950' : 'bg-slate-950/30'}`} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-emerald-300">
                      <ShieldCheck className="h-4 w-4" /> Verified
                    </div>
                    <div className="mt-1 text-[10px] text-slate-400">Signed by Green AI Engine</div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Sustainability Score</div>
                  <div className="mt-3 font-mono text-3xl font-semibold text-emerald-300">{passportData.sustainabilityScore}</div>
                  <div className="mt-2 text-xs text-slate-300">Rating: {passportData.sustainabilityRating}</div>
                </div>

                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Carbon Footprint</div>
                  <div className="mt-3 font-mono text-3xl font-semibold text-cyan-300">{passportData.metrics.carbonKgCO2}</div>
                  <div className="mt-2 text-xs text-slate-300">kg CO₂eq</div>
                </div>

                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Renewable Energy</div>
                  <div className="mt-3 font-mono text-3xl font-semibold text-emerald-300">{passportData.metrics.renewablePct}%</div>
                  <div className="mt-2 text-xs text-slate-300">Grid: {passportData.gridProvider}</div>
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
                  <div className="mb-3 text-[10px] uppercase tracking-[0.18em] text-slate-400">Resource Identity</div>
                  <div className="space-y-3 text-sm text-slate-200">
                    <div className="flex justify-between gap-3"><span>Resource ID</span><span className="font-mono text-slate-100">{passportData.resourceId}</span></div>
                    <div className="flex justify-between gap-3"><span>Service</span><span className="font-mono text-slate-100">{passportData.service}</span></div>
                    <div className="flex justify-between gap-3"><span>Region</span><span className="font-mono text-slate-100">{passportData.region}</span></div>
                    <div className="flex justify-between gap-3"><span>Instance Type</span><span className="font-mono text-slate-100">{passportData.instanceType}</span></div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
                  <div className="mb-3 text-[10px] uppercase tracking-[0.18em] text-slate-400">Operational Impact</div>
                  <div className="space-y-3 text-sm text-slate-200">
                    <div className="flex justify-between gap-3"><span>Power</span><span className="font-mono text-slate-100">{passportData.metrics.powerWatts} W</span></div>
                    <div className="flex justify-between gap-3"><span>Energy</span><span className="font-mono text-slate-100">{passportData.metrics.totalKWh} kWh</span></div>
                    <div className="flex justify-between gap-3"><span>Carbon Intensity</span><span className="font-mono text-slate-100">{passportData.metrics.carbonIntensity} gCO₂/kWh</span></div>
                    <div className="flex justify-between gap-3"><span>AI Status</span><span className="inline-flex items-center gap-1.5 text-emerald-300"><CheckCircle2 className="h-3.5 w-3.5" /> OPTIMIZED</span></div>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
                <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-slate-400">
                  <Zap className="h-4 w-4 text-amber-300" /> GHG Protocol Breakdown
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3">
                    <div className="text-xs text-slate-400">Scope 2</div>
                    <div className="mt-1 font-mono text-lg font-semibold text-slate-100">{passportData.ghgProtocol.scope2} kg</div>
                  </div>
                  <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3">
                    <div className="text-xs text-slate-400">Scope 3</div>
                    <div className="mt-1 font-mono text-lg font-semibold text-slate-100">{passportData.ghgProtocol.scope3} kg</div>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
                <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-slate-400">
                  <Clock className="h-4 w-4 text-emerald-300" /> Audit Trail
                </div>
                <div className="space-y-2 text-sm text-slate-200">
                  {passportData.auditTrail.map((item, index) => (
                    <div key={index} className="flex justify-between gap-4 rounded-xl border border-slate-800/80 bg-slate-950/60 px-3 py-2">
                      <div>
                        <div className="font-medium text-slate-100">{item.event}</div>
                        <div className="mt-1 font-mono text-[10px] text-slate-400">{item.timestamp}</div>
                      </div>
                      <div className="text-right font-mono text-emerald-300">{item.carbonRateKg} kg</div>
                    </div>
                  ))}
                </div>
              </div>
            </ReflectiveCard>
          </div>
        )}

        <div className="passport-footer flex flex-col gap-3 border-t border-slate-800/80 bg-slate-950/90 p-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={handleDownloadJson}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2.5 text-xs font-semibold text-slate-950 transition hover:brightness-110"
          >
            <Download className="h-4 w-4" />
            {downloadSuccess ? 'Downloaded' : 'Export JSON'}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:border-slate-600 hover:text-white"
          >
            Close Passport
          </button>
        </div>
      </div>
    </div>
  );
}
