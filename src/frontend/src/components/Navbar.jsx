import React, { useState } from 'react';
import { Leaf, ShieldCheck, Zap, Activity, ChevronDown } from 'lucide-react';
import { BellToggle } from './ReactBits';

export default function Navbar({ activeTab, setActiveTab, stats }) {
  const [notificationsOn, setNotificationsOn] = useState(true);

  return (
    <header className="topbar sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl px-4 py-3 sm:px-6">
      <div className="topbar-inner mx-auto flex max-w-[1500px] items-center justify-between gap-4">
        <div className="brand-lockup flex min-w-0 items-center gap-3" onClick={() => setActiveTab('dashboard')}>
          <div className="brand-mark" aria-hidden="true">
            <span className="brand-mark-orbit" />
            <Leaf className="h-5 w-5" />
            <span className="brand-mark-node" />
          </div>

          <div className="min-w-0">
            <div className="brand-title-row flex items-center gap-2">
              <span className="brand-eyebrow">CLOUD CARBON CONTROL</span>
              <span className="brand-version">AI 2.4</span>
            </div>
            <h1 className="brand-title truncate text-sm font-semibold text-slate-100 sm:text-base">
                Smart Carbon Passport
            </h1>
            <p className="brand-subtitle truncate text-[11px] sm:text-xs">
              Measure impact. Optimize infrastructure.
            </p>
          </div>
        </div>

        <div className="topbar-signals hidden items-center gap-3 lg:flex">
          <div className="system-chip glass-panel flex items-center gap-2 rounded-xl px-3 py-2 text-[11px]">
            <Activity className="h-3.5 w-3.5 text-emerald-400" />
            <span className="system-chip-label">Monitoring</span>
            <span className="system-chip-value">ACTIVE</span>
          </div>

          <div className="system-chip glass-panel flex items-center gap-2 rounded-xl px-3 py-2 text-[11px]">
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
            <span className="system-chip-label">ISO 14064</span>
            <span className="system-chip-value">VERIFIED</span>
          </div>

          {stats && (
            <div className="system-chip glass-panel flex items-center gap-2 rounded-xl px-3 py-2 text-[11px]">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span className="system-chip-label">Infra score</span>
              <span className={`system-chip-value ${stats.avgSustainabilityScore >= 75 ? 'text-emerald-300' : 'text-amber-300'}`}>
                {stats.avgSustainabilityScore}/100
              </span>
            </div>
          )}
        </div>

        <div className="topbar-actions flex items-center gap-2 sm:gap-3">
          <BellToggle enabled={notificationsOn} onChange={setNotificationsOn} />

          <button
            type="button"
            onClick={() => setNotificationsOn(!notificationsOn)}
            className="alert-status-control hidden items-center gap-2 rounded-xl px-2 py-1.5 text-[10px] font-medium sm:flex"
          >
            <span className={`alert-status-dot inline-flex h-2.5 w-2.5 rounded-full ${notificationsOn ? 'is-on' : 'is-off'}`} />
            <span>{notificationsOn ? 'Alerts On' : 'Alerts Off'}</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          <div className="profile-chip flex items-center gap-2 rounded-xl px-2 py-1.5 sm:px-3">
            <div className="profile-avatar flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold">
              CC
            </div>
            <div className="hidden text-left sm:block">
              <div className="text-[10px] font-semibold text-slate-100">Admin</div>
              <div className="text-[9px] text-slate-400">Environment: Live</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
