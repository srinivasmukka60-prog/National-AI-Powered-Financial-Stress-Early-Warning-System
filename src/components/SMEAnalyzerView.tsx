import React, { useState } from 'react';
import { SMEFinancialInputs, SMEAnalysisResult } from '../types';
import { analyzeSMEFinancials, getRiskColor } from '../services/mlEngine';
import { AIRiskScoreModal } from './AIRiskScoreModal';
import { useLanguage } from '../context/LanguageContext';
import {
  ShieldCheck,
  Upload,
  Download,
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Lock,
  RotateCcw,
  Sliders,
  DollarSign,
  Calendar,
  Bot,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface SMEAnalyzerViewProps {
  darkMode: boolean;
  onNavigate?: (tab: string) => void;
}

const PRESETS: Record<string, SMEFinancialInputs> = {
  surat_textiles: {
    businessName: 'Surat Synthetic Textiles & Weaving LLP',
    sector: 'Textiles & Garments',
    state: 'Gujarat',
    district: 'Surat',
    annualRevenueLakhs: 480, // ₹4.8 Cr
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
  },
  pune_auto: {
    businessName: 'Pune Precision Auto Components Pvt Ltd',
    sector: 'Auto Components & Ancillary',
    state: 'Maharashtra',
    district: 'Pune',
    annualRevenueLakhs: 920, // ₹9.2 Cr
    revenueGrowthYoY: 3.2,
    netProfitMargin: 4.8,
    debtToEquity: 2.1,
    dscr: 1.28,
    receivablesDays: 72,
    payablesDays: 55,
    inventoryTurnoverDays: 60,
    cashRunwayMonths: 2.4,
    rawMaterialInflationPct: 11.5,
    monthlyInterestBurdenLakhs: 6.2,
  },
  bengaluru_tech: {
    businessName: 'Bengaluru Embedded IoT Solutions',
    sector: 'IT & Digital Services MSMEs',
    state: 'Karnataka',
    district: 'Bengaluru',
    annualRevenueLakhs: 360, // ₹3.6 Cr
    revenueGrowthYoY: 22.0,
    netProfitMargin: 14.5,
    debtToEquity: 0.6,
    dscr: 2.85,
    receivablesDays: 38,
    payablesDays: 25,
    inventoryTurnoverDays: 15,
    cashRunwayMonths: 5.8,
    rawMaterialInflationPct: 3.0,
    monthlyInterestBurdenLakhs: 0.8,
  },
};

export const SMEAnalyzerView: React.FC<SMEAnalyzerViewProps> = ({ darkMode, onNavigate }) => {
  const { t, language } = useLanguage();
  const [inputs, setInputs] = useState<SMEFinancialInputs>(PRESETS.surat_textiles);
  const [activePreset, setActivePreset] = useState<string>('surat_textiles');
  const [whatIfDso, setWhatIfDso] = useState<number>(inputs.receivablesDays);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [aiRiskScoreOpen, setAiRiskScoreOpen] = useState<boolean>(false);

  // Compute analysis result via ML Engine
  const effectiveInputs = { ...inputs, receivablesDays: whatIfDso };
  const result: SMEAnalysisResult = analyzeSMEFinancials(effectiveInputs);
  const riskColor = getRiskColor(result.riskLevel);

  const handlePresetSelect = (key: string) => {
    setActivePreset(key);
    const chosen = PRESETS[key];
    setInputs(chosen);
    setWhatIfDso(chosen.receivablesDays);
  };

  const handleInputChange = (field: keyof SMEFinancialInputs, value: any) => {
    setInputs((prev) => ({
      ...prev,
      [field]: typeof value === 'string' ? (isNaN(Number(value)) ? value : Number(value)) : value,
    }));
  };

  const handleDownloadSample = () => {
    const csvContent = `Metric,Value,Unit
Business Name,${inputs.businessName},Text
Sector,${inputs.sector},Text
Annual Revenue,${inputs.annualRevenueLakhs},Lakhs INR
YoY Revenue Growth,${inputs.revenueGrowthYoY},Percentage
Net Profit Margin,${inputs.netProfitMargin},Percentage
Debt to Equity,${inputs.debtToEquity},Ratio
DSCR (Debt Service Coverage),${inputs.dscr},Ratio
Receivables Days (DSO),${inputs.receivablesDays},Days
Payables Days (DPO),${inputs.payablesDays},Days
Inventory Days,${inputs.inventoryTurnoverDays},Days
Cash Runway,${inputs.cashRunwayMonths},Months
Raw Material Inflation,${inputs.rawMaterialInflationPct},Percentage
Monthly Interest Burden,${inputs.monthlyInterestBurdenLakhs},Lakhs INR`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sme_sentinel_sample_financials.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus(`Parsing ${file.name}...`);
    setTimeout(() => {
      // Simulate file parse or CSV ingestion
      setInputs({
        ...PRESETS.pune_auto,
        businessName: file.name.replace(/\.[^/.]+$/, '') + ' (Uploaded)',
      });
      setWhatIfDso(PRESETS.pune_auto.receivablesDays);
      setUploadStatus(`Successfully parsed financial statements from ${file.name}. Analysis updated.`);
      setTimeout(() => setUploadStatus(null), 4000);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Privacy Sandbox Header Banner */}
      <div className={`p-4 md:p-6 rounded-2xl border transition-colors ${
        darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
              <Lock className="w-3.5 h-3.5" />
              <span>{t('sme_sandbox_badge')}</span>
            </div>
            <h2 className={`text-xl md:text-2xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              {t('analyzer_title')}
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              {t('analyzer_subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAiRiskScoreOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white shadow-md shadow-indigo-500/25 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>{t('ai_risk_score')}</span>
            </button>

            {onNavigate && (
              <button
                onClick={() => onNavigate('cfo')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                  darkMode ? 'border-purple-500/40 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20' : 'border-purple-300 bg-purple-50 text-purple-800 hover:bg-purple-100'
                }`}
              >
                <Bot className="w-3.5 h-3.5 text-purple-400" />
                <span>{t('ask_digital_cfo')}</span>
              </button>
            )}

            <button
              onClick={handleDownloadSample}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                darkMode ? 'border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700' : 'border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t('sample_csv')}</span>
            </button>

            <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 transition-colors cursor-pointer shadow-xs">
              <Upload className="w-3.5 h-3.5" />
              <span>{t('upload_statements')}</span>
              <input type="file" accept=".csv,.json,.xlsx" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {uploadStatus && (
          <div className="mt-3 p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{uploadStatus}</span>
          </div>
        )}
      </div>

      {/* Preset Selector Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <span className={`text-xs font-semibold mr-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{t('load_demo_case')}</span>
        <button
          onClick={() => handlePresetSelect('surat_textiles')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
            activePreset === 'surat_textiles'
              ? darkMode ? 'bg-red-500/15 border-red-500/40 text-red-300' : 'bg-red-50 border-red-300 text-red-700 font-bold'
              : darkMode ? 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs'
          }`}
        >
          {t('demo_surat')}
        </button>

        <button
          onClick={() => handlePresetSelect('pune_auto')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
            activePreset === 'pune_auto'
              ? darkMode ? 'bg-amber-500/15 border-amber-500/40 text-amber-300' : 'bg-amber-50 border-amber-300 text-amber-800 font-bold'
              : darkMode ? 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs'
          }`}
        >
          {t('demo_pune')}
        </button>

        <button
          onClick={() => handlePresetSelect('bengaluru_tech')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
            activePreset === 'bengaluru_tech'
              ? darkMode ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' : 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
              : darkMode ? 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs'
          }`}
        >
          {t('demo_bengaluru')}
        </button>
      </div>

      {/* Main Analysis Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Financial Health Gauge & Score Breakdown */}
        <div className={`lg:col-span-5 p-5 md:p-6 rounded-2xl border space-y-6 transition-colors ${
          darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {t('financial_stress_score')}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${riskColor.bg} ${riskColor.text} border ${riskColor.border}`}>
                {result.riskLevel === 'critical' ? t('critical_risk') : result.riskLevel === 'high' ? t('high_risk') : result.riskLevel === 'moderate' ? t('moderate_risk') : t('low_risk')}
              </span>
            </div>

            <div className="flex items-baseline gap-3 mt-3">
              <span className={`text-5xl md:text-6xl font-extrabold font-mono tabular-nums ${riskColor.text}`}>
                {result.score.toFixed(1)}
              </span>
              <div>
                <div className={`text-sm font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>
                  {result.riskLevel === 'critical'
                    ? t('immediate_intervention_required')
                    : result.riskLevel === 'high'
                    ? 'Substantial Working Capital Stress'
                    : result.riskLevel === 'moderate'
                    ? 'Approaching Tight Cash Flow Threshold'
                    : 'Robust Solvency & Cash Runway'}
                </div>
                <div className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {t('assessed_entity')} <strong className={darkMode ? 'text-white' : 'text-slate-950 font-bold'}>{inputs.businessName}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Probability & Model Confidence Strip */}
          <div className={`grid grid-cols-2 gap-3 pt-4 border-t ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
            <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className={`text-[11px] font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{t('stress_probability_60d')}</div>
              <div className={`text-2xl font-bold font-mono tabular-nums mt-0.5 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                {result.probabilityOfStress60d}%
              </div>
              <div className={`text-[10px] mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t('bank_covenant_breach')}</div>
            </div>

            <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className={`text-[11px] font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{t('model_confidence')}</div>
              <div className={`text-2xl font-bold font-mono tabular-nums mt-0.5 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                {result.confidenceScore}%
              </div>
              <div className={`text-[10px] mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t('gradient_boosting_val')}</div>
            </div>
          </div>

          {/* 30-60-90 Day Trajectory */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-400 uppercase">
              Predictive Stress Trajectory
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              {result.forecastTrajectory.map((t) => (
                <div
                  key={t.period}
                  className={`p-2.5 rounded-xl border ${
                    darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">{t.period}</div>
                  <div className={`text-lg font-bold font-mono tabular-nums mt-0.5 ${
                    t.score > 80 ? 'text-red-400' : t.score > 60 ? 'text-orange-400' : t.score > 30 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {t.score.toFixed(0)}
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono">
                    ±{((t.upperBound - t.lowerBound) / 2).toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Risk Score Quick Banner */}
          <div className={`p-4 rounded-xl border transition-all ${
            darkMode
              ? 'bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-slate-900/60 border-indigo-500/30'
              : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-white border-indigo-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  AI Risk Score Engine
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                Gemini 2.5 Flash
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Generate enterprise credit risk grade (AAA to D), 5-pillar sub-scores, stress tolerance thresholds, and simulate risk point reduction with prescriptive interventions.
            </p>
            <button
              onClick={() => setAiRiskScoreOpen(true)}
              className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md shadow-indigo-600/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch AI Risk Score Diagnostic</span>
            </button>
          </div>

          {/* Interactive What-If Slider (Receivables Days) */}
          <div className={`p-4 rounded-xl border space-y-3 ${
            darkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold flex items-center gap-1.5 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                <Sliders className="w-3.5 h-3.5" />
                <span>Instant What-If: Receivables Collection</span>
              </span>
              <button
                onClick={() => setWhatIfDso(inputs.receivablesDays)}
                className={`text-[11px] flex items-center gap-1 cursor-pointer transition-colors ${
                  darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className={darkMode ? 'text-slate-400' : 'text-slate-600 font-medium'}>Debtor Days (DSO):</span>
                <span className={`font-mono font-bold tabular-nums ${darkMode ? 'text-white' : 'text-slate-900'}`}>{whatIfDso} days</span>
              </div>
              <input
                type="range"
                min="25"
                max="120"
                value={whatIfDso}
                onChange={(e) => setWhatIfDso(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className={`flex justify-between text-[10px] ${darkMode ? 'text-slate-400' : 'text-slate-500 font-medium'}`}>
                <span>25d (Factored)</span>
                <span>45d (MSMED Cap)</span>
                <span>120d (Severe)</span>
              </div>
            </div>

            {whatIfDso !== inputs.receivablesDays && (
              <div className={`text-xs pt-2 border-t flex items-center justify-between ${
                darkMode ? 'text-slate-300 border-slate-800' : 'text-slate-700 border-slate-200'
              }`}>
                <span>Simulated Score Impact:</span>
                <span className={`font-mono font-bold ${
                  whatIfDso < inputs.receivablesDays
                    ? darkMode ? 'text-emerald-400' : 'text-emerald-600'
                    : darkMode ? 'text-red-400' : 'text-red-600'
                }`}>
                  {whatIfDso < inputs.receivablesDays ? '▼ Stress Drops' : '▲ Stress Climbs'} by {Math.abs(inputs.receivablesDays - whatIfDso) * 0.4 > 0 ? (Math.abs(inputs.receivablesDays - whatIfDso) * 0.38).toFixed(1) : 0} pts
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Explainable AI (SHAP Waterfall) & Cash Flow Forecast */}
        <div className="lg:col-span-7 space-y-6">
          {/* Explainable AI (SHAP Waterfall Attribution) */}
          <div className={`p-5 md:p-6 rounded-2xl border transition-colors ${
            darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-500 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t('explainable_shap')}</span>
                </div>
                <h3 className={`text-base font-bold mt-0.5 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  {t('why_stress_assigned')}
                </h3>
              </div>
              <span className="text-xs text-slate-400">{t('baseline_expectation')}</span>
            </div>

            <div className="space-y-3">
              {result.shapWaterfall.map((shap, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                    shap.direction === 'increase'
                      ? darkMode ? 'bg-red-950/20 border-red-900/30' : 'bg-red-50 border-red-200'
                      : darkMode ? 'bg-emerald-950/20 border-emerald-900/30' : 'bg-emerald-50 border-emerald-200'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${
                        shap.direction === 'increase' ? 'text-red-400' : 'text-emerald-400'
                      }`}>
                        {shap.direction === 'increase' ? '+' : ''}{shap.impact.toFixed(1)} pts
                      </span>
                      <span className={`text-xs font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                        {shap.factor}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 max-w-lg">
                      {shap.description}
                    </p>
                  </div>

                  <div className="shrink-0">
                    <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                      shap.direction === 'increase'
                        ? 'bg-red-500/20 text-red-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {shap.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 6-Month Projected Cash Flow Statement */}
          <div className={`p-5 md:p-6 rounded-2xl border transition-colors ${
            darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  6-Month Forward Cash-Flow Projection
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Net liquidity balance trend based on current debtor delays and cost inflation.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">₹ Lakhs</span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={result.cashFlowForecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#e2e8f0'} opacity={0.6} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: darkMode ? '#94a3b8' : '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: darkMode ? '#94a3b8' : '#64748b' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                      borderColor: darkMode ? '#334155' : '#e2e8f0',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="inflow" name="Cash Inflow" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="outflow" name="Cash Outflow" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="netBalance" name="Cumulative Reserve" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Actionable Recommendations Section */}
      <div className={`p-5 md:p-6 rounded-2xl border transition-colors ${
        darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className={`text-lg font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Explainable Decision-Support Interventions
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Targeted recommendations generated for {inputs.businessName}. Presented as decision support, not financial advice.
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>Prioritized by Impact</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {result.recommendations.map((rec) => (
            <div
              key={rec.id}
              className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
                darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    rec.priority === 'critical'
                      ? 'bg-red-500/20 text-red-300'
                      : rec.priority === 'high'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {rec.priority} Priority
                  </span>
                  <span className="text-[11px] text-slate-400 capitalize">{rec.category.replace('_', ' ')}</span>
                </div>

                <h4 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  {rec.title}
                </h4>

                <p className="text-xs text-amber-400/90 font-medium mt-1">
                  Est. Impact: {rec.impactEstimate}
                </p>

                <ul className={`mt-3 space-y-1.5 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-700'}`}>
                  {rec.actionSteps.map((step, sIdx) => (
                    <li key={sIdx} className="flex items-start gap-1.5">
                      <span className="text-amber-500 font-bold">·</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Manual Input Expansion Accordion */}
      <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <h4 className={`text-sm font-bold ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>
            Manual SME Financial Parameter Adjustments
          </h4>
          <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Edit fields to re-run ML pipeline</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Annual Revenue (₹ Lakhs)</label>
            <input
              type="number"
              value={inputs.annualRevenueLakhs}
              onChange={(e) => handleInputChange('annualRevenueLakhs', e.target.value)}
              className={`w-full px-2.5 py-1.5 text-xs rounded-lg border font-mono ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">YoY Revenue Growth (%)</label>
            <input
              type="number"
              value={inputs.revenueGrowthYoY}
              onChange={(e) => handleInputChange('revenueGrowthYoY', e.target.value)}
              className={`w-full px-2.5 py-1.5 text-xs rounded-lg border font-mono ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Net Margin (%)</label>
            <input
              type="number"
              value={inputs.netProfitMargin}
              onChange={(e) => handleInputChange('netProfitMargin', e.target.value)}
              className={`w-full px-2.5 py-1.5 text-xs rounded-lg border font-mono ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">DSCR Ratio</label>
            <input
              type="number"
              step="0.05"
              value={inputs.dscr}
              onChange={(e) => handleInputChange('dscr', e.target.value)}
              className={`w-full px-2.5 py-1.5 text-xs rounded-lg border font-mono ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Debtor Days (DSO)</label>
            <input
              type="number"
              value={inputs.receivablesDays}
              onChange={(e) => {
                handleInputChange('receivablesDays', e.target.value);
                setWhatIfDso(Number(e.target.value));
              }}
              className={`w-full px-2.5 py-1.5 text-xs rounded-lg border font-mono ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Cash Runway (Months)</label>
            <input
              type="number"
              step="0.1"
              value={inputs.cashRunwayMonths}
              onChange={(e) => handleInputChange('cashRunwayMonths', e.target.value)}
              className={`w-full px-2.5 py-1.5 text-xs rounded-lg border font-mono ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>
        </div>
      </div>

      {/* AIRiskScoreModal Diagnostic Panel */}
      <AIRiskScoreModal
        isOpen={aiRiskScoreOpen}
        onClose={() => setAiRiskScoreOpen(false)}
        inputs={effectiveInputs}
        mlBaselineScore={result.score}
        darkMode={darkMode}
      />
    </div>
  );
};
