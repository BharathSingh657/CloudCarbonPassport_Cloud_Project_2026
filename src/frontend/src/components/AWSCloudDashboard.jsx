import React, { useEffect, useState } from 'react';
import { Activity, Cloud, RefreshCw, Server, Database, Boxes, HardDrive } from 'lucide-react';
import CloudWatchUsagePanel from './CloudWatchUsagePanel';
import AWSCostExplorerPanel from './AWSCostExplorerPanel';

const serviceCards = [
  { service: 'Amazon EC2', label: 'EC2 instances', icon: Server },
  { service: 'Amazon RDS', label: 'RDS databases', icon: Database },
  { service: 'AWS Lambda', label: 'Lambda functions', icon: Boxes },
  { service: 'Amazon S3', label: 'S3 buckets', icon: HardDrive }
];

export default function AWSCloudDashboard() {
  const [status, setStatus] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadAwsData() {
      setLoading(true);
      setError('');
      try {
        const statusResponse = await fetch('/api/aws/status', { cache: 'no-store' });
        const statusResult = await statusResponse.json();
        if (!statusResponse.ok || !statusResult.success) {
          throw new Error(statusResult.message || `AWS status request failed (${statusResponse.status})`);
        }
        if (active) setStatus(statusResult.data);

        if (!statusResult.data.enabled) {
          if (active) setInventory(null);
          return;
        }

        const inventoryResponse = await fetch('/api/aws/inventory', { cache: 'no-store' });
        const inventoryResult = await inventoryResponse.json();
        if (!inventoryResponse.ok || !inventoryResult.success) {
          const details = (inventoryResult.errors || []).map((item) => `${item.service}: ${item.message}`).join('; ');
          throw new Error([inventoryResult.message || `AWS inventory request failed (${inventoryResponse.status})`, details].filter(Boolean).join(' '));
        }
        if (active) setInventory(inventoryResult.data);
      } catch (requestError) {
        if (active) setError(requestError.message || 'AWS request failed');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadAwsData();
    return () => { active = false; };
  }, [refreshCount]);

  const resources = inventory?.resources || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.22em] text-cyan-300">
            <Cloud className="h-3.5 w-3.5" /> AWS account
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-100">AWS Infrastructure Dashboard</h2>
          <p className="mt-1 text-xs text-slate-400">
            Read-only live inventory and CloudWatch usage from your configured AWS credentials.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setRefreshCount((count) => count + 1)}
          disabled={loading}
          className="glass-panel flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-3.5 py-2 text-xs font-medium text-slate-200 transition hover:border-cyan-500/30 hover:text-cyan-300 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-cyan-300 ${loading ? 'animate-spin' : ''}`} />
          Refresh AWS data
        </button>
      </div>

      <section className="glass-panel rounded-2xl p-5">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs">
          <div className="inline-flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${status?.enabled ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span className="font-semibold text-slate-100">{status?.enabled ? 'AWS live mode enabled' : 'AWS live mode disabled'}</span>
          </div>
          <span className="text-slate-400">Region: <span className="font-mono text-slate-200">{status?.region || '...'}</span></span>
          <span className="text-slate-400">Credential profile: <span className="font-mono text-slate-200">{status?.profile || '...'}</span></span>
          <span className="text-slate-400">Access: <span className="text-emerald-300">Read-only</span></span>
        </div>
      </section>

      {error && (
        <section role="alert" className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5">
          <h3 className="font-semibold text-rose-200">Could not load live AWS data</h3>
          <p className="mt-2 text-sm text-rose-100/90">{error}</p>
          <p className="mt-3 text-xs leading-5 text-slate-300">
            Configure AWS credentials locally (for example, sign in with AWS CLI using <code className="font-mono">aws configure sso</code>)
            and restart the backend. Do not send access keys or secret keys in chat.
          </p>
        </section>
      )}

      {status?.enabled && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {serviceCards.map(({ service, label, icon: Icon }) => (
              <div key={service} className="glass-card rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">{label}</span>
                  <Icon className="h-4 w-4 text-cyan-300" />
                </div>
                <div className="mt-3 font-mono text-3xl font-semibold text-slate-100">
                  {loading && !inventory ? '...' : inventory ? resources.filter((resource) => resource.service === service).length : '—'}
                </div>
              </div>
            ))}
          </div>

          <AWSCostExplorerPanel />
          <CloudWatchUsagePanel region={status.region} />

          <section className="glass-panel overflow-hidden rounded-2xl">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 p-5">
              <div>
                <h3 className="text-base font-semibold text-slate-100">Live resource inventory</h3>
                <p className="mt-1 text-xs text-slate-400">Read from AWS APIs · {inventory?.count || 0} resources</p>
              </div>
              {inventory?.collectedAt && (
                <span className="text-[11px] text-slate-500">Updated {new Date(inventory.collectedAt).toLocaleString()}</span>
              )}
            </div>

            {inventory?.errors?.length > 0 && (
              <div role="status" className="space-y-1 border-b border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-200">
                {inventory.errors.map((item) => (
                  <p key={item.service}>{item.service} inventory could not be read: {item.message}</p>
                ))}
              </div>
            )}

            {loading && !inventory ? (
              <div className="p-8 text-center text-sm text-slate-400">Loading AWS resource inventory…</div>
            ) : error && !inventory ? (
              <div className="p-8 text-center text-sm text-rose-200">Inventory unavailable. See the AWS access error above.</div>
            ) : resources.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400">
                No resources were returned for this account and region. S3 buckets are account-wide and may still appear here.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-xs">
                  <thead className="bg-slate-950/40 text-[10px] uppercase tracking-[0.14em] text-slate-500">
                    <tr>
                      <th className="px-5 py-3 font-medium">Resource</th>
                      <th className="px-5 py-3 font-medium">Service</th>
                      <th className="px-5 py-3 font-medium">Type</th>
                      <th className="px-5 py-3 font-medium">Region</th>
                      <th className="px-5 py-3 font-medium">State</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resources.map((resource) => (
                      <tr key={`${resource.service}-${resource.id}`} className="border-t border-slate-800/80">
                        <td className="px-5 py-3">
                          <div className="font-medium text-slate-200">{resource.name}</div>
                          <div className="mt-1 max-w-[280px] truncate font-mono text-[10px] text-slate-500">{resource.id}</div>
                        </td>
                        <td className="px-5 py-3 text-slate-300">{resource.service}</td>
                        <td className="px-5 py-3 font-mono text-slate-400">{resource.instanceType}</td>
                        <td className="px-5 py-3 font-mono text-slate-400">{resource.region}</td>
                        <td className="px-5 py-3 text-slate-300">{resource.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <p className="inline-flex items-center gap-2 text-[11px] leading-5 text-slate-500">
            <Activity className="h-3.5 w-3.5 shrink-0" />
            Inventory and API-call metrics are live AWS data. CPU, memory, storage usage, cost, and carbon emissions are not collected or inferred on this page.
          </p>
        </>
      )}
    </div>
  );
}
