import React, { useState } from 'react';
import { NATIONAL_OVERVIEW, STATES_DATA, SECTORS_DATA } from '../data/indiaData';
import { getRiskColor } from '../services/mlEngine';
import {
  TrendingUp,
  Activity,
  Calendar,
  Sparkles,
  Zap,
  BarChart2,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ForecastEngineViewProps {
  darkMode: boolean;
  onNavigateToState?: (stateId: string) => void;
}

export const ForecastEngineView: React.FC<ForecastEngineViewProps> = ({ darkMode }) => {
  const [selectedHorizon, setSelectedHorizon] = useState<'30' | '60' | '90'>('60');

  const horizonData = {
    '30': {
      label: '30-Day Outlook (Nov 2026)',
      nationalScore: NATIONAL_OVERVIEW.forecast30,
      probability: 54.2,
      confidence: 91.0,
      description: 'Short-term liquidity tightening driven by festival-season inventory stockpiling and delayed corporate receivables clearance.',
      highRiskCount: 6,
    },
    '60': {
      label: '60-Day Critical Horizon (Dec 2026)',
      nationalScore: NATIONAL_OVERVIEW.forecast60,
      probability: 78.4,
      confidence: 88.5,
      description: 'Peak distress window where unhedged cotton and metals raw material contracts expire, accelerating working capital defaults in Gujarat and Tamil Nadu.',
      highRiskCount: 9,
    },
    '90': {
      label: '90-Day Structural Contagion (Jan 2027)',
      nationalScore: NATIONAL_OVERVIEW.forecast90,
      probability: 86.1,
      confidence: 84.0,
      description: 'Extended credit strain propagating into commercial bank non-performing asset (NPA) classifications across auto component and engineering foundries.',
      highRiskCount: 11,
    },
  }[selectedHorizon];

  // High-frequency leading indicators
  const leadingIndicators = [
    {
      name: 'GST E-Way Bill Generation Volume',
      value: '-8.4% MoM',
      signal: 'Slowdown in inter-state industrial freight dispatches',
      status: 'warning',
    },
    {
      name: 'UPI Merchant P2M Transaction Velocity',
      value: '+2.1% MoM',
      signal: 'Retail cash inflows resilient, but B2B payment cycles stagnant',
      status: 'neutral',
    },
    {
      name: 'Industrial High-Tension Power Draw (Discom)',
      value: '-5.2% MoM',
      signal: 'Factory shift curtailment observed in Surat and Tiruppur clusters',
      status: 'warning',
    },
    {
      name: 'Commercial Vehicle Freight Ton-Km Index',
      value: '-6.8% MoM',
      signal: 'Lower movement of steel, cement, and chemical intermediates',
      status: 'danger',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-4 md:p-6 rounded-2xl border transition-colors ${
        darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-wider mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Predictive Forward Horizon · 30 / 60 / 90 Days</span>
            </div>
            <h2 className={`text-xl md:text-2xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              National SME Financial Stress Forecast Engine
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Deep machine-learning forward trajectory trained on GSTN e-way bills, bank credit registries, and commodity volatility indices.
            </p>
          </div>

          {/* Horizon Selector */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-800/60 border border-slate-700/60">
            {(['30', '60', '90'] as const).map((h) => (
              <button
                key={h}
                onClick={() => setSelectedHorizon(h)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  selectedHorizon === h
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                +{h} Days
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Horizon Spotlight Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* National Forecast Score */}
        <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {horizonData.label} Score
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl md:text-5xl font-extrabold font-mono tabular-nums text-red-400">
              {horizonData.nationalScore.toFixed(1)}
            </span>
            <span className="text-xs text-red-400 font-bold">
              (+{(horizonData.nationalScore - NATIONAL_OVERVIEW.stressScore).toFixed(1)} pts above today)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {horizonData.description}
          </p>
        </div>

        {/* Probability of Severe Stress */}
        <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Stress Breach Probability
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl md:text-5xl font-extrabold font-mono tabular-nums text-amber-400">
              {horizonData.probability}%
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Likelihood that monitored SME clusters surpass the high/critical debt-service distress barrier.
          </p>
        </div>

        {/* Model Confidence */}
        <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Predictive Model Confidence
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl md:text-5xl font-extrabold font-mono tabular-nums text-emerald-400">
              {horizonData.confidence}%
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Gradient Boosting cross-validation confidence interval with ±4.2 pts standard error margin.
          </p>
        </div>
      </div>

      {/* Trajectory Curves & High-Frequency Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trajectory Chart */}
        <div className={`lg:col-span-7 p-5 md:p-6 rounded-2xl border transition-colors ${
          darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                SME Financial Stress Trajectory (Oct 2026 – Jan 2027)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Projections modeled under steady-state macroeconomic policy conditions.
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={NATIONAL_OVERVIEW.stressTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <Line type="monotone" dataKey="actual" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }} name="Historical Baseline" />
                <Line type="monotone" dataKey="predicted" stroke="#ef4444" strokeWidth={2.5} strokeDasharray="5 5" dot={{ r: 5, fill: '#ef4444' }} name="Forward Forecast" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* High Frequency Leading Indicators */}
        <div className={`lg:col-span-5 p-5 md:p-6 rounded-2xl border transition-colors ${
          darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                High-Frequency Leading Indicators
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time signals informing the 30–90 day prediction model.
              </p>
            </div>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>

          <div className="space-y-3">
            {leadingIndicators.map((item, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border ${
                  darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className={`font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                    {item.name}
                  </span>
                  <span className={`font-mono font-bold ${
                    item.status === 'danger' ? 'text-red-400' : item.status === 'warning' ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {item.value}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {item.signal}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
