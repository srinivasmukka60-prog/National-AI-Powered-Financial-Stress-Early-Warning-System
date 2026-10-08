import React from 'react';
import {
  ShieldAlert,
  ArrowRight,
  Sparkles,
  MapPin,
  Sliders,
  UserCheck,
  Building2,
  Landmark,
  CheckCircle2,
  TrendingUp,
  Cpu,
} from 'lucide-react';

interface LandingHeroViewProps {
  darkMode: boolean;
  onNavigate: (tab: string) => void;
  onOpenTour: () => void;
}

export const LandingHeroView: React.FC<LandingHeroViewProps> = ({
  darkMode,
  onNavigate,
  onOpenTour,
}) => {
  const workflowSteps = [
    {
      step: '01',
      title: 'High-Frequency Ingestion',
      desc: 'GST e-way bills, bank credit registries, power draw, and commodity spot prices.',
    },
    {
      step: '02',
      title: 'Gradient Boosted ML',
      desc: 'XGBoost & time-series models evaluate 12 financial ratios and liquidity runway.',
    },
    {
      step: '03',
      title: '30–90 Day Stress Forecast',
      desc: 'Quantifies default probability and credit at risk with 88%+ cross-validated accuracy.',
    },
    {
      step: '04',
      title: 'Explainable Interventions',
      desc: 'SHAP feature attribution pinpoints exact causes and suggests targeted policy relief.',
    },
  ];

  return (
    <div className="space-y-12 py-4">
      {/* Hero Section */}
      <div className={`relative overflow-hidden rounded-3xl p-6 sm:p-10 md:p-14 border transition-all ${
        darkMode ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-slate-800' : 'bg-gradient-to-b from-slate-50 to-white border-slate-200'
      }`}>
        {/* Glow ambient background elements */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-80 h-80 rounded-full bg-red-500/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span>National Early-Warning System for Indian MSMEs</span>
          </div>

          <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>
            Predict SME Financial Stress Before It Becomes a Crisis.
          </h1>

          <p className={`text-base sm:text-lg md:text-xl font-normal leading-relaxed max-w-2xl ${
            darkMode ? 'text-slate-300' : 'text-slate-600'
          }`}>
            AI-powered early-warning intelligence for India's MSME ecosystem. Forecasting liquidity distress 30, 60, and 90 days ahead at state, district, sector, and business-cluster levels.
          </p>

          {/* Three Mandatory Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <span>Explore National Risk</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('analyzer')}
              className={`px-5 py-3 rounded-xl border text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                darkMode ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700' : 'border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200'
              }`}
            >
              <span>Analyze My SME</span>
              <UserCheck className="w-4 h-4 text-emerald-400" />
            </button>

            <button
              onClick={() => onNavigate('simulator')}
              className={`px-5 py-3 rounded-xl border text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                darkMode ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700' : 'border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200'
              }`}
            >
              <span>Run Scenario</span>
              <Sliders className="w-4 h-4 text-amber-400" />
            </button>

            <button
              onClick={onOpenTour}
              className="px-4 py-3 rounded-xl border border-amber-500/40 text-amber-400 hover:bg-amber-500/10 text-sm font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Judge Demo Tour</span>
            </button>
          </div>
        </div>

        {/* Quick Micro-KPI Bar inside hero */}
        <div className="mt-10 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <div className="text-[11px] text-slate-400 font-medium uppercase">National Stress Index</div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-400 mt-0.5">58.4 / 100</div>
            <div className="text-[11px] text-slate-400">Moderate · +8.4 pts MoM</div>
          </div>

          <div>
            <div className="text-[11px] text-slate-400 font-medium uppercase">Credit Monitored</div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white mt-0.5">₹24.8 Lakh Cr</div>
            <div className="text-[11px] text-slate-400">Across 63M+ Enterprises</div>
          </div>

          <div>
            <div className="text-[11px] text-slate-400 font-medium uppercase">High-Risk Clusters</div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-orange-400 mt-0.5">8 Regions</div>
            <div className="text-[11px] text-slate-400">Surat, Tiruppur, Ludhiana</div>
          </div>

          <div>
            <div className="text-[11px] text-slate-400 font-medium uppercase">Early Horizon Lead</div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400 mt-0.5">30–90 Days</div>
            <div className="text-[11px] text-slate-400">Before Bank Default</div>
          </div>
        </div>
      </div>

      {/* Platform Concept & Mechanism Architecture */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-bold text-amber-500 uppercase tracking-wider">
            Operational Architecture
          </div>
          <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            How SME-SENTINEL Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            From fragmented raw telemetry to actionable state policy interventions in four autonomous stages.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {workflowSteps.map((wf) => (
            <div
              key={wf.step}
              className={`p-5 rounded-2xl border transition-all ${
                darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <span className="font-mono text-2xl font-black text-amber-500 block mb-2">
                {wf.step}
              </span>
              <h3 className={`text-base font-bold mb-1.5 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                {wf.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {wf.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Three User Roles Showcase */}
      <div className={`p-6 sm:p-8 rounded-2xl border ${
        darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="text-center max-w-xl mx-auto mb-8 space-y-1">
          <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Purpose-Built for Three Critical Stakeholders
          </h3>
          <p className="text-xs text-slate-400">
            Tailored interfaces engineered for sovereign policy, credit underwriting, and MSME resilience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Role 1 */}
          <div className="space-y-2 p-4 rounded-xl border border-slate-800/80 bg-slate-950/40">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Landmark className="w-4 h-4" />
              <span>Government & Policy Makers</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Monitor national systemic stress, district-level emerging hot-spots, and generate targeted subsidy or TReDS intervention directives before industry layoffs occur.
            </p>
          </div>

          {/* Role 2 */}
          <div className="space-y-2 p-4 rounded-xl border border-slate-800/80 bg-slate-950/40">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
              <Building2 className="w-4 h-4" />
              <span>Financial Institutions & Banks</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Track aggregate sectoral credit-stress trends, stress-test loan books under RBI rate hike scenarios, and safeguard drawing limits without individual SME privacy breaches.
            </p>
          </div>

          {/* Role 3 */}
          <div className="space-y-2 p-4 rounded-xl border border-slate-800/80 bg-slate-950/40">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <UserCheck className="w-4 h-4" />
              <span>MSME Business Owners</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enter or upload financial ratios in a private, client-side sandbox to receive instant credit health scores, 6-month cash flow projections, and debt restructuring plans.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
