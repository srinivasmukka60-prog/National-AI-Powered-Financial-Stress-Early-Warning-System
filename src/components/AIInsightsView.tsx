import React, { useState, useEffect } from 'react';
import { STATES_DATA, SECTORS_DATA } from '../data/indiaData';
import { generateAIPolicyBriefing, AIInsightReport } from '../services/geminiService';
import {
  Sparkles,
  RefreshCw,
  Send,
  Building2,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
} from 'lucide-react';

interface AIInsightsViewProps {
  darkMode: boolean;
  initialStateId?: string;
}

export const AIInsightsView: React.FC<AIInsightsViewProps> = ({
  darkMode,
  initialStateId,
}) => {
  const [selectedStateId, setSelectedStateId] = useState<string>(initialStateId || 'GJ');
  const [selectedSectorId, setSelectedSectorId] = useState<string>('textiles');
  const [loading, setLoading] = useState<boolean>(false);
  const [report, setReport] = useState<AIInsightReport | null>(null);

  const selectedState = STATES_DATA.find((s) => s.id === selectedStateId) || STATES_DATA[0];
  const selectedSector = SECTORS_DATA.find((s) => s.id === selectedSectorId) || SECTORS_DATA[0];

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await generateAIPolicyBriefing({
        regionName: selectedState.name,
        sectorName: selectedSector.name,
        stressScore: selectedState.stressScore,
        riskLevel: selectedState.riskLevel,
        primaryIssues: [...selectedState.topRiskFactors, ...selectedSector.keyVulnerabilities],
      });
      setReport(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGenerate();
  }, [selectedStateId, selectedSectorId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-4 md:p-6 rounded-2xl border transition-colors ${
        darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Policy Advisory & Generative Macroeconomic Briefings</span>
            </div>
            <h2 className={`text-xl md:text-2xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Executive Risk Briefing Generator
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Synthesizes cluster indicators into actionable policy interventions for the Ministry of MSME, RBI, SIDBI, and commercial banks.
            </p>
          </div>

          {/* Region and Sector Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedStateId}
              onChange={(e) => setSelectedStateId(e.target.value)}
              className={`text-xs font-medium py-1.5 px-3 rounded-lg border cursor-pointer ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            >
              {STATES_DATA.map((st) => (
                <option key={st.id} value={st.id}>
                  State: {st.name}
                </option>
              ))}
            </select>

            <select
              value={selectedSectorId}
              onChange={(e) => setSelectedSectorId(e.target.value)}
              className={`text-xs font-medium py-1.5 px-3 rounded-lg border cursor-pointer ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            >
              {SECTORS_DATA.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  Sector: {sec.name}
                </option>
              ))}
            </select>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Analyzing...' : 'Regenerate Brief'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Briefing Content */}
      {report && (
        <div className={`p-6 md:p-8 rounded-2xl border space-y-6 transition-colors ${
          darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          {/* Memo Header */}
          <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs text-amber-500 font-mono font-semibold">
                <span>OFFICIAL MEMO · REF: SME-SENTINEL/AI/{selectedState.code}</span>
                <span>·</span>
                <span>{report.timestamp}</span>
              </div>
              <h3 className={`text-xl md:text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                {report.title}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Aggregated Data Verified</span>
              </span>
            </div>
          </div>

          {/* Executive Summary */}
          <div className={`p-4 rounded-xl border ${
            darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Executive Situation Summary
            </h4>
            <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
              {report.executiveSummary}
            </p>
          </div>

          {/* Root Causes Matrix */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Diagnosed Root Causes & Structural Vulnerabilities
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {report.rootCauses.map((rc, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border flex flex-col justify-between ${
                    darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        rc.severity === 'critical' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {rc.severity} Severity
                      </span>
                      <span className="text-xs font-mono text-slate-500">#{idx + 1}</span>
                    </div>

                    <h5 className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                      {rc.title}
                    </h5>

                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      {rc.explanation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Policy Interventions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Strategic Policy & Liquidity Interventions
            </h4>

            <div className="space-y-3">
              {report.policyRecommendations.map((pr, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-start justify-between gap-3 ${
                    darkMode ? 'bg-emerald-950/15 border-emerald-900/30' : 'bg-emerald-50 border-emerald-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-400">
                        Recommendation {idx + 1}:
                      </span>
                      <h5 className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        {pr.title}
                      </h5>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                      {pr.description}
                    </p>
                  </div>

                  <div className="shrink-0 flex sm:flex-col items-start sm:items-end gap-1.5 text-xs text-slate-400">
                    <span className="flex items-center gap-1 font-semibold text-amber-400 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{pr.timeHorizon}</span>
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Lead: <strong>{pr.owner}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Credit Risk Guidance */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
            <div className="font-bold text-amber-400 uppercase flex items-center gap-1.5">
              <Building2 className="w-4 h-4" />
              <span>Direct Guidance for Financial Institutions & Underwriters:</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              {report.creditRiskGuidance}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
