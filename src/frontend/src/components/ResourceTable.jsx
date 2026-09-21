import React, { useState } from 'react';
import { Search, Filter, Cpu, Server, FileText, ExternalLink, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ResourceTable({ resources, onSelectPassport }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState('All');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Available unique filter values
  const services = ['All', 'Amazon EC2', 'Amazon RDS', 'Amazon S3', 'AWS Lambda', 'Amazon ECS'];
  const regions = ['All', 'us-east-1', 'us-west-2', 'eu-north-1', 'eu-west-1', 'ap-south-1', 'ap-southeast-1'];
  const statuses = ['All', 'Optimal', 'Active', 'Warning', 'Critical'];

  // Filter resources based on user choices
  const filteredResources = resources.filter(res => {
    const matchesSearch = 
      res.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.instanceType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesService = selectedService === 'All' || res.service === selectedService;
    const matchesRegion = selectedRegion === 'All' || res.region === selectedRegion;
    const matchesStatus = selectedStatus === 'All' || res.status === selectedStatus;

    return matchesSearch && matchesService && matchesRegion && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Table Title & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 tracking-tight flex items-center space-x-2">
            <Server className="w-5 h-5 text-emerald-400" />
            <span>Cloud Infrastructure Resource Hub</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Real-time power consumption, carbon footprint, and Digital Carbon Passport generation for monitored AWS workloads.
          </p>
        </div>
        <div className="text-xs text-gray-400 font-mono">
          Showing <span className="text-emerald-400 font-bold">{filteredResources.length}</span> of {resources.length} Cloud Resources
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by name, ID or instance type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-dark-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Service Filter */}
          <div className="flex items-center space-x-1.5 text-xs text-gray-400">
            <Filter className="w-3.5 h-3.5 text-emerald-400 hidden sm:inline" />
            <span>Service:</span>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="bg-dark-900 border border-gray-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
            >
              {services.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Region Filter */}
          <div className="flex items-center space-x-1.5 text-xs text-gray-400">
            <span>Region:</span>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="bg-dark-900 border border-gray-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
            >
              {regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-1.5 text-xs text-gray-400">
            <span>Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-dark-900 border border-gray-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
            >
              {statuses.map(st => <option key={st} value={st}>{st}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Main Resource Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-dark-800/80 text-gray-400 uppercase font-mono text-[11px] border-b border-gray-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Resource Details</th>
                <th className="py-3.5 px-4 font-semibold">Service & Region</th>
                <th className="py-3.5 px-4 font-semibold">Utilization</th>
                <th className="py-3.5 px-4 font-semibold">Power & Energy</th>
                <th className="py-3.5 px-4 font-semibold">Carbon (kg CO₂)</th>
                <th className="py-3.5 px-4 font-semibold">Passport Score</th>
                <th className="py-3.5 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {filteredResources.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-500">
                    No matching cloud resources found for the selected filters.
                  </td>
                </tr>
              ) : (
                filteredResources.map((res) => {
                  const m = res.metrics;
                  return (
                    <tr key={res.id} className="hover:bg-gray-800/40 transition">
                      {/* Name & ID */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-100 text-sm">{res.name}</div>
                        <div className="font-mono text-[11px] text-gray-400 flex items-center space-x-1 mt-0.5">
                          <span>{res.id}</span>
                          <span className="text-gray-600">|</span>
                          <span className="text-cyan-400">{res.instanceType}</span>
                        </div>
                      </td>

                      {/* Service & Region */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-200">{res.service}</div>
                        <div className="font-mono text-[11px] text-gray-400 mt-0.5 flex items-center space-x-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500/80" />
                          <span>{res.region}</span>
                        </div>
                      </td>

                      {/* Utilization Bars */}
                      <td className="py-3.5 px-4 w-40">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-gray-400">CPU</span>
                            <span className={`font-mono font-semibold ${res.cpuUtilization < 20 ? 'text-amber-400 font-bold' : 'text-slate-200'}`}>
                              {res.cpuUtilization}%
                            </span>
                          </div>
                          <div className="w-full bg-dark-900 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${res.cpuUtilization < 20 ? 'bg-amber-400' : 'bg-emerald-400'}`} 
                              style={{ width: `${res.cpuUtilization}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Power & Energy */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="text-slate-200 font-semibold">{m.powerWatts} W</div>
                        <div className="text-gray-400 text-[11px]">{m.totalKWh} kWh</div>
                      </td>

                      {/* Carbon Emissions */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="text-emerald-400 font-bold text-sm">{m.carbonKgCO2} kg</div>
                        <div className="text-[10px] text-gray-500">{m.carbonIntensity} gCO₂/kWh</div>
                      </td>

                      {/* Score & Rating Badge */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono border ${
                            m.sustainabilityScore >= 80 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                              : m.sustainabilityScore >= 60 
                              ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}>
                            Score {m.sustainabilityScore}
                          </span>
                          <span className="text-xs font-semibold text-gray-400">
                            {m.rating}
                          </span>
                        </div>
                      </td>

                      {/* Action Button */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => onSelectPassport(res)}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500 hover:to-teal-500 hover:text-dark-900 border border-emerald-500/40 text-emerald-400 text-xs font-semibold transition flex items-center space-x-1.5 ml-auto shadow-sm"
                        >
                          <FileText className="w-3.5 h-3.5" />
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
      </div>
    </div>
  );
}
