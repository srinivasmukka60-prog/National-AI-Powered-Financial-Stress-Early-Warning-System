import React, { useState, useMemo } from 'react';
import { STATES_DATA, SECTORS_DATA, NATIONAL_OVERVIEW } from '../data/indiaData';
import { StateData, SectorData, RiskLevel } from '../types';
import { getRiskColor, getRiskLevel } from '../services/mlEngine';
import {
  Grid,
  Layers,
  Sparkles,
  Filter,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Flame,
  Info,
  Building2,
  DollarSign,
  Clock,
  Compass,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface RiskHeatmapViewProps {
  darkMode: boolean;
  onNavigate?: (tab: string) => void;
}

type HeatmapMetric = 'stressScore' | 'creditAtRisk' | 'receivablesDays' | 'forecast90';
type ViewMode = 'matrix2d' | 'erm5x5';

interface CellData {
  stateId: string;
  stateName: string;
  sectorId: string;
  sectorName: string;
  stressScore: number;
  creditAtRiskCr: number;
  receivablesDays: number;
  forecast90: number;
  riskLevel: RiskLevel;
  primaryRiskDriver: string;
}

export const RiskHeatmapView: React.FC<RiskHeatmapViewProps> = ({ darkMode, onNavigate }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('matrix2d');
  const [metric, setMetric] = useState<HeatmapMetric>('stressScore');
  const [riskFilter, setRiskFilter] = useState<'all' | 'critical' | 'high_critical'>('all');
  const [selectedCell, setSelectedCell] = useState<CellData | null>(null);

  // Generate deterministic synthetic cross-product of State x Sector data
  const heatmapGrid: CellData[][] = useMemo(() => {
    return STATES_DATA.map((state) => {
      return SECTORS_DATA.map((sector) => {
        // Deterministic variation algorithm based on state + sector stress baselines
        const hash = (state.name.length * 7 + sector.name.length * 11) % 19;
        const stateWeight = state.stressScore * 0.55;
        const sectorWeight = sector.stressScore * 0.45;
        const noise = (hash - 9.5) * 1.2;
        const score = Math.min(96, Math.max(18, Math.round((stateWeight + sectorWeight + noise) * 10) / 10));
        
        const creditShare = Math.round((sector.totalCreditExposureCr * (state.creditAtRiskCr / NATIONAL_OVERVIEW.creditAtRiskCr)) * 0.08);
        const dso = Math.min(115, Math.max(35, Math.round(sector.topContributingFactors[0]?.impact * 1.8 + state.stressScore * 0.4)));
        const forecast90 = Math.min(99, Math.round(score + (score > 60 ? 7.2 : 3.5)));
        const level = getRiskLevel(score);

        const driver = score > 75 
          ? sector.keyVulnerabilities[0] || 'Receivables Lockup'
          : score > 55
          ? 'Working Capital Tension & Borrowing Cost'
          : 'Stable Cash Flow Margin';

        return {
          stateId: state.id,
          stateName: state.name,
          sectorId: sector.id,
          sectorName: sector.name,
          stressScore: score,
          creditAtRiskCr: Math.max(120, creditShare),
          receivablesDays: dso,
          forecast90,
          riskLevel: level,
          primaryRiskDriver: driver,
        };
      });
    });
  }, []);

  // Compute thermal color based on current metric value
  const getCellColor = (item: CellData) => {
    let normalized = 0;
    if (metric === 'stressScore') {
      normalized = item.stressScore;
    } else if (metric === 'creditAtRisk') {
      normalized = Math.min(100, (item.creditAtRiskCr / 8000) * 100);
    } else if (metric === 'receivablesDays') {
      normalized = Math.min(100, Math.max(0, (item.receivablesDays - 35) * 1.4));
    } else if (metric === 'forecast90') {
      normalized = item.forecast90;
    }

    if (normalized >= 80) {
      return {
        bg: darkMode ? 'bg-red-600/80 text-white' : 'bg-red-600 text-white',
        border: 'border-red-400',
        ring: 'ring-1 ring-red-400/80',
        glow: 'shadow-sm shadow-red-500/30',
        badge: 'Critical',
      };
    }
    if (normalized >= 65) {
      return {
        bg: darkMode ? 'bg-orange-600/75 text-white' : 'bg-orange-500 text-white',
        border: 'border-orange-400',
        ring: '',
        glow: '',
        badge: 'High',
      };
    }
    if (normalized >= 50) {
      return {
        bg: darkMode ? 'bg-amber-600/60 text-amber-100' : 'bg-amber-400 text-slate-900',
        border: 'border-amber-400',
        ring: '',
        glow: '',
        badge: 'Moderate',
      };
    }
    if (normalized >= 35) {
      return {
        bg: darkMode ? 'bg-emerald-600/40 text-emerald-100' : 'bg-emerald-300 text-emerald-950',
        border: 'border-emerald-500',
        ring: '',
        glow: '',
        badge: 'Low',
      };
    }
    return {
      bg: darkMode ? 'bg-emerald-900/30 text-emerald-300' : 'bg-emerald-100 text-emerald-800',
      border: 'border-emerald-700/40',
      ring: '',
      glow: '',
      badge: 'Minimal',
    };
  };

  const getMetricDisplayValue = (item: CellData) => {
    switch (metric) {
      case 'stressScore':
        return item.stressScore.toFixed(0);
      case 'creditAtRisk':
        return `₹${Math.round(item.creditAtRiskCr)}`;
      case 'receivablesDays':
        return `${item.receivablesDays}d`;
      case 'forecast90':
        return item.forecast90.toFixed(0);
    }
  };

  // 5x5 Matrix Buckets (Likelihood vs Impact)
  const ermMatrix = useMemo(() => {
    // 5 likelihood rows: 5 (Almost Certain) down to 1 (Rare)
    // 5 impact columns: 1 (Insignificant) to 5 (Catastrophic)
    const grid: CellData[][][] = Array(5).fill(null).map(() => Array(5).fill(null).map(() => []));

    heatmapGrid.forEach((row) => {
      row.forEach((item) => {
        // Likelihood from 0 to 4 based on stress score
        let lIdx = Math.min(4, Math.max(0, Math.floor((item.stressScore - 20) / 16)));
        // Impact from 0 to 4 based on credit at risk & receivables
        let iIdx = Math.min(4, Math.max(0, Math.floor((item.receivablesDays - 35) / 16)));
        grid[lIdx][iIdx].push(item);
      });
    });

    return grid;
  }, [heatmapGrid]);

  const flatCells = heatmapGrid.flat();
  const criticalCount = flatCells.filter((c) => c.riskLevel === 'critical').length;
  const highCount = flatCells.filter((c) => c.riskLevel === 'high').length;
  const totalCreditAtRisk = flatCells.reduce((acc, c) => acc + (c.riskLevel === 'critical' || c.riskLevel === 'high' ? c.creditAtRiskCr : 0), 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className={`p-4 md:p-6 rounded-2xl border transition-colors ${
        darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 uppercase tracking-wider mb-1">
              <Flame className="w-3.5 h-3.5 animate-pulse" />
              <span>Multi-Dimensional Thermal Risk Heatmap</span>
            </div>
            <h2 className={`text-xl md:text-2xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Industrial Cluster & Regional Risk Exposure Matrix
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Visualize financial contagion density across 15 states and 10 manufacturing sectors. Isolate systemic solvency threats and receivables logjams.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <div className={`p-1 rounded-xl border flex items-center gap-1 ${
              darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                onClick={() => setViewMode('matrix2d')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'matrix2d'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>State × Sector Grid</span>
              </button>
              <button
                onClick={() => setViewMode('erm5x5')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'erm5x5'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>5×5 ERM Matrix</span>
              </button>
            </div>
          </div>
        </div>

        {/* Controls Toolbar */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          {/* Metric Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Heatmap Metric:</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'stressScore', label: 'Financial Stress (0–100)' },
                { id: 'creditAtRisk', label: 'Credit at Risk (₹ Cr)' },
                { id: 'receivablesDays', label: 'Debtor DSO (Days)' },
                { id: 'forecast90', label: '90-Day Trajectory' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMetric(m.id as HeatmapMetric)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer border ${
                    metric === m.id
                      ? 'bg-indigo-600 border-indigo-500 text-white font-semibold'
                      : darkMode
                      ? 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Threshold */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Risk Filter:</span>
            <div className="flex items-center gap-1">
              {[
                { id: 'all', label: 'All (150 Nodes)' },
                { id: 'high_critical', label: 'High & Critical Only' },
                { id: 'critical', label: 'Critical Only' },
              ].map((rf) => (
                <button
                  key={rf.id}
                  onClick={() => setRiskFilter(rf.id as any)}
                  className={`px-2.5 py-1 text-xs rounded-lg transition-colors cursor-pointer border ${
                    riskFilter === rf.id
                      ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 font-semibold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {rf.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="text-[11px] text-slate-400 uppercase font-semibold flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-red-400" />
            <span>Critical Stress Nodes</span>
          </div>
          <div className="text-2xl font-bold font-mono text-red-400 mt-1">
            {criticalCount} <span className="text-xs text-slate-400 font-normal">of 150 clusters</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Stress score ≥ 80 / 100</p>
        </div>

        <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="text-[11px] text-slate-400 uppercase font-semibold flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
            <span>Elevated Risk Nodes</span>
          </div>
          <div className="text-2xl font-bold font-mono text-orange-400 mt-1">
            {highCount} <span className="text-xs text-slate-400 font-normal">clusters</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Requires 60-day debt restructuring</p>
        </div>

        <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="text-[11px] text-slate-400 uppercase font-semibold flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-amber-400" />
            <span>Capital at Severe Risk</span>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
            ₹{Math.round(totalCreditAtRisk / 1000).toLocaleString()} <span className="text-xs text-slate-400 font-normal">k Cr</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Aggregated in high/critical zones</p>
        </div>

        <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="text-[11px] text-slate-400 uppercase font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
            <span>Peak Stressed Cluster</span>
          </div>
          <div className="text-sm font-bold text-slate-100 mt-1.5 truncate">
            Surat · Textiles & Garments
          </div>
          <p className="text-[10px] text-red-400 font-mono mt-0.5">Score: 88.4 · DSO: 94 Days</p>
        </div>
      </div>

      {/* Main Heatmap Matrix Container */}
      {viewMode === 'matrix2d' ? (
        <div className={`p-5 rounded-2xl border overflow-hidden transition-colors ${
          darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                Cross-Sectoral State Exposure Grid (15 States × 10 Sectors)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Click any cell to examine financial breakdown, debtor days, and trigger an AI diagnostic.
              </p>
            </div>

            {/* Thermal Legend */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
              <span className="text-[10px] uppercase font-semibold mr-1">Risk Scale:</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600/30 text-emerald-300">Low &lt;35</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/30 text-amber-300">Mod 35–60</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/50 text-orange-200">High 61–80</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white">Critical &gt;80</span>
            </div>
          </div>

          {/* Scrollable Grid Table */}
          <div className="overflow-x-auto pb-2">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] uppercase text-slate-400">
                  <th className="py-2.5 px-3 sticky left-0 z-20 bg-slate-900/90 font-bold backdrop-blur-md min-w-[130px]">
                    State / Region
                  </th>
                  {SECTORS_DATA.map((sector) => (
                    <th key={sector.id} className="py-2.5 px-2 font-bold text-center min-w-[85px] max-w-[110px]">
                      <span className="block truncate" title={sector.name}>{sector.name.split(' ')[0]}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-xs">
                {heatmapGrid.map((row, rIdx) => {
                  const state = STATES_DATA[rIdx];
                  const stateColor = getRiskColor(state.riskLevel);
                  return (
                    <tr key={state.id} className="hover:bg-slate-800/20 transition-colors">
                      {/* Sticky State Header Column */}
                      <td className="py-2 px-3 sticky left-0 z-10 bg-slate-900/95 backdrop-blur-md font-semibold border-r border-slate-800/80">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-slate-200 font-bold">{state.name}</span>
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${stateColor.bg} ${stateColor.text}`}>
                            {state.stressScore}
                          </span>
                        </div>
                      </td>

                      {/* Sector Cells */}
                      {row.map((cell) => {
                        const style = getCellColor(cell);
                        const isFilteredOut =
                          (riskFilter === 'critical' && cell.riskLevel !== 'critical') ||
                          (riskFilter === 'high_critical' && cell.riskLevel !== 'critical' && cell.riskLevel !== 'high');
                        const isSelected = selectedCell?.stateId === cell.stateId && selectedCell?.sectorId === cell.sectorId;

                        return (
                          <td key={cell.sectorId} className="p-1 text-center">
                            <button
                              onClick={() => setSelectedCell(cell)}
                              disabled={isFilteredOut}
                              title={`${cell.stateName} · ${cell.sectorName} (${cell.riskLevel.toUpperCase()})\nStress: ${cell.stressScore}\nCredit: ₹${cell.creditAtRiskCr} Cr\nDSO: ${cell.receivablesDays} days`}
                              className={`w-full py-2 px-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex flex-col items-center justify-center ${
                                isFilteredOut
                                  ? 'opacity-10 bg-slate-800/30 text-slate-600 cursor-not-allowed'
                                  : `${style.bg} ${style.border} ${style.ring} ${style.glow} hover:scale-105 hover:z-20`
                              } ${isSelected ? 'outline-2 outline-white scale-105 z-20 shadow-lg' : ''}`}
                            >
                              <span>{getMetricDisplayValue(cell)}</span>
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* 5x5 ERM Matrix View */
        <div className={`p-5 rounded-2xl border transition-colors ${
          darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                5×5 Enterprise Risk Matrix (Likelihood vs Impact)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Standard ISO 31000 financial risk matrix. Select any quadrant to view all exposed industry clusters.
              </p>
            </div>

            <div className="text-xs font-semibold text-rose-400 flex items-center gap-1">
              <Compass className="w-4 h-4" />
              <span>ERM Distribution</span>
            </div>
          </div>

          {/* Matrix Grid */}
          <div className="grid grid-cols-6 gap-2 text-xs">
            {/* Header Column Label */}
            <div className="col-span-1 flex flex-col justify-between py-6 text-right pr-3 font-semibold text-slate-400 text-[11px] uppercase">
              <span>5. Almost Certain (&gt;80%)</span>
              <span>4. Likely (65–80%)</span>
              <span>3. Possible (50–65%)</span>
              <span>2. Unlikely (35–50%)</span>
              <span>1. Rare (&lt;35%)</span>
            </div>

            {/* 5x5 Matrix Grid (5 rows of 5 columns) */}
            <div className="col-span-5 grid grid-cols-5 gap-2">
              {[4, 3, 2, 1, 0].map((rowIdx) => (
                <React.Fragment key={rowIdx}>
                  {[0, 1, 2, 3, 4].map((colIdx) => {
                    const items = ermMatrix[rowIdx][colIdx];
                    const severityScore = (rowIdx + 1) * (colIdx + 1); // 1 to 25
                    const bgColor =
                      severityScore >= 16
                        ? 'bg-red-600/70 border-red-500 text-white'
                        : severityScore >= 10
                        ? 'bg-orange-500/60 border-orange-400 text-white'
                        : severityScore >= 6
                        ? 'bg-amber-500/50 border-amber-400 text-amber-100'
                        : 'bg-emerald-600/40 border-emerald-500 text-emerald-100';

                    return (
                      <div
                        key={colIdx}
                        className={`min-h-[75px] p-2 rounded-xl border flex flex-col justify-between transition-all ${bgColor}`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-bold">
                          <span>Sev {severityScore}</span>
                          <span className="font-mono bg-black/30 px-1 rounded">{items.length} nodes</span>
                        </div>

                        {items.length > 0 ? (
                          <div className="space-y-0.5 mt-1">
                            <button
                              onClick={() => setSelectedCell(items[0])}
                              className="text-[10px] font-semibold truncate block w-full text-left hover:underline cursor-pointer"
                              title={`${items[0].stateName} · ${items[0].sectorName}`}
                            >
                              {items[0].stateName.split(' ')[0]} · {items[0].sectorName.split(' ')[0]}
                            </button>
                            {items.length > 1 && (
                              <span className="text-[9px] text-white/70 block">
                                +{items.length - 1} more clusters
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-white/40 italic">Clear</span>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>

            {/* Empty corner space */}
            <div className="col-span-1"></div>

            {/* X-Axis Impact Severity Labels */}
            <div className="col-span-5 grid grid-cols-5 gap-2 text-center text-[10px] font-bold uppercase text-slate-400 pt-1">
              <span>1. Insignificant</span>
              <span>2. Minor</span>
              <span>3. Moderate</span>
              <span>4. Major</span>
              <span>5. Catastrophic</span>
            </div>
          </div>
        </div>
      )}

      {/* Selected Node Drilldown Panel */}
      {selectedCell && (
        <div className={`p-5 rounded-2xl border shadow-xl transition-all animate-in fade-in ${
          darkMode ? 'bg-slate-900 border-indigo-500/40' : 'bg-white border-indigo-300'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  Selected Heatmap Cluster Dossier
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
                  selectedCell.riskLevel === 'critical' ? 'bg-red-500/20 text-red-300 border border-red-500/40' :
                  selectedCell.riskLevel === 'high' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40' :
                  'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  {selectedCell.riskLevel} Risk
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mt-1">
                {selectedCell.stateName} · {selectedCell.sectorName}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate && onNavigate('analyzer')}
                className="px-3.5 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Analyze in AI Risk Engine</span>
              </button>

              <button
                onClick={() => setSelectedCell(null)}
                className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-[11px] text-slate-400 font-medium">Stress Score</div>
              <div className="text-2xl font-bold font-mono text-red-400 mt-0.5">
                {selectedCell.stressScore.toFixed(1)} / 100
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Composite ML & Gemini proxy</div>
            </div>

            <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-[11px] text-slate-400 font-medium">Credit at Risk</div>
              <div className="text-2xl font-bold font-mono text-amber-400 mt-0.5">
                ₹{selectedCell.creditAtRiskCr.toLocaleString()} Cr
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Estimated NPA threat pool</div>
            </div>

            <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-[11px] text-slate-400 font-medium">Debtor Collection Cycle</div>
              <div className="text-2xl font-bold font-mono text-orange-400 mt-0.5">
                {selectedCell.receivablesDays} Days
              </div>
              <div className="text-[10px] text-red-400 mt-0.5">Exceeds 45-day statutory cap</div>
            </div>

            <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-[11px] text-slate-400 font-medium">90-Day Trajectory</div>
              <div className="text-2xl font-bold font-mono text-purple-400 mt-0.5">
                {selectedCell.forecast90} / 100
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Forward XGBoost estimate</div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between text-xs">
            <span className="text-slate-300">
              <strong>Dominant Stress Driver:</strong> {selectedCell.primaryRiskDriver}
            </span>
            <span className="text-indigo-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              TReDS Liquidity Protocol Recommended
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
