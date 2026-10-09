import React, { useState, useEffect } from 'react';
import { SMEFinancialInputs, AIRiskScoreResult, CreditRiskGrade } from '../types';
import { ApiClient } from '../services/apiClient';
import {
  Sparkles,
  X,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingDown,
  TrendingUp,
  Percent,
  Activity,
  Layers,
  ArrowRight,
  Download,
  Copy,
  RefreshCw,
  Sliders,
  Award,
} from 'lucide-react';

interface AIRiskScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  inputs: SMEFinancialInputs;
  mlBaselineScore?: number;
  darkMode: boolean;
}

const GRADE_INFO: Record<CreditRiskGrade, { title: string; color: string; bg: string; border: string }> = {
  AAA: { title: 'Prime Quality · Negligible Default Risk', color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/40' },
  AA: { title: 'High Grade · Very Strong Solvency', color: 'text-emerald-300', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  A: { title: 'Upper Medium Grade · Strong Solvency Buffer', color: 'text-blue-400', bg: 'bg-blue-500/15', border: 'border-blue-500/40' },
  BBB: { title: 'Investment Grade · Moderate Working Capital Sensitivity', color: 'text-cyan-400', bg: 'bg-cyan-500/15', border: 'border-cyan-500/40' },
  BB: { title: 'Speculative Grade · Vulnerable to Liquidity Shocks', color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/40' },
  B: { title: 'Highly Leveraged · Elevated Covenant Breach Risk', color: 'text-orange-400', bg: 'bg-orange-500/15', border: 'border-orange-500/40' },
  CCC: { title: 'Substantial Risk · Severe Liquidity Contraction', color: 'text-red-400', bg: 'bg-red-500/15', border: 'border-red-500/40' },
  D: { title: 'Imminent Default · Critical Intervention Required', color: 'text-rose-500', bg: 'bg-rose-500/20', border: 'border-rose-500/50' },
};

export const AIRiskScoreModal: React.FC<AIRiskScoreModalProps> = ({
  isOpen,
  onClose,
  inputs,
  mlBaselineScore,
  darkMode,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [result, setResult] = useState<AIRiskScoreResult | null>(null);
  const [simulatedMitigations, setSimulatedMitigations] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState<boolean>(false);

  const fetchScore = async () => {
    setLoading(true);
    try {
      const res = await ApiClient.generateAIRiskScore(inputs, mlBaselineScore);
      setResult(res);
      setSimulatedMitigations({});
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchScore();
    }
  }, [isOpen, inputs.businessName, inputs.receivablesDays, inputs.dscr, inputs.cashRunwayMonths]);

  if (!isOpen) return null;

  // Calculate projected score if mitigations are simulated
  let totalReduction = 0;
  if (result) {
    result.prescriptiveMitigations.forEach((m, idx) => {
      if (simulatedMitigations[idx]) {
        totalReduction += m.expectedRiskReductionPoints;
      }
    });
  }
  const projectedScore = result ? Math.max(8, result.overallScore - totalReduction) : 0;

  const handleCopyReport = () => {
    if (!result) return;
    const text = `SME-SENTINEL AI RISK SCORE REPORT
Entity: ${inputs.businessName} (${inputs.sector}, ${inputs.state})
AI Risk Score: ${result.overallScore}/100 (${result.riskLevel.toUpperCase()})
Credit Grade: ${result.riskGrade}
Liquidity Risk: ${result.subScores.liquidityRisk}/100
Debt & Solvency Risk: ${result.subScores.debtSolvencyRisk}/100
Operational Efficiency Risk: ${result.subScores.operationalEfficiencyRisk}/100
Supply Chain Risk: ${result.subScores.supplyChainExposure}/100
Market Macro Risk: ${result.subScores.marketMacroRisk}/100

Summary:
${result.executiveSummary}

Key Vulnerabilities:
${result.criticalVulnerabilities.map((v) => '- ' + v).join('\n')}

Prescriptive Mitigations:
${result.prescriptiveMitigations.map((m) => `- [${m.priority}] ${m.action} (Expected: -${m.expectedRiskReductionPoints} pts)\n  ${m.details}`).join('\n')}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const gradeDetails = result ? GRADE_INFO[result.riskGrade] : GRADE_INFO.BB;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-4xl rounded-2xl border shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col ${
          darkMode ? 'bg-slate-900 border-slate-700/80 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Modal Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b shrink-0 ${
          darkMode
            ? 'border-slate-800/80 bg-gradient-to-r from-purple-900/20 via-slate-900/40 to-cyan-900/20'
            : 'border-slate-200 bg-gradient-to-r from-purple-50 via-slate-50 to-cyan-50'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-lg font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>AI Risk Score Diagnostic</h3>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border flex items-center gap-1 ${
                  darkMode ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                }`}>
                  <Activity className="w-2.5 h-2.5 animate-pulse text-indigo-500" />
                  Gemini 2.5 Flash
                </span>
              </div>
              <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {inputs.businessName} · {inputs.sector} ({inputs.district}, {inputs.state})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchScore}
              disabled={loading}
              title="Refresh AI evaluation"
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                darkMode ? 'border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-slate-300' : 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800/60' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                <Sparkles className="w-6 h-6 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="text-center">
                <p className={`text-sm font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>Evaluating Multi-Pillar Risk Matrix...</p>
                <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Cross-referencing debtor days, interest burden, and sector stress.</p>
              </div>
            </div>
          ) : result ? (
            <>
              {/* Primary Score Banner */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Score Dial / Grade */}
                <div className={`md:col-span-5 p-5 rounded-2xl border flex flex-col justify-between ${
                  darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Composite AI Risk Score
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${gradeDetails.bg} ${gradeDetails.color} border ${gradeDetails.border}`}>
                        Grade {result.riskGrade}
                      </span>
                    </div>

                    <div className="mt-3 flex items-baseline gap-3">
                      <span className={`text-5xl font-black font-mono tabular-nums ${gradeDetails.color}`}>
                        {result.overallScore}
                      </span>
                      <span className={`text-sm font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>/ 100</span>
                      {totalReduction > 0 && (
                        <div className="ml-auto text-right">
                          <span className={`text-xs font-bold block ${darkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
                            Simulated: {projectedScore}
                          </span>
                          <span className={`text-[10px] font-semibold ${darkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>
                            (-{totalReduction} pts reduction)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={`mt-4 pt-3 border-t space-y-1 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                    <p className={`text-xs font-bold ${gradeDetails.color}`}>
                      {gradeDetails.title}
                    </p>
                    <div className={`flex items-center justify-between text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      <span>Model Confidence:</span>
                      <span className={`font-mono font-semibold ${darkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>{result.confidenceLevel}%</span>
                    </div>
                    <div className={`flex items-center justify-between text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      <span>Status:</span>
                      <span className={`font-semibold ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                        {result.isAiGenerated ? 'Gemini Generative Engine' : 'Calibrated Hybrid Engine'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 5 Risk Pillars */}
                <div className={`md:col-span-7 p-5 rounded-2xl border space-y-3 ${
                  darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                      darkMode ? 'text-slate-300' : 'text-slate-800'
                    }`}>
                      <Layers className="w-3.5 h-3.5 text-indigo-400" />
                      5-Pillar Sub-Score Breakdown
                    </span>
                    <span className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>0 (Safe) → 100 (Critical)</span>
                  </div>

                  <div className="space-y-2.5 pt-1">
                    {[
                      { label: 'Liquidity & Cash Flow Risk', score: result.subScores.liquidityRisk, color: 'bg-cyan-500' },
                      { label: 'Debt Servicing & Solvency', score: result.subScores.debtSolvencyRisk, color: 'bg-red-500' },
                      { label: 'Operational Efficiency', score: result.subScores.operationalEfficiencyRisk, color: 'bg-amber-500' },
                      { label: 'Supply Chain & Inventory', score: result.subScores.supplyChainExposure, color: 'bg-purple-500' },
                      { label: 'Market & Macro Sensitivity', score: result.subScores.marketMacroRisk, color: 'bg-blue-500' },
                    ].map((pillar, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className={`font-medium ${darkMode ? 'text-slate-300' : 'text-slate-800'}`}>{pillar.label}</span>
                          <span className={`font-mono font-bold tabular-nums ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>{pillar.score}/100</span>
                        </div>
                        <div className={`w-full h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${pillar.color}`}
                            style={{ width: `${pillar.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stress Tolerance Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className={`text-[11px] font-medium flex items-center gap-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    <TrendingUp className="w-3 h-3 text-red-400" /> Rate Hike Tolerance
                  </div>
                  <div className={`text-xl font-bold font-mono mt-1 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                    +{result.stressTolerance.rateHikeToleranceBps} bps
                  </div>
                  <p className={`text-[10px] mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Repo hike margin before DSCR &lt; 1.0</p>
                </div>

                <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className={`text-[11px] font-medium flex items-center gap-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    <TrendingDown className="w-3 h-3 text-amber-400" /> Revenue Shock Threshold
                  </div>
                  <div className={`text-xl font-bold font-mono mt-1 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                    -{result.stressTolerance.revenueDropTolerancePct}%
                  </div>
                  <p className={`text-[10px] mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Top-line contraction cushion</p>
                </div>

                <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className={`text-[11px] font-medium flex items-center gap-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    <Clock className="w-3 h-3 text-cyan-400" /> Debtor Delay Buffer
                  </div>
                  <div className={`text-xl font-bold font-mono mt-1 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                    +{result.stressTolerance.paymentDelayBufferDays} days
                  </div>
                  <p className={`text-[10px] mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Extra DSO stretch before 0 runway</p>
                </div>
              </div>

              {/* Executive Summary Narrative */}
              <div className={`p-4.5 rounded-xl border leading-relaxed text-xs md:text-sm ${
                darkMode ? 'bg-indigo-950/20 border-indigo-900/40 text-indigo-200' : 'bg-indigo-50 border-indigo-200 text-indigo-950'
              }`}>
                <div className="flex items-center gap-1.5 font-bold mb-1.5 text-xs text-indigo-400 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Executive Assessment
                </div>
                {result.executiveSummary}
              </div>

              {/* Strengths & Vulnerabilities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Strengths */}
                <div className={`p-4 rounded-xl border space-y-2.5 ${
                  darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4" />
                    Key Resilience Strengths ({result.keyStrengths.length})
                  </div>
                  <ul className="space-y-1.5">
                    {result.keyStrengths.map((str, idx) => (
                      <li key={idx} className={`flex items-start gap-2 text-xs ${darkMode ? 'text-slate-300' : 'text-slate-800'}`}>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Vulnerabilities */}
                <div className={`p-4 rounded-xl border space-y-2.5 ${
                  darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-red-400 uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4" />
                    Critical Vulnerabilities ({result.criticalVulnerabilities.length})
                  </div>
                  <ul className="space-y-1.5">
                    {result.criticalVulnerabilities.map((vuln, idx) => (
                      <li key={idx} className={`flex items-start gap-2 text-xs ${darkMode ? 'text-slate-300' : 'text-slate-800'}`}>
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                        <span>{vuln}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Prescriptive Mitigations with Interactive Simulator */}
              <div className={`p-5 rounded-2xl border space-y-3.5 ${
                darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className={`text-sm font-bold flex items-center gap-1.5 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                      <Sliders className="w-4 h-4 text-indigo-400" />
                      Prescriptive Interventions & Risk Impact Simulator
                    </h4>
                    <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Toggle actions below to simulate instant risk score reduction on this enterprise.
                    </p>
                  </div>
                  <span className={`text-xs font-mono font-semibold px-2.5 py-1 rounded-lg border ${
                    darkMode ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-emerald-800 bg-emerald-100 border-emerald-300'
                  }`}>
                    Max Potential Gain: -{result.prescriptiveMitigations.reduce((acc, m) => acc + m.expectedRiskReductionPoints, 0)} pts
                  </span>
                </div>

                <div className="space-y-2.5">
                  {result.prescriptiveMitigations.map((item, idx) => {
                    const isSelected = !!simulatedMitigations[idx];
                    return (
                      <div
                        key={idx}
                        onClick={() =>
                          setSimulatedMitigations((prev) => ({
                            ...prev,
                            [idx]: !prev[idx],
                          }))
                        }
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                          isSelected
                            ? darkMode ? 'bg-emerald-950/20 border-emerald-500/50 shadow-sm' : 'bg-emerald-50/80 border-emerald-400 shadow-xs'
                            : darkMode
                            ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                            : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="mt-1 rounded accent-emerald-500 cursor-pointer"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-bold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{item.action}</span>
                              <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                item.priority === 'immediate'
                                  ? darkMode ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-800 font-bold'
                                  : darkMode ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-800 font-bold'
                              }`}>
                                {item.priority}
                              </span>
                            </div>
                            <p className={`text-xs mt-1 max-w-xl ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{item.details}</p>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
                            darkMode ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}>
                            -{item.expectedRiskReductionPoints} pts
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className={`flex items-center justify-between px-6 py-4 border-t shrink-0 ${
          darkMode ? 'border-slate-800/80 bg-slate-900/40' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className={`text-[11px] ${darkMode ? 'text-slate-500' : 'text-slate-600 font-medium'}`}>
            Assessed timestamp: {result?.timestamp || 'Just now'} · Confidential MSME assessment
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyReport}
              disabled={!result}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                darkMode ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700' : 'border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200'
              }`}
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Report'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
