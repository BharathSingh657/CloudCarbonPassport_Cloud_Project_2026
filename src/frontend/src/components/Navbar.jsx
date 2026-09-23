import React from 'react';
import { Leaf, ShieldCheck, Zap, Server, Activity } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, stats }) {
  return (
    <header className="sticky top-0 z-40 bg-dark-900/80 backdrop-blur-md border-b border-gray-800 px-6 py-3.5 flex items-center justify-between">
      {/* Brand & Product Title */}
      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Leaf className="w-6 h-6 text-dark-900 stroke-[2.5]" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold gradient-text tracking-wide">Cloud Carbon Passport</h1>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Green AI v2.4
            </span>
          </div>
          <p className="text-xs text-gray-400">Sustainable IT Infrastructure & Carbon Intelligence Analytics</p>
        </div>
      </div>

      {/* Real-time Status Telemetry Banner */}
      <div className="hidden lg:flex items-center space-x-6 text-xs">
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-dark-800 border border-gray-800">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-gray-400">Monitoring System:</span>
          <span className="text-emerald-400 font-semibold font-mono">ACTIVE</span>
        </div>

        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-dark-800 border border-gray-800">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span className="text-gray-400">ISO 14064 Compliance:</span>
          <span className="text-cyan-400 font-semibold font-mono">VERIFIED</span>
        </div>

        {stats && (
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-dark-800 border border-gray-800 font-mono">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-gray-400">Infra Score:</span>
            <span className={`font-bold text-sm ${stats.avgSustainabilityScore >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {stats.avgSustainabilityScore}/100
            </span>
          </div>
        )}
      </div>

      {/* User / Team Metadata */}
      <div className="flex items-center space-x-3">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-medium text-slate-200">Cloud Architecture Group 2026</p>
          <p className="text-[11px] text-gray-400">Bharath D Singh | Rahul P | K. Ratna Subhash</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-gradient-to-r from-emerald-600 to-teal-700 flex items-center justify-center text-white font-bold text-xs shadow-md border border-emerald-400/30">
          CC
        </div>
      </div>
    </header>
  );
}
