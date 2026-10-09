import React from 'react';
import {
  Cpu,
  ShieldCheck,
  Database,
  GitBranch,
  Layers,
  Code,
  FileCheck,
  BarChart,
} from 'lucide-react';

interface MethodologyViewProps {
  darkMode: boolean;
}

export const MethodologyView: React.FC<MethodologyViewProps> = ({ darkMode }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-4 md:p-6 rounded-2xl border transition-colors ${
        darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-wider mb-1">
          <Cpu className="w-3.5 h-3.5" />
          <span>Technical Whitepaper & Architecture Specification</span>
        </div>
        <h2 className={`text-xl md:text-2xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          SME-SENTINEL Methodology & AI Pipeline
        </h2>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Rigorous early-warning engineering combining Gradient Boosted Trees, SHAP attribution, and privacy-preserving multi-tier aggregation.
        </p>
      </div>

      {/* Main Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pillar 1: Predictive ML Engine */}
        <div className={`p-5 rounded-2xl border space-y-3 ${
          darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            01. Predictive ML Pipeline
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Multi-stage ensemble combining Gradient Boosted Decision Trees (XGBoost / LightGBM proxies) for default risk classification with autoregressive lag models for 30, 60, and 90-day time-series forecasting.
          </p>
          <ul className="text-xs text-slate-300 space-y-1 pt-2 border-t border-slate-800/80">
            <li>· <strong>Input Features:</strong> 12 primary financial & macroeconomic drivers</li>
            <li>· <strong>Confidence Metric:</strong> 5-fold cross-validated scoring bands</li>
            <li>· <strong>Target Labels:</strong> Probability of DSCR &lt; 1.0 within horizon</li>
          </ul>
        </div>

        {/* Pillar 2: Explainable AI & SHAP */}
        <div className={`p-5 rounded-2xl border space-y-3 ${
          darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
            <BarChart className="w-5 h-5" />
          </div>
          <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            02. Explainable AI (SHAP)
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Shapley Additive exPlanations (SHAP) ensure transparent, audit-ready accountability. Rather than opaque black-box predictions, every score decomposes into exact marginal contributions from debtor days, margin compression, and debt load.
          </p>
          <ul className="text-xs text-slate-300 space-y-1 pt-2 border-t border-slate-800/80">
            <li>· <strong>Base Expectation:</strong> 42.0 (Historical MSME index)</li>
            <li>· <strong>Directional Decomposition:</strong> Risk-inflating vs risk-buffering</li>
            <li>· <strong>Actionability:</strong> Direct mapping to interventions</li>
          </ul>
        </div>

        {/* Pillar 3: Privacy-by-Design */}
        <div className={`p-5 rounded-2xl border space-y-3 ${
          darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            03. Privacy-by-Design
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Strict isolation between Public National Data and Private SME Sandboxes. Individual business inputs are evaluated entirely on the client side or within ephemeral memory—never written to public registries or exposed to third parties.
          </p>
          <ul className="text-xs text-slate-300 space-y-1 pt-2 border-t border-slate-800/80">
            <li>· <strong>k-Anonymity Threshold:</strong> Minimum 50 enterprises per cluster</li>
            <li>· <strong>Zero PII Exposure:</strong> No GSTIN, PAN, or account identifiers</li>
            <li>· <strong>Public Aggregation:</strong> Only state and cluster averages</li>
          </ul>
        </div>
      </div>

      {/* Relational & Data Schema Blueprint */}
      <div className={`p-6 rounded-2xl border space-y-4 ${
        darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between">
          <h3 className={`text-base font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            <Database className="w-4 h-4 text-amber-500" />
            <span>Platform Relational Data Architecture (PostgreSQL / In-Memory Schema)</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">12 Normalized Entities</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 space-y-1.5">
            <div className="font-bold text-amber-400">regions & states</div>
            <div className="text-[11px] text-slate-400 font-mono">
              state_id, state_name, code, stress_score, forecast_30d, forecast_60d, forecast_90d, credit_at_risk_cr
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 space-y-1.5">
            <div className="font-bold text-amber-400">districts & clusters</div>
            <div className="text-[11px] text-slate-400 font-mono">
              district_id, state_id, cluster_name, primary_sectors, dominant_issue, total_msmes, stress_score
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 space-y-1.5">
            <div className="font-bold text-amber-400">sectors & supply_chains</div>
            <div className="text-[11px] text-slate-400 font-mono">
              sector_id, category, stress_score, credit_exposure_cr, high_risk_pct, key_vulnerabilities
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 space-y-1.5">
            <div className="font-bold text-amber-400">early_warning_alerts</div>
            <div className="text-[11px] text-slate-400 font-mono">
              alert_id, urgency, state_id, sector_id, horizon_days, causes_json, suggested_policy_intervention
            </div>
          </div>
        </div>
      </div>

      {/* Synthetic Dataset Transparency Note */}
      <div className={`p-5 rounded-2xl border border-indigo-500/30 ${
        darkMode ? 'bg-indigo-950/20' : 'bg-indigo-50/50'
      }`}>
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
          <FileCheck className="w-4 h-4" />
          <span>Data Privacy & Statistical Calibration Disclosure</span>
        </div>
        <p className={`text-xs md:text-sm leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
          <strong>Enterprise Data Anonymization:</strong> Because actual micro-level SME financial balance sheets and GST transaction logs are protected under national statutory privacy laws, this deployment utilizes a mathematically calibrated synthetic dataset modeled after public RBI Annual MSME Credit Reports, SIDBI MSME Pulse, and DGFT Export statistics. It accurately reproduces authentic economic correlations between debtor days, raw material shocks, and loan repayment defaults.
        </p>
      </div>
    </div>
  );
};
