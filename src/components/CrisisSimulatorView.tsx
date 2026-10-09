import React, { useState } from 'react';
import { CrisisScenarioParams } from '../types';
import { NATIONAL_SHOCK_PRESETS } from '../data/indiaData';
import { runCrisisSimulation } from '../services/simulationEngine';
import { getRiskColor } from '../services/mlEngine';
import {
  Sliders,
  RotateCcw,
  AlertOctagon,
  TrendingUp,
  Zap,
  ShieldAlert,
  ArrowRight,
  Layers,
  MapPin,
  Flame,
  ShieldCheck,
} from 'lucide-react';

interface CrisisSimulatorViewProps {
  darkMode: boolean;
  onNavigate?: (tab: string) => void;
  initialPresetId?: string | null;
  presetTimestamp?: number;
}

const DEFAULT_PARAMS: CrisisScenarioParams = {
  interestRateDelta: 0,
  revenueGrowthDelta: 0,
  rawMaterialCostDelta: 0,
  customerDemandDelta: 0,
  operatingExpensesDelta: 0,
  paymentDelayDaysDelta: 0,
  loanAmountMultiplier: 1.0,
};

export const CrisisSimulatorView: React.FC<CrisisSimulatorViewProps> = ({
  darkMode,
  onNavigate,
  initialPresetId,
  presetTimestamp,
}) => {
  const [params, setParams] = useState<CrisisScenarioParams>(DEFAULT_PARAMS);
  const [activePresetId, setActivePresetId] = useState<string | null>(initialPresetId || null);

  // Apply initial preset if triggered by search bar or navigation
  React.useEffect(() => {
    if (initialPresetId) {
      const match = NATIONAL_SHOCK_PRESETS.find((p) => p.id === initialPresetId);
      if (match) {
        setActivePresetId(match.id);
        setParams(match.params);
      }
    }
  }, [initialPresetId, presetTimestamp]);

  const result = runCrisisSimulation(params);

  const baselineColor = getRiskColor(result.baselineLevel);
  const simulatedColor = getRiskColor(result.simulatedLevel);

  const handleSliderChange = (field: keyof CrisisScenarioParams, val: number) => {
    setActivePresetId(null);
    setParams((prev) => ({
      ...prev,
      [field]: val,
    }));
  };

  const handleApplyPreset = (preset: typeof NATIONAL_SHOCK_PRESETS[0]) => {
    setActivePresetId(preset.id);
    setParams(preset.params);
  };

  const handleReset = () => {
    setActivePresetId(null);
    setParams(DEFAULT_PARAMS);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-4 md:p-6 rounded-2xl border transition-colors ${
        darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-wider mb-1">
              <Zap className="w-3.5 h-3.5" />
              <span>Stress Testing & Macro Shock Transmission</span>
            </div>
            <h2 className={`text-xl md:text-2xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Crisis & National Economic Shock Simulator
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Simulate interest rate spikes, input inflation, payment delays, and export contractions to predict cross-sector and cross-regional financial contagion.
            </p>
          </div>

          <button
            onClick={handleReset}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
              darkMode ? 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700' : 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Baseline</span>
          </button>
        </div>
      </div>

      {/* National Macro Shock Presets */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          <span>One-Click National Economic Shock Scenarios:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {NATIONAL_SHOCK_PRESETS.map((preset) => {
            const isSelected = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleApplyPreset(preset)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-amber-500 bg-amber-500/15 shadow-sm'
                    : darkMode
                    ? 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                      {preset.badge}
                    </span>
                    {isSelected && <span className="text-[10px] font-bold text-amber-400">ACTIVE</span>}
                  </div>
                  <h4 className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    {preset.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    {preset.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-amber-400/90 font-medium">
                  <span>Simulate Shock</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Dual Gauges & Sliders Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: What-If Slider Controls */}
        <div className={`lg:col-span-7 p-5 md:p-6 rounded-2xl border space-y-5 transition-colors ${
          darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className={`text-base font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              <Sliders className="w-4 h-4 text-amber-500" />
              <span>Macroeconomic Shock Parameters</span>
            </h3>
            <span className="text-xs text-slate-400">7 Variable Controls</span>
          </div>

          <div className="space-y-4">
            {/* 1. Interest Rate Delta */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">RBI Repo / Borrowing Rate Change:</span>
                <span className={`font-mono font-bold ${params.interestRateDelta > 0 ? 'text-red-400' : 'text-slate-200'}`}>
                  {params.interestRateDelta > 0 ? `+${params.interestRateDelta.toFixed(1)}%` : `${params.interestRateDelta.toFixed(1)}%`} ({params.interestRateDelta * 100 > 0 ? `+${(params.interestRateDelta * 100).toFixed(0)} bps` : '0 bps'})
                </span>
              </div>
              <input
                type="range"
                min="-1.0"
                max="4.0"
                step="0.25"
                value={params.interestRateDelta}
                onChange={(e) => handleSliderChange('interestRateDelta', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>-100 bps Cut</span>
                <span>Baseline (0)</span>
                <span>+400 bps Extreme Squeeze</span>
              </div>
            </div>

            {/* 2. Raw Material Cost Delta */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Raw Material & Commodity Cost Inflation:</span>
                <span className={`font-mono font-bold ${params.rawMaterialCostDelta > 0 ? 'text-red-400' : 'text-slate-200'}`}>
                  +{params.rawMaterialCostDelta}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="35"
                step="1"
                value={params.rawMaterialCostDelta}
                onChange={(e) => handleSliderChange('rawMaterialCostDelta', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0% Stable</span>
                <span>+15% Moderate Surge</span>
                <span>+35% Severe Crisis</span>
              </div>
            </div>

            {/* 3. Customer Demand Delta */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Customer & Export Demand Change:</span>
                <span className={`font-mono font-bold ${params.customerDemandDelta < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {params.customerDemandDelta > 0 ? `+${params.customerDemandDelta}%` : `${params.customerDemandDelta}%`}
                </span>
              </div>
              <input
                type="range"
                min="-35"
                max="15"
                step="1"
                value={params.customerDemandDelta}
                onChange={(e) => handleSliderChange('customerDemandDelta', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>-35% Sharp Slump</span>
                <span>0% Flat</span>
                <span>+15% Rebound</span>
              </div>
            </div>

            {/* 4. Payment Delays Days Delta */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Supply-Chain Payment Delay Extension:</span>
                <span className={`font-mono font-bold ${params.paymentDelayDaysDelta > 0 ? 'text-red-400' : 'text-slate-200'}`}>
                  +{params.paymentDelayDaysDelta} Days
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={params.paymentDelayDaysDelta}
                onChange={(e) => handleSliderChange('paymentDelayDaysDelta', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0d On-Time</span>
                <span>+25d Liquidity Pinch</span>
                <span>+50d Near Default</span>
              </div>
            </div>

            {/* 5. Revenue Growth Delta */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Top-Line Revenue Contraction/Growth:</span>
                <span className={`font-mono font-bold ${params.revenueGrowthDelta < 0 ? 'text-red-400' : 'text-slate-200'}`}>
                  {params.revenueGrowthDelta > 0 ? `+${params.revenueGrowthDelta}%` : `${params.revenueGrowthDelta}%`}
                </span>
              </div>
              <input
                type="range"
                min="-30"
                max="15"
                step="1"
                value={params.revenueGrowthDelta}
                onChange={(e) => handleSliderChange('revenueGrowthDelta', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>-30% Contraction</span>
                <span>0% Normal</span>
                <span>+15% Growth</span>
              </div>
            </div>

            {/* 6. Operating Expenses Delta */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Power, Fuel & Operating Expense Inflation:</span>
                <span className={`font-mono font-bold ${params.operatingExpensesDelta > 0 ? 'text-red-400' : 'text-slate-200'}`}>
                  +{params.operatingExpensesDelta}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="1"
                value={params.operatingExpensesDelta}
                onChange={(e) => handleSliderChange('operatingExpensesDelta', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0% Stable</span>
                <span>+15% Energy Tariff Rise</span>
                <span>+30% Severe Inflation</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Dual Comparison Gauges & Impact Summary */}
        <div className={`lg:col-span-5 p-5 md:p-6 rounded-2xl border space-y-6 transition-colors ${
          darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Contagion Outcome Simulation
              </span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                result.delta > 15 ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-amber-500/20 text-amber-300'
              }`}>
                {result.delta > 0 ? `+${result.delta.toFixed(1)} pts Shock` : 'Baseline'}
              </span>
            </div>

            {/* Dual Score Cards */}
            <div className="grid grid-cols-2 gap-3">
              {/* Baseline */}
              <div className={`p-4 rounded-xl border text-center ${
                darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Baseline Index</div>
                <div className={`text-3xl font-extrabold font-mono tabular-nums mt-1 ${baselineColor.text}`}>
                  {result.baselineScore}
                </div>
                <div className="text-[10px] text-slate-400 uppercase mt-0.5 font-bold">
                  {result.baselineLevel} Risk
                </div>
              </div>

              {/* Simulated */}
              <div className={`p-4 rounded-xl border text-center relative overflow-hidden ${
                result.simulatedScore > 80
                  ? 'border-red-500/50 bg-red-950/20'
                  : result.simulatedScore > 60
                  ? 'border-orange-500/50 bg-orange-950/20'
                  : 'border-amber-500/50 bg-amber-950/20'
              }`}>
                <div className="text-[11px] text-slate-300 uppercase font-bold">Simulated Index</div>
                <div className={`text-4xl font-extrabold font-mono tabular-nums mt-1 ${simulatedColor.text}`}>
                  {result.simulatedScore.toFixed(1)}
                </div>
                <div className="text-[10px] text-slate-300 uppercase mt-0.5 font-bold">
                  {result.simulatedLevel} Risk
                </div>
              </div>
            </div>
          </div>

          {/* Recommended National Liquidity Buffer */}
          <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Est. National Liquidity Backstop:</span>
              <span className="font-mono font-bold text-amber-400 text-sm">
                ₹{result.recommendedBufferCr.toLocaleString()} Cr
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Contingency credit reserve required to prevent cascading supplier insolvencies.
            </p>
          </div>

          {/* Executive Contagion Summary */}
          <div className={`p-4 rounded-xl border space-y-2 ${
            result.simulatedScore > 80
              ? 'bg-red-950/20 border-red-900/30 text-red-200'
              : 'bg-amber-950/20 border-amber-900/30 text-amber-200'
          }`}>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
              <AlertOctagon className="w-4 h-4 shrink-0 text-red-400" />
              <span>Simulated Scenario Analysis</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-300">
              {result.impactSummary}
            </p>
          </div>
        </div>
      </div>

      {/* Breakdown: Most Affected Sectors & Regions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Most Vulnerable Sectors Table */}
        <div className={`lg:col-span-6 p-5 md:p-6 rounded-2xl border transition-colors ${
          darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500" />
              <span>Sector Sensitivity Breakdown</span>
            </h4>
            <span className="text-xs text-slate-400">Baseline → Simulated</span>
          </div>

          <div className="divide-y divide-slate-800/60 text-xs">
            {result.mostVulnerableSectors.slice(0, 5).map((s) => (
              <div key={s.sector} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-200">{s.sector}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-slate-400">{s.baseline.toFixed(1)}</span>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                  <span className={`font-mono font-bold ${s.simulated > 80 ? 'text-red-400' : 'text-orange-400'}`}>
                    {s.simulated.toFixed(1)}
                  </span>
                  <span className="font-mono text-[10px] text-red-400 font-bold w-12 text-right">
                    +{s.delta.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Vulnerable Regions Table */}
        <div className={`lg:col-span-6 p-5 md:p-6 rounded-2xl border transition-colors ${
          darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-500" />
              <span>Regional Vulnerability Shifts</span>
            </h4>
            <span className="text-xs text-slate-400">Baseline → Simulated</span>
          </div>

          <div className="divide-y divide-slate-800/60 text-xs">
            {result.mostVulnerableStates.slice(0, 5).map((st) => (
              <div key={st.state} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-200">{st.state}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-slate-400">{st.baseline.toFixed(1)}</span>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                  <span className={`font-mono font-bold ${st.simulated > 80 ? 'text-red-400' : 'text-orange-400'}`}>
                    {st.simulated.toFixed(1)}
                  </span>
                  <span className="font-mono text-[10px] text-red-400 font-bold w-12 text-right">
                    +{st.delta.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Countermeasure CTA */}
      <div className={`p-4 md:p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors ${
        darkMode ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h4 className={`text-xs md:text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Want to simulate policy interventions to counteract this crisis?
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Test how ECLGS liquidity top-ups, TReDS receivables clearing, and RBI interest subventions can mitigate simulated stress.
            </p>
          </div>
        </div>

        {onNavigate && (
          <button
            onClick={() => onNavigate('intervention')}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 shadow-md"
          >
            <span>Launch Intervention Simulator</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

