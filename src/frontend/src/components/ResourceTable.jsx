import React, { useState } from 'react';
import { Search, Filter, Server, FileText, Cloud, CheckCircle, ExternalLink, Zap } from 'lucide-react';
import { GlassSurface, GlideSelect, StatusMark } from './ReactBits';

export default function ResourceTable({ resources, onSelectPassport }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState('All');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('all'); // 'all', 'aws_live', 'sample'

  const services = ['All', 'Amazon EC2', 'Amazon RDS', 'Amazon S3', 'AWS Lambda', 'Amazon ECS'];
  const regions = ['All', 'Account-wide', 'ap-south-1', 'us-east-1', 'us-west-2', 'eu-north-1', 'eu-west-1', 'ap-southeast-1'];
  const statuses = ['All', 'Optimal', 'Active', 'Warning', 'Critical', 'Stopped', 'Pending', 'Listed', 'Unknown'];

  const awsCount = resources.filter(r => r.isLiveAws || r.source === 'aws_live').length;
  const sampleCount = resources.filter(r => !r.isLiveAws && r.source !== 'aws_live').length;

  const filteredResources = resources.filter((res) => {
    const isLive = res.isLiveAws || res.source === 'aws_live';
    if (sourceFilter === 'aws_live' && !isLive) return false;
    if (sourceFilter === 'sample' && isLive) return false;

    const matchesSearch =
      res.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.instanceType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesService = selectedService === 'All' || res.service === selectedService;
    const matchesRegion = selectedRegion === 'All' || res.region === selectedRegion;
    const matchesStatus = selectedStatus === 'All' || res.status === selectedStatus;

    return matchesSearch && matchesService && matchesRegion && matchesStatus;
  });

  const getStatusClass = (status) => {
    const normalized = String(status || '').toLowerCase();
    if (normalized.includes('optimal') || normalized.includes('efficient') || normalized.includes('active')) return 'status-healthy';
    if (normalized.includes('warning') || normalized.includes('moderate')) return 'status-warning';
    if (normalized.includes('critical') || normalized.includes('high')) return 'status-danger';
    return 'status-info';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-cyan-300">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Infrastructure Inventory & Live Asset Registry
          </div>
          <h2 className="mt-1 flex items-center gap-2 text-xl font-semibold text-slate-100">
            <Server className="h-5 w-5 text-emerald-400" /> Cloud Infrastructure Resource Hub
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1.5 font-mono text-[11px] text-slate-400">
            Showing <span className="font-semibold text-emerald-300">{filteredResources.length}</span> of {resources.length} resources
          </div>
        </div>
      </div>

      {/* Priority Source Segregation Filter */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-2 backdrop-blur-xl">
        <button
          onClick={() => setSourceFilter('aws_live')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            sourceFilter === 'aws_live'
              ? 'border border-cyan-500/50 bg-gradient-to-r from-cyan-500/20 to-teal-500/20 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
              : 'border border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cloud className="h-3.5 w-3.5 text-cyan-400" />
          <span>Live AWS Cloud Assets</span>
          <span className="ml-1 rounded-full border border-cyan-500/40 bg-cyan-950/80 px-2 py-0.5 font-mono text-[10px] text-cyan-300">
            {awsCount}
          </span>
        </button>

        <button
          onClick={() => setSourceFilter('all')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            sourceFilter === 'all'
              ? 'border border-emerald-500/50 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
              : 'border border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>All Discovered Resources</span>
          <span className="ml-1 rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-slate-300">
            {resources.length}
          </span>
        </button>

        <button
          onClick={() => setSourceFilter('sample')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            sourceFilter === 'sample'
              ? 'border border-slate-700 bg-slate-800 text-slate-200'
              : 'border border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Benchmark Workloads</span>
          <span className="ml-1 rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 font-mono text-[10px] text-slate-400">
            {sampleCount}
          </span>
        </button>
      </div>

      <div className="glass-panel rounded-2xl border border-slate-800/80 p-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by resource name, ARN, ID, or instance..."
              className="w-full rounded-xl border border-slate-700 bg-slate-900/70 py-2.5 pl-9 pr-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-emerald-500/40 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 text-[11px] text-slate-300">
              <Filter className="h-3.5 w-3.5 text-emerald-300" />
              <span>Service</span>
              <GlideSelect label="" value={selectedService} onChange={setSelectedService} options={services} />
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-300">
              <span>Region</span>
              <GlideSelect label="" value={selectedRegion} onChange={setSelectedRegion} options={regions} />
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-300">
              <span>Status</span>
              <GlideSelect label="" value={selectedStatus} onChange={setSelectedStatus} options={statuses} />
            </div>
          </div>
        </div>
      </div>

      <GlassSurface className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800/80 bg-slate-900/60 text-[10px] uppercase tracking-[0.16em] text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Resource & Provenance</th>
                <th className="px-4 py-3 font-medium">Service / Region</th>
                <th className="px-4 py-3 font-medium">Telemetry</th>
                <th className="px-4 py-3 font-medium">Power & Energy</th>
                <th className="px-4 py-3 font-medium">Carbon Footprint</th>
                <th className="px-4 py-3 font-medium">Rating</th>
                <th className="px-4 py-3 text-right font-medium">Passport</th>
              </tr>
            </thead>
            <tbody>
              {filteredResources.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-10 text-center text-slate-400">
                    No matching resources found for the selected filters.
                  </td>
                </tr>
              ) : (
                filteredResources.map((res) => {
                  const m = res.metrics;
                  const isLive = res.isLiveAws || res.source === 'aws_live';
                  return (
                    <tr
                      key={res.id}
                      className={`border-t border-slate-800/80 transition ${
                        isLive
                          ? 'bg-gradient-to-r from-cyan-950/20 via-transparent to-transparent hover:bg-cyan-950/30'
                          : 'hover:bg-slate-900/30'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-100">{res.name}</span>
                          {isLive ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/40 bg-cyan-500/15 px-2 py-0.5 font-mono text-[9px] font-semibold text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                              LIVE AWS
                            </span>
                          ) : (
                            <span className="rounded-full border border-slate-700 bg-slate-800/80 px-1.5 py-0.5 text-[9px] text-slate-400">
                              Benchmark
                            </span>
                          )}
                        </div>
                        <div className="mt-1 font-mono text-[10px] text-slate-400 truncate max-w-xs" title={res.id}>
                          {res.id}
                        </div>
                        <div className="mt-0.5 text-[10px] text-slate-400">
                          {res.instanceType !== 'unknown' ? res.instanceType : res.service}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-100">{res.service}</div>
                        <div className="mt-1 inline-flex items-center gap-1.5 font-mono text-[10px] text-slate-400">
                          <span className={`h-2 w-2 rounded-full ${isLive ? 'bg-cyan-400' : 'bg-emerald-400'}`} />
                          {res.region}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="mb-1 flex items-center justify-between gap-3 text-[10px] text-slate-400">
                          <span>{res.service === 'Amazon S3' ? 'Storage' : 'CPU'}</span>
                          <span className="font-mono text-slate-200">
                            {res.service === 'Amazon S3' ? `${res.storageGB} GB` : `${res.cpuUtilization}%`}
                          </span>
                        </div>
                        <div className="h-1.5 w-28 overflow-hidden rounded-full bg-slate-800">
                          <div
                            className={`h-full rounded-full ${
                              isLive ? 'bg-gradient-to-r from-cyan-400 to-teal-400' : res.cpuUtilization < 20 ? 'bg-amber-400' : 'bg-emerald-400'
                            }`}
                            style={{ width: `${Math.min(res.cpuUtilization || 10, 100)}%` }}
                          />
                        </div>
                      </td>

                      <td className="px-4 py-3 font-mono text-slate-200">
                        <div>{m.powerWatts} W</div>
                        <div className="mt-1 text-[10px] text-slate-400">{m.totalKWh} kWh</div>
                      </td>

                      <td className="px-4 py-3 font-mono text-slate-200">
                        <div className={isLive ? 'text-cyan-300 font-semibold' : 'text-emerald-300'}>
                          {m.carbonKgCO2} kg
                        </div>
                        <div className="mt-1 text-[10px] text-slate-400">{m.carbonIntensity} gCO₂/kWh</div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-2.5 py-1 text-[10px] font-medium text-slate-200">
                          <span className={`font-mono font-bold ${isLive ? 'text-cyan-300' : 'text-emerald-300'}`}>
                            {m.sustainabilityScore}
                          </span>
                          <StatusMark status={res.status} className={`${getStatusClass(res.status)} text-[11px]`} />
                        </div>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => onSelectPassport(res)}
                          className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-[11px] font-semibold transition ${
                            isLive
                              ? 'border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 hover:border-cyan-500/70 hover:bg-cyan-500/20 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                              : 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:border-emerald-500/50 hover:bg-emerald-500/20'
                          }`}
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span>View Passport</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </GlassSurface>
    </div>
  );
}
