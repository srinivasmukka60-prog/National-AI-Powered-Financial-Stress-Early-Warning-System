/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserRole, StateData } from './types';
import { Header } from './components/Header';
import { PrivacyBanner } from './components/PrivacyBanner';
import { LandingHeroView } from './components/LandingHeroView';
import { DashboardView } from './components/DashboardView';
import { IndiaMap } from './components/IndiaMap';
import { SectorAnalysisView } from './components/SectorAnalysisView';
import { ForecastEngineView } from './components/ForecastEngineView';
import { SMEAnalyzerView } from './components/SMEAnalyzerView';
import { CrisisSimulatorView } from './components/CrisisSimulatorView';
import { EarlyWarningsView } from './components/EarlyWarningsView';
import { AIInsightsView } from './components/AIInsightsView';
import { MethodologyView } from './components/MethodologyView';
import { PresentationTourModal } from './components/PresentationTourModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [userRole, setUserRole] = useState<UserRole>('government');
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [tourOpen, setTourOpen] = useState<boolean>(false);
  const [selectedBriefingStateId, setSelectedBriefingStateId] = useState<string>('GJ');

  const handleGenerateBriefingFromMap = (state: StateData) => {
    setSelectedBriefingStateId(state.id);
    setCurrentTab('insights');
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors ${
      darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Privacy and Demo Notice Banner */}
      <PrivacyBanner darkMode={darkMode} />

      {/* Top Bar Contract Navigation */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        userRole={userRole}
        setUserRole={setUserRole}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenTour={() => setTourOpen(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6">
        {currentTab === 'landing' && (
          <LandingHeroView
            darkMode={darkMode}
            onNavigate={(tab) => setCurrentTab(tab)}
            onOpenTour={() => setTourOpen(true)}
          />
        )}

        {currentTab === 'dashboard' && (
          <DashboardView
            darkMode={darkMode}
            userRole={userRole}
            onNavigate={(tab) => setCurrentTab(tab)}
          />
        )}

        {currentTab === 'map' && (
          <IndiaMap
            darkMode={darkMode}
            onGenerateBriefing={handleGenerateBriefingFromMap}
          />
        )}

        {currentTab === 'sectors' && (
          <SectorAnalysisView
            darkMode={darkMode}
            onNavigateToSimulator={() => setCurrentTab('simulator')}
          />
        )}

        {currentTab === 'forecast' && (
          <ForecastEngineView darkMode={darkMode} />
        )}

        {currentTab === 'analyzer' && (
          <SMEAnalyzerView darkMode={darkMode} />
        )}

        {currentTab === 'simulator' && (
          <CrisisSimulatorView darkMode={darkMode} />
        )}

        {currentTab === 'alerts' && (
          <EarlyWarningsView darkMode={darkMode} />
        )}

        {currentTab === 'insights' && (
          <AIInsightsView
            darkMode={darkMode}
            initialStateId={selectedBriefingStateId}
          />
        )}

        {currentTab === 'methodology' && (
          <MethodologyView darkMode={darkMode} />
        )}
      </main>

      {/* Professional Footer */}
      <footer className={`border-t py-8 px-4 md:px-8 text-xs transition-colors ${
        darkMode ? 'bg-slate-950 border-slate-900 text-slate-500' : 'bg-white border-slate-200 text-slate-500'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-amber-500 flex items-center justify-center text-[10px] font-bold text-slate-950">
              SS
            </div>
            <span className="font-bold text-slate-300">
              SME-SENTINEL
            </span>
            <span>·</span>
            <span>National SME Financial Stress Predictor</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <button
              onClick={() => setCurrentTab('methodology')}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Methodology & Privacy
            </button>
            <span>·</span>
            <button
              onClick={() => setCurrentTab('analyzer')}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Confidential SME Sandbox
            </button>
            <span>·</span>
            <button
              onClick={() => setTourOpen(true)}
              className="text-amber-500 hover:text-amber-400 font-semibold cursor-pointer"
            >
              Hackathon Demo Tour
            </button>
          </div>

          <div className="text-[11px] text-slate-400">
            Demo/Synthetic Data — For Hackathon Demonstration · Decision Support Only
          </div>
        </div>
      </footer>

      {/* Guided Hackathon Presentation Tour Modal */}
      <PresentationTourModal
        isOpen={tourOpen}
        onClose={() => setTourOpen(false)}
        onNavigateTab={(tab) => setCurrentTab(tab)}
        darkMode={darkMode}
      />
    </div>
  );
}
