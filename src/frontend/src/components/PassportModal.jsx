import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, QrCode, Download, ExternalLink, Leaf, CheckCircle, Clock, Cpu, Zap, Globe, Layers } from 'lucide-react';

export default function PassportModal({ resource, onClose }) {
  const [passportData, setPassportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    if (resource) {
      setLoading(true);
      fetch(`/api/resources/${resource.id}/passport`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setPassportData(data.data);
          }
        })
        .catch(err => console.error('Error fetching passport:', err))
        .finally(() => setLoading(false));
    }
  }, [resource]);

  if (!resource) return null;

  const handleDownloadJson = () => {
    if (!passportData) return;
    const jsonStr = JSON.stringify(passportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${passportData.passportId}.json`;
    link.click();
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/80 backdrop-blur-md overflow-y-auto">
      <div className="glass-card w-full max-w-3xl rounded-3xl border border-emerald-500/30 overflow-hidden shadow-2xl relative my-8">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-dark-800 via-gray-900 to-dark-800 p-6 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Leaf className="w-7 h-7 text-dark-900 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-extrabold text-slate-100">Digital Carbon Passport</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  ISO 14064 Standard
                </span>
              </div>
              <p className="text-xs text-gray-400">Verifiable Cloud Sustainability Certificate</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-dark-800 hover:bg-gray-800 text-gray-400 hover:text-white transition border border-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {loading || !passportData ? (
          <div className="p-12 text-center text-gray-400 space-y-3">
            <div className="w-8 h-8 mx-auto border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs">Cryptographically generating Digital Carbon Passport...</p>
          </div>
        ) : (
          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Passport Identity Header */}
            <div className="p-5 rounded-2xl bg-dark-900 border border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center md:text-left">
                <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400">Passport Serial ID</span>
                <div className="text-lg font-extrabold font-mono text-slate-100 tracking-wide">
                  {passportData.passportId}
                </div>
                <div className="text-xs text-gray-400 flex items-center justify-center md:justify-start space-x-2 pt-1">
                  <span>Resource: <strong className="text-slate-200">{passportData.resourceName}</strong></span>
                  <span>•</span>
                  <span>Type: <span className="text-cyan-400 font-mono">{passportData.instanceType}</span></span>
                </div>
              </div>

              {/* QR Code & Verification Stamp */}
              <div className="flex items-center space-x-4 bg-dark-800 p-3 rounded-xl border border-gray-700">
                <div className="w-14 h-14 bg-white p-1 rounded-lg flex items-center justify-center shadow-md">
                  {/* SVG Mock QR Code */}
                  <svg className="w-full h-full text-dark-900" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm8-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm13-2h3v2h-3v-2zm-3 3h2v2h-2v-2zm3 3h3v2h-3v-2zm-3-3h3v2h-3v-2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="flex items-center space-x-1 text-emerald-400 text-xs font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>VERIFIED PASSPORT</span>
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono mt-0.5">Signed by Green AI Engine</div>
                  <div className="text-[10px] text-gray-500 font-mono">{passportData.issueDate.split('T')[0]}</div>
                </div>
              </div>
            </div>

            {/* Core Metrics & GHG Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-dark-900 border border-gray-800 text-center">
                <div className="text-[11px] text-gray-400 uppercase font-mono">Sustainability Score</div>
                <div className="text-3xl font-extrabold font-mono text-emerald-400 mt-1">
                  {passportData.sustainabilityScore} <span className="text-xs text-gray-400 font-sans">/ 100</span>
                </div>
                <div className="mt-1 text-xs font-semibold text-slate-300">
                  Rating: <span className="text-emerald-400">{passportData.sustainabilityRating}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-dark-900 border border-gray-800 text-center">
                <div className="text-[11px] text-gray-400 uppercase font-mono">Total Carbon Footprint</div>
                <div className="text-3xl font-extrabold font-mono text-cyan-400 mt-1">
                  {passportData.metrics.carbonKgCO2} <span className="text-xs text-gray-400 font-sans">kg CO₂</span>
                </div>
                <div className="mt-1 text-xs text-gray-400 font-mono">
                  Intensity: {passportData.metrics.carbonIntensity} g/kWh
                </div>
              </div>

              <div className="p-4 rounded-xl bg-dark-900 border border-gray-800 text-center">
                <div className="text-[11px] text-gray-400 uppercase font-mono">Grid Renewable Ratio</div>
                <div className="text-3xl font-extrabold font-mono text-teal-400 mt-1">
                  {passportData.metrics.renewablePct}%
                </div>
                <div className="mt-1 text-xs text-gray-400 truncate">
                  Grid: {passportData.gridProvider}
                </div>
              </div>
            </div>

            {/* GHG Scope 2 & 3 Detail */}
            <div className="p-4 rounded-2xl bg-dark-900 border border-gray-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>GHG Protocol Carbon Breakdown (Scope 2 & Scope 3)</span>
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-dark-800 border border-gray-800">
                  <div className="text-gray-400 font-medium">Scope 2 (Electricity Grid Emissions)</div>
                  <div className="text-base font-bold font-mono text-slate-100 mt-1">
                    {passportData.ghgProtocol.scope2} kg CO₂eq
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">Purchased grid power for compute runtime</div>
                </div>

                <div className="p-3 rounded-xl bg-dark-800 border border-gray-800">
                  <div className="text-gray-400 font-medium">Scope 3 (Embodied Hardware Mfg)</div>
                  <div className="text-base font-bold font-mono text-slate-100 mt-1">
                    {passportData.ghgProtocol.scope3} kg CO₂eq
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">Server manufacturing & datacenter infrastructure amortized</div>
                </div>
              </div>
            </div>

            {/* Lifecycle Audit Trail Timeline */}
            <div className="p-4 rounded-2xl bg-dark-900 border border-gray-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Lifecycle Carbon Passport Audit History</span>
              </h4>

              <div className="space-y-2">
                {passportData.auditTrail.map((audit, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-dark-800 border border-gray-800 text-xs">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <div>
                        <div className="font-semibold text-slate-200">{audit.event}</div>
                        <div className="text-[10px] text-gray-500 font-mono">{audit.timestamp}</div>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-emerald-400 font-bold">{audit.carbonRateKg} kg CO₂</div>
                      <div className="text-[10px] text-gray-400">Score: {audit.score}/100</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cryptographic Digital Signature Footer */}
            <div className="p-3.5 rounded-xl bg-dark-900 border border-gray-800 font-mono text-[10px] text-gray-500 flex flex-col sm:flex-row justify-between items-center gap-2">
              <span className="truncate max-w-md">SHA256 Signature: {passportData.verification.digitalSignature}</span>
              <span className="text-emerald-400 font-semibold">Status: ISO-Compliant Valid</span>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="p-4 bg-dark-800 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={handleDownloadJson}
            disabled={loading}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-dark-900 text-xs font-bold transition flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20"
          >
            <Download className="w-4 h-4" />
            <span>{downloadSuccess ? 'Passport Downloaded!' : 'Export Passport (JSON)'}</span>
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-dark-900 hover:bg-gray-900 text-gray-300 text-xs font-semibold border border-gray-700 transition"
          >
            Close Passport
          </button>
        </div>
      </div>
    </div>
  );
}
