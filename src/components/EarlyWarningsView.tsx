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
  ArrowRight,
  Sliders,
  DollarSign,
  Copy,
  X,
  FileText,
  Landmark,
  Zap,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Activity,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface EarlyWarningsViewProps {
  darkMode: boolean;
  searchQuery?: string;
  onNavigate?: (tab: string) => void;
}

// SLBC (State Level Bankers' Committee) Lead Bank Mapping for Indian States
const STATE_LEAD_BANKS: Record<string, { bankName: string; convenor: string; dsoCapDays: number }> = {
  'Tamil Nadu': { bankName: 'Indian Overseas Bank & Canara Bank', convenor: 'SLBC Tamil Nadu Secretariat, Chennai', dsoCapDays: 45 },
  'Gujarat': { bankName: 'State Bank of India & Bank of Baroda', convenor: 'SLBC Gujarat Secretariat, Ahmedabad', dsoCapDays: 45 },
  'Uttar Pradesh': { bankName: 'Bank of Baroda & State Bank of India', convenor: 'SLBC Uttar Pradesh Secretariat, Lucknow', dsoCapDays: 45 },
  'Maharashtra': { bankName: 'Bank of Maharashtra & Union Bank', convenor: 'SLBC Maharashtra Secretariat, Pune', dsoCapDays: 45 },
  'Karnataka': { bankName: 'Canara Bank & State Bank of India', convenor: 'SLBC Karnataka Secretariat, Bengaluru', dsoCapDays: 45 },
  'Punjab': { bankName: 'Punjab National Bank', convenor: 'SLBC Punjab Secretariat, Chandigarh', dsoCapDays: 45 },
  'Telangana': { bankName: 'State Bank of India', convenor: 'SLBC Telangana Secretariat, Hyderabad', dsoCapDays: 45 },
  'West Bengal': { bankName: 'Punjab National Bank & UCO Bank', convenor: 'SLBC West Bengal Secretariat, Kolkata', dsoCapDays: 45 },
};

export const EarlyWarningsView: React.FC<EarlyWarningsViewProps> = ({ darkMode, searchQuery = '', onNavigate }) => {
  const { t } = useLanguage();
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Modal States
  const [activeTredsAlert, setActiveTredsAlert] = useState<EarlyWarningAlert | null>(null);
  const [tredsWindowCr, setTredsWindowCr] = useState<number>(800);
  const [tredsDiscountRate, setTredsDiscountRate] = useState<number>(7.5);
  const [tredsPlatform, setTredsPlatform] = useState<string>('all');
  const [tredsSuccessMsg, setTredsSuccessMsg] = useState<string | null>(null);

  const [activeBankAlert, setActiveBankAlert] = useState<EarlyWarningAlert | null>(null);
  const [bankMoratoriumMonths, setBankMoratoriumMonths] = useState<number>(3);
  const [adhocLimitPct, setAdhocLimitPct] = useState<number>(10);
  const [copiedMemo, setCopiedMemo] = useState<boolean>(false);
  const [bankSuccessMsg, setBankSuccessMsg] = useState<string | null>(null);

  const filteredAlerts = EARLY_WARNING_ALERTS.filter((a) => {
    const matchesUrgency = urgencyFilter === 'all' || a.urgency === urgencyFilter;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesUrgency;
    const matchesQuery =
      a.title.toLowerCase().includes(q) ||
      a.state.toLowerCase().includes(q) ||
      a.sector.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q) ||
      a.dominantTrigger.toLowerCase().includes(q);
    return matchesUrgency && matchesQuery;
  });

  // Trigger TReDS Modal
  const openTredsModal = (alert: EarlyWarningAlert) => {
    setActiveTredsAlert(alert);
    const suggested = Math.round(alert.estimatedExposureCr * 0.12) || 800;
    setTredsWindowCr(suggested);
    setTredsSuccessMsg(null);
  };

  // Trigger Bank Notification Modal
  const openBankModal = (alert: EarlyWarningAlert) => {
    setActiveBankAlert(alert);
    setCopiedMemo(false);
    setBankSuccessMsg(null);
  };

  // Execute TReDS Window
  const handleDeployTredsWindow = () => {
    if (!activeTredsAlert) return;
    const txId = `TRDS-WIN-${Date.now().toString().slice(-6)}`;
    setTredsSuccessMsg(`Window #${txId} Authorized: ₹${tredsWindowCr} Cr factoring liquidity deployed for ${activeTredsAlert.state} (${activeTredsAlert.sector}) at ${tredsDiscountRate}% APR.`);
    setActionNotice(`Live TReDS Liquidity Window #${txId} active for ${activeTredsAlert.state}! Discarding 90-day trapped invoices.`);
    setTimeout(() => {
      setActiveTredsAlert(null);
      setTredsSuccessMsg(null);
    }, 2800);
  };

  // Execute Bank Notification
  const handleTransmitBankNotice = () => {
    if (!activeBankAlert) return;
    const dispatchId = `SLBC-DIR-${Date.now().toString().slice(-6)}`;
    setBankSuccessMsg(`Regulatory Alert #${dispatchId} transmitted to SLBC Secretariat and Lead Bank with a ${bankMoratoriumMonths}-month covenant forbearance directive.`);
    setActionNotice(`SLBC Lead Bank Alert #${dispatchId} successfully dispatched for ${activeBankAlert.state}!`);
    setTimeout(() => {
      setActiveBankAlert(null);
      setBankSuccessMsg(null);
    }, 2800);
  };

  // Copy Memo
  const handleCopyMemo = () => {
    if (!activeBankAlert) return;
    const lead = STATE_LEAD_BANKS[activeBankAlert.state] || { bankName: 'State Lead Bank', convenor: 'SLBC Secretariat', dsoCapDays: 45 };
    const text = `URGENT REGULATORY DIRECTIVE · SLBC EARLY-WARNING CONVENOR
To: ${lead.convenor} (${lead.bankName})
From: SME-SENTINEL National Financial Stress Intelligence Hub
Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
Cluster: ${activeBankAlert.state} · ${activeBankAlert.district || 'Statewide'} (${activeBankAlert.sector})
Impending Stress Horizon: Within ${activeBankAlert.expectedDays} Days
Estimated Credit at Risk: ₹${activeBankAlert.estimatedExposureCr.toLocaleString()} Cr

DIAGNOSED VULNERABILITY:
${activeBankAlert.headline}
Root Drivers:
${activeBankAlert.causes.map((c) => '• ' + c).join('\n')}

MANDATORY REGULATORY ACTIONS:
1. Institute ${bankMoratoriumMonths}-month SMA asset classification forbearance to prevent premature default contagion.
2. Grant ${adhocLimitPct}% emergency ad-hoc working capital credit enhancement for compliant GST-registered MSMEs.
3. Accelerate invoice discounting via TReDS with 100% non-recourse settlement.
Directive Authorized By: National SME Early-Warning Engine`;
    navigator.clipboard.writeText(text);
    setCopiedMemo(true);
    setTimeout(() => setCopiedMemo(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-4 md:p-6 rounded-2xl border transition-colors ${
        darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-red-500 uppercase tracking-wider mb-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Real-Time Contagion Alerts & Automated Early-Warning System</span>
            </div>
            <h2 className={`text-xl md:text-2xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              {t('warnings_title')}
            </h2>
            <p className={`text-xs md:text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {t('warnings_subtitle')}
            </p>
          </div>

          {/* Urgency Filter */}
          <div className={`flex items-center gap-1 p-1 rounded-xl border ${
            darkMode ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-100 border-slate-200'
          }`}>
            <Filter className={`w-3.5 h-3.5 ml-1.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
            {[
              { id: 'all', label: t('filter_all') },
              { id: 'critical', label: t('filter_critical') },
              { id: 'high', label: t('filter_high') },
              { id: 'moderate', label: t('filter_moderate') },
            ].map((u) => (
              <button
                key={u.id}
                onClick={() => setUrgencyFilter(u.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                  urgencyFilter === u.id
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                    : darkMode
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {u.label}
              </button>
            ))}
          </div>
        </div>

        {actionNotice && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in duration-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold text-emerald-200">{actionNotice}</span>
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
                  ? darkMode ? 'bg-red-950/15 border-red-900/40' : 'bg-red-50/50 border-red-200 shadow-xs'
                  : alert.urgency === 'high'
                  ? darkMode ? 'bg-orange-950/15 border-orange-900/40' : 'bg-orange-50/50 border-orange-200 shadow-xs'
                  : darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                <div className="space-y-2.5 max-w-3xl">
                  {/* Top Meta Line */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${riskColor.bg} ${riskColor.text} border ${riskColor.border}`}>
                      {alert.urgency} Urgency
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className={`flex items-center gap-1 font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      <MapPin className="w-3.5 h-3.5 text-amber-500" />
                      <span>{alert.state} {alert.district ? `(${alert.district})` : ''}</span>
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className={`flex items-center gap-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      <Layers className="w-3.5 h-3.5 text-blue-500" />
                      <span>{alert.sector}</span>
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className={`flex items-center gap-1 font-mono font-medium ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
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
                    <div className={`text-[11px] font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Diagnosed Root Drivers:
                    </div>
                    <ul className="space-y-1 text-xs">
                      {alert.causes.map((cause, cIdx) => (
                        <li key={cIdx} className={`flex items-start gap-1.5 leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                          <span className="text-amber-500 font-bold shrink-0">•</span>
                          <span>{cause}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Suggested Policy Intervention */}
                  <div className="pt-2">
                    <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                      darkMode ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-300' : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                    }`}>
                      <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                      <div>
                        <strong className={`font-bold ${darkMode ? 'text-emerald-200' : 'text-emerald-950'}`}>{t('recommended_policy')}</strong>{' '}
                        <span>{alert.suggestedIntervention}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Action Column */}
                <div className="shrink-0 flex flex-col justify-between items-start lg:items-end gap-3.5 pt-2 lg:pt-0">
                  <div className="text-left lg:text-right">
                    <div className={`text-[11px] font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t('est_credit_risk')}</div>
                    <div className="text-xl md:text-2xl font-bold font-mono text-amber-500">
                      ₹{alert.estimatedExposureCr.toLocaleString()} Cr
                    </div>
                    <div className={`text-[10px] font-mono ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{alert.timestamp}</div>
                  </div>

                  {/* Interactive Button Group */}
                  <div className="flex flex-col gap-2 w-full lg:w-52">
                    <button
                      onClick={() => openTredsModal(alert)}
                      className="w-full py-2 px-3 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-98"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>{t('deploy_treds')}</span>
                    </button>

                    <button
                      onClick={() => openBankModal(alert)}
                      className={`w-full py-2 px-3 text-xs font-semibold rounded-lg border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        darkMode
                          ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                          : 'border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200'
                      }`}
                    >
                      <Building className="w-3.5 h-3.5 text-blue-400" />
                      <span>{t('notify_lead_bank')}</span>
                    </button>

                    {/* Integrated Cross-Navigation Shortcuts */}
                    {onNavigate && (
                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        <button
                          onClick={() => onNavigate('intervention')}
                          className={`py-1.5 px-2 text-[10px] font-semibold rounded-md border text-center transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                            darkMode
                              ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300 hover:bg-emerald-900/30'
                              : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                          }`}
                          title="Simulate Policy Intervention"
                        >
                          <Sliders className="w-3 h-3 text-emerald-500" />
                          <span>Simulate</span>
                        </button>

                        <button
                          onClick={() => onNavigate('cfo')}
                          className={`py-1.5 px-2 text-[10px] font-semibold rounded-md border text-center transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                            darkMode
                              ? 'border-purple-500/30 bg-purple-950/20 text-purple-300 hover:bg-purple-900/30'
                              : 'border-purple-200 bg-purple-50 text-purple-800 hover:bg-purple-100'
                          }`}
                          title="Consult AI Digital CFO"
                        >
                          <Sparkles className="w-3 h-3 text-purple-400" />
                          <span>AI CFO</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: Interactive TReDS Relief Deployment Workflow */}
      {activeTredsAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`relative w-full max-w-xl rounded-2xl border shadow-2xl p-6 space-y-5 ${
            darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold tracking-tight">Deploy Emergency TReDS Relief Window</h3>
                  <p className="text-xs text-slate-400">
                    Cluster: <strong className="text-amber-400">{activeTredsAlert.state} ({activeTredsAlert.sector})</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTredsAlert(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {tredsSuccessMsg ? (
              <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Deployment Executed Successfully</span>
                </div>
                <p>{tredsSuccessMsg}</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 text-xs">
                  {/* Amount Slider */}
                  <div className={`p-4 rounded-xl border space-y-2 ${
                    darkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between font-semibold">
                      <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>Emergency Liquidity Allocation:</span>
                      <span className="font-mono font-bold text-base text-amber-500">₹{tredsWindowCr.toLocaleString()} Cr</span>
                    </div>
                    <input
                      type="range"
                      min="200"
                      max="3000"
                      step="50"
                      value={tredsWindowCr}
                      onChange={(e) => setTredsWindowCr(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>₹200 Cr (Micro Focus)</span>
                      <span>₹1,500 Cr (Balanced)</span>
                      <span>₹3,000 Cr (Full Cluster)</span>
                    </div>
                  </div>

                  {/* Factoring Exchange Platform */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-[11px] font-semibold mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        Factoring Exchange:
                      </label>
                      <select
                        value={tredsPlatform}
                        onChange={(e) => setTredsPlatform(e.target.value)}
                        className={`w-full p-2 rounded-lg border text-xs ${
                          darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      >
                        <option value="all">Unified Multi-Platform (RXIL + M1xchange + Invoicemart)</option>
                        <option value="rxil">RXIL (RBI/NSE Joint Venture)</option>
                        <option value="m1xchange">M1xchange Platform</option>
                        <option value="invoicemart">Invoicemart (Axis Bank/mjunction)</option>
                      </select>
                    </div>

                    <div>
                      <label className={`block text-[11px] font-semibold mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        Subsidized Discount Rate (APR):
                      </label>
                      <input
                        type="number"
                        step="0.25"
                        value={tredsDiscountRate}
                        onChange={(e) => setTredsDiscountRate(Number(e.target.value))}
                        className={`w-full p-2 rounded-lg border text-xs font-mono font-bold ${
                          darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Key Benefits Strip */}
                  <div className={`p-3 rounded-xl border text-[11px] space-y-1.5 ${
                    darkMode ? 'bg-indigo-950/20 border-indigo-900/30 text-indigo-200' : 'bg-indigo-50 border-indigo-200 text-indigo-950'
                  }`}>
                    <div className="font-bold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Cluster Impact Projection:</span>
                    </div>
                    <p>• Unlocks ~₹{Math.round(tredsWindowCr * 1.4)} Cr in trapped debtor claims within 48 hours.</p>
                    <p>• 100% Non-Recourse to MSME sellers backed by SIDBI/RAMP credit guarantee pool.</p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => setActiveTredsAlert(null)}
                    className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleDeployTredsWindow}
                    className="px-5 py-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Authorize & Deploy Window</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: Interactive SLBC Lead Bank Notification Workflow */}
      {activeBankAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`relative w-full max-w-xl rounded-2xl border shadow-2xl p-6 space-y-5 ${
            darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold tracking-tight">State Level Bankers' Committee (SLBC) Notification</h3>
                  <p className="text-xs text-slate-400">
                    Lead Bank: <strong className="text-blue-400">{STATE_LEAD_BANKS[activeBankAlert.state]?.bankName || 'State Lead Bank'}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveBankAlert(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bankSuccessMsg ? (
              <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Dispatch Confirmed</span>
                </div>
                <p>{bankSuccessMsg}</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 text-xs">
                  {/* Regulatory Recipient Details */}
                  <div className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                    darkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Convenor Secretariat:</span>
                      <span className="font-semibold">{STATE_LEAD_BANKS[activeBankAlert.state]?.convenor || 'SLBC Secretariat'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Assigned Sector Risk:</span>
                      <span className="font-mono text-red-400 font-bold">{activeBankAlert.sector} ({activeBankAlert.urgency} Urgency)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Cluster Credit at Risk:</span>
                      <span className="font-mono text-amber-400 font-bold">₹{activeBankAlert.estimatedExposureCr.toLocaleString()} Cr</span>
                    </div>
                  </div>

                  {/* Covenant Forbearance Options */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-[11px] font-semibold mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        SMA Asset Classification Freeze:
                      </label>
                      <select
                        value={bankMoratoriumMonths}
                        onChange={(e) => setBankMoratoriumMonths(Number(e.target.value))}
                        className={`w-full p-2 rounded-lg border text-xs ${
                          darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      >
                        <option value={1}>30-Day Forbearance Window</option>
                        <option value={2}>60-Day Forbearance Window</option>
                        <option value={3}>90-Day Standard Forbearance</option>
                      </select>
                    </div>

                    <div>
                      <label className={`block text-[11px] font-semibold mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        Emergency Ad-hoc Working Capital:
                      </label>
                      <select
                        value={adhocLimitPct}
                        onChange={(e) => setAdhocLimitPct(Number(e.target.value))}
                        className={`w-full p-2 rounded-lg border text-xs ${
                          darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      >
                        <option value={5}>+5% Credit Line Expansion</option>
                        <option value={10}>+10% Emergency CC Buffer (Recommended)</option>
                        <option value={15}>+15% Critical Shock Relief</option>
                      </select>
                    </div>
                  </div>

                  {/* Regulatory Memo Text Preview */}
                  <div className={`p-3 rounded-xl border text-[11px] space-y-1.5 font-mono ${
                    darkMode ? 'bg-slate-950/80 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}>
                    <div className="font-sans font-bold flex items-center justify-between text-slate-400">
                      <span>FORMAL SLBC COMMUNIQUE PREVIEW:</span>
                      <button
                        onClick={handleCopyMemo}
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer font-sans"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedMemo ? 'Copied to Clipboard!' : 'Copy Memo'}</span>
                      </button>
                    </div>
                    <p className="line-clamp-3 font-mono text-[10px]">
                      DIRECTIVE: Initiate {bankMoratoriumMonths}-month SMA classification freeze across {activeBankAlert.state}'s {activeBankAlert.sector} cluster to avoid systemic NPA formation.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => setActiveBankAlert(null)}
                    className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleTransmitBankNotice}
                    className="px-5 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Transmit SLBC Regulatory Alert</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
