import React, { useState } from 'react';
import { EARLY_WARNING_ALERTS } from '../data/indiaData';
import { EarlyWarningAlert } from '../types';
import { getRiskColor } from '../services/mlEngine';
import {
  AlertTriangle,
  Clock,
  MapPin,
  Layers,
  CheckCircle2,
  Filter,
  Send,
  Building,
  ShieldAlert,
} from 'lucide-react';

interface EarlyWarningsViewProps {
  darkMode: boolean;
}

export const EarlyWarningsView: React.FC<EarlyWarningsViewProps> = ({ darkMode }) => {
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const filteredAlerts = urgencyFilter === 'all'
    ? EARLY_WARNING_ALERTS
    : EARLY_WARNING_ALERTS.filter((a) => a.urgency === urgencyFilter);

  const handleAction = (alert: EarlyWarningAlert, actionType: string) => {
    setActionNotice(`Notification dispatched: ${actionType} initiated for ${alert.state} (${alert.sector})`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-4 md:p-6 rounded-2xl border transition-colors ${
        darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-red-400 uppercase tracking-wider mb-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Real-Time Contagion Alerts & Automated Early-Warning System</span>
            </div>
            <h2 className={`text-xl md:text-2xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Cluster Financial Stress Warning Feed
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Autonomous triggers signaling impending working capital and solvency breaches 30 to 90 days ahead.
            </p>
          </div>

          {/* Urgency Filter */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            {['all', 'critical', 'high', 'moderate'].map((u) => (
              <button
                key={u}
                onClick={() => setUrgencyFilter(u)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                  urgencyFilter === u
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        {actionNotice && (
          <div className="mt-3 p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{actionNotice}</span>
          </div>
        )}
      </div>

      {/* Alert Feed Cards */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => {
          const riskColor = getRiskColor(alert.riskLevel);
          return (
            <div
              key={alert.id}
              className={`p-5 md:p-6 rounded-2xl border transition-all ${
                alert.urgency === 'critical'
                  ? darkMode ? 'bg-red-950/15 border-red-900/40' : 'bg-red-50/50 border-red-200'
                  : alert.urgency === 'high'
                  ? darkMode ? 'bg-orange-950/15 border-orange-900/40' : 'bg-orange-50/50 border-orange-200'
                  : darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="space-y-2 max-w-3xl">
                  {/* Top Meta Line */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${riskColor.bg} ${riskColor.text} border ${riskColor.border}`}>
                      {alert.urgency} Urgency
                    </span>
                    <span className="text-slate-500">·</span>
                    <span className="flex items-center gap-1 font-semibold text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-amber-500" />
                      <span>{alert.state} {alert.district ? `(${alert.district})` : ''}</span>
                    </span>
                    <span className="text-slate-500">·</span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <Layers className="w-3.5 h-3.5 text-blue-400" />
                      <span>{alert.sector}</span>
                    </span>
                    <span className="text-slate-500">·</span>
                    <span className="flex items-center gap-1 text-amber-400 font-mono font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Horizon: Within {alert.expectedDays} Days</span>
                    </span>
                  </div>

                  {/* Headline */}
                  <h3 className={`text-base md:text-lg font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    {alert.headline}
                  </h3>

                  {/* Major Causes */}
                  <div className="space-y-1 pt-1">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase">
                      Diagnosed Root Drivers:
                    </div>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {alert.causes.map((cause, cIdx) => (
                        <li key={cIdx} className="flex items-start gap-1.5">
                          <span className="text-amber-500 font-bold shrink-0">·</span>
                          <span>{cause}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Suggested Policy Intervention */}
                  <div className="pt-2">
                    <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/30 text-xs text-emerald-300 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-semibold text-emerald-200">Recommended Policy Action:</strong> {alert.suggestedIntervention}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Action Column */}
                <div className="shrink-0 flex flex-col justify-between items-start lg:items-end gap-3 pt-2 lg:pt-0">
                  <div className="text-left lg:text-right">
                    <div className="text-[11px] text-slate-400">Est. Credit at Risk</div>
                    <div className="text-xl font-bold font-mono text-amber-400">
                      ₹{alert.estimatedExposureCr.toLocaleString()} Cr
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">{alert.timestamp}</div>
                  </div>

                  <div className="flex flex-wrap lg:flex-col gap-2 w-full lg:w-48">
                    <button
                      onClick={() => handleAction(alert, 'Emergency TReDS Liquidity Directive')}
                      className="flex-1 lg:flex-none py-1.5 px-3 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Deploy TReDS Relief</span>
                    </button>

                    <button
                      onClick={() => handleAction(alert, 'SLBC Lead Bank Working Capital Notice')}
                      className={`flex-1 lg:flex-none py-1.5 px-3 text-xs font-semibold rounded-lg border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                        darkMode ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700' : 'border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200'
                      }`}
                    >
                      <Building className="w-3.5 h-3.5" />
                      <span>Notify Lead Bank</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
