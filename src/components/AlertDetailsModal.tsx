import React from 'react';
import { X, AlertTriangle, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface AlertDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  onNavigateToCfo?: () => void;
}

export const AlertDetailsModal: React.FC<AlertDetailsModalProps> = ({
  isOpen,
  onClose,
  darkMode,
  onNavigateToCfo,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col transition-all ${
          darkMode ? 'bg-[#0f1319] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className={`p-4 sm:p-6 border-b flex items-center justify-between ${
          darkMode ? 'border-slate-800 bg-[#121721]' : 'border-slate-100 bg-slate-50'
        }`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  WATCH
                </span>
                <h2 className="text-base sm:text-lg font-bold tracking-tight">Gross Margin Compression Alert</h2>
              </div>
              <p className={`text-xs truncate ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Detected: Gross margin slipped 1.2 points to 72.8%.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              darkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className={`p-4 rounded-xl border ${
            darkMode ? 'bg-[#151a24] border-slate-800' : 'bg-slate-50 border-slate-100'
          }`}>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Diagnosed Root Driver</h4>
            <p className={`text-xs leading-relaxed ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
              Vendor and subcontractor expenses expanded by <strong>$3,420 (+7.8%)</strong> in the last billing cycle without a proportional price adjustment to clients. If this trend compounds across Q2, projected net margin will decline by 2.4 percentage points.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Prescriptive Action Plan</h4>
            <div className={`p-3 rounded-xl border flex items-start gap-3 ${
              darkMode ? 'bg-[#141923] border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong>Audit 3 Largest Vendor Contracts:</strong> Identify off-scope billable hours and establish fixed rate caps on contractor deliverables.
              </div>
            </div>
            <div className={`p-3 rounded-xl border flex items-start gap-3 ${
              darkMode ? 'bg-[#141923] border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong>Implement Retainer Price Adjustment:</strong> Apply standard 4.5% inflation adjustment across 8 grandfathered enterprise accounts.
              </div>
            </div>
          </div>
        </div>

        <div className={`p-4 border-t flex items-center justify-between ${
          darkMode ? 'border-slate-800 bg-[#121721]' : 'border-slate-100 bg-slate-50'
        }`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
              darkMode ? 'border-slate-700 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
            }`}
          >
            Dismiss Alert
          </button>
          {onNavigateToCfo ? (
            <button
              onClick={() => {
                onClose();
                onNavigateToCfo();
              }}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-white transition-all cursor-pointer shadow-md shadow-sky-500/20"
            >
              Consult AI Digital CFO
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-white transition-all cursor-pointer"
            >
              Acknowledge
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
