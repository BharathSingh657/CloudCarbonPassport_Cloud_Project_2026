import React from 'react';
import { LayoutDashboard, Server, TrendingDown, Sparkles, FileText, Globe } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, recommendationsCount }) {
  const navItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'resources', label: 'Cloud Resources', icon: Server, badge: 'Live' },
    { id: 'predictions', label: '7-Day Green AI Forecast', icon: TrendingDown, badge: 'AI' },
    { id: 'recommendations', label: 'AI Optimization Studio', icon: Sparkles, badge: recommendationsCount > 0 ? recommendationsCount : null }
  ];

  return (
    <aside className="w-64 bg-dark-900 border-r border-gray-800 p-4 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-65px)]">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Carbon Platform
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                      : 'text-gray-400 hover:text-slate-200 hover:bg-gray-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-gray-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-emerald-500 text-dark-900 font-bold'
                          : 'bg-gray-800 text-gray-400 border border-gray-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* AWS Modular Integration Status Card */}
        <div className="p-3.5 rounded-xl bg-gradient-to-b from-dark-800 to-gray-900/60 border border-gray-800">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300 mb-1.5">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>AWS Infrastructure</span>
          </div>
          <p className="text-[11px] text-gray-400 mb-2 leading-relaxed">
            Modular CloudWatch, S3, RDS & SageMaker connectors ready.
          </p>
          <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 pt-1 border-t border-gray-800">
            <span>Adapter Mode:</span>
            <span className="text-emerald-400 font-semibold">Simulated MVP</span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 rounded-lg bg-dark-800/50 border border-gray-800 text-[11px] text-gray-400 space-y-1">
        <div className="flex justify-between">
          <span>GHG Protocol:</span>
          <span className="text-slate-200 font-mono">Scope 2 & 3</span>
        </div>
        <div className="flex justify-between">
          <span>PUE Target:</span>
          <span className="text-emerald-400 font-mono">1.18</span>
        </div>
      </div>
    </aside>
  );
}
