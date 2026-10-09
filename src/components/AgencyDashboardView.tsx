import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  DollarSign,
  Compass,
  Briefcase,
  Users,
  Landmark,
  Clock,
  TrendingUp,
  Receipt,
  Bell,
  FileText,
  Smile,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  ExternalLink,
  Target,
  Check,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { ScorecardReportModal } from './ScorecardReportModal';
import { AlertDetailsModal } from './AlertDetailsModal';
import { SupportedLanguage, getTranslation } from '../utils/translations';
import { useLanguage } from '../context/LanguageContext';

interface AgencyDashboardViewProps {
  darkMode: boolean;
  currency?: string;
  language?: SupportedLanguage;
  onNavigate?: (tab: string) => void;
}

export const AgencyDashboardView: React.FC<AgencyDashboardViewProps> = ({
  darkMode,
  currency = 'USD',
  language: _language = 'en',
  onNavigate,
}) => {
  const [timeframe, setTimeframe] = useState<'Monthly' | 'Quarterly' | 'Yearly'>('Monthly');
  const [timeframeMenuOpen, setTimeframeMenuOpen] = useState(false);
  const timeframeDropdownRef = useRef<HTMLDivElement>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [alertModalOpen, setAlertModalOpen] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (timeframeDropdownRef.current && !timeframeDropdownRef.current.contains(e.target as Node)) {
        setTimeframeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { t } = useLanguage();
  const currSymbol = currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';

  // 1. MONTHLY DATASET (12 Months rolling cashflow)
  const monthlyCashflowData = [
    { period: 'Jan', income: 38000, expenses: 24000, net: 14000 },
    { period: 'Feb', income: 44000, expenses: 28000, net: 16000 },
    { period: 'Mar', income: 64000, expenses: 38000, net: 26000 }, // Mar peak income $64k
    { period: 'Apr', income: 48000, expenses: 31000, net: 17000 },
    { period: 'May', income: 52000, expenses: 33000, net: 19000 },
    { period: 'Jun', income: 56000, expenses: 35000, net: 21000 },
    { period: 'Jul', income: 51000, expenses: 34000, net: 17000 },
    { period: 'Aug', income: 59000, expenses: 37000, net: 22000 },
    { period: 'Sep', income: 63000, expenses: 39000, net: 24000 },
    { period: 'Oct', income: 68000, expenses: 42000, net: 26000 },
    { period: 'Nov', income: 74900, expenses: 45000, net: 29900 }, // Nov peak callout $4,892
    { period: 'Dec', income: 69000, expenses: 43000, net: 26000 },
  ];

  // 2. QUARTERLY DATASET (8 Quarters Q1'24 - Q4'25)
  const quarterlyCashflowData = [
    { period: 'Q1 \'24', income: 146000, expenses: 90000, net: 56000 },
    { period: 'Q2 \'24', income: 156000, expenses: 99000, net: 57000 },
    { period: 'Q3 \'24', income: 173000, expenses: 110000, net: 63000 },
    { period: 'Q4 \'24', income: 211900, expenses: 130000, net: 81900 },
    { period: 'Q1 \'25', income: 194000, expenses: 124000, net: 70000 },
    { period: 'Q2 \'25', income: 228000, expenses: 139000, net: 89000 },
    { period: 'Q3 \'25', income: 264000, expenses: 155000, net: 109000 },
    { period: 'Q4 \'25', income: 298000, expenses: 168000, net: 130000 },
  ];

  // 3. YEARLY DATASET (Multi-Year Historical & Projections 2021-2026)
  const yearlyCashflowData = [
    { period: '2021', income: 420000, expenses: 285000, net: 135000 },
    { period: '2022', income: 550000, expenses: 360000, net: 190000 },
    { period: '2023', income: 695000, expenses: 440000, net: 255000 },
    { period: '2024', income: 845000, expenses: 525000, net: 320000 },
    { period: '2025', income: 990000, expenses: 590000, net: 400000 },
    { period: '2026 (Est)', income: 1150000, expenses: 665000, net: 485000 },
  ];

  // Dynamic configuration driven by timeframe selection
  const activeCashflowConfig = useMemo(() => {
    switch (timeframe) {
      case 'Quarterly':
        return {
          data: quarterlyCashflowData,
          headlineBalance: 164700,
          label: `${t('balance_cashflow', 'Balance Cashflow')} (Quarterly)`,
          yTicks: [0, 75000, 150000, 225000, 300000],
          yDomain: [0, 320000],
          callout: { text: `${currSymbol}14,680`, left: 'left-[84%]', top: 'top-8' },
        };
      case 'Yearly':
        return {
          data: yearlyCashflowData,
          headlineBalance: 658800,
          label: `${t('balance_cashflow', 'Balance Cashflow')} (Annual)`,
          yTicks: [0, 300000, 600000, 900000, 1200000],
          yDomain: [0, 1250000],
          callout: { text: `${currSymbol}58,700`, left: 'left-[79%]', top: 'top-8' },
        };
      case 'Monthly':
      default:
        return {
          data: monthlyCashflowData,
          headlineBalance: 54900,
          label: `${t('balance_cashflow', 'Balance Cashflow')} (Monthly)`,
          yTicks: [0, 20000, 40000, 60000, 80000],
          yDomain: [0, 85000],
          callout: { text: `${currSymbol}4,892`, left: 'left-[88%]', top: 'top-9' },
        };
    }
  }, [timeframe, currSymbol, language]);

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto pb-8">
      {/* ========================================================
          ROW 1: TOP 4 METRIC KPI CARDS
      ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Revenue */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            darkMode
              ? 'bg-[#141a24] border-[#1e2634]'
              : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${
              darkMode ? 'bg-slate-800/80 border-slate-700/60 text-sky-400' : 'bg-sky-50 border-sky-100 text-sky-600'
            }`}>
              <DollarSign className="w-4 h-4" />
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
              darkMode ? 'bg-slate-800/80 text-slate-300 border-slate-700/60' : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}>
              {t('steady_growth')}
            </span>
          </div>
          <div className="mt-3">
            <div className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {t('revenue')}
            </div>
            <div className={`text-2xl font-bold tracking-tight mt-0.5 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
              {currSymbol}54.9K
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs font-medium text-emerald-400/90">
            <span>↑ +13.4%</span>
            <span className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>{t('vs_last_month')}</span>
          </div>
        </div>

        {/* Card 2: Gross margin */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            darkMode
              ? 'bg-[#141a24] border-[#1e2634]'
              : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${
              darkMode ? 'bg-slate-800/80 border-slate-700/60 text-amber-300' : 'bg-amber-50 border-amber-100 text-amber-600'
            }`}>
              <Compass className="w-4 h-4" />
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
              darkMode ? 'bg-amber-950/30 text-amber-300 border-amber-800/40' : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {t('slipping')}
            </span>
          </div>
          <div className="mt-3">
            <div className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {t('gross_margin')}
            </div>
            <div className={`text-2xl font-bold tracking-tight mt-0.5 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
              72.8%
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs font-medium text-rose-400/90">
            <span>↓ -1.2 pts</span>
            <span className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>{t('vs_last_month')}</span>
          </div>
        </div>

        {/* Card 3: Net profit */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            darkMode
              ? 'bg-[#141a24] border-[#1e2634]'
              : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${
              darkMode ? 'bg-slate-800/80 border-slate-700/60 text-emerald-300' : 'bg-emerald-50 border-emerald-100 text-emerald-600'
            }`}>
              <Briefcase className="w-4 h-4" />
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
              darkMode ? 'bg-emerald-950/30 text-emerald-300 border-emerald-800/40' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {t('strong_growth')}
            </span>
          </div>
          <div className="mt-3">
            <div className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {t('net_profit')}
            </div>
            <div className={`text-2xl font-bold tracking-tight mt-0.5 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
              {currSymbol}24.6K
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs font-medium text-emerald-400/90">
            <span>↑ +28.0%</span>
            <span className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>{t('vs_last_month')}</span>
          </div>
        </div>

        {/* Card 4: Active clients */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            darkMode
              ? 'bg-[#141a24] border-[#1e2634]'
              : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${
              darkMode ? 'bg-slate-800/80 border-slate-700/60 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}>
              <Users className="w-4 h-4" />
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
              darkMode ? 'bg-slate-800/80 text-slate-300 border-slate-700/60' : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}>
              {t('stable')}
            </span>
          </div>
          <div className="mt-3">
            <div className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {t('active_clients')}
            </div>
            <div className={`text-2xl font-bold tracking-tight mt-0.5 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
              24
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs font-medium text-emerald-400/90">
            <span>↑ +28.0%</span>
            <span className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>{t('vs_last_month')}</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          ROW 2: MIDDLE 2 PANELS (BALANCE CASHFLOW & MOMENTUM SCORE)
      ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Panel 1: Balance Cashflow (col-span-7) */}
        <div
          className={`lg:col-span-7 p-5 rounded-2xl border flex flex-col justify-between transition-all ${
            darkMode
              ? 'bg-[#141a24] border-[#1e2634]'
              : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {activeCashflowConfig.label}
              </div>
              <div className={`text-2xl font-bold tracking-tight mt-0.5 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                {currSymbol}{activeCashflowConfig.headlineBalance.toLocaleString()}
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                <span className={darkMode ? 'text-slate-300' : 'text-slate-600'}>{t('income')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                <span className={darkMode ? 'text-slate-300' : 'text-slate-600'}>{t('expenses')}</span>
              </div>

              {/* Interactive Timeframe Dropdown (Monthly / Quarterly / Yearly) */}
              <div className="relative" ref={timeframeDropdownRef}>
                <button
                  type="button"
                  onClick={() => setTimeframeMenuOpen(!timeframeMenuOpen)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    darkMode
                      ? 'bg-[#18202d] border-slate-700 text-slate-200 hover:border-slate-600 hover:bg-slate-800'
                      : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 shadow-xs'
                  }`}
                  title="Select representation timeframe (Monthly, Quarterly, or Yearly)"
                >
                  <span>{timeframe === 'Monthly' ? t('monthly', 'Monthly') : timeframe === 'Quarterly' ? t('quarterly', 'Quarterly') : t('yearly', 'Yearly')}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${timeframeMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {timeframeMenuOpen && (
                  <div
                    className={`absolute right-0 mt-1.5 w-48 rounded-xl border shadow-2xl p-1.5 z-40 animate-in fade-in zoom-in-95 duration-150 ${
                      darkMode ? 'bg-[#151c27] border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    {(['Monthly', 'Quarterly', 'Yearly'] as const).map((mode) => {
                      const isSelected = timeframe === mode;
                      const modeTitle = mode === 'Monthly' ? t('monthly', 'Monthly') : mode === 'Quarterly' ? t('quarterly', 'Quarterly') : t('yearly', 'Yearly');
                      const modeSub = mode === 'Monthly' ? '12-Month Rolling Cash' : mode === 'Quarterly' ? 'Q1 - Q4 Aggregates' : '2021 - 2026 Multi-Year';
                      return (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => {
                            setTimeframe(mode);
                            setTimeframeMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                            isSelected
                              ? darkMode
                                ? 'bg-sky-500/15 text-sky-400 font-bold'
                                : 'bg-sky-50 text-sky-600 font-bold'
                              : darkMode
                              ? 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
                              : 'hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <div>
                            <div className="font-semibold">{modeTitle}</div>
                            <div className={`text-[10px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{modeSub}</div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-sky-400 shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Chart with Spline & Marker */}
          <div className="h-56 mt-4 relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeCashflowConfig.data} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.20} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="period"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: darkMode ? '#64748b' : '#94a3b8', fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  ticks={activeCashflowConfig.yTicks}
                  domain={activeCashflowConfig.yDomain}
                  tickFormatter={(val) => val === 0 ? '0' : val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : `${Math.round(val / 1000)}k`}
                  tick={{ fill: darkMode ? '#64748b' : '#94a3b8', fontSize: 10 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      const inc = Number(payload.find(p => p.dataKey === 'income')?.value || d.income);
                      const exp = Number(payload.find(p => p.dataKey === 'expenses')?.value || d.expenses);
                      const netDiff = inc - exp;
                      return (
                        <div className={`p-3 rounded-xl shadow-2xl border text-xs min-w-[170px] backdrop-blur-md ${
                          darkMode ? 'bg-[#121722]/95 border-slate-700 text-white' : 'bg-white/95 border-slate-200 text-slate-900'
                        }`}>
                          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-700/50">
                            <span className="font-bold text-[11px] text-slate-300">
                              {d.period} {timeframe === 'Monthly' ? 'Cashflow' : timeframe === 'Quarterly' ? 'Performance' : 'Fiscal'}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                              netDiff >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                            }`}>
                              {netDiff >= 0 ? '+' : ''}{currSymbol}{Math.abs(netDiff).toLocaleString()}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-3">
                              <span className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                                <span className="w-2 h-2 rounded-full bg-sky-400" />
                                Income
                              </span>
                              <span className="font-bold text-sky-400 font-mono">
                                {currSymbol}{inc.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <span className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                                <span className="w-2 h-2 rounded-full bg-amber-400" />
                                Expenses
                              </span>
                              <span className="font-bold text-amber-400 font-mono">
                                {currSymbol}{exp.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#incomeGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="#f59e0b"
                  strokeWidth={1.8}
                  strokeOpacity={0.8}
                  fillOpacity={1}
                  fill="url(#expensesGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>

            {/* Subtle dynamic callout badge on peak - Soft slate pill with sky border */}
            <div className={`absolute ${activeCashflowConfig.callout.top} ${activeCashflowConfig.callout.left} -translate-x-1/2 flex flex-col items-center pointer-events-none transition-all duration-300`}>
              <div className={`px-2 py-0.5 rounded-full text-[11px] font-bold shadow-md border ${
                darkMode ? 'bg-[#18202d] text-sky-300 border-sky-500/40' : 'bg-slate-900 text-white border-slate-900'
              }`}>
                {activeCashflowConfig.callout.text}
              </div>
              <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-sky-400' : 'bg-sky-600'} shadow -mt-0.5`} />
            </div>
          </div>

          {/* Direct Link to Deep 13-Week Cashflow Forecast Engine */}
          {onNavigate && (
            <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between">
              <span className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Treasury Runway & Debt Stress Simulator
              </span>
              <button
                type="button"
                onClick={() => onNavigate('cash')}
                className={`flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                  darkMode ? 'text-sky-400 hover:text-sky-300' : 'text-sky-600 hover:text-sky-700'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Launch 13-Week Cash-Flow Forecast</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Panel 2: Momentum Score (col-span-5) */}
        <div
          className={`lg:col-span-5 p-5 rounded-2xl border flex flex-col justify-between transition-all ${
            darkMode
              ? 'bg-[#141a24] border-[#1e2634]'
              : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          {/* Header */}
          <div>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {t('momentum_score')}
                </div>
                <div className={`text-2xl font-bold tracking-tight mt-0.5 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                  78
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-sky-400">+13 {t('vs_last_month')}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  darkMode ? 'bg-emerald-950/30 text-emerald-300 border-emerald-800/40' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  ↑ {t('positive')}
                </span>
              </div>
            </div>

            {/* Harmonious Segmented Color Gauge Bar */}
            <div className="mt-5 relative pt-6">
              {/* "You" Marker Pointer positioned above Stable/Strong boundary (78%) */}
              <div className="absolute top-0 left-[74%] -translate-x-1/2 flex flex-col items-center">
                <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shadow-sm border ${
                  darkMode ? 'bg-slate-800 text-sky-300 border-sky-400/40' : 'bg-slate-900 text-white border-slate-900'
                }`}>
                  {t('you')}
                </div>
                <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-sky-400' : 'bg-sky-600'} shadow -mt-0.5`} />
              </div>

              {/* Soothing Muted Track */}
              <div className="h-2 w-full rounded-full flex overflow-hidden gap-1 bg-slate-800/80">
                <div className="w-[30%] bg-rose-500/60 rounded-l-full" title={t('at_risk')} />
                <div className="w-[35%] bg-slate-600" title={t('stable')} />
                <div className="w-[35%] bg-emerald-500/70 rounded-r-full" title={t('strong')} />
              </div>

              {/* Range Labels */}
              <div className={`flex justify-between text-[11px] font-medium mt-2 ${
                darkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                <span>{t('at_risk')}</span>
                <span>{t('stable')}</span>
                <span>{t('strong')}</span>
              </div>
            </div>
          </div>

          {/* 2 Columns of Sub-Metrics Progress Bars - Unified Harmonious Slate-Sky Color */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 mt-4 pt-3 border-t border-slate-800/60">
            {/* Left Column */}
            <div className="space-y-2.5 text-xs">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Revenue</span>
                  <span className={`font-semibold font-mono ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>82</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500/75 rounded-full" style={{ width: '82%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Customer</span>
                  <span className={`font-semibold font-mono ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>89</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500/75 rounded-full" style={{ width: '89%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Margin</span>
                  <span className={`font-semibold font-mono ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>72</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500/75 rounded-full" style={{ width: '72%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>AR</span>
                  <span className={`font-semibold font-mono ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>84</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500/75 rounded-full" style={{ width: '84%' }} />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-2.5 text-xs">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Health</span>
                  <span className={`font-semibold font-mono ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>82</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500/75 rounded-full" style={{ width: '82%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Runway</span>
                  <span className={`font-semibold font-mono ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>89</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500/75 rounded-full" style={{ width: '89%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Concentration</span>
                  <span className={`font-semibold font-mono ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>72</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500/75 rounded-full" style={{ width: '72%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          ROW 3: THIRD ROW 4 KPI CARDS
      ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Cash on hand */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            darkMode
              ? 'bg-[#141a24] border-[#1e2634]'
              : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${
              darkMode ? 'bg-slate-800/80 border-slate-700/60 text-sky-400' : 'bg-sky-50 border-sky-100 text-sky-600'
            }`}>
              <Landmark className="w-4 h-4" />
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
              darkMode ? 'bg-slate-800/80 text-slate-300 border-slate-700/60' : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}>
              {t('steady_growth')}
            </span>
          </div>
          <div className="mt-3">
            <div className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {t('cash_on_hand')}
            </div>
            <div className={`text-2xl font-bold tracking-tight mt-0.5 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
              {currSymbol}71.2K
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs font-medium text-emerald-400/90">
            <span>↑ +13.4%</span>
            <span className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>{t('vs_last_month')}</span>
          </div>
        </div>

        {/* Card 2: Cash runway */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            darkMode
              ? 'bg-[#141a24] border-[#1e2634]'
              : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${
              darkMode ? 'bg-slate-800/80 border-slate-700/60 text-amber-300' : 'bg-amber-50 border-amber-100 text-amber-600'
            }`}>
              <Clock className="w-4 h-4" />
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
              darkMode ? 'bg-slate-800/80 text-emerald-300 border-slate-700/60' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {t('healthy')}
            </span>
          </div>
          <div className="mt-3">
            <div className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {t('cash_runway')}
            </div>
            <div className={`text-2xl font-bold tracking-tight mt-0.5 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
              7.5 mo
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs font-medium text-rose-400/90">
            <span>↓ -1.2 pts</span>
            <span className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>{t('vs_last_month')}</span>
          </div>
        </div>

        {/* Card 3: Net profit */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            darkMode
              ? 'bg-[#141a24] border-[#1e2634]'
              : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${
              darkMode ? 'bg-slate-800/80 border-slate-700/60 text-emerald-300' : 'bg-emerald-50 border-emerald-100 text-emerald-600'
            }`}>
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
              darkMode ? 'bg-emerald-950/30 text-emerald-300 border-emerald-800/40' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {t('strong_growth')}
            </span>
          </div>
          <div className="mt-3">
            <div className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {t('net_profit')}
            </div>
            <div className={`text-2xl font-bold tracking-tight mt-0.5 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
              {currSymbol}49.4K
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs font-medium text-emerald-400/90">
            <span>↑ +28.0%</span>
            <span className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>{t('vs_last_month')}</span>
          </div>
        </div>

        {/* Card 4: Money you're owed */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            darkMode
              ? 'bg-[#141a24] border-[#1e2634]'
              : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${
              darkMode ? 'bg-slate-800/80 border-slate-700/60 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}>
              <Receipt className="w-4 h-4" />
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
              darkMode ? 'bg-rose-950/30 text-rose-300 border-rose-800/40' : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}>
              {t('overdue')}
            </span>
          </div>
          <div className="mt-3">
            <div className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {t('money_owed')}
            </div>
            <div className={`text-2xl font-bold tracking-tight mt-0.5 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
              {currSymbol}7,000
            </div>
          </div>
          <div className="mt-3 text-xs font-medium text-emerald-400/90">
            {currSymbol}1,400 {t('over_30_days')}
          </div>
        </div>
      </div>

      {/* ========================================================
          ROW 4: BOTTOM 3 PANELS (ALERT, LAST SCORE CARD, AT A GLANCE)
      ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Alert */}
        <div
          className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
            darkMode
              ? 'bg-[#141a24] border-[#1e2634]'
              : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-4 h-4 text-amber-400/90" />
              <h3 className={`text-base font-bold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                {t('alert')}
              </h3>
            </div>

            <div className="space-y-3">
              {[1, 2, 3].map((_, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-xl border transition-colors ${
                    darkMode
                      ? 'bg-[#18202d] border-slate-800/80 hover:border-slate-700'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-950/40 text-amber-300 border border-amber-800/40">
                      {t('watch')}
                    </span>
                    <button
                      onClick={() => setAlertModalOpen(true)}
                      className="text-[11px] font-semibold text-slate-400 hover:text-sky-300 transition-colors cursor-pointer underline decoration-dotted"
                    >
                      {t('view_details')}
                    </button>
                  </div>
                  <p className={`text-xs leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    {t('alert_text')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 2: Last Score Card */}
        <div
          className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
            darkMode
              ? 'bg-[#141a24] border-[#1e2634]'
              : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-sky-400" />
              <h3 className={`text-base font-bold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                {t('last_score_card')}
              </h3>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-baseline gap-2">
                <span className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  March 2026
                </span>
                <span className={`text-xl font-bold font-mono ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                  65
                </span>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                darkMode ? 'bg-emerald-950/30 text-emerald-300 border-emerald-800/40' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                ↑ {t('positive')}
              </span>
            </div>

            {/* 2x2 Mini Metric Boxes */}
            <div className="grid grid-cols-2 gap-2.5">
              <div
                className={`p-2.5 rounded-xl border ${
                  darkMode ? 'bg-[#18202d] border-slate-800/80' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {t('revenue')}
                </div>
                <div className={`text-sm font-bold font-mono mt-0.5 ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>
                  {currSymbol}47.0K
                </div>
              </div>

              <div
                className={`p-2.5 rounded-xl border ${
                  darkMode ? 'bg-[#18202d] border-slate-800/80' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {t('gross_margin')}
                </div>
                <div className={`text-sm font-bold font-mono mt-0.5 ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>
                  {currSymbol}47.0K
                </div>
              </div>

              <div
                className={`p-2.5 rounded-xl border ${
                  darkMode ? 'bg-[#18202d] border-slate-800/80' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {t('net_profit')}
                </div>
                <div className={`text-sm font-bold font-mono mt-0.5 ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>
                  {currSymbol}47.0K
                </div>
              </div>

              <div
                className={`p-2.5 rounded-xl border ${
                  darkMode ? 'bg-[#18202d] border-slate-800/80' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {t('cash')}
                </div>
                <div className={`text-sm font-bold font-mono mt-0.5 ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>
                  {currSymbol}47.0K
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <button
              onClick={() => setReportModalOpen(true)}
              className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs tracking-wide shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>{t('open_report')}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 3: At a glance */}
        <div
          className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
            darkMode
              ? 'bg-[#141a24] border-[#1e2634]'
              : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Smile className="w-4 h-4 text-sky-400" />
              <h3 className={`text-base font-bold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                {t('at_a_glance')}
              </h3>
            </div>

            <p className={`text-xs leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {t('glance_summary')}
            </p>
          </div>

          <div className="mt-6">
            <div
              className={`p-3.5 rounded-xl border ${
                darkMode
                  ? 'bg-amber-950/20 border-amber-900/40 text-amber-200/90'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-1">
                {t('watch')}
              </div>
              <p className="text-xs leading-relaxed">
                {t('alert_text')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ScorecardReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        darkMode={darkMode}
      />

      <AlertDetailsModal
        isOpen={alertModalOpen}
        onClose={() => setAlertModalOpen(false)}
        darkMode={darkMode}
        onNavigateToCfo={() => onNavigate && onNavigate('cash')}
      />
    </div>
  );
};
