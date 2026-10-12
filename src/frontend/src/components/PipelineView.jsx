import React, { useState, useEffect } from 'react';
import {
  Play,
  RefreshCw,
  Database,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  ArrowRight,
  Server,
  Zap,
  Activity,
  ShieldCheck,
  Cloud,
  Cpu,
  HardDrive,
  Filter,
  Radio,
  FileCheck
} from 'lucide-react';
import { GlassSurface } from './ReactBits';

export default function PipelineView({ onPipelineCompleted }) {
  const [pipelineStatus, setPipelineStatus] = useState(null);
  const [dbHealth, setDbHealth] = useState(null);
  const [awsInventory, setAwsInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [runningAws, setRunningAws] = useState(false);
  const [runningSample, setRunningSample] = useState(false);
  const [selectedDays, setSelectedDays] = useState(30);
  const [activeHistoryTab, setActiveHistoryTab] = useState('aws'); // 'aws', 'all', 'sample'
  const [runMessage, setRunMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loadPipelineData = async () => {
    try {
      setLoading(true);
      const [statusRes, healthRes, awsRes] = await Promise.all([
        fetch('/api/pipeline/status', { cache: 'no-store' }).then(r => r.json()),
        fetch('/api/health', { cache: 'no-store' }).then(r => r.json()),
        fetch('/api/aws/inventory', { cache: 'no-store' }).then(r => r.json()).catch(() => ({ success: false }))
      ]);

      if (statusRes.success) setPipelineStatus(statusRes.data);
      if (healthRes.database) setDbHealth(healthRes.database);
      if (awsRes.success && awsRes.data) setAwsInventory(awsRes.data);
    } catch (err) {
      console.error('Failed to load pipeline telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPipelineData();
  }, []);

  const handleRunAwsPipeline = async () => {
    try {
      setRunningAws(true);
      setRunMessage('');
      setErrorMessage('');

      const response = await fetch('/api/pipeline/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataSource: 'aws_live' })
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'AWS Live Pipeline execution failed');
      }

      setRunMessage(result.message || 'AWS Live Pipeline executed successfully!');
      setActiveHistoryTab('aws');
      await loadPipelineData();
      if (onPipelineCompleted) onPipelineCompleted();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to execute AWS live pipeline');
    } finally {
      setRunningAws(false);
    }
  };

  const handleRunSamplePipeline = async () => {
    try {
      setRunningSample(true);
      setRunMessage('');
      setErrorMessage('');

      const response = await fetch('/api/pipeline/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: selectedDays, dataSource: 'sample_workload' })
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Sample pipeline execution failed');
      }

      setRunMessage(result.message || 'Benchmark pipeline completed successfully!');
      await loadPipelineData();
      if (onPipelineCompleted) onPipelineCompleted();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to execute sample data pipeline');
    } finally {
      setRunningSample(false);
    }
  };

  const latestAwsRun = pipelineStatus?.latestAwsRun;
  const recentRuns = pipelineStatus?.recentRuns || [];
  const awsRuns = pipelineStatus?.awsRuns || recentRuns.filter(r => r.data_source === 'aws_live_cloudwatch');
  const sampleRuns = pipelineStatus?.sampleRuns || recentRuns.filter(r => r.data_source !== 'aws_live_cloudwatch');

  const displayedRuns = activeHistoryTab === 'aws'
    ? awsRuns
    : activeHistoryTab === 'sample'
      ? sampleRuns
      : recentRuns;

  const liveResources = awsInventory?.resources || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">
            <Radio className="h-3 w-3 animate-pulse text-cyan-400" />
            Live Cloud Telemetry & Auditing
          </div>
          <h2 className="mt-2 flex items-center gap-2.5 text-2xl font-bold tracking-tight text-slate-100">
            <Database className="h-6 w-6 text-emerald-400" />
            <span>Cloud Carbon Data Pipeline Studio</span>
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Dual Ingestion Architecture: Priority Live AWS CloudWatch Pipeline + Historical Benchmark Simulation.
          </p>
        </div>

        <button
          onClick={loadPipelineData}
          disabled={loading || runningAws || runningSample}
          className="glass-panel flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-3.5 py-2 text-xs font-medium text-slate-200 transition hover:border-emerald-500/30 hover:text-emerald-300 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
          Refresh Pipeline Status
        </button>
      </div>

      {/* Database Connection & Health Card */}
      <div className="grid gap-4 md:grid-cols-3">
        <GlassSurface className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.16em] text-slate-400">PostgreSQL Database</span>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              dbHealth?.connected ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${dbHealth?.connected ? 'bg-emerald-400' : 'bg-rose-400'}`} />
              {dbHealth?.connected ? 'Connected' : 'Offline'}
            </span>
          </div>
          <div className="mt-3 font-mono text-xl font-bold text-slate-100">
            {dbHealth?.database || 'carbon_passport'}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Latency: <span className="font-mono text-emerald-300">{dbHealth?.latencyMs ?? '—'} ms</span> · Port 5433
          </div>
        </GlassSurface>

        <GlassSurface className="p-5 border-cyan-500/30 bg-slate-900/80">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.16em] text-cyan-300 font-semibold">Live AWS Assets</span>
            <span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/40 bg-cyan-500/15 px-2 py-0.5 text-[9px] font-bold text-cyan-300">
              <Cloud className="h-3 w-3" /> ap-south-1
            </span>
          </div>
          <div className="mt-3 font-mono text-2xl font-bold text-cyan-300">
            {liveResources.length} <span className="text-xs font-sans font-normal text-slate-300">Live Resources</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-300">
            EC2, RDS, Lambda, S3 in Mumbai
          </div>
        </GlassSurface>

        <GlassSurface className="p-5">
          <div className="text-[10px] uppercase tracking-[0.16em] text-slate-400">Latest Live AWS Run</div>
          <div className="mt-3 font-mono text-xl font-bold text-slate-100">
            {latestAwsRun ? (
              <span className="text-emerald-300 capitalize">Run #{latestAwsRun.run_id} ({latestAwsRun.status.toLowerCase()})</span>
            ) : (
              <span className="text-slate-500 text-base">No AWS runs yet</span>
            )}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {latestAwsRun ? `${latestAwsRun.records_ingested} resources processed in ${latestAwsRun.duration_ms}ms` : 'Ready to ingest'}
          </div>
        </GlassSurface>
      </div>

      {/* ========================================================================= */}
      {/* PRIORITY 1: AWS LIVE INGESTION PIPELINE (HERO CARD) */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-cyan-500/40 bg-gradient-to-br from-slate-900/90 via-slate-950/80 to-slate-900/90 p-6 shadow-[0_0_40px_rgba(6,182,212,0.15)] backdrop-blur-2xl">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                <Cloud className="h-4 w-4 text-cyan-300" />
                Primary Pipeline · Real AWS CloudWatch Telemetry
              </div>
              <h3 className="text-xl font-bold text-slate-100 sm:text-2xl">
                Live AWS Ingestion & Digital Passport Engine
              </h3>
              <p className="max-w-2xl text-xs text-slate-300 leading-relaxed">
                Connects directly to your authenticated AWS account (<code className="text-cyan-300 font-mono">126716541919</code> in <code className="text-cyan-300 font-mono">ap-south-1</code>), queries live CloudWatch metrics (CPU%, RAM, storage GB, invocations), calculates SPECPower wattage and Mumbai grid emissions (708 g/kWh), stores verified observations in PostgreSQL, and stamps official Digital Carbon Passports.
              </p>

              {/* Discovered live assets pill box */}
              <div className="mt-4 pt-2">
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-400 font-medium">Discovered AWS Resources for Ingestion:</span>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {liveResources.length > 0 ? (
                    liveResources.map((res) => (
                      <span
                        key={res.id}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-slate-950/80 px-2.5 py-1 text-[11px] font-mono text-cyan-200 shadow-sm"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                        <span className="font-semibold text-slate-100">{res.service}:</span>
                        <span>{res.name}</span>
                        <span className="text-[10px] text-cyan-400/80">({res.instanceType || 'storage'})</span>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">Loading discovered AWS resources...</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start lg:items-end gap-3 shrink-0">
              <button
                type="button"
                onClick={handleRunAwsPipeline}
                disabled={runningAws || runningSample}
                className="relative group flex items-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-400 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-950 shadow-[0_0_30px_rgba(6,182,212,0.5)] transition duration-200 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(6,182,212,0.8)] disabled:opacity-50 disabled:hover:scale-100"
              >
                {runningAws ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-slate-950" />
                    <span>Ingesting AWS Telemetry...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-slate-950" />
                    <span>Run Live AWS Pipeline</span>
                  </>
                )}
              </button>
              <span className="text-[11px] text-slate-400 font-mono">
                Updates PostgreSQL <code className="text-cyan-300">pipeline_runs</code> with <code className="text-cyan-300">aws_live_cloudwatch</code>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECONDARY PIPELINE: HISTORICAL BENCHMARK SIMULATION */}
      {/* ========================================================================= */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 shadow-lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.16em] text-slate-400 font-medium">
              <Layers className="h-3.5 w-3.5 text-slate-400" /> Benchmark Data Pipeline (Offline / 45-Day Dataset)
            </span>
            <h4 className="text-sm font-semibold text-slate-200">Ingest Historical Multi-Region Synthetic Benchmark</h4>
            <p className="max-w-xl text-xs text-slate-400">
              Simulates 45-day multi-region historical workload observations (us-east-1, us-west-2, eu-north-1) for training the Random Forest forecaster.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-950/60 p-1 text-xs">
              {[7, 14, 30].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setSelectedDays(days)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                    selectedDays === days
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {days}d
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleRunSamplePipeline}
              disabled={runningAws || runningSample}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs font-medium text-slate-200 transition hover:border-slate-500 hover:text-slate-100 disabled:opacity-50"
            >
              {runningSample ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-slate-400" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 text-slate-300" />
                  <span>Run Benchmark</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {runMessage && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-xs text-emerald-200 shadow-lg">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          <span className="font-medium">{runMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs text-rose-200 shadow-lg">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Target Architecture Flow */}
      <div className="glass-panel rounded-2xl p-5">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          Target Architecture Data Flow
        </h3>
        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 text-center">
          {[
            { step: '1. Source', desc: 'AWS / CloudWatch', icon: Cloud, color: 'text-cyan-300' },
            { step: '2. Ingestion', desc: 'ETL Pipeline', icon: Layers, color: 'text-emerald-300' },
            { step: '3. Normalization', desc: 'UTC & Sanitize', icon: ShieldCheck, color: 'text-amber-300' },
            { step: '4. Carbon Engine', desc: 'SPECPower / PUE', icon: Zap, color: 'text-emerald-400' },
            { step: '5. ML Forecast', desc: 'Random Forest', icon: Activity, color: 'text-cyan-400' },
            { step: '6. Storage', desc: 'PostgreSQL DB', icon: Database, color: 'text-indigo-300' },
            { step: '7. Passport', desc: 'ISO 14064 Cert', icon: FileCheck, color: 'text-emerald-300' }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className="glass-card rounded-xl p-2.5 border border-slate-800/80">
                <Icon className={`mx-auto h-4 w-4 ${item.color} mb-1`} />
                <div className="font-mono text-[10px] font-bold text-slate-200">{item.step}</div>
                <div className="text-[9px] text-slate-400 mt-0.5">{item.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PIPELINE EXECUTION HISTORY (WITH FILTER TABS) */}
      {/* ========================================================================= */}
      <div className="glass-panel overflow-hidden rounded-2xl">
        <div className="flex flex-col gap-4 border-b border-slate-800/80 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <span>Pipeline Execution History</span>
              <span className="font-mono text-xs text-slate-400">({displayedRuns.length} runs)</span>
            </h3>
            <p className="mt-0.5 text-xs text-slate-400">
              Audit trail of automated ingestion jobs stored in PostgreSQL (<code className="text-slate-300 font-mono">pipeline_runs</code>)
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950/80 p-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveHistoryTab('aws')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition ${
                activeHistoryTab === 'aws'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cloud className="h-3.5 w-3.5 text-cyan-400" />
              <span>AWS Live Pipeline</span>
              <span className="rounded-full bg-cyan-500/30 px-1.5 py-0.2 text-[10px] font-mono text-cyan-200">
                {awsRuns.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveHistoryTab('all')}
              className={`rounded-lg px-3 py-1.5 font-medium transition ${
                activeHistoryTab === 'all'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Runs ({recentRuns.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveHistoryTab('sample')}
              className={`rounded-lg px-3 py-1.5 font-medium transition ${
                activeHistoryTab === 'sample'
                  ? 'bg-slate-700/50 text-slate-200 border border-slate-600'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Benchmark ({sampleRuns.length})
            </button>
          </div>
        </div>

        {displayedRuns.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-400">
            {activeHistoryTab === 'aws' ? (
              <div className="space-y-3">
                <Cloud className="mx-auto h-8 w-8 text-cyan-400/60" />
                <p>No AWS Live Pipeline runs recorded yet.</p>
                <button
                  onClick={handleRunAwsPipeline}
                  className="rounded-xl bg-cyan-500/20 border border-cyan-500/40 px-4 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/30"
                >
                  Run Live AWS Pipeline Now
                </button>
              </div>
            ) : (
              'No runs recorded in this category.'
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950/60 uppercase tracking-wider text-[10px] text-slate-400">
                <tr>
                  <th className="px-5 py-3">Run ID</th>
                  <th className="px-5 py-3">Pipeline</th>
                  <th className="px-5 py-3">Data Source</th>
                  <th className="px-5 py-3">Records Ingested</th>
                  <th className="px-5 py-3">Emissions Calculated</th>
                  <th className="px-5 py-3">Duration</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Started At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {displayedRuns.map((run) => {
                  const isAwsRun = run.data_source === 'aws_live_cloudwatch';
                  return (
                    <tr
                      key={run.run_id}
                      className={`transition ${
                        isAwsRun
                          ? 'bg-cyan-500/[0.03] hover:bg-cyan-500/[0.08]'
                          : 'hover:bg-slate-800/20'
                      }`}
                    >
                      <td className="px-5 py-3.5 font-bold text-slate-200">#{run.run_id}</td>
                      <td className="px-5 py-3.5 text-slate-200 font-sans font-medium flex items-center gap-2">
                        {isAwsRun && <Cloud className="h-4 w-4 text-cyan-400 shrink-0" />}
                        <span>{run.pipeline_name}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        {isAwsRun ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/40 bg-cyan-500/15 px-2.5 py-0.5 text-[10px] font-semibold text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                            <Cloud className="h-3 w-3" />
                            aws_live_cloudwatch
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800/60 px-2 py-0.5 text-[10px] text-slate-400">
                            sample_workload
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-slate-200">
                        {Number(run.records_ingested).toLocaleString()}{' '}
                        {isAwsRun && <span className="text-[10px] text-cyan-400 font-sans">(live assets)</span>}
                      </td>
                      <td className="px-5 py-3.5 text-emerald-300">
                        {Number(run.emissions_calculated).toLocaleString()}{' '}
                        {isAwsRun && <span className="text-[10px] text-emerald-400 font-sans">(passports)</span>}
                      </td>
                      <td className="px-5 py-3.5 text-slate-400">{run.duration_ms} ms</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase ${
                          run.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                        }`}>
                          {run.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-400 font-sans">
                        {new Date(run.started_at).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
