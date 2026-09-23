import React, { useState } from 'react';
import { Search, Filter, Server, FileText } from 'lucide-react';
import { GlassSurface, GlideSelect, StatusMark } from './ReactBits';

export default function ResourceTable({ resources, onSelectPassport }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState('All');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const services = ['All', 'Amazon EC2', 'Amazon RDS', 'Amazon S3', 'AWS Lambda', 'Amazon ECS'];
  const regions = ['All', 'us-east-1', 'us-west-2', 'eu-north-1', 'eu-west-1', 'ap-south-1', 'ap-southeast-1'];
  const statuses = ['All', 'Optimal', 'Active', 'Warning', 'Critical'];

  const filteredResources = resources.filter((res) => {
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
    if (normalized.includes('optimal') || normalized.includes('efficient')) return 'status-healthy';
    if (normalized.includes('warning') || normalized.includes('moderate')) return 'status-warning';
    if (normalized.includes('critical') || normalized.includes('high')) return 'status-danger';
    return 'status-info';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-300">Infrastructure Inventory</p>
          <h2 className="mt-1 flex items-center gap-2 text-xl font-semibold text-slate-100">
            <Server className="h-5 w-5 text-emerald-400" /> Cloud Infrastructure Resource Hub
          </h2>
        </div>
        <div className="rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1.5 font-mono text-[11px] text-slate-400">
          Showing <span className="font-semibold text-emerald-300">{filteredResources.length}</span> of {resources.length} resources
        </div>
      </div>

      <div className="glass-panel rounded-2xl border border-slate-800/80 p-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by resource name, ID, or instance…"
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
                <th className="px-4 py-3 font-medium">Resource</th>
                <th className="px-4 py-3 font-medium">Service / Region</th>
                <th className="px-4 py-3 font-medium">Utilization</th>
                <th className="px-4 py-3 font-medium">Energy</th>
                <th className="px-4 py-3 font-medium">Carbon</th>
                <th className="px-4 py-3 font-medium">Score</th>
                <th className="px-4 py-3 text-right font-medium">Action</th>
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
                  return (
                    <tr key={res.id} className="border-t border-slate-800/80 transition hover:bg-slate-900/30">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-100">{res.name}</div>
                        <div className="mt-1 font-mono text-[10px] text-slate-400">{res.id}</div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-100">{res.service}</div>
                        <div className="mt-1 inline-flex items-center gap-1.5 font-mono text-[10px] text-slate-400">
                          <span className="h-2 w-2 rounded-full bg-emerald-400" />
                          {res.region}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="mb-1 flex items-center justify-between gap-3 text-[10px] text-slate-400">
                          <span>CPU</span>
                          <span className="font-mono text-slate-200">{res.cpuUtilization}%</span>
                        </div>
                        <div className="h-1.5 w-28 overflow-hidden rounded-full bg-slate-800">
                          <div className={`h-full rounded-full ${res.cpuUtilization < 20 ? 'bg-amber-400' : 'bg-emerald-400'}`} style={{ width: `${res.cpuUtilization}%` }} />
                        </div>
                      </td>

                      <td className="px-4 py-3 font-mono text-slate-200">
                        <div>{m.powerWatts} W</div>
                        <div className="mt-1 text-[10px] text-slate-400">{m.totalKWh} kWh</div>
                      </td>

                      <td className="px-4 py-3 font-mono text-slate-200">
                        <div className="text-emerald-300">{m.carbonKgCO2} kg</div>
                        <div className="mt-1 text-[10px] text-slate-400">{m.carbonIntensity} gCO₂/kWh</div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-2.5 py-1 text-[10px] font-medium text-slate-200">
                          <span className="font-mono text-emerald-300">{m.sustainabilityScore}</span>
                          <StatusMark status={res.status} className={`${getStatusClass(res.status)} text-[11px]`} />
                        </div>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => onSelectPassport(res)}
                          className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-[11px] font-semibold text-emerald-300 transition hover:border-emerald-500/50 hover:bg-emerald-500/20"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          View Passport
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
