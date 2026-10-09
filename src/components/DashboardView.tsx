import React, { useState } from 'react';
import { NATIONAL_OVERVIEW, STATES_DATA, SECTORS_DATA, EARLY_WARNING_ALERTS } from '../data/indiaData';
import { UserRole, StateData, SMEFinancialInputs } from '../types';
import { getRiskColor } from '../services/mlEngine';
import { AIRiskScoreModal } from './AIRiskScoreModal';
import {
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  Activity,
  Layers,
  Sparkles,
  Grid,
  Bot,
  ShieldCheck,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DashboardViewProps {
  darkMode: boolean;
  userRole: UserRole;
  onNavigate: (tab: string) => void;
  onSelectState?: (state: StateData) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  darkMode,
  userRole,
  onNavigate,
}) => {
  const nationalColor = getRiskColor(NATIONAL_OVERVIEW.riskLevel);

  // Ranked states by stress
  const rankedStates = [...STATES_DATA].sort((a, b) => b.stressScore - a.stressScore);
  // Ranked sectors by stress
  const rankedSectors = [...SECTORS_DATA].sort((a, b) => b.stressScore - a.stressScore);

  const [aiModalOpen, setAiModalOpen] = useState(false);
  const demoSmeInputs: SMEFinancialInputs = {
    businessName: 'Surat Synthetic Textiles LLP (National Cluster Sample)',
    sector: 'Textiles & Garments',
    state: 'Gujarat',
    district: 'Surat',
    annualRevenueLakhs: 480,
    revenueGrowthYoY: -14.5,
    netProfitMargin: 2.1,
    debtToEquity: 2.8,
    dscr: 1.05,
    receivablesDays: 88,
    payablesDays: 42,
    inventoryTurnoverDays: 75,
    cashRunwayMonths: 1.4,
    rawMaterialInflationPct: 18.0,
    monthlyInterestBurdenLakhs: 3.8,
  };

  return (
    <div className="space-y-6">
      {/* Top Hero Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: National Stress Score */}
        <div className={`p-5 rounded-2xl border transition-all ${
          darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              National SME Stress Index
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase ${nationalColor.bg} ${nationalColor.text}`}>
              {NATIONAL_OVERVIEW.riskLevel}
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-3">
            <span className={`text-4xl md:text-5xl font-extrabold font-mono tabular-nums ${nationalColor.text}`}>
              {NATIONAL_OVERVIEW.stressScore}
            </span>
            <span className="text-slate-400 text-sm font-semibold">/ 100</span>
          </div>

          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
            <TrendingUp className="w-4 h-4 text-orange-400" />
            <span>
              <strong className="text-orange-400 font-semibold">+8.4 pts</strong> increase over prior 90-day baseline
            </span>
          </div>
        </div>

        {/* Card 2: High-Risk Regions */}
        <div className={`p-5 rounded-2xl border transition-all ${
          darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              High-Risk Regions
            </span>
            <AlertTriangle className="w-4 h-4 text-orange-400" />
          </div>

          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-4xl md:text-5xl font-extrabold font-mono tabular-nums text-orange-400">
              {NATIONAL_OVERVIEW.highRiskRegionsCount}
            </span>
            <span className="text-slate-400 text-sm">of 15 States</span>
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/80 text-xs">
            <span className="text-slate-400">Critical Clusters:</span>
            <span className="font-semibold text-amber-400">Surat, Tiruppur, Ludhiana</span>
          </div>
        </div>

        {/* Card 3: High-Risk Sectors */}
        <div className={`p-5 rounded-2xl border transition-all ${
          darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              High-Risk Sectors
            </span>
            <Layers className="w-4 h-4 text-red-400" />
          </div>

          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-4xl md:text-5xl font-extrabold font-mono tabular-nums text-red-400">
              {NATIONAL_OVERVIEW.highRiskSectorsCount}
            </span>
            <span className="text-slate-400 text-sm">of 10 Monitored</span>
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/80 text-xs">
            <span className="text-slate-400">Lead Squeeze:</span>
            <span className="font-semibold text-red-400">Textiles (78.2), Auto (68.5)</span>
          </div>
        </div>

        {/* Card 4: Predictive Forecast Trajectory */}
        <div className={`p-5 rounded-2xl border transition-all ${
          darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              90-Day Trajectory Forecast
            </span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3 text-center">
            <div className="p-1.5 rounded-lg bg-slate-800/50">
              <div className="text-[10px] text-slate-400 uppercase font-medium">30d</div>
              <div className="text-base font-bold font-mono text-amber-400">
                {NATIONAL_OVERVIEW.forecast30.toFixed(0)}
              </div>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-800/50">
              <div className="text-[10px] text-slate-400 uppercase font-medium">60d</div>
              <div className="text-base font-bold font-mono text-orange-400">
                {NATIONAL_OVERVIEW.forecast60.toFixed(0)}
              </div>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-800/50">
              <div className="text-[10px] text-slate-400 uppercase font-medium">90d</div>
              <div className="text-base font-bold font-mono text-red-400">
                {NATIONAL_OVERVIEW.forecast90.toFixed(0)}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
            <span>Model Confidence:</span>
            <span className="font-mono font-bold text-emerald-400">{NATIONAL_OVERVIEW.confidence}%</span>
          </div>
        </div>
      </div>

      {/* AI Risk Score Feature Hero Banner */}
      <div className={`p-4 md:p-5 rounded-2xl border transition-all ${
        darkMode
          ? 'bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900/60 border-indigo-500/30 shadow-lg shadow-indigo-950/20'
          : 'bg-gradient-to-r from-indigo-50 via-purple-50 to-white border-indigo-200 shadow-sm'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/25 shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  AI Risk Score & Credit Grade Engine
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                  Gemini 2.5 Flash
                </span>
              </div>
              <h3 className={`text-base font-bold mt-0.5 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                Enterprise Financial Risk Evaluation & Insolvency Early-Warning
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluates 5 sub-pillars (Liquidity, Debt Solvency, Operations, Supply Chain, Macro), calculates covenant rate shock tolerance, and simulates prescriptive mitigations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setAiModalOpen(true)}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Evaluate AI Risk Score</span>
            </button>
            <button
              onClick={() => onNavigate('heatmap')}
              className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer flex items-center gap-1.5 ${
                darkMode ? 'border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20' : 'border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100'
              }`}
            >
              <Grid className="w-3.5 h-3.5 text-rose-400" />
              <span>Risk Heatmap</span>
            </button>
            <button
              onClick={() => onNavigate('cfo')}
              className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer flex items-center gap-1.5 ${
                darkMode ? 'border-purple-500/40 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20' : 'border-purple-300 bg-purple-50 text-purple-800 hover:bg-purple-100'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-purple-400" />
              <span>AI Digital CFO</span>
            </button>
            <button
              onClick={() => onNavigate('intervention')}
              className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer flex items-center gap-1.5 ${
                darkMode ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20' : 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Intervention Simulator</span>
            </button>
            <button
              onClick={() => onNavigate('analyzer')}
              className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer flex items-center gap-1 ${
                darkMode ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700' : 'border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200'
              }`}
            >
              <span>Custom MSME</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Role-Specific Insight Banner */}
      <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
        darkMode ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500 text-slate-950 font-bold">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              {userRole === 'government' ? 'Government & Policy Directives' : userRole === 'financial_institution' ? 'Banking & Credit Risk Brief' : 'SME Business Sandbox Guidance'}
            </div>
            <p className={`text-xs md:text-sm mt-0.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              {userRole === 'government'
                ? '8 export clusters are tracking toward debt servicing breaches within 60 days. Immediate TReDS digital invoice discounting and state power duty relief recommended.'
                : userRole === 'financial_institution'
                ? 'Aggregated ₹3.82 Lakh Cr MSME credit under pressure. Watchlist loans in Tiruppur textile mills and Surat diamond cutting units before NPA classification.'
                : 'Evaluate your own SME health score in the confidential sandbox to benchmark debtor days, DSCR, and access tailored debt restructuring steps.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate(userRole === 'sme_owner' ? 'analyzer' : 'simulator')}
          className="shrink-0 px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <span>{userRole === 'sme_owner' ? 'Open SME Analyzer' : 'Simulate Economic Shock'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Charts Row: Stress Trend & Top Risk Factors */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trend Forecast Chart */}
        <div className={`lg:col-span-7 p-5 md:p-6 rounded-2xl border transition-colors ${
          darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                National SME Financial Stress Trend & 90-Day Trajectory
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Composite stress score historical progression and ML forward predictive cone.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="text-slate-400">Actual History</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                <span className="text-slate-400">ML Forecast Cone</span>
              </div>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={NATIONAL_OVERVIEW.stressTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#e2e8f0'} opacity={0.6} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: darkMode ? '#94a3b8' : '#64748b' }} />
                <YAxis domain={[30, 90]} tick={{ fontSize: 11, fill: darkMode ? '#94a3b8' : '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                    borderColor: darkMode ? '#334155' : '#e2e8f0',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="actual" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#actualGradient)" name="Actual Score" />
                <Area type="monotone" dataKey="predicted" stroke="#ef4444" strokeWidth={2.5} strokeDasharray="4 4" fillOpacity={1} fill="url(#predictedGradient)" name="Predicted Stress" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>High Stress Threshold: <strong>60.0</strong></span>
            <span>Critical Stress Threshold: <strong>80.0</strong></span>
            <span>Expected Transition to Critical: <strong>Dec 2026 (+60d)</strong></span>
          </div>
        </div>

        {/* Top Risk Factor Attribution */}
        <div className={`lg:col-span-5 p-5 md:p-6 rounded-2xl border transition-colors ${
          darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                Top Macro & Structural Risk Factors
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Aggregated SHAP feature importance driving national score.
              </p>
            </div>
            <span className="text-xs font-mono text-amber-500 font-bold">SHAP %</span>
          </div>

          <div className="space-y-4">
            {NATIONAL_OVERVIEW.topRiskFactors.map((rf, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-medium ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                    {rf.factor}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono tabular-nums font-bold text-amber-400">
                      {rf.contribution}%
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">{rf.trend}</span>
                  </div>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-red-500 transition-all duration-500"
                    style={{ width: `${rf.contribution * 3}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 text-xs text-slate-400 space-y-1">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>AI Attribution Diagnosis:</span>
            </div>
            <p>
              Supply-chain payment delays (DSO &gt; 75d) account for nearly 30% of total financial stress. Without factoring relief, working capital gaps will trigger secondary loan defaults.
            </p>
          </div>
        </div>
      </div>

      {/* Rankings Row: State Risk Ranking & Sector Risk Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Regional Risk Ranking */}
        <div className={`lg:col-span-6 p-5 md:p-6 rounded-2xl border transition-colors ${
          darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                Regional Risk Ranking (Top 6 States)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                States prioritized by composite MSME stress score and credit exposure.
              </p>
            </div>
            <button
              onClick={() => onNavigate('map')}
              className="text-xs font-semibold text-amber-500 hover:text-amber-400 flex items-center gap-1 cursor-pointer"
            >
              <span>Explore Map</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-800/60">
            {rankedStates.slice(0, 6).map((st, idx) => {
              const c = getRiskColor(st.riskLevel);
              return (
                <div
                  key={st.id}
                  className="py-3 flex items-center justify-between text-xs hover:bg-slate-800/20 px-2 rounded-lg transition-colors cursor-pointer"
                  onClick={() => onNavigate('map')}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-400 font-bold w-4">#{idx + 1}</span>
                    <div>
                      <div className="font-bold text-slate-200 flex items-center gap-2">
                        <span>{st.name}</span>
                        <span className={`text-[10px] font-bold uppercase ${c.text}`}>({st.riskLevel})</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {st.districts[0]?.clusterName || st.keySectors.slice(0, 2).join(', ')}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`text-sm font-extrabold font-mono tabular-nums ${c.text}`}>
                      {st.stressScore.toFixed(1)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      ₹{st.creditAtRiskCr.toLocaleString()} Cr at risk
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sector Risk Ranking */}
        <div className={`lg:col-span-6 p-5 md:p-6 rounded-2xl border transition-colors ${
          darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                Sector Risk Ranking (10 Monitored Verticals)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Ordered by financial stress score and supply chain vulnerability.
              </p>
            </div>
            <button
              onClick={() => onNavigate('sectors')}
              className="text-xs font-semibold text-amber-500 hover:text-amber-400 flex items-center gap-1 cursor-pointer"
            >
              <span>All Sectors</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-800/60">
            {rankedSectors.slice(0, 6).map((sec, idx) => {
              const c = getRiskColor(sec.riskLevel);
              return (
                <div
                  key={sec.id}
                  className="py-3 flex items-center justify-between text-xs hover:bg-slate-800/20 px-2 rounded-lg transition-colors cursor-pointer"
                  onClick={() => onNavigate('sectors')}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-400 font-bold w-4">#{idx + 1}</span>
                    <div>
                      <div className="font-bold text-slate-200">
                        {sec.name}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-xs">
                        {sec.keyVulnerabilities[0]}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`text-sm font-extrabold font-mono tabular-nums ${c.text}`}>
                      {sec.stressScore.toFixed(1)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      +{sec.changePct}% MoM
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Early Warnings Ticker Bar */}
      <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
        darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-3 min-w-0">
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 uppercase shrink-0">
            Active Warning
          </span>
          <p className="text-xs text-slate-300 truncate">
            <strong>{EARLY_WARNING_ALERTS[0].region}:</strong> {EARLY_WARNING_ALERTS[0].headline}
          </p>
        </div>

        <button
          onClick={() => onNavigate('alerts')}
          className="shrink-0 text-xs font-semibold text-amber-500 hover:text-amber-400 flex items-center gap-1 cursor-pointer"
        >
          <span>View All ({EARLY_WARNING_ALERTS.length})</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* AI Risk Score Diagnostic Modal */}
      <AIRiskScoreModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        inputs={demoSmeInputs}
        mlBaselineScore={NATIONAL_OVERVIEW.stressScore}
        darkMode={darkMode}
      />
    </div>
  );
};
