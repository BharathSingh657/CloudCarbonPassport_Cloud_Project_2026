import React, { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { Activity, RefreshCw } from 'lucide-react';

export default function CloudWatchUsagePanel({ region = 'ap-south-1' }) {
  const [snapshot, setSnapshot] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadUsage() {
      setLoading(true);
      setError('');
      try {
        const response = await fetch('/api/cloudwatch/usage?hours=24', { cache: 'no-store' });
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || `Request failed (${response.status})`);
        }
        if (active) setSnapshot(result.data);
      } catch (requestError) {
        if (active) setError(requestError.message || 'CloudWatch request failed');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadUsage();
    return () => { active = false; };
  }, [refreshCount]);

  const series = [...(snapshot?.series || [])]
    .sort((left, right) => right.totalCalls - left.totalCalls)
    .slice(0, 8);

  return (
    <section className="glass-panel rounded-2xl p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-cyan-300">
            <Activity className="h-3.5 w-3.5" /> Live CloudWatch data
          </p>
          <h3 className="mt-1 text-base font-semibold text-slate-100">AWS API request activity</h3>
          <p className="mt-1 text-xs text-slate-400">
            AWS/Usage CallCount · {snapshot?.region || region} · last 24 hours
          </p>
        </div>
        <button
          type="button"
          onClick={() => setRefreshCount((count) => count + 1)}
          disabled={loading}
          aria-label="Refresh CloudWatch usage"
          title="Refresh CloudWatch usage"
          className="rounded-lg border border-slate-700 bg-slate-950/50 p-2 text-slate-300 transition hover:border-cyan-400/50 hover:text-cyan-300 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error ? (
        <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
          {error}
        </div>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-end gap-x-6 gap-y-2">
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">Recorded API calls</p>
              <p className="mt-1 font-mono text-3xl font-semibold text-slate-100">
                {loading && !snapshot ? '...' : Number(snapshot?.totalCalls || 0).toLocaleString()}
              </p>
            </div>
            <p className="pb-1 text-xs text-slate-400">
              {snapshot?.seriesCount || 0} metric series discovered · hourly sums
            </p>
          </div>

          {snapshot?.truncated && (
            <p className="mb-3 text-xs text-amber-300">Showing the first 100 metric series.</p>
          )}

          {snapshot?.timeline?.length > 0 ? (
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={snapshot.timeline} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cloudWatchUsageFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#67E8F9" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#67E8F9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" vertical={false} />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit' })}
                    stroke="#94A3B8"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value) => [Number(value).toLocaleString(), 'API calls']}
                    contentStyle={{ background: '#111411', border: '1px solid #292D29', borderRadius: '10px', color: '#E2E8F0' }}
                  />
                  <Area type="monotone" dataKey="calls" name="API calls" stroke="#67E8F9" strokeWidth={2} fill="url(#cloudWatchUsageFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="rounded-xl border border-slate-700/70 bg-slate-950/30 p-4 text-sm text-slate-400">
              CloudWatch returned no datapoints in this time window. Try refreshing later; usage metrics may be sparse.
            </p>
          )}

          {series.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[460px] text-left text-xs">
                <thead className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                  <tr>
                    <th className="pb-2 pr-4 font-medium">AWS service</th>
                    <th className="pb-2 pr-4 font-medium">API resource</th>
                    <th className="pb-2 text-right font-medium">Calls</th>
                  </tr>
                </thead>
                <tbody>
                  {series.map((item) => (
                    <tr key={`${item.service}-${item.resource}-${item.type}-${item.class}`} className="border-t border-slate-800/80">
                      <td className="py-2 pr-4 text-slate-300">{item.service}</td>
                      <td className="py-2 pr-4 font-mono text-slate-400">{item.resource}</td>
                      <td className="py-2 text-right font-mono text-cyan-200">{Math.round(item.totalCalls).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="mt-4 border-t border-slate-800/80 pt-3 text-[11px] leading-5 text-slate-500">
            This is AWS API usage telemetry, not EC2/RDS/Lambda workload utilization. It cannot be converted into carbon emissions.
            CloudWatch access is read-only; no AWS resources are created.
          </p>
        </>
      )}
    </section>
  );
}
