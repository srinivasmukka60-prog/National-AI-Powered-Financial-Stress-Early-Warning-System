import React, { useState } from 'react';
import {
  X,
  Settings,
  Bell,
  Sliders,
  Database,
  Shield,
  Key,
  Check,
  Save,
  RotateCcw,
  DollarSign,
  Calendar,
  Globe,
  Zap,
  Languages,
  Search,
  Download,
  Monitor,
  Smartphone,
  Phone,
  MessageSquare,
  Sparkles,
  Lock,
  CheckCircle2,
  Cloud,
} from 'lucide-react';
import {
  SupportedLanguage,
  SUPPORTED_LANGUAGES,
  getTranslation,
} from '../utils/translations';
import {
  downloadWindowsShortcut,
  downloadWindowsBatchLauncher,
  downloadMobileShortcutHtml,
  promptPWAInstall,
  getInstallPrompt,
} from '../utils/appShortcut';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  currency: string;
  setCurrency: (c: string) => void;
  language?: SupportedLanguage;
  setLanguage?: (l: SupportedLanguage) => void;
  onOpenSecurityCenter?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  darkMode,
  currency,
  setCurrency,
  language: propLanguage = 'en',
  setLanguage,
  onOpenSecurityCenter,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'thresholds' | 'integrations' | 'notifications' | 'security'>('general');
  const {
    is2FAEnabled,
    toggleTwoFactor,
    pinCode,
    autoLockMinutes,
    setAutoLockMinutes,
    lockSession,
    phone,
    updateUserPhone,
    twoFactorMethod,
    setTwoFactorMethod,
    supabaseConfig,
    saveSupabaseKeys,
    clearSupabaseKeys,
  } = useAuth();
  const { language: ctxLanguage, setLanguage: ctxSetLanguage, t } = useLanguage();
  const activeLang = ctxLanguage || propLanguage || 'en';
  const [langSearch, setLangSearch] = useState('');
  const [langCategory, setLangCategory] = useState<'all' | 'Indian' | 'Global'>('all');

  const [supabaseUrlInput, setSupabaseUrlInput] = useState(supabaseConfig.url || '');
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(supabaseConfig.anonKey || '');
  const [supabaseSaved, setSupabaseSaved] = useState(false);

  const [phoneInput, setPhoneInput] = useState(phone || '+91 98490 28410');
  const [phoneSaved, setPhoneSaved] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Settings state
  const [companyName, setCompanyName] = useState('Agency Book Financial Group');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [timeZone, setTimeZone] = useState('EST (UTC-5)');
  const [marginAlertThreshold, setMarginAlertThreshold] = useState(74.0);
  const [runwayAlertMonths, setRunwayAlertMonths] = useState(6.0);
  const [arOverdueDays, setArOverdueDays] = useState(30);
  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    return localStorage.getItem('gemini_api_key') || localStorage.getItem('sme_gemini_api_key') || '';
  });
  const [accountingPlatform, setAccountingPlatform] = useState('QuickBooks Online');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [slackAlerts, setSlackAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);

  if (!isOpen) return null;

  const handleSave = () => {
    if (geminiApiKey.trim() && !geminiApiKey.includes('***')) {
      localStorage.setItem('gemini_api_key', geminiApiKey.trim());
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleReset = () => {
    setCurrency('USD');
    if (setLanguage) setLanguage('en');
    ctxSetLanguage('en');
    setMarginAlertThreshold(74.0);
    setRunwayAlertMonths(6.0);
    setArOverdueDays(30);
    setDateFormat('MM/DD/YYYY');
    setAccountingPlatform('QuickBooks Online');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-3xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all ${
          darkMode ? 'bg-[#0f1319] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className={`p-6 border-b flex items-center justify-between ${
          darkMode ? 'border-slate-800 bg-[#121721]' : 'border-slate-100 bg-slate-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">{t('settings_title')}</h2>
              <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {t('settings_desc')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              darkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className={`flex border-b px-4 sm:px-6 gap-2 overflow-x-auto whitespace-nowrap scrollbar-none ${darkMode ? 'border-slate-800 bg-[#0f1319]' : 'border-slate-100 bg-white'}`}>
          {[
            { id: 'general', label: t('tab_general'), icon: Globe },
            { id: 'thresholds', label: t('tab_thresholds'), icon: Sliders },
            { id: 'integrations', label: t('tab_integrations'), icon: Database },
            { id: 'notifications', label: t('tab_notifications'), icon: Bell },
            { id: 'security', label: t('Security & 2FA'), icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-sky-400 text-sky-400'
                    : darkMode
                    ? 'border-transparent text-slate-400 hover:text-slate-200'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'general' && (
            <div className="space-y-4">
              {/* Language Selection */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                  <label className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    <Languages className="w-4 h-4 text-sky-400" />
                    <span>{t('app_language')}</span>
                    <span className="text-[10px] text-sky-400 font-normal">({SUPPORTED_LANGUAGES.length} Languages)</span>
                  </label>

                  {/* Category Filter Tabs */}
                  <div className="flex gap-1">
                    {(['all', 'Indian', 'Global'] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setLangCategory(cat)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
                          langCategory === cat
                            ? darkMode ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'bg-sky-100 text-sky-700 border border-sky-300'
                            : darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {cat === 'all' ? `All (${SUPPORTED_LANGUAGES.length})` : cat === 'Indian' ? 'Indian (13)' : 'Global (8)'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search Input */}
                <div className="relative mb-2.5">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search language name or script (e.g. Tamil, हिन्दी, Spanish)..."
                    value={langSearch}
                    onChange={(e) => setLangSearch(e.target.value)}
                    className={`w-full pl-8 pr-3 py-1.5 rounded-xl text-xs font-medium border focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                      darkMode
                        ? 'bg-[#151c28] border-slate-800 text-slate-200 placeholder-slate-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>

                {/* Responsive Scrollable Language Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-72 overflow-y-auto pr-1">
                  {SUPPORTED_LANGUAGES.filter((langOpt) => {
                    const matchesCat = langCategory === 'all' || langOpt.category === langCategory;
                    const query = langSearch.trim().toLowerCase();
                    const matchesQuery = !query ||
                      langOpt.name.toLowerCase().includes(query) ||
                      langOpt.nativeName.toLowerCase().includes(query) ||
                      langOpt.code.toLowerCase().includes(query);
                    return matchesCat && matchesQuery;
                  }).map((langOpt) => {
                    const isSelected = activeLang === langOpt.code;
                    return (
                      <button
                        key={langOpt.code}
                        type="button"
                        onClick={() => {
                          ctxSetLanguage(langOpt.code);
                          if (setLanguage) setLanguage(langOpt.code);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-sky-500/15 border-sky-500 text-sky-400 shadow-sm shadow-sky-500/20'
                            : darkMode
                            ? 'bg-[#151a24] border-slate-800 text-slate-300 hover:border-slate-700'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-base">{langOpt.flag}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-sky-400" />}
                        </div>
                        <div className="mt-2">
                          <div className="text-xs font-bold truncate">{langOpt.nativeName}</div>
                          <div className={`text-[10px] truncate ${isSelected ? 'text-sky-300' : 'text-slate-500'}`}>
                            {langOpt.name}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {t('workspace_name')}
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                    darkMode ? 'bg-[#151a24] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    {t('primary_currency')}
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                      darkMode ? 'bg-[#151a24] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="USD">USD ($) · US Dollar</option>
                    <option value="INR">INR (₹) · Indian Rupee</option>
                    <option value="EUR">EUR (€) · Euro</option>
                    <option value="GBP">GBP (£) · British Pound</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    {t('date_format')}
                  </label>
                  <select
                    value={dateFormat}
                    onChange={(e) => setDateFormat(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                      darkMode ? 'bg-[#151a24] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY (US Standard)</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY (International)</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD (ISO Format)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {t('reporting_timezone')}
                </label>
                <select
                  value={timeZone}
                  onChange={(e) => setTimeZone(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                    darkMode ? 'bg-[#151a24] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="EST (UTC-5)">EST (UTC-5) · New York / Toronto</option>
                  <option value="PST (UTC-8)">PST (UTC-8) · San Francisco / LA</option>
                  <option value="IST (UTC+5:30)">IST (UTC+5:30) · New Delhi / Mumbai / Hyderabad</option>
                  <option value="GMT (UTC+0)">GMT (UTC+0) · London</option>
                </select>
              </div>

              {/* App Shortcut & Installation Section */}
              <div className={`p-4 rounded-xl border ${darkMode ? 'bg-[#141924] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                      {t('download_app_shortcut', 'App Shortcut & Offline Access')}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                    {t('Mobile, Desktop & PWA')}
                  </span>
                </div>
                <p className={`text-xs mb-3 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {t('download_shortcut_desc', 'Download desktop shortcut or install as a standalone progressive web app for instant 1-click access.')}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => downloadMobileShortcutHtml(window.location.href)}
                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer shadow-sm shadow-emerald-600/20"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>{t('install_mobile_btn', 'Download on Mobile Phone')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadWindowsShortcut(window.location.href)}
                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-white transition-all cursor-pointer shadow-sm shadow-sky-500/20"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>{t('desktop_shortcut_btn', 'Download Windows Shortcut')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const installed = await promptPWAInstall();
                      if (!installed) {
                        downloadWindowsShortcut(window.location.href);
                      }
                    }}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      darkMode
                        ? 'border-indigo-500/30 bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25'
                        : 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{t('install_pwa_btn', 'Install Web App (PWA)')}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'thresholds' && (
            <div className="space-y-5">
              <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Fine-tune autonomous trigger conditions that fire the <span className="text-amber-400 font-bold">WATCH</span> alert badges and score slippage warnings.
              </p>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    {t('Gross Margin Slippage Alert Threshold')}
                  </label>
                  <span className="text-sm font-bold font-mono text-sky-400">{marginAlertThreshold}%</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="90"
                  step="0.5"
                  value={marginAlertThreshold}
                  onChange={(e) => setMarginAlertThreshold(parseFloat(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
                <span className={`text-[11px] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  {t('Triggers an automated alert if gross margin drops below this value.')}
                </span>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    {t('Minimum Cash Runway Warning')}
                  </label>
                  <span className="text-sm font-bold font-mono text-amber-400">{runwayAlertMonths} {t('Months')}</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="12"
                  step="0.5"
                  value={runwayAlertMonths}
                  onChange={(e) => setRunwayAlertMonths(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <span className={`text-[11px] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  {t('Flags working capital vulnerability if cash burn exceeds this horizon.')}
                </span>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    {t('Accounts Receivable (AR) Overdue Trigger')}
                  </label>
                  <span className="text-sm font-bold font-mono text-rose-400">{arOverdueDays} {t('Days')}</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="90"
                  step="5"
                  value={arOverdueDays}
                  onChange={(e) => setArOverdueDays(parseInt(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
                <span className={`text-[11px] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  {t('Categorizes receivables beyond this duration under the "Overdue" pill badge.')}
                </span>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-4">
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {t('Connected Accounting Engine')}
                </label>
                <select
                  value={accountingPlatform}
                  onChange={(e) => setAccountingPlatform(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                    darkMode ? 'bg-[#151a24] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="QuickBooks Online">QuickBooks Online (Active Sync)</option>
                  <option value="Xero">Xero Accounting</option>
                  <option value="TallyPrime / GSTN">TallyPrime & GSTN API</option>
                  <option value="Zoho Books">Zoho Books Enterprise</option>
                </select>
              </div>

              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {t('Gemini AI Copilot & CFO API Key')}
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="Enter Gemini API Key (AIzaSy...)"
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    className={`flex-1 px-4 py-2.5 rounded-xl border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                      darkMode ? 'bg-[#151a24] border-slate-800 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                  <button
                    onClick={() => {
                      if (geminiApiKey.trim()) {
                        localStorage.setItem('gemini_api_key', geminiApiKey.trim());
                        alert('Gemini API Key saved and activated for AI Digital CFO!');
                      } else {
                        alert('Please enter a valid Gemini API key.');
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                  >
                    {t('Save & Test', 'Save & Test')}
                  </button>
                </div>
                <span className={`text-[11px] mt-1 block ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  {t('Used for real-time narrative summaries, AI Digital CFO dynamic reasoning, and anomaly discovery.')}
                </span>
              </div>

              {/* Supabase Cloud Authentication Configuration */}
              <div className={`p-4 rounded-xl border ${darkMode ? 'bg-[#0f172a]/70 border-emerald-500/30' : 'bg-emerald-50/50 border-emerald-200'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Cloud className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        {t('Supabase Cloud Authentication', 'Supabase Cloud Authentication')}
                        {supabaseConfig.isConfigured ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            {t('Active Connected', 'Active Connected')}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            {t('Local Fallback Active', 'Local Fallback Active')}
                          </span>
                        )}
                      </h4>
                      <p className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        {t('Provides production JWT authentication, live sessions, and user management across the portal.')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div>
                    <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      {t('Supabase Project URL')}
                    </label>
                    <input
                      type="text"
                      placeholder="https://xyzcompany.supabase.co"
                      value={supabaseUrlInput}
                      onChange={(e) => setSupabaseUrlInput(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        darkMode ? 'bg-[#151a24] border-slate-700 text-white placeholder-slate-600' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      {t('Supabase Anon Public API Key')}
                    </label>
                    <input
                      type="password"
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={supabaseKeyInput}
                      onChange={(e) => setSupabaseKeyInput(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        darkMode ? 'bg-[#151a24] border-slate-700 text-white placeholder-slate-600' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>

                  {supabaseSaved && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold py-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t('Supabase keys saved! Live authentication protocol active.', 'Supabase keys saved! Live authentication protocol active.')}</span>
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => {
                        if (!supabaseUrlInput.trim() || !supabaseKeyInput.trim()) {
                          alert('Please enter both Supabase Project URL and Anon API Key.');
                          return;
                        }
                        saveSupabaseKeys(supabaseUrlInput.trim(), supabaseKeyInput.trim());
                        setSupabaseSaved(true);
                        setTimeout(() => setSupabaseSaved(false), 3000);
                      }}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{t('Save Supabase Credentials', 'Save Supabase Credentials')}</span>
                    </button>

                    {supabaseConfig.isConfigured && (
                      <button
                        onClick={() => {
                          clearSupabaseKeys();
                          setSupabaseUrlInput('');
                          setSupabaseKeyInput('');
                          alert('Supabase credentials removed from local storage.');
                        }}
                        className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                          darkMode ? 'border-rose-500/40 text-rose-300 hover:bg-rose-500/20' : 'border-rose-200 text-rose-700 hover:bg-rose-50'
                        }`}
                      >
                        {t('Clear Keys', 'Clear Keys')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                darkMode ? 'bg-[#141923] border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <h4 className="text-sm font-bold">{t('Email Anomaly Alerts')}</h4>
                  <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {t('Send real-time alerts when margin slips below')} {marginAlertThreshold}%.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="w-5 h-5 accent-sky-500 rounded cursor-pointer"
                />
              </div>

              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                darkMode ? 'bg-[#141923] border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <h4 className="text-sm font-bold">{t('Slack Webhook Notifications')}</h4>
                  <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {t('Broadcast monthly scorecards and runway alerts to your team channel.')}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={slackAlerts}
                  onChange={(e) => setSlackAlerts(e.target.checked)}
                  className="w-5 h-5 accent-sky-500 rounded cursor-pointer"
                />
              </div>

              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                darkMode ? 'bg-[#141923] border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <h4 className="text-sm font-bold">{t('Weekly Performance Digest')}</h4>
                  <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {t('Receive a consolidated executive digest every Monday at 08:00 AM.')}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={weeklyDigest}
                  onChange={(e) => setWeeklyDigest(e.target.checked)}
                  className="w-5 h-5 accent-sky-500 rounded cursor-pointer"
                />
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                darkMode ? 'bg-[#141923] border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-bold">{t('Two-Factor Authentication (2FA)')}</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      is2FAEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {is2FAEnabled ? t('ACTIVE') : t('OFF')}
                    </span>
                  </div>
                  <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {t('Mandate 6-digit TOTP / SMS verification on each terminal login (Demo OTP: 123456).')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleTwoFactor(!is2FAEnabled)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    is2FAEnabled
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20'
                      : 'bg-emerald-500 text-white hover:bg-emerald-600'
                  }`}
                >
                  {is2FAEnabled ? t('Disable 2FA') : t('Enable 2FA')}
                </button>
              </div>

              {/* Registered Mobile Phone for 2FA */}
              <div className={`p-4 rounded-xl border space-y-3 ${
                darkMode ? 'bg-[#141923] border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">{t('Registered Mobile for 2FA Verification')}</h4>
                      <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {t('SMS and WhatsApp OTP security codes will be transmitted to this verified mobile number.')}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {t('2FA Verified')}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={phoneInput}
                      onChange={(e) => {
                        setPhoneInput(e.target.value);
                        setPhoneSaved(false);
                      }}
                      placeholder="+91 98490 28410"
                      className={`w-full px-3 py-2 rounded-xl border text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        darkMode ? 'bg-[#18202d] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      updateUserPhone(phoneInput);
                      setPhoneSaved(true);
                      setTimeout(() => setPhoneSaved(false), 3000);
                    }}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{t('Save Mobile')}</span>
                  </button>
                </div>

                {phoneSaved && (
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                    <Check className="w-3.5 h-3.5" />
                    <span>Mobile number updated successfully: <strong>{phoneInput}</strong></span>
                  </div>
                )}

                {/* Preferred Method Selection */}
                <div className="pt-1 flex items-center gap-3 text-xs flex-wrap">
                  <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>{t('Default Channel:')}</span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="method_radio"
                        checked={twoFactorMethod === 'sms' || twoFactorMethod === 'both'}
                        onChange={() => setTwoFactorMethod('both')}
                        className="accent-emerald-500"
                      />
                      <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>📱 {t('Mobile SMS & WhatsApp')}</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="method_radio"
                        checked={twoFactorMethod === 'totp'}
                        onChange={() => setTwoFactorMethod('totp')}
                        className="accent-emerald-500"
                      />
                      <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>🔐 {t('Authenticator App Only')}</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                darkMode ? 'bg-[#141923] border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <h4 className="text-sm font-bold">{t('Inactivity Auto-Lock')}</h4>
                  <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {t('Automatically lock the screen after idle timeout.')} ({t('Default Terminal PIN')}: {pinCode})
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  {[5, 15, 30, 0].map(mins => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setAutoLockMinutes(mins)}
                      className={`px-2.5 py-1 text-xs rounded font-medium transition-colors cursor-pointer ${
                        autoLockMinutes === mins
                          ? 'bg-cyan-500 text-white font-bold'
                          : darkMode
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      {mins === 0 ? t('Never') : `${mins}m`}
                    </button>
                  ))}
                </div>
              </div>

              <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                darkMode ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
              }`}>
                <div>
                  <h4 className="text-sm font-bold text-emerald-400">{t('Security & Trust Center Hub')}</h4>
                  <p className={`text-xs ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    {t('View concurrent sessions, revoke remote devices, inspect audit trails, and export access records.')}
                  </p>
                </div>
                {onOpenSecurityCenter && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenSecurityCenter();
                    }}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-colors cursor-pointer whitespace-nowrap shadow-sm"
                  >
                    {t('Open Security Center')}
                  </button>
                )}
              </div>
            </div>
          )}

          {savedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4" />
              Settings updated successfully and persisted to active workspace.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-4 sm:p-6 border-t flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 ${
          darkMode ? 'border-slate-800 bg-[#121721]' : 'border-slate-100 bg-slate-50'
        }`}>
          <button
            onClick={handleReset}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            {t('reset_defaults')}
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer text-center ${
                darkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleSave}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-white shadow-md shadow-sky-500/20 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {t('save_settings')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
