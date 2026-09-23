import React from 'react';
import {
  LayoutDashboard,
  Server,
  TrendingDown,
  Sparkles,
  BarChart3,
  ShieldCheck,
  BellRing,
  Settings,
  Cloud,
  FileText
} from 'lucide-react';
import { LineSidebar } from './ReactBits';

export default function Sidebar({ activeTab, setActiveTab, recommendationsCount }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'resources', label: 'Cloud Resources', icon: Server, badge: 'Live' },
    { id: 'predictions', label: 'AI Predictions', icon: TrendingDown, badge: 'AI' },
    { id: 'recommendations', label: 'Recommendations', icon: Sparkles, badge: recommendationsCount > 0 ? recommendationsCount : null },
    { id: 'analytics', label: 'Carbon Analytics', icon: BarChart3, badge: null },
    { id: 'passport', label: 'Carbon Passport', icon: FileText, badge: null },
    { id: 'alerts', label: 'Alerts', icon: BellRing, badge: recommendationsCount > 0 ? recommendationsCount : null },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null }
  ];

  return (
    <LineSidebar>
      <aside className="carbon-sidebar hidden min-h-[calc(100vh-72px)] w-72 shrink-0 p-4 md:flex">
      <div className="flex w-full flex-col justify-between">
        <div className="space-y-6">
          <div>
            <p className="mb-3 px-2 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">
              Carbon Platform
            </p>
            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id || (item.id === 'dashboard' && activeTab === 'dashboard');
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`sidebar-nav-item group relative flex w-full items-center justify-between rounded-2xl border px-3 py-2.5 text-left text-xs font-medium transition-all duration-200 ${
                      isActive
                        ? 'active sidebar-nav-item-active'
                        : 'sidebar-nav-item-idle'
                    }`}
                  >
                    <span className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-emerald-400 opacity-0 transition-opacity group-hover:opacity-100" style={{ opacity: isActive ? 1 : 0 }} />
                    <span className="flex items-center gap-3">
                      <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-300' : 'text-slate-400 group-hover:text-slate-200'}`} />
                      <span>{item.label}</span>
                    </span>
                    {item.badge && (
                      <span className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold ${
                        isActive
                          ? 'sidebar-badge-active'
                          : 'sidebar-badge-idle'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="sidebar-info-panel glass-panel rounded-2xl p-3.5 shadow-[0_16px_28px_rgba(0,0,0,0.3)]">
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold text-slate-200">
              <Cloud className="h-4 w-4 text-cyan-400" />
              AWS Infrastructure
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Modular CloudWatch, S3, RDS, and AI optimization connectors ready for live integration.
            </p>
            <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2 text-[10px] text-slate-400">
              <span>Adapter Mode</span>
              <span className="font-medium text-emerald-300">Simulated MVP</span>
            </div>
          </div>
        </div>

        <div className="sidebar-compliance mt-4 rounded-2xl p-3 text-[11px] text-slate-400">
          <div className="mb-2 flex items-center gap-2 text-slate-200">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            GHG Compliance
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>Protocol</span>
            <span className="font-mono text-slate-200">Scope 2 & 3</span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-4">
            <span>PUE Target</span>
            <span className="font-mono text-emerald-300">1.18</span>
          </div>
        </div>
      </div>
      </aside>
    </LineSidebar>
  );
}
