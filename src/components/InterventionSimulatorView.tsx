import React, { useState } from 'react';
import { InterventionParams, InterventionPreset } from '../types';
import { INTERVENTION_PACKAGES, NATIONAL_OVERVIEW } from '../data/indiaData';
import { runInterventionSimulation } from '../services/simulationEngine';
import { getRiskColor } from '../services/mlEngine';
import {
  Sliders,
  RotateCcw,
  ShieldCheck,
  TrendingDown,
  DollarSign,
  Users,
  Award,
  Layers,
  ArrowRight,
  ExternalLink,
  Printer,
  Sparkles,
  Building2,
  FileCheck,
  CheckCircle2,
  Flame,
  Zap,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface InterventionSimulatorViewProps {
  darkMode: boolean;
  onNavigate?: (tab: string) => void;
}

const DEFAULT_INTERVENTION: InterventionParams = {
  eclgsCreditExpansionPct: 0,
  tredsEnforcementPct: 0,
  interestSubventionBps: 0,
  debtMoratoriumMonths: 0,
  cgtmseCoveragePct: 0,
  gstRefundAccelerationDays: 0,
  opexRationalizationPct: 0,
  powerTariffSubsidyPct: 0,
};

export const InterventionSimulatorView: React.FC<InterventionSimulatorViewProps> = ({
  darkMode,
  onNavigate,
}) => {
  const [params, setParams] = useState<InterventionParams>(DEFAULT_INTERVENTION);
  const [activePackageId, setActivePackageId] = useState<string | null>(null);
  const [scenarioMode, setScenarioMode] = useState<'baseline' | 'crisis_shock'>('baseline');
  const [customBaselineScore, setCustomBaselineScore] = useState<number>(76.5); // Escalated crisis shock scenario

  const effectiveBaseline = scenarioMode === 'baseline' ? NATIONAL_OVERVIEW.stressScore : customBaselineScore;
  const result = runInterventionSimulation(params, effectiveBaseline);

  const baselineColor = getRiskColor(result.baselineRiskLevel);
  const postColor = getRiskColor(result.postInterventionRiskLevel);

  const handleSliderChange = (field: keyof InterventionParams, val: number) => {
    setActivePackageId(null);
    setParams((prev) => ({
      ...prev,
      [field]: val,
    }));
  };

  const handleApplyPackage = (pkg: InterventionPreset) => {
    setActivePackageId(pkg.id);
    setParams(pkg.params);
  };

  const handleReset = () => {
    setActivePackageId(null);
    setParams(DEFAULT_INTERVENTION);
  };

  const handlePrint = () => {
    window.print();
  };

  // Prepare chart data for Recharts
  const sectorChartData = result.sectorRelief.slice(0, 8).map((s) => ({
    name: s.sector.length > 18 ? s.sector.slice(0, 16) + '...' : s.sector,
    before: s.beforeScore,
    after: s.afterScore,
    relief: s.reliefPoints,
  }));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className={`p-4 md:p-6 rounded-2xl border transition-colors ${
        darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-500 uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Policy Countermeasure & Capital Easing Sandbox</span>
            </div>
            <h2 className={`text-xl md:text-2xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Policy & Financial Intervention Simulator
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-3xl">
              Model government relief packages, RBI emergency credit facilities, TReDS receivables clearing, and rate subventions to forecast systemic stress mitigation and economic ROI.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handlePrint}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                darkMode ? 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700' : 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Export Memo</span>
            </button>

            <button
              onClick={handleReset}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                darkMode ? 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700' : 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Levers</span>
            </button>
          </div>
        </div>

        {/* Scenario Mode Switcher */}
        <div className={`mt-5 pt-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
          darkMode ? 'border-slate-800/80 text-slate-400' : 'border-slate-100 text-slate-600'
        }`}>
          <div className="flex items-center gap-2 font-medium">
            <span>Simulation Context:</span>
            <div className={`inline-flex p-0.5 rounded-lg border ${
              darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                onClick={() => setScenarioMode('baseline')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  scenarioMode === 'baseline'
                    ? darkMode
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                National Baseline (58.4 pts)
              </button>
              <button
                onClick={() => setScenarioMode('crisis_shock')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  scenarioMode === 'crisis_shock'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Flame className="w-3 h-3" />
                <span>Under Crisis Shock ({customBaselineScore} pts)</span>
              </button>
            </div>
          </div>

          {scenarioMode === 'crisis_shock' && (
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Shock Stress Level:</span>
              <input
                type="range"
                min="65"
                max="95"
                step="0.5"
                value={customBaselineScore}
                onChange={(e) => setCustomBaselineScore(parseFloat(e.target.value))}
                className="w-28 accent-rose-500"
              />
              <span className="font-mono font-bold text-rose-400">{customBaselineScore} pts</span>
            </div>
          )}

          {onNavigate && (
            <button
              onClick={() => onNavigate('simulator')}
              className="text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Crisis Shock Simulator</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Pre-built Policy Packages */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>One-Click Policy & Institutional Rescue Packages:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {INTERVENTION_PACKAGES.map((pkg) => {
            const isActive = activePackageId === pkg.id;
            return (
              <button
                key={pkg.id}
                onClick={() => handleApplyPackage(pkg)}
                className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isActive
                    ? darkMode
                      ? 'bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500/50'
                      : 'bg-emerald-50 border-emerald-400 ring-1 ring-emerald-400'
                    : darkMode
                    ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {pkg.badge}
                    </span>
                    {isActive && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </div>
                  <h4 className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    {pkg.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {pkg.description}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800/40 flex items-center justify-between text-[10px] text-slate-500">
                  <span className="truncate">{pkg.authority}</span>
                  <span className="text-emerald-400 font-semibold shrink-0">Deploy</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary KPI Result Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Stress Reduction Card */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between ${
          darkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>National Stress</span>
              <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-black ${postColor}`}>
                {result.postInterventionScore}
              </span>
              <span className="text-xs text-slate-500 line-through">
                {result.baselineStressScore}
              </span>
            </div>
          </div>
          <div className="mt-2 text-xs font-semibold text-emerald-400">
            {result.stressReliefDelta < 0 ? `${result.stressReliefDelta} pts relief` : '0 pts delta'}
          </div>
        </div>

        {/* Credit Protected */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between ${
          darkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Credit Shielded</span>
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <span className="text-2xl font-black text-amber-400">
              ₹{(result.creditPreservedCr / 1000).toFixed(1)}k Cr
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Protected from NPA slippage
          </div>
        </div>

        {/* Liquidity Injected */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between ${
          darkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Liquidity Unlocked</span>
              <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <span className="text-2xl font-black text-cyan-400">
              ₹{(result.liquidityInjectedCr / 1000).toFixed(1)}k Cr
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Cash injected into supply chain
          </div>
        </div>

        {/* MSMEs Rescued */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between ${
          darkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>MSMEs Shielded</span>
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <span className="text-2xl font-black text-indigo-400">
              {(result.enterprisesSavedCount / 1000).toFixed(1)}k
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            ≈ {(result.jobsProtectedCount / 100000).toFixed(1)} Lakh Jobs Saved
          </div>
        </div>

        {/* Fiscal ROI */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between ${
          darkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Economic Multiplier</span>
              <Award className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className="text-2xl font-black text-emerald-400">
              {result.roiRatio}x
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            ₹{result.totalInterventionCostCr.toLocaleString()} Cr fiscal cost
          </div>
        </div>
      </div>

      {/* Main Grid: Policy Sliders (Left) & Real-time Analysis (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 4 Policy Pillars (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className={`p-4 md:p-5 rounded-2xl border ${
            darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <h3 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  Intervention Levers & Policy Controls
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                8 Calibrated Transmission Levers
              </span>
            </div>

            {/* Pillar 1: Liquidity & Receivables (ECLGS & TReDS) */}
            <div className="mb-5 pb-5 border-b border-slate-800/60">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">
                <DollarSign className="w-3.5 h-3.5" />
                <span>Pillar 1: Working Capital & Receivables Liquidity</span>
              </div>

              <div className="space-y-4">
                {/* ECLGS */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium">
                      Emergency Credit Line (ECLGS) Top-Up:
                    </span>
                    <span className="font-mono font-bold text-amber-400">
                      +{params.eclgsCreditExpansionPct}% of existing limit
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="5"
                    value={params.eclgsCreditExpansionPct}
                    onChange={(e) => handleSliderChange('eclgsCreditExpansionPct', parseInt(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                    <span>0% (None)</span>
                    <span>10% (Targeted)</span>
                    <span>20% (Standard)</span>
                    <span>30% (Maximum Emergency)</span>
                  </div>
                </div>

                {/* TReDS Discounting Enforcement */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium">
                      TReDS Mandatory Receivables Discounting Mandate:
                    </span>
                    <span className="font-mono font-bold text-cyan-400">
                      {params.tredsEnforcementPct}% clearance
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="80"
                    step="10"
                    value={params.tredsEnforcementPct}
                    onChange={(e) => handleSliderChange('tredsEnforcementPct', parseInt(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50% (Strict GeM)</span>
                    <span>80% (Mandatory Corporate Clearing)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pillar 2: Monetary & Debt Relief */}
            <div className="mb-5 pb-5 border-b border-slate-800/60">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3">
                <Building2 className="w-3.5 h-3.5" />
                <span>Pillar 2: Monetary & Debt Service Relief</span>
              </div>

              <div className="space-y-4">
                {/* Interest Subvention */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium">
                      Targeted Interest Subvention Rate Relief:
                    </span>
                    <span className="font-mono font-bold text-indigo-400">
                      {(params.interestSubventionBps / 100).toFixed(1)}% ({params.interestSubventionBps} bps)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="400"
                    step="50"
                    value={params.interestSubventionBps}
                    onChange={(e) => handleSliderChange('interestSubventionBps', parseInt(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                    <span>0%</span>
                    <span>1.5% (150 bps)</span>
                    <span>2.5% (250 bps)</span>
                    <span>4.0% (400 bps)</span>
                  </div>
                </div>

                {/* Debt Moratorium */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium">
                      RBI Loan Principal Moratorium Window:
                    </span>
                    <span className="font-mono font-bold text-purple-400">
                      {params.debtMoratoriumMonths === 0 ? 'No Moratorium' : `${params.debtMoratoriumMonths} Months Repayment Holiday`}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-1">
                    {[0, 3, 6, 9].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => handleSliderChange('debtMoratoriumMonths', m)}
                        className={`py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                          params.debtMoratoriumMonths === m
                            ? 'bg-purple-600 text-white border-purple-500'
                            : darkMode
                            ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                            : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {m === 0 ? '0 mo' : `${m} mo`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Pillar 3: Credit Guarantee & Tax Acceleration */}
            <div className="mb-5 pb-5 border-b border-slate-800/60">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">
                <FileCheck className="w-3.5 h-3.5" />
                <span>Pillar 3: Credit Guarantee & Fiscal Tax Acceleration</span>
              </div>

              <div className="space-y-4">
                {/* CGTMSE Coverage */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium">
                      CGTMSE Guarantee Coverage & Fee Waiver:
                    </span>
                    <span className="font-mono font-bold text-emerald-400">
                      {params.cgtmseCoveragePct}% Coverage
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="85"
                    step="5"
                    value={params.cgtmseCoveragePct}
                    onChange={(e) => handleSliderChange('cgtmseCoveragePct', parseInt(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                    <span>0% (Standard)</span>
                    <span>50%</span>
                    <span>75% (Enhanced)</span>
                    <span>85% (Comprehensive)</span>
                  </div>
                </div>

                {/* GST Refund Acceleration */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium">
                      Fast-Track GST ITC Refund Processing:
                    </span>
                    <span className="font-mono font-bold text-teal-400">
                      +{params.gstRefundAccelerationDays} Days Accelerated
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    step="5"
                    value={params.gstRefundAccelerationDays}
                    onChange={(e) => handleSliderChange('gstRefundAccelerationDays', parseInt(e.target.value))}
                    className="w-full accent-teal-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                    <span>0d (Normal cycle)</span>
                    <span>15d</span>
                    <span>30d</span>
                    <span>60d (Instant 72h audit)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pillar 4: Cost & Infrastructure Support */}
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider mb-3">
                <Zap className="w-3.5 h-3.5" />
                <span>Pillar 4: Energy, Logistics & Enterprise Efficiency</span>
              </div>

              <div className="space-y-4">
                {/* Power Tariff Subsidy */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium">
                      Industrial Power & Freight Surcharge Rebate:
                    </span>
                    <span className="font-mono font-bold text-rose-400">
                      {params.powerTariffSubsidyPct}% Tariff Relief
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="5"
                    value={params.powerTariffSubsidyPct}
                    onChange={(e) => handleSliderChange('powerTariffSubsidyPct', parseInt(e.target.value))}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                    <span>0%</span>
                    <span>10%</span>
                    <span>20%</span>
                    <span>30%</span>
                  </div>
                </div>

                {/* OpEx Rationalization */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium">
                      SME Enterprise OpEx Rationalization (Lean Overhead):
                    </span>
                    <span className="font-mono font-bold text-amber-400">
                      {params.opexRationalizationPct}% Cost Reduction
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    step="5"
                    value={params.opexRationalizationPct}
                    onChange={(e) => handleSliderChange('opexRationalizationPct', parseInt(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                    <span>0%</span>
                    <span>10%</span>
                    <span>15%</span>
                    <span>25%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sector Breakdown & Policy Memo (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Executive Policy Brief Card */}
          <div className={`p-4 md:p-5 rounded-2xl border ${
            darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulated Policy Transmission Memo</span>
            </div>
            <p className={`text-xs md:text-sm leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              {result.policyBriefSummary}
            </p>

            <div className={`mt-4 pt-3 border-t grid grid-cols-2 gap-3 text-xs ${
              darkMode ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-600'
            }`}>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Baseline Risk Level</span>
                <span className={`font-semibold capitalize ${baselineColor}`}>{result.baselineRiskLevel}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Post-Intervention</span>
                <span className={`font-semibold capitalize ${postColor}`}>{result.postInterventionRiskLevel}</span>
              </div>
            </div>
          </div>

          {/* Sector Relief Comparison Chart */}
          <div className={`p-4 md:p-5 rounded-2xl border ${
            darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h4 className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  Sector Stress: Before vs. After
                </h4>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Lower = Safer
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectorChartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#e2e8f0'} />
                  <XAxis type="number" domain={[0, 100]} stroke={darkMode ? '#94a3b8' : '#64748b'} fontSize={10} />
                  <YAxis type="category" dataKey="name" stroke={darkMode ? '#94a3b8' : '#64748b'} fontSize={10} width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                      borderColor: darkMode ? '#334155' : '#cbd5e1',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="before" name="Before Intervention" fill="#f43f5e" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="after" name="Post-Intervention" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Regional Relief Matrix */}
          <div className={`p-4 md:p-5 rounded-2xl border ${
            darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Top Regional Industrial Clusters Relieved
            </h4>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {result.stateRelief.slice(0, 6).map((st) => (
                <div
                  key={st.state}
                  className={`p-2 rounded-lg flex items-center justify-between text-xs border ${
                    darkMode ? 'bg-slate-950/40 border-slate-800/80' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div>
                    <span className="font-semibold text-slate-200 block">{st.state}</span>
                    <span className="text-[10px] text-slate-400 capitalize">{st.riskStatus} Risk Post-Policy</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-400">
                      -{st.reliefPoints.toFixed(1)} pts
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {st.beforeScore} → {st.afterScore}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Implementation Roadmap */}
      <div className={`p-4 md:p-6 rounded-2xl border ${
        darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h3 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Policy Implementation & Deployment Roadmap
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            90-Day Execution Trajectory
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {result.actionRoadmap.map((step, idx) => (
            <div
              key={step.phase}
              className={`p-4 rounded-xl border relative ${
                darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-400 mb-1">
                <span>{step.phase}</span>
                <span className="font-mono text-slate-500">{step.timeframe}</span>
              </div>
              <h5 className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                {step.title}
              </h5>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                {step.description}
              </p>
              <div className="mt-3 pt-2 border-t border-slate-800/40 text-[10px] text-slate-500">
                Lead: <span className="text-slate-400 font-medium">{step.leadAgency}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cross-Link Footer Actions */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
        darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="text-xs text-slate-400">
          Want to test how specific SME loan books react or run micro-enterprise treasury scenarios?
        </div>
        <div className="flex items-center gap-3">
          {onNavigate && (
            <>
              <button
                onClick={() => onNavigate('cfo')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                  darkMode ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                Launch AI Digital CFO
              </button>
              <button
                onClick={() => onNavigate('analyzer')}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>Analyze Individual SME</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
