import React from 'react';
import { X, CheckCircle, TrendingUp, AlertTriangle, Download, Share2, FileText, ArrowUpRight } from 'lucide-react';

interface ScorecardReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
}

export const ScorecardReportModal: React.FC<ScorecardReportModalProps> = ({
  isOpen,
  onClose,
  darkMode,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all ${
          darkMode ? 'bg-[#0f1319] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className={`p-4 sm:p-6 border-b flex items-center justify-between ${
          darkMode ? 'border-slate-800 bg-[#121721]' : 'border-slate-100 bg-slate-50'
        }`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-xl font-bold tracking-tight">March 2026 Scorecard Audit</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Score: 65 / 100 · Positive
                </span>
              </div>
              <p className={`text-xs truncate ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Full financial audit, liquidity health verification, and margin analysis.
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

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Executive Overview */}
          <div className={`p-4 rounded-xl border ${
            darkMode ? 'bg-[#151a24] border-slate-800' : 'bg-slate-50 border-slate-100'
          }`}>
            <h3 className="text-sm font-bold mb-1">Executive Summary</h3>
            <p className={`text-xs leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              March delivered solid momentum with net profit climbing +28.0% and total cash balances hitting $71.2K with 7.5 months of operational runway. While top-line growth is outperforming targets, the 1.2-point compression in gross margin warrants vendor renegotiation.
            </p>
          </div>

          {/* Core Four Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className={`p-3 rounded-xl border ${darkMode ? 'bg-[#141923] border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className={`text-[11px] font-semibold uppercase ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Revenue</div>
              <div className="text-lg font-bold font-mono text-white mt-1">$47.0K</div>
              <div className="text-[10px] text-emerald-400 font-semibold mt-1">↑ +14.2% YoY</div>
            </div>
            <div className={`p-3 rounded-xl border ${darkMode ? 'bg-[#141923] border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className={`text-[11px] font-semibold uppercase ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Gross Margin</div>
              <div className="text-lg font-bold font-mono text-amber-400 mt-1">72.8%</div>
              <div className="text-[10px] text-rose-400 font-semibold mt-1">↓ -1.2 pts</div>
            </div>
            <div className={`p-3 rounded-xl border ${darkMode ? 'bg-[#141923] border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className={`text-[11px] font-semibold uppercase ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Net Profit</div>
              <div className="text-lg font-bold font-mono text-emerald-400 mt-1">$47.0K</div>
              <div className="text-[10px] text-emerald-400 font-semibold mt-1">↑ +28.0%</div>
            </div>
            <div className={`p-3 rounded-xl border ${darkMode ? 'bg-[#141923] border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className={`text-[11px] font-semibold uppercase ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Cash Balance</div>
              <div className="text-lg font-bold font-mono text-sky-400 mt-1">$47.0K</div>
              <div className="text-[10px] text-sky-400 font-semibold mt-1">7.5 Mo Runway</div>
            </div>
          </div>

          {/* Detailed Performance Checks */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Scorecard Pillar Breakdown</h4>
            {[
              { title: 'Liquidity & Runway Reserves', status: 'Healthy', note: '7.5 months runway surpasses safety baseline of 6.0 months.', color: 'text-emerald-400 bg-emerald-500/10' },
              { title: 'Accounts Receivable (AR) Velocity', status: 'Moderate', note: '$1,400 overdue beyond 30 days. Recommend automated invoice reminders.', color: 'text-amber-400 bg-amber-500/10' },
              { title: 'Unit Economics & Vendor COGS', status: 'Attention', note: 'Direct contractor cost expansion reduced gross margins from 74.0% to 72.8%.', color: 'text-rose-400 bg-rose-500/10' },
            ].map((pillar, i) => (
              <div key={i} className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                darkMode ? 'bg-[#141923] border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <div className="text-xs font-bold">{pillar.title}</div>
                  <div className={`text-[11px] mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{pillar.note}</div>
                </div>
                <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold whitespace-nowrap ${pillar.color}`}>
                  {pillar.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className={`p-4 border-t flex items-center justify-between ${
          darkMode ? 'border-slate-800 bg-[#121721]' : 'border-slate-100 bg-slate-50'
        }`}>
          <button
            onClick={() => alert('Scorecard PDF exported successfully!')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
              darkMode ? 'border-slate-700 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-white transition-all cursor-pointer shadow-md shadow-sky-500/20"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
