import React from 'react';
import { ShieldCheck, Database, AlertCircle } from 'lucide-react';

interface PrivacyBannerProps {
  darkMode: boolean;
}

export const PrivacyBanner: React.FC<PrivacyBannerProps> = ({ darkMode }) => {
  return (
    <div className={`border-b text-xs py-2 px-4 md:px-8 transition-colors ${
      darkMode 
        ? 'bg-slate-900/90 border-slate-800 text-slate-400' 
        : 'bg-slate-100 border-slate-200 text-slate-600'
    }`}>
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>
            <strong className="font-semibold text-slate-200 dark:text-slate-200 text-slate-800">Privacy-by-Design Guaranteed:</strong> Public datasets contain aggregated, k-anonymized cluster indicators only. Zero individual business PII or bank records exposed.
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-medium text-amber-500/90">
              Demo/Synthetic Data — For Hackathon Demonstration
            </span>
          </div>

          <span className="hidden sm:inline text-slate-500">·</span>

          <div className="flex items-center gap-1 text-slate-400">
            <AlertCircle className="w-3.5 h-3.5 text-blue-400" />
            <span>Decision Support Only</span>
          </div>
        </div>
      </div>
    </div>
  );
};
