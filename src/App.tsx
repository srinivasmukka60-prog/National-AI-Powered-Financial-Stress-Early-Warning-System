/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserRole, StateData } from './types';
import { AgencySidebar } from './components/AgencySidebar';
import { AgencyHeader } from './components/AgencyHeader';
import { AgencyDashboardView } from './components/AgencyDashboardView';
import { SettingsModal } from './components/SettingsModal';
import { UserProfileModal } from './components/UserProfileModal';
import { DashboardView } from './components/DashboardView';
import { IndiaMap } from './components/IndiaMap';
import { RiskHeatmapView } from './components/RiskHeatmapView';
import { SectorAnalysisView } from './components/SectorAnalysisView';
import { ForecastEngineView } from './components/ForecastEngineView';
import { SMEAnalyzerView } from './components/SMEAnalyzerView';
import { AIDigitalCFOView } from './components/AIDigitalCFOView';
import { CashflowForecastView } from './components/CashflowForecastView';
import { CrisisSimulatorView } from './components/CrisisSimulatorView';
import { InterventionSimulatorView } from './components/InterventionSimulatorView';
import { EarlyWarningsView } from './components/EarlyWarningsView';
import { AIInsightsView } from './components/AIInsightsView';
import { MethodologyView } from './components/MethodologyView';
import { MainAIChatbot } from './components/MainAIChatbot';
import { InstallShortcutModal } from './components/InstallShortcutModal';
import { AuthModal } from './components/AuthModal';
import { SessionLockOverlay } from './components/SessionLockOverlay';
import { SecurityCenterModal } from './components/SecurityCenterModal';
import {
  LogOut,
  CheckCircle2,
  Menu,
  LayoutGrid,
  Wallet,
  Bot,
  FileText,
} from 'lucide-react';
import { useLanguage } from './context/LanguageContext';
import { useAuth } from './context/AuthContext';
import { getTranslation } from './utils/translations';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [userRole, setUserRole] = useState<UserRole>('government');
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [selectedBriefingStateId, setSelectedBriefingStateId] = useState<string>('GJ');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currency, setCurrency] = useState<string>('USD');
  const { language, setLanguage, t } = useLanguage();
  const { isAuthenticated, isLocked, lockSession, logout } = useAuth();

  // Modals
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [profileOpen, setProfileOpen] = useState<boolean>(false);
  const [shortcutModalOpen, setShortcutModalOpen] = useState<boolean>(false);
  const [securityCenterOpen, setSecurityCenterOpen] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [logoutNotice, setLogoutNotice] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Economic Shock Simulation Preset selected from search
  const [selectedShockPresetId, setSelectedShockPresetId] = useState<string | null>(null);
  const [presetTimestamp, setPresetTimestamp] = useState<number>(0);

  const handleGenerateBriefingFromMap = (state: StateData) => {
    setSelectedBriefingStateId(state.id);
    setCurrentTab('insights');
  };

  const handleLogout = () => {
    logout();
    setLogoutNotice('Terminal Session securely terminated. Clearance reset.');
    setTimeout(() => {
      setLogoutNotice(null);
    }, 2500);
  };

  // Human readable translated title for top bar
  const tabTitles: Record<string, string> = {
    dashboard: t('dashboard'),
    scorecards: t('scorecards'),
    analyzer: `${t('scorecards')} & AI Risk Analyzer`,
    clients: t('clients'),
    profitability: t('profitability'),
    sectors: t('sector_profitability', 'Sector Profitability'),
    cash: t('cashflow_hero_title', 'Cash-Flow Forecasting Engine'),
    cashflow: t('cashflow_hero_title', 'Cash-Flow Forecasting Engine'),
    cfo: t('cfo_nav', 'AI Digital CFO Advisory'),
    growth: t('growth'),
    forecast: t('growth_forecast', 'Growth & Forecast Engine'),
    map: t('real_world_map'),
    alerts: t('early_warnings'),
    simulator: t('macro_simulator', 'Crisis Simulator'),
    intervention: t('intervention_sim', 'Intervention Simulator'),
    heatmap: t('risk_heatmap', 'Risk Heatmap'),
    insights: t('executive_briefings', 'Executive AI Briefings'),
    methodology: t('methodology_arch', 'Methodology & Architecture'),
  };

  const activeTitle = tabTitles[currentTab] || t('dashboard');

  return (
    <div
      className={`min-h-screen flex flex-row transition-colors ${
        darkMode ? 'bg-[#0f141c] text-slate-200' : 'bg-slate-100/70 text-slate-900'
      }`}
    >
      {/* 1. Left Sidebar Navigation (Matching User Screenshot) */}
      <AgencySidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        darkMode={darkMode}
        language={language}
        onOpenSettings={() => setSettingsOpen(true)}
        onLogout={handleLogout}
        onOpenShortcutModal={() => setShortcutModalOpen(true)}
        onOpenProfile={() => setProfileOpen(true)}
        onOpenSecurityCenter={() => setSecurityCenterOpen(true)}
        mobileMenuOpen={mobileMenuOpen}
        onCloseMobileMenu={() => setMobileMenuOpen(false)}
      />

      {/* 2. Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        {/* Top Header Bar */}
        <AgencyHeader
          title={activeTitle}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          language={language}
          setLanguage={setLanguage}
          onOpenProfile={() => setProfileOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenShortcutModal={() => setShortcutModalOpen(true)}
          onOpenSecurityCenter={() => setSecurityCenterOpen(true)}
          onLockSession={lockSession}
          onLogout={handleLogout}
          onNavigate={(tab) => setCurrentTab(tab)}
          onSelectState={(stateId) => {
            setSelectedBriefingStateId(stateId);
            setCurrentTab('insights');
          }}
          onSelectShockPreset={(presetId) => {
            setSelectedShockPresetId(presetId);
            setPresetTimestamp(Date.now());
            setCurrentTab('simulator');
          }}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto px-3 sm:px-6 md:px-8 py-3.5 sm:py-5 pb-20 lg:pb-6">
          {logoutNotice && (
            <div className="mb-4 p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              {logoutNotice}
            </div>
          )}

          {/* Core Dashboard View Matching Screenshot Pixel-for-Pixel */}
          {currentTab === 'dashboard' && (
            <AgencyDashboardView
              darkMode={darkMode}
              currency={currency}
              language={language}
              onNavigate={(tab) => setCurrentTab(tab)}
            />
          )}

          {/* Scorecards View */}
          {(currentTab === 'scorecards' || currentTab === 'analyzer') && (
            <SMEAnalyzerView
              darkMode={darkMode}
              onNavigate={(tab) => setCurrentTab(tab)}
            />
          )}

          {/* Clients & National SME Directory */}
          {currentTab === 'clients' && (
            <DashboardView
              darkMode={darkMode}
              userRole={userRole}
              onNavigate={(tab) => setCurrentTab(tab)}
            />
          )}

          {/* Profitability Analysis */}
          {(currentTab === 'profitability' || currentTab === 'sectors') && (
            <SectorAnalysisView
              darkMode={darkMode}
              onNavigateToSimulator={() => setCurrentTab('simulator')}
            />
          )}

          {/* Corporate Cash-Flow Forecasting Engine */}
          {(currentTab === 'cash' || currentTab === 'cashflow') && (
            <CashflowForecastView
              darkMode={darkMode}
              currency={currency}
              onNavigate={(tab) => setCurrentTab(tab)}
            />
          )}

          {/* AI Digital CFO Advisory */}
          {currentTab === 'cfo' && (
            <AIDigitalCFOView
              darkMode={darkMode}
              onNavigate={(tab) => setCurrentTab(tab)}
            />
          )}

          {/* Growth & Forecast Engine */}
          {(currentTab === 'growth' || currentTab === 'forecast') && (
            <ForecastEngineView darkMode={darkMode} />
          )}

          {/* Real-World Satellite Map */}
          {currentTab === 'map' && (
            <IndiaMap
              darkMode={darkMode}
              onGenerateBriefing={handleGenerateBriefingFromMap}
            />
          )}

          {/* Risk Heatmap */}
          {currentTab === 'heatmap' && (
            <RiskHeatmapView
              darkMode={darkMode}
              onNavigate={(tab) => setCurrentTab(tab)}
            />
          )}

          {/* Crisis Simulator */}
          {currentTab === 'simulator' && (
            <CrisisSimulatorView
              darkMode={darkMode}
              onNavigate={(tab) => setCurrentTab(tab)}
              initialPresetId={selectedShockPresetId}
              presetTimestamp={presetTimestamp}
            />
          )}

          {/* Intervention Simulator */}
          {currentTab === 'intervention' && (
            <InterventionSimulatorView
              darkMode={darkMode}
              onNavigate={(tab) => setCurrentTab(tab)}
            />
          )}

          {/* Early Warning Feed */}
          {currentTab === 'alerts' && (
            <EarlyWarningsView
              darkMode={darkMode}
              searchQuery={searchQuery}
              onNavigate={(tab) => setCurrentTab(tab)}
            />
          )}

          {/* Executive AI Insights */}
          {currentTab === 'insights' && (
            <AIInsightsView
              darkMode={darkMode}
              initialStateId={selectedBriefingStateId}
            />
          )}

          {/* Methodology View */}
          {currentTab === 'methodology' && (
            <MethodologyView darkMode={darkMode} />
          )}
        </main>

        {/* Sleek Mobile Bottom Navigation Bar (< lg screens) */}
        <nav
          className={`lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t backdrop-blur-md px-2 py-1 flex items-center justify-around transition-colors shadow-lg ${
            darkMode ? 'bg-[#10151f]/95 border-slate-800/90 text-slate-400' : 'bg-white/95 border-slate-200/90 text-slate-600'
          }`}
        >
          <button
            type="button"
            onClick={() => setCurrentTab('dashboard')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl text-[10px] font-semibold transition-all cursor-pointer ${
              currentTab === 'dashboard'
                ? darkMode ? 'text-sky-400 font-bold bg-sky-950/40' : 'text-sky-600 font-bold bg-sky-50'
                : 'hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('cash')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl text-[10px] font-semibold transition-all cursor-pointer ${
              currentTab === 'cash' || currentTab === 'cashflow'
                ? darkMode ? 'text-sky-400 font-bold bg-sky-950/40' : 'text-sky-600 font-bold bg-sky-50'
                : 'hover:text-slate-200'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>Cashflow</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('cfo')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl text-[10px] font-semibold transition-all cursor-pointer ${
              currentTab === 'cfo'
                ? darkMode ? 'text-sky-400 font-bold bg-sky-950/40' : 'text-sky-600 font-bold bg-sky-50'
                : 'hover:text-slate-200'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>AI CFO</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('scorecards')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl text-[10px] font-semibold transition-all cursor-pointer ${
              currentTab === 'scorecards' || currentTab === 'analyzer'
                ? darkMode ? 'text-sky-400 font-bold bg-sky-950/40' : 'text-sky-600 font-bold bg-sky-50'
                : 'hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Scorecard</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl text-[10px] font-semibold transition-all cursor-pointer hover:text-slate-200"
          >
            <Menu className="w-4 h-4 text-sky-400" />
            <span>More</span>
          </button>
        </nav>
      </div>

      {/* 3. Global Interactive Modals */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        darkMode={darkMode}
        currency={currency}
        setCurrency={setCurrency}
        language={language}
        setLanguage={setLanguage}
        onOpenSecurityCenter={() => setSecurityCenterOpen(true)}
      />

      <UserProfileModal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
        darkMode={darkMode}
        onOpenSettings={() => setSettingsOpen(true)}
        onLogout={handleLogout}
        onOpenSecurityCenter={() => setSecurityCenterOpen(true)}
        onLockSession={lockSession}
      />

      <InstallShortcutModal
        isOpen={shortcutModalOpen}
        onClose={() => setShortcutModalOpen(false)}
        darkMode={darkMode}
      />

      {/* Security Modals & Lock Screen */}
      <AuthModal
        isOpen={!isAuthenticated || authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        canDismiss={isAuthenticated}
        darkMode={darkMode}
      />

      {isLocked && <SessionLockOverlay />}

      <SecurityCenterModal
        isOpen={securityCenterOpen}
        onClose={() => setSecurityCenterOpen(false)}
        darkMode={darkMode}
      />

      {/* 4. Persistent Global AI Copilot Floating Chatbot */}
      <MainAIChatbot
        darkMode={darkMode}
        currentTab={currentTab}
        onNavigate={(tab) => setCurrentTab(tab)}
      />
    </div>
  );
}
