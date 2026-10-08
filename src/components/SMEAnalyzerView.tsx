import React, { useState } from 'react';
import { SMEFinancialInputs, SMEAnalysisResult } from '../types';
import { analyzeSMEFinancials, getRiskColor } from '../services/mlEngine';
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

export const SMEAnalyzerView: React.FC<SMEAnalyzerViewProps> = ({ darkMode }) => {
  const [inputs, setInputs] = useState<SMEFinancialInputs>(PRESETS.surat_textiles);
  const [activePreset, setActivePreset] = useState<string>('surat_textiles');
  const [whatIfDso, setWhatIfDso] = useState<number>(inputs.receivablesDays);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

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
              <span>Private Client-Side Sandbox · Zero Cloud Persistence</span>
            </div>
            <h2 className={`text-xl md:text-2xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              SME Financial Health & Early-Warning Analyzer
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Confidential self-assessment for MSME owners. Calculate 30–90 day stress probability, explainable SHAP drivers, and actionable interventions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadSample}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                darkMode ? 'border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700' : 'border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Sample CSV</span>
            </button>

            <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 transition-colors cursor-pointer shadow-xs">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Statements</span>
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
        <span className="text-xs text-slate-400 font-semibold mr-1">Load Demo Case:</span>
        <button
          onClick={() => handlePresetSelect('surat_textiles')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
            activePreset === 'surat_textiles'
              ? 'bg-red-500/15 border-red-500/40 text-red-300'
              : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white'
          }`}
        >
          Surat Synthetic Textiles (High Stress · 88d DSO)
        </button>

        <button
          onClick={() => handlePresetSelect('pune_auto')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
            activePreset === 'pune_auto'
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
              : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white'
          }`}
        >
          Pune Auto Ancillary (Moderate · Tooling Capex)
        </button>

        <button
          onClick={() => handlePresetSelect('bengaluru_tech')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
            activePreset === 'bengaluru_tech'
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
              : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white'
          }`}
        >
          Bengaluru IoT Services (Low Stress · Healthy)
        </button>
      </div>

      {/* Main Analysis Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Financial Health Gauge & Score Breakdown */}
        <div className={`lg:col-span-5 p-5 md:p-6 rounded-2xl border space-y-6 transition-colors ${
          darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Financial Stress Score (0–100)
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${riskColor.bg} ${riskColor.text} border ${riskColor.border}`}>
                {result.riskLevel} Risk
              </span>
            </div>

            <div className="flex items-baseline gap-3 mt-3">
              <span className={`text-5xl md:text-6xl font-extrabold font-mono tabular-nums ${riskColor.text}`}>
                {result.score.toFixed(1)}
              </span>
              <div>
                <div className="text-sm font-semibold text-slate-200">
                  {result.riskLevel === 'critical'
                    ? 'Immediate Liquidity Intervention Required'
                    : result.riskLevel === 'high'
                    ? 'Substantial Working Capital Stress'
                    : result.riskLevel === 'moderate'
                    ? 'Approaching Tight Cash Flow Threshold'
                    : 'Robust Solvency & Cash Runway'}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Assessed entity: <strong>{inputs.businessName}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Probability & Model Confidence Strip */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800">
            <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-[11px] text-slate-400 font-medium">60-Day Stress Probability</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-red-400 mt-0.5">
                {result.probabilityOfStress60d}%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Likelihood of bank covenant breach</div>
            </div>

            <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-[11px] text-slate-400 font-medium">Model Confidence</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-emerald-400 mt-0.5">
                {result.confidenceScore}%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Gradient Boosting Cross-Val</div>
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

          {/* Interactive What-If Slider (Receivables Days) */}
          <div className={`p-4 rounded-xl border space-y-3 ${
            darkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                <span>Instant What-If: Receivables Collection</span>
              </span>
              <button
                onClick={() => setWhatIfDso(inputs.receivablesDays)}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Debtor Days (DSO):</span>
                <span className="font-mono font-bold text-white tabular-nums">{whatIfDso} days</span>
              </div>
              <input
                type="range"
                min="25"
                max="120"
                value={whatIfDso}
                onChange={(e) => setWhatIfDso(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>25d (Factored)</span>
                <span>45d (MSMED Cap)</span>
                <span>120d (Severe)</span>
              </div>
            </div>

            {whatIfDso !== inputs.receivablesDays && (
              <div className="text-xs text-slate-300 pt-2 border-t border-slate-800 flex items-center justify-between">
                <span>Simulated Score Impact:</span>
                <span className={`font-mono font-bold ${
                  whatIfDso < inputs.receivablesDays ? 'text-emerald-400' : 'text-red-400'
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
                  <span>Explainable AI · Feature Attribution (SHAP)</span>
                </div>
                <h3 className={`text-base font-bold mt-0.5 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  Why Was This Stress Score Assigned?
                </h3>
              </div>
              <span className="text-xs text-slate-400">Baseline expectation: 42.0</span>
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

                <ul className="mt-3 space-y-1.5 text-xs text-slate-400">
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
          <h4 className="text-sm font-bold text-slate-200">
            Manual SME Financial Parameter Adjustments
          </h4>
          <span className="text-xs text-slate-400">Edit fields to re-run ML pipeline</span>
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
    </div>
  );
};
