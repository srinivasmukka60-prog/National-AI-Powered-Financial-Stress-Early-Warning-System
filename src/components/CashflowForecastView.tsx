import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Sparkles,
  Download,
  Building2,
  Clock,
  ShieldAlert,
  ArrowRight,
  RotateCcw,
  Bot,
  Zap,
  Layers,
  ChevronDown,
  Info,
  Flame,
  Check,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { useLanguage } from '../context/LanguageContext';

interface CashflowForecastViewProps {
  darkMode: boolean;
  currency?: string;
  onNavigate?: (tab: string) => void;
}

type HorizonMode = '13week' | '30day' | '12month';
type ScenarioMode = 'base' | 'stress' | 'optimistic';

interface BusinessProfile {
  id: string;
  name: string;
  sector: string;
  location: string;
  openingCash: number;
  monthlyRevenue: number;
  monthlyOpEx: number;
  monthlyDebtService: number;
  baseDSO: number; // Days Sales Outstanding
  safetyBuffer: number;
}

const PROFILES: Record<string, BusinessProfile> = {
  surat_textiles: {
    id: 'surat_textiles',
    name: 'Surat Synthetic Textiles LLP',
    sector: 'Textiles & Dyeing',
    location: 'Surat, Gujarat',
    openingCash: 58000,
    monthlyRevenue: 85000,
    monthlyOpEx: 72000,
    monthlyDebtService: 11000,
    baseDSO: 88,
    safetyBuffer: 40000,
  },
  pune_auto: {
    id: 'pune_auto',
    name: 'Pune Precision Auto Components',
    sector: 'Auto Ancillary & Precision Machining',
    location: 'Pune, Maharashtra',
    openingCash: 142000,
    monthlyRevenue: 165000,
    monthlyOpEx: 132000,
    monthlyDebtService: 19500,
    baseDSO: 72,
    safetyBuffer: 75000,
  },
  bengaluru_tech: {
    id: 'bengaluru_tech',
    name: 'Bengaluru Embedded IoT Solutions',
    sector: 'IT & Digital Engineering',
    location: 'Bengaluru, Karnataka',
    openingCash: 215000,
    monthlyRevenue: 98000,
    monthlyOpEx: 64000,
    monthlyDebtService: 5200,
    baseDSO: 38,
    safetyBuffer: 50000,
  },
};

export const CashflowForecastView: React.FC<CashflowForecastViewProps> = ({
  darkMode,
  currency = 'USD',
  onNavigate,
}) => {
  const { t } = useLanguage();
  const currSymbol = currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';

  // State
  const [selectedProfileId, setSelectedProfileId] = useState<string>('pune_auto');
  const [horizon, setHorizon] = useState<HorizonMode>('13week');
  const [scenario, setScenario] = useState<ScenarioMode>('base');

  // Interactive Simulation Levers
  const [dsoAdjustment, setDsoAdjustment] = useState<number>(0); // -20 to +40 days
  const [revenueDeltaPct, setRevenueDeltaPct] = useState<number>(0); // -30% to +30%
  const [opexInflationPct, setOpexInflationPct] = useState<number>(0); // -20% to +25%
  const [tredsDiscountingActive, setTredsDiscountingActive] = useState<boolean>(false);
  const [capexFreezeActive, setCapexFreezeActive] = useState<boolean>(false);
  const [creditLineActive, setCreditLineActive] = useState<boolean>(false);
  const [showTableDetails, setShowTableDetails] = useState<boolean>(true);

  const profile = PROFILES[selectedProfileId] || PROFILES.pune_auto;

  const handleResetLevers = () => {
    setDsoAdjustment(0);
    setRevenueDeltaPct(0);
    setOpexInflationPct(0);
    setTredsDiscountingActive(false);
    setCapexFreezeActive(false);
    setCreditLineActive(false);
    setScenario('base');
  };

  // Switch scenario preset
  const handleSelectScenario = (sc: ScenarioMode) => {
    setScenario(sc);
    if (sc === 'stress') {
      setDsoAdjustment(25);
      setRevenueDeltaPct(-15);
      setOpexInflationPct(12);
      setTredsDiscountingActive(false);
      setCapexFreezeActive(false);
    } else if (sc === 'optimistic') {
      setDsoAdjustment(-12);
      setRevenueDeltaPct(15);
      setOpexInflationPct(-5);
      setTredsDiscountingActive(true);
      setCapexFreezeActive(true);
    } else {
      setDsoAdjustment(0);
      setRevenueDeltaPct(0);
      setOpexInflationPct(0);
      setTredsDiscountingActive(false);
      setCapexFreezeActive(false);
    }
  };

  // Dynamic Multi-Horizon Cash Engine Generator
  const forecastData = useMemo(() => {
    const periodsCount = horizon === '13week' ? 13 : horizon === '30day' ? 10 : 12;
    const baseWeeklyRev = profile.monthlyRevenue / 4.33;
    const baseWeeklyOpEx = profile.monthlyOpEx / 4.33;
    const baseWeeklyDebt = profile.monthlyDebtService / 4.33;

    let currentCash = profile.openingCash;
    if (creditLineActive) {
      currentCash += profile.safetyBuffer * 0.8; // emergency credit line infusion
    }

    const items = [];

    for (let i = 1; i <= periodsCount; i++) {
      let periodLabel = '';
      let revMult = 1 + revenueDeltaPct / 100;
      let costMult = 1 + opexInflationPct / 100;

      // DSO Collection lag modifier:
      // High DSO delays early collections, pushing them into later periods
      const dsoLagFactor = Math.max(0.6, 1 - (dsoAdjustment / 100) * 0.7);
      const lagRecovery = (i > 4 ? 1 + (dsoAdjustment / 100) * 0.35 : 1);

      let inflow = 0;
      let outflowOpEx = 0;
      let outflowDebt = 0;
      let extraInflow = 0;

      if (horizon === '13week') {
        periodLabel = `W${i}`;
        inflow = baseWeeklyRev * revMult * dsoLagFactor * lagRecovery;
        outflowOpEx = baseWeeklyOpEx * costMult;
        // Payroll cycle spike on weeks 1, 5, 9, 13
        if (i % 4 === 1) {
          outflowOpEx *= 1.28;
        }
        outflowDebt = baseWeeklyDebt;

        // TReDS discounting liquidity injection in Week 2
        if (tredsDiscountingActive && i === 2) {
          extraInflow = profile.monthlyRevenue * 0.45;
        }

        // Capex freeze savings
        if (capexFreezeActive) {
          outflowOpEx *= 0.91;
        }
      } else if (horizon === '30day') {
        periodLabel = `D${i * 3}`;
        const dailyRev = profile.monthlyRevenue / 30;
        const dailyOpEx = profile.monthlyOpEx / 30;
        inflow = dailyRev * 3 * revMult * dsoLagFactor;
        outflowOpEx = dailyOpEx * 3 * costMult;
        outflowDebt = (profile.monthlyDebtService / 30) * 3;
        if (tredsDiscountingActive && i === 3) {
          extraInflow = profile.monthlyRevenue * 0.3;
        }
        if (capexFreezeActive) {
          outflowOpEx *= 0.92;
        }
      } else {
        // 12 Months
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        periodLabel = monthNames[(i - 1) % 12];
        inflow = profile.monthlyRevenue * revMult * (1 + 0.02 * i) * dsoLagFactor * lagRecovery;
        outflowOpEx = profile.monthlyOpEx * costMult * (1 + 0.015 * i);
        outflowDebt = profile.monthlyDebtService;
        if (tredsDiscountingActive && i === 2) {
          extraInflow = profile.monthlyRevenue * 0.6;
        }
        if (capexFreezeActive) {
          outflowOpEx *= 0.9;
        }
      }

      const totalInflows = Math.round(inflow + extraInflow);
      const totalOutflows = Math.round(outflowOpEx + outflowDebt);
      const netCashflow = totalInflows - totalOutflows;
      currentCash = Math.round(currentCash + netCashflow);

      items.push({
        period: periodLabel,
        inflow: totalInflows,
        outflow: totalOutflows,
        netCashflow,
        closingCash: currentCash,
        safetyBuffer: profile.safetyBuffer,
        isUnderBuffer: currentCash < profile.safetyBuffer,
        isNegative: currentCash < 0,
      });
    }

    return items;
  }, [
    horizon,
    profile,
    dsoAdjustment,
    revenueDeltaPct,
    opexInflationPct,
    tredsDiscountingActive,
    capexFreezeActive,
    creditLineActive,
  ]);

  // Aggregate Key Performance Metrics
  const summaryMetrics = useMemo(() => {
    const opening = profile.openingCash + (creditLineActive ? profile.safetyBuffer * 0.8 : 0);
    const ending = forecastData[forecastData.length - 1]?.closingCash || 0;
    const totalInflows = forecastData.reduce((acc, curr) => acc + curr.inflow, 0);
    const totalOutflows = forecastData.reduce((acc, curr) => acc + curr.outflow, 0);
    const minCash = Math.min(...forecastData.map((d) => d.closingCash));
    const troughPeriod = forecastData.find((d) => d.closingCash === minCash)?.period || 'N/A';

    // Monthly burn rate (average outflow - average inflow if negative)
    const avgOutflow = totalOutflows / forecastData.length;
    const avgInflow = totalInflows / forecastData.length;
    const netBurn = Math.max(1, avgOutflow - avgInflow);
    const runwayMonths = (opening / (netBurn || 1)).toFixed(1);

    const firstInsolvency = forecastData.find((d) => d.closingCash < 0);
    const zeroCashPeriod = firstInsolvency ? firstInsolvency.period : null;

    return {
      opening,
      ending,
      netTotal: ending - opening,
      totalInflows,
      totalOutflows,
      minCash,
      troughPeriod,
      runwayMonths: Number(runwayMonths) > 24 ? '> 24.0' : runwayMonths,
      zeroCashPeriod,
      status:
        zeroCashPeriod !== null
          ? 'critical'
          : minCash < profile.safetyBuffer
          ? 'warning'
          : 'healthy',
    };
  }, [profile, creditLineActive, forecastData]);

  const handleExportCSV = () => {
    const headers = ['Period', 'Total Inflows', 'Total Outflows', 'Net Cashflow', 'Closing Cash Balance', 'Safety Buffer'];
    const rows = forecastData.map((d) => [
      d.period,
      d.inflow,
      d.outflow,
      d.netCashflow,
      d.closingCash,
      d.safetyBuffer,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cashflow_forecast_${selectedProfileId}_${horizon}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* 1. Header Banner with Profile & Horizon Switcher */}
      <div
        className={`p-5 md:p-6 rounded-2xl border transition-colors ${
          darkMode ? 'bg-[#141a24] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider mb-1">
              <Zap className="w-3.5 h-3.5" />
              <span>Predictive Treasury Engine · 13-Week Liquidity & Cash Runway</span>
            </div>
            <h1 className={`text-xl md:text-2xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Corporate Cash-Flow Forecasting & Solvency Guard
            </h1>
            <p className={`text-xs mt-1 max-w-2xl ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Model cash collection trajectories, simulate debtor payment slippages (DSO), test OpEx inflation shocks, and track the exact zero-cash depletion date.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Entity Selector */}
            <div className="relative">
              <select
                value={selectedProfileId}
                onChange={(e) => setSelectedProfileId(e.target.value)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border focus:outline-none focus:ring-1 focus:ring-sky-400 ${
                  darkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-slate-100 border-slate-300 text-slate-800'
                }`}
              >
                {Object.values(PROFILES).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sector})
                  </option>
                ))}
              </select>
            </div>

            {/* Horizon Toggle */}
            <div
              className={`p-1 rounded-xl border flex items-center gap-1 ${
                darkMode ? 'bg-slate-900/80 border-slate-700' : 'bg-slate-100 border-slate-200'
              }`}
            >
              {[
                { id: '13week', label: '13-Week Treasury' },
                { id: '30day', label: '30-Day Daily' },
                { id: '12month', label: '12-Month Runway' },
              ].map((h) => (
                <button
                  key={h.id}
                  onClick={() => setHorizon(h.id as HorizonMode)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    horizon === h.id
                      ? 'bg-sky-500 text-white shadow-sm'
                      : darkMode
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {h.label}
                </button>
              ))}
            </div>

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
                darkMode
                  ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
              title="Export 13-week cashflow schedule to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Quick Scenario Preset Pills */}
        <div className="mt-5 pt-4 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Stress Scenarios:</span>
            <div className="flex items-center gap-1.5">
              {[
                { id: 'base', label: 'Base Plan (Expected)' },
                { id: 'stress', label: 'Severe Stress (DSO +25d, -15% Sales)' },
                { id: 'optimistic', label: 'Optimistic (TReDS Cash Boost)' },
              ].map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => handleSelectScenario(sc.id as ScenarioMode)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    scenario === sc.id
                      ? 'bg-sky-500/20 text-sky-400 border-sky-500/40 font-bold'
                      : darkMode
                      ? 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {sc.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Safety Cash Buffer Threshold: <strong className="text-amber-400">{currSymbol}{profile.safetyBuffer.toLocaleString()}</strong>
            </span>
            <button
              onClick={handleResetLevers}
              className={`flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-sky-400 transition-colors cursor-pointer`}
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Levers</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Opening Position */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            darkMode ? 'bg-[#141a24] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Opening Liquidity</span>
            <Building2 className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-bold font-mono mt-2">
            {currSymbol}{summaryMetrics.opening.toLocaleString()}
          </div>
          <div className={`text-[11px] mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Starting bank & cash equivalent
          </div>
        </div>

        {/* Card 2: Projected Net Cashflow */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            darkMode ? 'bg-[#141a24] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Horizon Net Delta</span>
            {summaryMetrics.netTotal >= 0 ? (
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-rose-400" />
            )}
          </div>
          <div
            className={`text-xl font-bold font-mono mt-2 ${
              summaryMetrics.netTotal >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {summaryMetrics.netTotal >= 0 ? '+' : ''}{currSymbol}{summaryMetrics.netTotal.toLocaleString()}
          </div>
          <div className={`text-[11px] mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Inflow ({currSymbol}{Math.round(summaryMetrics.totalInflows / 1000)}k) vs Outflow
          </div>
        </div>

        {/* Card 3: Minimum Cash Trough */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            darkMode ? 'bg-[#141a24] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Cash Trough (Pinch)</span>
            <AlertTriangle className={`w-4 h-4 ${summaryMetrics.minCash < profile.safetyBuffer ? 'text-amber-400' : 'text-slate-400'}`} />
          </div>
          <div
            className={`text-xl font-bold font-mono mt-2 ${
              summaryMetrics.minCash < 0
                ? 'text-rose-400'
                : summaryMetrics.minCash < profile.safetyBuffer
                ? 'text-amber-400'
                : 'text-sky-400'
            }`}
          >
            {currSymbol}{summaryMetrics.minCash.toLocaleString()}
          </div>
          <div className={`text-[11px] mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Lowest balance hit at <strong className="text-slate-200">{summaryMetrics.troughPeriod}</strong>
          </div>
        </div>

        {/* Card 4: Estimated Cash Runway */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            darkMode ? 'bg-[#141a24] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Cash Runway</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold font-mono mt-2 text-purple-400">
            {summaryMetrics.runwayMonths} Mo
          </div>
          <div className={`text-[11px] mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            At projected burn & collections
          </div>
        </div>

        {/* Card 5: Insolvency Risk Status */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            summaryMetrics.status === 'critical'
              ? darkMode ? 'bg-rose-950/20 border-rose-500/40 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-800'
              : summaryMetrics.status === 'warning'
              ? darkMode ? 'bg-amber-950/20 border-amber-500/40 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'
              : darkMode ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider">Solvency Guard</span>
            {summaryMetrics.status === 'critical' ? (
              <Flame className="w-4 h-4 text-rose-400" />
            ) : summaryMetrics.status === 'warning' ? (
              <ShieldAlert className="w-4 h-4 text-amber-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
          </div>
          <div className="text-sm font-bold mt-2">
            {summaryMetrics.status === 'critical'
              ? `Deficit by ${summaryMetrics.zeroCashPeriod}`
              : summaryMetrics.status === 'warning'
              ? 'Buffer Breached'
              : 'Liquidity Secured'}
          </div>
          <div className="text-[11px] mt-1 opacity-80">
            {summaryMetrics.status === 'critical'
              ? 'Negative cash projected'
              : summaryMetrics.status === 'warning'
              ? 'Falls below safety reserve'
              : 'Reserves remain above minimum'}
          </div>
        </div>
      </div>

      {/* 3. Main Chart & Interactive Sliders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Composed Forecast Chart (col-span-8) */}
        <div
          className={`lg:col-span-8 p-5 rounded-2xl border flex flex-col justify-between transition-all ${
            darkMode ? 'bg-[#141a24] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div>
              <h3 className="text-base font-bold tracking-tight">
                Cash Inflow vs Outflow & Closing Trajectory
              </h3>
              <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Visualizing weekly cash receipts, OpEx/debt burns, and resulting ending bank balance
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className={darkMode ? 'text-slate-300' : 'text-slate-600'}>Inflow</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <span className={darkMode ? 'text-slate-300' : 'text-slate-600'}>Outflow</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-sky-400 rounded-full" />
                <span className={darkMode ? 'text-slate-300' : 'text-slate-600'}>Closing Cash</span>
              </div>
            </div>
          </div>

          {/* Interactive Chart Container */}
          <div className="h-72 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={forecastData} margin={{ top: 20, right: 15, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="inflowAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="outflowAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.20} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#1e2634' : '#e2e8f0'} />
                <XAxis
                  dataKey="period"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${val < 0 ? '-' : ''}${currSymbol}${Math.round(Math.abs(val) / 1000)}k`}
                  tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 10 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div
                          className={`p-3.5 rounded-xl border shadow-2xl text-xs min-w-[200px] backdrop-blur-md ${
                            darkMode ? 'bg-[#121722]/95 border-slate-700 text-white' : 'bg-white/95 border-slate-200 text-slate-900'
                          }`}
                        >
                          <div className="font-bold text-xs pb-1.5 mb-2 border-b border-slate-700/60 flex items-center justify-between">
                            <span>Period: {d.period}</span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                                d.isNegative
                                  ? 'bg-rose-500/20 text-rose-400'
                                  : d.isUnderBuffer
                                  ? 'bg-amber-500/20 text-amber-400'
                                  : 'bg-emerald-500/20 text-emerald-400'
                              }`}
                            >
                              {d.isNegative ? 'INSOLVENT' : d.isUnderBuffer ? 'BUFFER PINCH' : 'HEALTHY'}
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                              <span className="text-slate-400 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                Inflows:
                              </span>
                              <span className="font-bold font-mono text-emerald-400">
                                {currSymbol}{d.inflow.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-400 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-rose-400" />
                                Outflows:
                              </span>
                              <span className="font-bold font-mono text-rose-400">
                                {currSymbol}{d.outflow.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center pt-1 border-t border-slate-800">
                              <span className="text-slate-400">Net Period Delta:</span>
                              <span
                                className={`font-bold font-mono ${
                                  d.netCashflow >= 0 ? 'text-emerald-400' : 'text-rose-400'
                                }`}
                              >
                                {d.netCashflow >= 0 ? '+' : ''}{currSymbol}{d.netCashflow.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center pt-1 border-t border-slate-800">
                              <span className="font-semibold text-sky-400">Ending Cash Balance:</span>
                              <span
                                className={`font-bold font-mono text-sm ${
                                  d.closingCash < 0 ? 'text-rose-400 underline' : 'text-sky-400'
                                }`}
                              >
                                {currSymbol}{d.closingCash.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine
                  y={profile.safetyBuffer}
                  stroke="#f59e0b"
                  strokeDasharray="4 4"
                  label={{
                    value: `Safety Buffer (${currSymbol}${Math.round(profile.safetyBuffer / 1000)}k)`,
                    fill: '#f59e0b',
                    fontSize: 10,
                    position: 'insideBottomRight',
                  }}
                />
                <ReferenceLine y={0} stroke="#ef4444" strokeWidth={1.5} />
                <Area
                  type="monotone"
                  dataKey="inflow"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#inflowAreaGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="outflow"
                  stroke="#f43f5e"
                  strokeWidth={1.8}
                  fill="url(#outflowAreaGrad)"
                />
                <Line
                  type="monotone"
                  dataKey="closingCash"
                  stroke="#38bdf8"
                  strokeWidth={3}
                  dot={{ r: 3, fill: '#38bdf8' }}
                  activeDot={{ r: 6, fill: '#0284c7' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-amber-400" />
              Safety Buffer: Minimum cash needed to weather a 30-day payment freeze.
            </span>
            <span className="font-mono">
              Ending Position: <strong className={summaryMetrics.ending >= 0 ? 'text-sky-400' : 'text-rose-400'}>{currSymbol}{summaryMetrics.ending.toLocaleString()}</strong>
            </span>
          </div>
        </div>

        {/* Right Column: Scenario Stress Levers & Liquidity Boosters (col-span-4) */}
        <div
          className={`lg:col-span-4 p-5 rounded-2xl border flex flex-col justify-between transition-all ${
            darkMode ? 'bg-[#141a24] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-sky-400" />
                <h3 className="font-bold text-sm">Working Capital Simulation Levers</h3>
              </div>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-sky-500/15 text-sky-400">
                Interactive
              </span>
            </div>
            <p className={`text-xs mb-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Adjust operational friction sliders to immediately see cashflow impacts on liquidity.
            </p>

            {/* Slider 1: DSO Debtor Delay */}
            <div className="space-y-1.5 mb-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-300">Customer Debtor Delay (DSO)</span>
                <span className={`font-mono font-bold ${dsoAdjustment > 0 ? 'text-rose-400' : dsoAdjustment < 0 ? 'text-emerald-400' : 'text-slate-200'}`}>
                  {dsoAdjustment > 0 ? `+${dsoAdjustment} Days` : dsoAdjustment < 0 ? `${dsoAdjustment} Days` : 'Normal (0d)'}
                </span>
              </div>
              <input
                type="range"
                min={-20}
                max={40}
                step={5}
                value={dsoAdjustment}
                onChange={(e) => setDsoAdjustment(Number(e.target.value))}
                className="w-full accent-sky-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>-20d (Fast)</span>
                <span>Base ({profile.baseDSO}d)</span>
                <span>+40d (Severe Delay)</span>
              </div>
            </div>

            {/* Slider 2: Sales Revenue Shock */}
            <div className="space-y-1.5 mb-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-300">Sales Order Volume Delta</span>
                <span className={`font-mono font-bold ${revenueDeltaPct > 0 ? 'text-emerald-400' : revenueDeltaPct < 0 ? 'text-rose-400' : 'text-slate-200'}`}>
                  {revenueDeltaPct > 0 ? `+${revenueDeltaPct}%` : `${revenueDeltaPct}%`}
                </span>
              </div>
              <input
                type="range"
                min={-30}
                max={30}
                step={5}
                value={revenueDeltaPct}
                onChange={(e) => setRevenueDeltaPct(Number(e.target.value))}
                className="w-full accent-sky-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>-30% Drop</span>
                <span>0% Target</span>
                <span>+30% Boom</span>
              </div>
            </div>

            {/* Slider 3: OpEx Inflation */}
            <div className="space-y-1.5 mb-5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-300">Operating Cost & Raw Material Delta</span>
                <span className={`font-mono font-bold ${opexInflationPct > 0 ? 'text-rose-400' : opexInflationPct < 0 ? 'text-emerald-400' : 'text-slate-200'}`}>
                  {opexInflationPct > 0 ? `+${opexInflationPct}%` : `${opexInflationPct}%`}
                </span>
              </div>
              <input
                type="range"
                min={-20}
                max={25}
                step={5}
                value={opexInflationPct}
                onChange={(e) => setOpexInflationPct(Number(e.target.value))}
                className="w-full accent-sky-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>-20% Cut</span>
                <span>0% Normal</span>
                <span>+25% Inflation</span>
              </div>
            </div>

            {/* Rapid Liquidity Levers */}
            <div className="pt-4 border-t border-slate-800 space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Emergency Liquidity Interventions:
              </span>

              <label
                className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                  tredsDiscountingActive
                    ? 'bg-sky-500/15 border-sky-500/40 text-sky-200'
                    : darkMode ? 'bg-slate-900/60 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={tredsDiscountingActive}
                    onChange={(e) => setTredsDiscountingActive(e.target.checked)}
                    className="w-4 h-4 accent-sky-500 rounded"
                  />
                  <div>
                    <div className="text-xs font-semibold">TReDS Invoice Liquidation</div>
                    <div className="text-[10px] opacity-80">+45% instant cash injection at W2</div>
                  </div>
                </div>
                <Zap className="w-3.5 h-3.5 text-sky-400" />
              </label>

              <label
                className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                  capexFreezeActive
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
                    : darkMode ? 'bg-slate-900/60 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={capexFreezeActive}
                    onChange={(e) => setCapexFreezeActive(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded"
                  />
                  <div>
                    <div className="text-xs font-semibold">Freeze Discretionary OpEx/Capex</div>
                    <div className="text-[10px] opacity-80">Saves ~9% weekly cash outflows</div>
                  </div>
                </div>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </label>

              <label
                className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                  creditLineActive
                    ? 'bg-purple-500/15 border-purple-500/40 text-purple-200'
                    : darkMode ? 'bg-slate-900/60 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={creditLineActive}
                    onChange={(e) => setCreditLineActive(e.target.checked)}
                    className="w-4 h-4 accent-purple-500 rounded"
                  />
                  <div>
                    <div className="text-xs font-semibold">Draw Revolving Credit Facility</div>
                    <div className="text-[10px] opacity-80">Adds +{currSymbol}{Math.round(profile.safetyBuffer * 0.8 / 1000)}k safety buffer</div>
                  </div>
                </div>
                <Layers className="w-3.5 h-3.5 text-purple-400" />
              </label>
            </div>
          </div>

          {/* AI Digital CFO CTA */}
          <div className="mt-5 pt-4 border-t border-slate-800">
            <button
              onClick={() => onNavigate && onNavigate('cfo')}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <Bot className="w-4 h-4" />
              <span>Ask AI Digital CFO for Liquidity Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Detailed Period-by-Period Treasury Table */}
      <div
        className={`p-5 rounded-2xl border transition-all ${
          darkMode ? 'bg-[#141a24] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-sky-400" />
            <h3 className="font-bold text-sm">
              {horizon === '13week' ? '13-Week Treasury Liquidity Schedule' : horizon === '30day' ? '30-Day Cash Schedule' : '12-Month Cashflow Schedule'}
            </h3>
          </div>

          <button
            onClick={() => setShowTableDetails(!showTableDetails)}
            className="text-xs text-sky-400 hover:text-sky-300 font-semibold cursor-pointer"
          >
            {showTableDetails ? 'Collapse Table' : 'Expand Schedule'}
          </button>
        </div>

        {showTableDetails && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className={`border-b ${darkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'}`}>
                  <th className="py-2.5 px-3">Period</th>
                  <th className="py-2.5 px-3">Expected Inflows</th>
                  <th className="py-2.5 px-3">Operating Outflows</th>
                  <th className="py-2.5 px-3">Net Period Delta</th>
                  <th className="py-2.5 px-3">Ending Cash Balance</th>
                  <th className="py-2.5 px-3">Liquidity Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {forecastData.map((row) => (
                  <tr
                    key={row.period}
                    className={`transition-colors ${
                      row.isNegative
                        ? darkMode ? 'bg-rose-950/20 text-rose-300 font-semibold' : 'bg-rose-50 text-rose-900 font-semibold'
                        : row.isUnderBuffer
                        ? darkMode ? 'bg-amber-950/10 text-amber-300' : 'bg-amber-50/70 text-amber-900'
                        : darkMode ? 'hover:bg-slate-800/40 text-slate-300' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-mono font-bold">{row.period}</td>
                    <td className="py-2.5 px-3 font-mono text-emerald-400">
                      +{currSymbol}{row.inflow.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-rose-400">
                      -{currSymbol}{row.outflow.toLocaleString()}
                    </td>
                    <td
                      className={`py-2.5 px-3 font-mono font-bold ${
                        row.netCashflow >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {row.netCashflow >= 0 ? '+' : ''}{currSymbol}{row.netCashflow.toLocaleString()}
                    </td>
                    <td
                      className={`py-2.5 px-3 font-mono font-extrabold ${
                        row.isNegative ? 'text-rose-400 underline' : 'text-sky-400'
                      }`}
                    >
                      {currSymbol}{row.closingCash.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          row.isNegative
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            : row.isUnderBuffer
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        }`}
                      >
                        {row.isNegative ? 'Insolvency Deficit' : row.isUnderBuffer ? 'Buffer Pinch' : 'Buffer Secure'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
