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
  Download,
  Monitor,
  Smartphone,
  Phone,
  MessageSquare,
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
  language = 'en',
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
  } = useAuth();

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

  const t = (key: string) => getTranslation(language, key);

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
        <div className={`flex border-b px-6 gap-2 ${darkMode ? 'border-slate-800 bg-[#0f1319]' : 'border-slate-100 bg-white'}`}>
          {[
            { id: 'general', label: t('tab_general'), icon: Globe },
            { id: 'thresholds', label: t('tab_thresholds'), icon: Sliders },
            { id: 'integrations', label: t('tab_integrations'), icon: Database },
            { id: 'notifications', label: t('tab_notifications'), icon: Bell },
            { id: 'security', label: 'Security & 2FA', icon: Shield },
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
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  <Languages className="w-4 h-4 text-sky-400" />
                  <span>{t('app_language')}</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {SUPPORTED_LANGUAGES.map((langOpt) => {
                    const isSelected = language === langOpt.code;
                    return (
                      <button
                        key={langOpt.code}
                        type="button"
                        onClick={() => setLanguage && setLanguage(langOpt.code)}
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
                          <div className="text-xs font-bold">{langOpt.nativeName}</div>
                          <div className={`text-[10px] ${isSelected ? 'text-sky-300' : 'text-slate-500'}`}>
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
                    Mobile, Desktop & PWA
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
                    Gross Margin Slippage Alert Threshold
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
                  Triggers an automated alert if gross margin drops below this value.
                </span>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Minimum Cash Runway Warning
                  </label>
                  <span className="text-sm font-bold font-mono text-amber-400">{runwayAlertMonths} Months</span>
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
                  Flags working capital vulnerability if cash burn exceeds this horizon.
                </span>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Accounts Receivable (AR) Overdue Trigger
                  </label>
                  <span className="text-sm font-bold font-mono text-rose-400">{arOverdueDays} Days</span>
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
                  Categorizes receivables beyond this duration under the "Overdue" pill badge.
                </span>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-4">
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Connected Accounting Engine
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
                  Gemini AI Copilot & CFO API Key
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
                    Save & Test
                  </button>
                </div>
                <span className={`text-[11px] mt-1 block ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  Used for real-time narrative summaries, AI Digital CFO dynamic reasoning, and anomaly discovery.
                </span>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                darkMode ? 'bg-[#141923] border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <h4 className="text-sm font-bold">Email Anomaly Alerts</h4>
                  <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Send real-time alerts when margin slips below {marginAlertThreshold}%.
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
                  <h4 className="text-sm font-bold">Slack Webhook Notifications</h4>
                  <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Broadcast monthly scorecards and runway alerts to your team channel.
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
                  <h4 className="text-sm font-bold">Weekly Performance Digest</h4>
                  <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Receive a consolidated executive digest every Monday at 08:00 AM.
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
                    <h4 className="text-sm font-bold">Two-Factor Authentication (2FA)</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      is2FAEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {is2FAEnabled ? 'ACTIVE' : 'OFF'}
                    </span>
                  </div>
                  <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Mandate 6-digit TOTP / SMS verification on each terminal login (Demo OTP: 123456).
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
                  {is2FAEnabled ? 'Disable 2FA' : 'Enable 2FA'}
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
                      <h4 className="text-sm font-bold">Registered Mobile for 2FA Verification</h4>
                      <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        SMS and WhatsApp OTP security codes will be transmitted to this verified mobile number.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    2FA Verified
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
                    <span>Save Mobile</span>
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
                  <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Default Channel:</span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="method_radio"
                        checked={twoFactorMethod === 'sms' || twoFactorMethod === 'both'}
                        onChange={() => setTwoFactorMethod('both')}
                        className="accent-emerald-500"
                      />
                      <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>📱 Mobile SMS & WhatsApp</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="method_radio"
                        checked={twoFactorMethod === 'totp'}
                        onChange={() => setTwoFactorMethod('totp')}
                        className="accent-emerald-500"
                      />
                      <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>🔐 Authenticator App Only</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                darkMode ? 'bg-[#141923] border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <h4 className="text-sm font-bold">Inactivity Auto-Lock</h4>
                  <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Automatically lock the screen after idle timeout. (Default Terminal PIN: {pinCode})
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
                      {mins === 0 ? 'Never' : `${mins}m`}
                    </button>
                  ))}
                </div>
              </div>

              <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                darkMode ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
              }`}>
                <div>
                  <h4 className="text-sm font-bold text-emerald-400">Security & Trust Center Hub</h4>
                  <p className={`text-xs ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    View concurrent sessions, revoke remote devices, inspect audit trails, and export access records.
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
                    Open Security Center
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
        <div className={`p-6 border-t flex items-center justify-between ${
          darkMode ? 'border-slate-800 bg-[#121721]' : 'border-slate-100 bg-slate-50'
        }`}>
          <button
            onClick={handleReset}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            {t('reset_defaults')}
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                darkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-white shadow-md shadow-sky-500/20 transition-all cursor-pointer"
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
