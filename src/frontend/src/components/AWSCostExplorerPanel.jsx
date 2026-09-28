import React, { useEffect, useState } from 'react';
import { DollarSign, RefreshCw } from 'lucide-react';

function formatCurrency(value, currency) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2
  }).format(value);
}

export default function AWSCostExplorerPanel() {
  const [snapshot, setSnapshot] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadCosts() {
      setLoading(true);
      setError('');
      try {
        const response = await fetch('/api/aws/costs', { cache: 'no-store' });
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || `Cost Explorer request failed (${response.status})`);
        }
        if (active) setSnapshot(result.data);
      } catch (requestError) {
        if (active) setError(requestError.message || 'AWS Cost Explorer request failed');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadCosts();
    return () => { active = false; };
  }, [refreshCount]);

  return (
    <section className="glass-panel rounded-2xl p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-emerald-300">
            <DollarSign className="h-3.5 w-3.5" /> Actual AWS billing data
          </p>
          <h3 className="mt-1 text-base font-semibold text-slate-100">Cost Explorer · last 30 complete days</h3>
          <p className="mt-1 text-xs text-slate-400">
            Read-only AWS Cost Explorer totals by service. Billing data is not workload or carbon data.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setRefreshCount((count) => count + 1)}
          disabled={loading}
          aria-label="Refresh AWS billing data"
          className="rounded-lg border border-slate-700 bg-slate-950/50 p-2 text-slate-300 hover:border-emerald-400/50 hover:text-emerald-300 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error ? (
        <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
          <p>{error}</p>
          <p className="mt-2 text-xs text-rose-100/80">
            The AWS profile needs the read-only <code className="font-mono">ce:GetCostAndUsage</code> permission.
            Cost Explorer must also be enabled for this account.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">Account spend</p>
            <p className="mt-1 font-mono text-3xl font-semibold text-slate-100">
              {loading && !snapshot ? '...' : snapshot ? formatCurrency(snapshot.total, snapshot.currency) : '—'}
            </p>
            {snapshot && (
              <p className="mt-1 text-xs text-slate-400">
                {snapshot.startDate} through {snapshot.endDate} (end date exclusive)
              </p>
            )}
          </div>

          {snapshot?.services?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-xs">
                <thead className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                  <tr>
                    <th className="pb-2 pr-4 font-medium">AWS service</th>
                    <th className="pb-2 text-right font-medium">Spend</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshot.services.slice(0, 10).map((item) => (
                    <tr key={item.service} className="border-t border-slate-800/80">
                      <td className="py-2 pr-4 text-slate-300">{item.service}</td>
                      <td className="py-2 text-right font-mono text-emerald-200">
                        {formatCurrency(item.amount, snapshot.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : !loading && snapshot ? (
            <p className="rounded-xl border border-slate-700/70 bg-slate-950/30 p-4 text-sm text-slate-400">
              Cost Explorer returned no service charges for this period. This is billing information only and does not imply
              that AWS resources are running.
            </p>
          ) : null}
        </>
      )}
    </section>
  );
}
