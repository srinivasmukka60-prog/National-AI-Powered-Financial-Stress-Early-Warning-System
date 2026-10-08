import React, { useState } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Presentation,
  MapPin,
  AlertTriangle,
  Layers,
  Calendar,
  Sparkles,
  Sliders,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface PresentationTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
  darkMode: boolean;
}

export const PresentationTourModal: React.FC<PresentationTourModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  darkMode,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  if (!isOpen) return null;

  const tourSteps = [
    {
      title: '01. National SME Financial Stress Map',
      tab: 'map',
      icon: MapPin,
      badge: 'Geospatial Intelligence',
      headline: 'Real-Time State & District Level Risk Mapping',
      description:
        'SME-SENTINEL aggregates millions of enterprise data points into a color-coded national risk map (Green=Low, Yellow=Moderate, Orange=High, Red=Critical). Users can drill down from All-India into individual States, Districts, and manufacturing clusters like Surat, Tiruppur, and Ludhiana.',
      highlightMetric: 'National Score: 58.4 / 100 (Moderate · Approaching High)',
      keyAction: 'Inspect interactive India map & click states',
    },
    {
      title: '02. Emerging High-Risk Region (Surat / Tiruppur)',
      tab: 'map',
      icon: AlertTriangle,
      badge: 'Cluster Focus',
      headline: 'Early Detection of Severe Liquidity Contagion',
      description:
        'Spotlighting Gujarat (Score: 74.2) and Tamil Nadu (Score: 72.8). In Surat, lab-grown diamond price drops and yarn inflation created an acute liquidity crunch in 1,800+ micro units. In Tiruppur, debtor days stretched to 88 days, triggering debt-service coverage deficits.',
      highlightMetric: 'Critical District: Surat (82.5) & Tiruppur (84.1)',
      keyAction: 'Drill down to Surat & Tiruppur in the state selector',
    },
    {
      title: '03. Sector Vulnerability Analysis',
      tab: 'sectors',
      icon: Layers,
      badge: 'Industry Matrix',
      headline: 'Cross-Sector Supply-Chain Stress Profiling',
      description:
        'Analyzing 10 core industrial sectors across manufacturing, trade, and agro. Textiles (78.2) and Gems & Jewellery (73.1) exhibit extreme vulnerability to raw material surges and delayed receivables, while IT services (28.5) remain defensive.',
      highlightMetric: '₹3.82 Lakh Cr Total Monitored Credit at Risk',
      keyAction: 'Review the 10 sector vulnerability cards & key bottlenecks',
    },
    {
      title: '04. 90-Day Forward Predictive Forecast',
      tab: 'forecast',
      icon: Calendar,
      badge: 'Machine Learning',
      headline: 'Forecasting Stress 30, 60, and 90 Days in Advance',
      description:
        'Powered by Gradient Boosted Trees and high-frequency leading indicators (GST e-way bills, power draw, UPI merchant velocity). The platform predicts a transition to Critical Stress (71.8) by January 2027 with 88.5% confidence.',
      highlightMetric: 'Probability of High Stress in 60 Days: 78.4%',
      keyAction: 'Toggle between +30, +60, and +90 day predictive curves',
    },
    {
      title: '05. Explainable AI & SHAP Feature Attribution',
      tab: 'analyzer',
      icon: Sparkles,
      badge: 'Explainable AI',
      headline: 'Showing WHY Predictions Happen, Not Just What',
      description:
        'Using Shapley Additive exPlanations (SHAP), SME-SENTINEL decomposes each business or cluster score into exact transparent drivers: e.g. Delayed Receivables (+14.2 pts), Raw Material Inflation (+9.8 pts), and Inadequate DSCR (+18.5 pts).',
      highlightMetric: 'Zero Black-Box: Exact Marginal Factor Breakdown',
      keyAction: 'View the SHAP Waterfall in the SME Analyzer view',
    },
    {
      title: '06. Crisis & National Macro Shock Simulator',
      tab: 'simulator',
      icon: Sliders,
      badge: 'Scenario Simulation',
      headline: 'Interactive What-If and Economic Shock Testing',
      description:
        'Users can simulate RBI repo rate hikes (+200 bps), crude oil commodity shocks (+18%), or customer demand declines (-15%). Watch the national score climb from 58.4 to 82.1 (Critical) and observe the sector contagion transmission matrix.',
      highlightMetric: 'Calculates Required Emergency Liquidity Backstop (₹ Cr)',
      keyAction: 'Drag scenario sliders or click a National Shock preset',
    },
    {
      title: '07. Explainable Interventions & Policy Recommendations',
      tab: 'insights',
      icon: CheckCircle2,
      badge: 'Actionable Relief',
      headline: 'Turning Predictive AI into Concrete Interventions',
      description:
        'Automated recommendations provide decision support: Mandatory TReDS digital invoice discounting, CGTMSE short-term loan restructuring, and state raw material procurement depots. Generates executive memos with Gemini integration.',
      highlightMetric: 'Targeted Policy Memos for Ministry of MSME, RBI & Banks',
      keyAction: 'Generate a Gemini AI policy memo for any state',
    },
  ];

  const current = tourSteps[currentStep];
  const StepIcon = current.icon;

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGoToView = () => {
    onNavigateTab(current.tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden transition-all ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-wider">
            <Presentation className="w-4 h-4" />
            <span>Hackathon Presentation Mode · Step {currentStep + 1} of {tourSteps.length}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Indicators */}
        <div className="px-6 pt-3 flex gap-1.5">
          {tourSteps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`h-1.5 rounded-full flex-1 transition-all cursor-pointer ${
                idx === currentStep
                  ? 'bg-amber-500'
                  : idx < currentStep
                  ? 'bg-amber-500/40'
                  : 'bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Body Content */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30">
                {current.badge}
              </span>
              <span className="text-xs text-slate-500 font-mono">Step {currentStep + 1}</span>
            </div>

            <h3 className={`text-2xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              {current.headline}
            </h3>

            <p className="text-sm text-slate-300 leading-relaxed pt-1">
              {current.description}
            </p>
          </div>

          {/* Highlight Key Metric Box */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-4">
            <div>
              <div className="text-[11px] text-slate-400 uppercase font-medium">Demonstrated Result</div>
              <div className="text-sm md:text-base font-bold font-mono text-amber-400 mt-0.5">
                {current.highlightMetric}
              </div>
            </div>

            <button
              onClick={handleGoToView}
              className="shrink-0 flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-xs"
            >
              <span>Jump to Live Feature</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Judge Prompt: <em>{current.keyAction}</em></span>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="text-xs text-slate-500 font-mono">
            {currentStep + 1} / {tourSteps.length}
          </div>

          <button
            onClick={handleNext}
            disabled={currentStep === tourSteps.length - 1}
            className="flex items-center gap-1 px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 disabled:opacity-30 cursor-pointer"
          >
            <span>Next Step</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
