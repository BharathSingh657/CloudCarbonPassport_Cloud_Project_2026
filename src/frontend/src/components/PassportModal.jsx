import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Download, Leaf, Clock, Zap, CheckCircle2, FileText } from 'lucide-react';
import { ReflectiveCard } from './ReactBits';

export default function PassportModal({ resource, onClose }) {
  const [passportData, setPassportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    if (resource) {
      setLoading(true);
      fetch(`/api/resources/${resource.id}/passport`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setPassportData(data.data);
        })
        .catch((err) => console.error('Error fetching passport:', err))
        .finally(() => setLoading(false));
    }
  }, [resource]);

  if (!resource) return null;

  const handleDownloadJson = () => {
    if (!passportData) return;
    const jsonStr = JSON.stringify(passportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${passportData.passportId}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  const handleExportPdf = () => {
    if (!passportData) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${passportData.passportId}_ISO14064_Passport.pdf</title>
          <style>
            @page { size: A4; margin: 12mm; }
            body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #0f172a; background: #ffffff; margin: 0; padding: 20px; }
            .certificate-container { border: 3px double #059669; padding: 24px; border-radius: 12px; max-width: 800px; margin: 0 auto; background: #fafdfb; position: relative; }
            .watermark { position: absolute; top: 40%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 60px; font-weight: 900; color: rgba(16, 185, 129, 0.06); letter-spacing: 4px; pointer-events: none; text-transform: uppercase; white-space: nowrap; }
            .header-bar { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #10b981; padding-bottom: 16px; margin-bottom: 20px; }
            .logo-title { font-size: 22px; font-weight: 800; color: #047857; letter-spacing: 0.5px; }
            .subtitle { font-size: 12px; color: #475569; margin-top: 4px; font-weight: 500; }
            .badge-iso { background: #d1fae5; color: #047857; padding: 4px 12px; border-radius: 16px; font-size: 11px; font-weight: 700; border: 1px solid #6ee7b7; display: inline-block; }
            .serial-box { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
            .serial-label { font-size: 10px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 1px; }
            .serial-value { font-family: monospace; font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 2px; }
            .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
            .kpi-card { background: #ffffff; border: 1px solid #e2e8f0; padding: 14px; border-radius: 8px; text-align: center; }
            .kpi-title { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
            .kpi-val { font-size: 22px; font-weight: 800; color: #047857; font-family: monospace; margin-top: 4px; }
            .kpi-sub { font-size: 11px; color: #475569; margin-top: 2px; }
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
            .section-box { background: #ffffff; border: 1px solid #e2e8f0; padding: 14px; border-radius: 8px; }
            .section-title { font-size: 11px; font-weight: 700; color: #047857; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px; }
            .data-row { display: flex; justify-content: space-between; font-size: 12px; padding: 5px 0; border-bottom: 1px dashed #f1f5f9; }
            .data-row:last-child { border-bottom: none; }
            .data-label { color: #64748b; }
            .data-val { font-family: monospace; font-weight: 600; color: #0f172a; }
            .audit-table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 11px; }
            .audit-table th { background: #f8fafc; text-align: left; padding: 6px 8px; font-size: 10px; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
            .audit-table td { padding: 6px 8px; border-bottom: 1px solid #f1f5f9; font-family: monospace; }
            .footer-signature { margin-top: 24px; padding-top: 16px; border-top: 2px solid #e2e8f0; display: flex; justify-content: space-between; align-items: flex-end; }
            .stamp-box { border: 2px dashed #059669; padding: 8px 16px; border-radius: 8px; color: #047857; font-size: 11px; font-weight: 700; text-align: center; background: #ecfdf5; }
            .sig-line { text-align: right; font-size: 11px; color: #64748b; }
            .sig-line-bar { width: 160px; border-bottom: 1px solid #94a3b8; margin-bottom: 4px; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="certificate-container">
            <div class="watermark">ISO 14064 VERIFIED</div>
            
            <div class="header-bar">
              <div>
                <div class="logo-title">🌱 Digital Carbon Passport</div>
                <div class="subtitle">Verifiable Cloud Infrastructure Sustainability Certificate</div>
              </div>
              <div class="badge-iso">ISO 14064 & GHG Protocol Certified</div>
            </div>

            <div class="serial-box">
              <div>
                <div class="serial-label">Passport Serial Identity</div>
                <div class="serial-value">${passportData.passportId}</div>
              </div>
              <div style="text-align: right;">
                <div class="serial-label">Issued Timestamp</div>
                <div class="serial-value" style="font-size: 12px;">${passportData.issuedAt || new Date().toISOString()}</div>
              </div>
            </div>

            <div class="grid-3">
              <div class="kpi-card">
                <div class="kpi-title">Sustainability Score</div>
                <div class="kpi-val">${passportData.sustainabilityScore}/100</div>
                <div class="kpi-sub">Rating: ${passportData.sustainabilityRating}</div>
              </div>
              <div class="kpi-card">
                <div class="kpi-title">Carbon Footprint</div>
                <div class="kpi-val">${passportData.metrics.carbonKgCO2} kg</div>
                <div class="kpi-sub">CO₂ Equivalent</div>
              </div>
              <div class="kpi-card">
                <div class="kpi-title">Renewable Energy</div>
                <div class="kpi-val">${passportData.metrics.renewablePct}%</div>
                <div class="kpi-sub">Grid: ${passportData.gridProvider}</div>
              </div>
            </div>

            <div class="grid-2">
              <div class="section-box">
                <div class="section-title">Resource Profile</div>
                <div class="data-row"><span class="data-label">Resource ID</span><span class="data-val">${passportData.resourceId}</span></div>
                <div class="data-row"><span class="data-label">Cloud Service</span><span class="data-val">${passportData.service}</span></div>
                <div class="data-row"><span class="data-label">AWS Region</span><span class="data-val">${passportData.region}</span></div>
                <div class="data-row"><span class="data-label">Instance Type</span><span class="data-val">${passportData.instanceType}</span></div>
              </div>

              <div class="section-box">
                <div class="section-title">Telemetry & Energy</div>
                <div class="data-row"><span class="data-label">Power Draw</span><span class="data-val">${passportData.metrics.powerWatts} W</span></div>
                <div class="data-row"><span class="data-label">Energy Consumed</span><span class="data-val">${passportData.metrics.totalKWh} kWh</span></div>
                <div class="data-row"><span class="data-label">Grid Intensity</span><span class="data-val">${passportData.metrics.carbonIntensity} gCO₂/kWh</span></div>
                <div class="data-row"><span class="data-label">PUE Overhead</span><span class="data-val">${passportData.metrics.pue || 1.18}</span></div>
              </div>
            </div>

            <div class="section-box" style="margin-bottom: 20px;">
              <div class="section-title">GHG Protocol Scope 2 & 3 Breakdown</div>
              <div class="grid-2" style="margin-bottom: 0;">
                <div class="data-row"><span class="data-label">Scope 2 (Grid Electricity Emissions)</span><span class="data-val">${passportData.ghgProtocol.scope2} kg CO₂</span></div>
                <div class="data-row"><span class="data-label">Scope 3 (Embodied Hardware Mfg & Lifecycle)</span><span class="data-val">${passportData.ghgProtocol.scope3} kg CO₂</span></div>
              </div>
            </div>

            <div class="section-box">
              <div class="section-title">Audit Log Trail</div>
              <table class="audit-table">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Timestamp</th>
                    <th style="text-align: right;">Emissions Rate</th>
                  </tr>
                </thead>
                <tbody>
                  ${passportData.auditTrail.map(item => `
                    <tr>
                      <td>${item.event}</td>
                      <td>${item.timestamp}</td>
                      <td style="text-align: right;">${item.carbonRateKg} kg</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <div class="footer-signature">
              <div class="stamp-box">
                ✓ GREEN AI VERIFIED CERTIFICATE<br/>
                <span style="font-size: 9px; font-weight: normal;">ISO 14064 Compliance Authenticated</span>
              </div>
              <div class="sig-line">
                <div class="sig-line-bar"></div><br/>
                Authorized Sustainability Officer
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  };

  return (
    <div className="passport-overlay fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="passport-theme glass-modal reflective-card relative my-6 w-full max-w-4xl overflow-hidden rounded-[32px] border border-emerald-500/20 bg-slate-950/90 shadow-[0_30px_80px_rgba(0,0,0,0.7)]">
        <div className="passport-header border-b border-slate-800/80 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 shadow-lg shadow-emerald-500/20">
                <Leaf className="h-6 w-6 text-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-slate-100">Digital Carbon Passport</h3>
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.16em] text-emerald-300">
                    ISO 14064
                  </span>
                </div>
                <p className="text-xs text-slate-400">Verifiable cloud sustainability identity</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-700 bg-slate-900/80 p-2 text-slate-300 transition hover:border-slate-600 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {loading || !passportData ? (
          <div className="flex min-h-[220px] items-center justify-center p-12 text-center">
            <div className="flex flex-col items-center gap-3 text-slate-300">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
              <div className="text-sm font-medium">Generating passport…</div>
            </div>
          </div>
        ) : (
          <div className="max-h-[75vh] overflow-y-auto p-5 sm:p-6">
            <ReflectiveCard className="p-5 sm:p-6">
              <div className="mb-5 flex flex-col gap-4 border-b border-slate-800/80 pb-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-emerald-300">Passport Serial</div>
                  <div className="mt-1 font-mono text-xl font-semibold text-slate-100">{passportData.passportId}</div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white">
                    <div className="grid grid-cols-4 gap-[2px] p-1">
                      {Array.from({ length: 16 }).map((_, i) => (
                        <span key={i} className={`h-1.5 w-1.5 rounded-sm ${i % 2 === 0 ? 'bg-slate-950' : 'bg-slate-950/30'}`} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-emerald-300">
                      <ShieldCheck className="h-4 w-4" /> Verified
                    </div>
                    <div className="mt-1 text-[10px] text-slate-400">Signed by Green AI Engine</div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Sustainability Score</div>
                  <div className="mt-3 font-mono text-3xl font-semibold text-emerald-300">{passportData.sustainabilityScore}</div>
                  <div className="mt-2 text-xs text-slate-300">Rating: {passportData.sustainabilityRating}</div>
                </div>

                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Carbon Footprint</div>
                  <div className="mt-3 font-mono text-3xl font-semibold text-cyan-300">{passportData.metrics.carbonKgCO2}</div>
                  <div className="mt-2 text-xs text-slate-300">kg CO₂eq</div>
                </div>

                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Renewable Energy</div>
                  <div className="mt-3 font-mono text-3xl font-semibold text-emerald-300">{passportData.metrics.renewablePct}%</div>
                  <div className="mt-2 text-xs text-slate-300">Grid: {passportData.gridProvider}</div>
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
                  <div className="mb-3 text-[10px] uppercase tracking-[0.18em] text-slate-400">Resource Identity</div>
                  <div className="space-y-3 text-sm text-slate-200">
                    <div className="flex justify-between gap-3"><span>Resource ID</span><span className="font-mono text-slate-100">{passportData.resourceId}</span></div>
                    <div className="flex justify-between gap-3"><span>Service</span><span className="font-mono text-slate-100">{passportData.service}</span></div>
                    <div className="flex justify-between gap-3"><span>Region</span><span className="font-mono text-slate-100">{passportData.region}</span></div>
                    <div className="flex justify-between gap-3"><span>Instance Type</span><span className="font-mono text-slate-100">{passportData.instanceType}</span></div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
                  <div className="mb-3 text-[10px] uppercase tracking-[0.18em] text-slate-400">Operational Impact</div>
                  <div className="space-y-3 text-sm text-slate-200">
                    <div className="flex justify-between gap-3"><span>Power</span><span className="font-mono text-slate-100">{passportData.metrics.powerWatts} W</span></div>
                    <div className="flex justify-between gap-3"><span>Energy</span><span className="font-mono text-slate-100">{passportData.metrics.totalKWh} kWh</span></div>
                    <div className="flex justify-between gap-3"><span>Carbon Intensity</span><span className="font-mono text-slate-100">{passportData.metrics.carbonIntensity} gCO₂/kWh</span></div>
                    <div className="flex justify-between gap-3"><span>AI Status</span><span className="inline-flex items-center gap-1.5 text-emerald-300"><CheckCircle2 className="h-3.5 w-3.5" /> OPTIMIZED</span></div>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
                <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-slate-400">
                  <Zap className="h-4 w-4 text-amber-300" /> GHG Protocol Breakdown
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3">
                    <div className="text-xs text-slate-400">Scope 2</div>
                    <div className="mt-1 font-mono text-lg font-semibold text-slate-100">{passportData.ghgProtocol.scope2} kg</div>
                  </div>
                  <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3">
                    <div className="text-xs text-slate-400">Scope 3</div>
                    <div className="mt-1 font-mono text-lg font-semibold text-slate-100">{passportData.ghgProtocol.scope3} kg</div>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
                <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-slate-400">
                  <Clock className="h-4 w-4 text-emerald-300" /> Audit Trail
                </div>
                <div className="space-y-2 text-sm text-slate-200">
                  {passportData.auditTrail.map((item, index) => (
                    <div key={index} className="flex justify-between gap-4 rounded-xl border border-slate-800/80 bg-slate-950/60 px-3 py-2">
                      <div>
                        <div className="font-medium text-slate-100">{item.event}</div>
                        <div className="mt-1 font-mono text-[10px] text-slate-400">{item.timestamp}</div>
                      </div>
                      <div className="text-right font-mono text-emerald-300">{item.carbonRateKg} kg</div>
                    </div>
                  ))}
                </div>
              </div>
            </ReflectiveCard>
          </div>
        )}

        <div className="passport-footer flex flex-col gap-3 border-t border-slate-800/80 bg-slate-950/90 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadJson}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2.5 text-xs font-semibold text-slate-950 transition hover:brightness-110"
            >
              <Download className="h-4 w-4" />
              {downloadSuccess ? 'Downloaded' : 'Export JSON'}
            </button>

            <button
              type="button"
              onClick={handleExportPdf}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
            >
              <FileText className="h-4 w-4" />
              Export PDF
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:border-slate-600 hover:text-white"
          >
            Close Passport
          </button>
        </div>
      </div>
    </div>
  );
}

