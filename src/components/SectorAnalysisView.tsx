import React, { useState } from 'react';
import { SECTORS_DATA } from '../data/indiaData';
import { SectorData } from '../types';
import { getRiskColor } from '../services/mlEngine';
import {
  Layers,
  TrendingUp,
  AlertTriangle,
  Building,
  ArrowRight,
  Filter,
  CheckCircle2,
  DollarSign,
  Briefcase,
} from 'lucide-react';

interface SectorAnalysisViewProps {
  darkMode: boolean;
  onNavigateToSimulator?: () => void;
}

export const SectorAnalysisView: React.FC<SectorAnalysisViewProps> = ({
  darkMode,
  onNavigateToSimulator,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeSectorId, setActiveSectorId] = useState<string>('textiles');

  const filteredSectors = selectedCategory === 'all'
    ? SECTORS_DATA
    : SECTORS_DATA.filter((s) => s.category === selectedCategory);

  const activeSector = SECTORS_DATA.find((s) => s.id === activeSectorId) || SECTORS_DATA[0];
  const sectorRiskColor = getRiskColor(activeSector.riskLevel);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-4 md:p-6 rounded-2xl border transition-colors ${
        darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-wider mb-1">
              <span>Sectoral Vulnerability Matrix</span>
              <span>·</span>
              <span>Supply Chain Contagion</span>
            </div>
            <h2 className={`text-xl md:text-2xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Industrial Sector Stress & Exposure Analytics
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Tracking financial health, input-cost inflation, and bank credit risk across India's key MSME manufacturing and export engines.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-800/40 border border-slate-700/50">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            {['all', 'manufacturing', 'services', 'agro'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Sector Cards + Deep-Dive Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Sector Cards Grid */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredSectors.map((sector) => {
            const isSelected = activeSectorId === sector.id;
            const c = getRiskColor(sector.riskLevel);
            return (
              <button
                key={sector.id}
                onClick={() => setActiveSectorId(sector.id)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-amber-500 bg-amber-500/15 shadow-sm'
                    : darkMode
                    ? 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">
                      {sector.category}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${c.bg} ${c.text}`}>
                      {sector.riskLevel}
                    </span>
                  </div>

                  <h4 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    {sector.name}
                  </h4>

                  <div className="flex items-baseline gap-2 mt-2">
                    <span className={`text-2xl font-extrabold font-mono tabular-nums ${c.text}`}>
                      {sector.stressScore.toFixed(1)}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      (+{sector.changePct}% MoM)
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Exposure: ₹{(sector.totalCreditExposureCr / 1000).toFixed(0)}k Cr</span>
                  <span className="text-amber-400 font-medium">{sector.highRiskPercentage}% Stressed</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Selected Sector Deep-Dive Inspector */}
        <div className={`lg:col-span-5 p-5 md:p-6 rounded-2xl border space-y-6 transition-colors ${
          darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="border-b border-slate-800 pb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Sector Risk Profile
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${sectorRiskColor.bg} ${sectorRiskColor.text} border ${sectorRiskColor.border}`}>
                {activeSector.riskLevel} Risk
              </span>
            </div>

            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              {activeSector.name}
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {activeSector.description}
            </p>
          </div>

          {/* 30-60-90 Day Trajectory */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-400 uppercase">
              Predictive Stress Horizon
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className={`p-2.5 rounded-xl border ${darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Now</div>
                <div className={`text-lg font-bold font-mono tabular-nums ${sectorRiskColor.text}`}>
                  {activeSector.stressScore.toFixed(0)}
                </div>
              </div>
              <div className={`p-2.5 rounded-xl border ${darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">+30d</div>
                <div className="text-lg font-bold font-mono tabular-nums text-amber-400">
                  {activeSector.forecast30.toFixed(0)}
                </div>
              </div>
              <div className={`p-2.5 rounded-xl border ${darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">+60d</div>
                <div className="text-lg font-bold font-mono tabular-nums text-orange-400">
                  {activeSector.forecast60.toFixed(0)}
                </div>
              </div>
              <div className={`p-2.5 rounded-xl border ${darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">+90d</div>
                <div className="text-lg font-bold font-mono tabular-nums text-red-400">
                  {activeSector.forecast90.toFixed(0)}
                </div>
              </div>
            </div>
          </div>

          {/* Total Monitored Credit Exposure */}
          <div className="grid grid-cols-2 gap-3">
            <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-[11px] text-slate-400">Total Sector Credit</div>
              <div className="text-lg font-bold font-mono tabular-nums text-white mt-0.5">
                ₹{activeSector.totalCreditExposureCr.toLocaleString()} Cr
              </div>
              <div className="text-[10px] text-slate-400">Bank & NBFC outstanding</div>
            </div>

            <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-[11px] text-slate-400">Stressed Enterprise Share</div>
              <div className="text-lg font-bold font-mono tabular-nums text-red-400 mt-0.5">
                {activeSector.highRiskPercentage}%
              </div>
              <div className="text-[10px] text-slate-400">High / Critical risk units</div>
            </div>
          </div>

          {/* Key Vulnerabilities */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-400 uppercase">
              Observed Supply Chain Bottlenecks
            </div>
            <div className="space-y-1.5">
              {activeSector.keyVulnerabilities.map((vuln, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-2 p-2 rounded-lg text-xs ${
                    darkMode ? 'bg-slate-950/40 text-slate-300' : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span>{vuln}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Contributing Factors */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-400 uppercase">
              Stress Attribution Factors
            </div>
            <div className="space-y-1.5">
              {activeSector.topContributingFactors.map((cf, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1">
                  <span className="text-slate-300">{cf.factor}</span>
                  <span className="font-mono font-bold text-amber-400">+{cf.impact}%</span>
                </div>
              ))}
            </div>
          </div>

          {onNavigateToSimulator && (
            <button
              onClick={onNavigateToSimulator}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              <span>Simulate Shock for {activeSector.name}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
