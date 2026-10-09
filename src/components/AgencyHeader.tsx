import React, { useState } from 'react';
import {
  Search,
  Moon,
  Sun,
  Bell,
  CheckCircle2,
  X,
  Settings,
  Globe,
  Check,
  Download,
  ChevronDown,
  User,
  Edit3,
  UserCheck,
  Sparkles,
  Command,
  ShieldCheck,
  Lock,
  LogOut,
} from 'lucide-react';
import { SupportedLanguage, SUPPORTED_LANGUAGES, getTranslation } from '../utils/translations';
import { useUserProfile } from '../context/UserProfileContext';
import { GlobalSearchPalette } from './GlobalSearchPalette';

interface AgencyHeaderProps {
  title: string;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  darkMode: boolean;
  setDarkMode: (d: boolean) => void;
  language?: SupportedLanguage;
  setLanguage?: (lang: SupportedLanguage) => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onOpenShortcutModal?: () => void;
  onOpenSecurityCenter?: () => void;
  onLockSession?: () => void;
  onLogout?: () => void;
  onNavigate?: (tab: string) => void;
  onSelectState?: (stateId: string) => void;
  onSelectShockPreset?: (presetId: string) => void;
}

export const AgencyHeader: React.FC<AgencyHeaderProps> = ({
  title,
  searchQuery,
  setSearchQuery,
  darkMode,
  setDarkMode,
  language = 'en',
  setLanguage,
  onOpenProfile,
  onOpenSettings,
  onOpenShortcutModal,
  onOpenSecurityCenter,
  onLockSession,
  onLogout,
  onNavigate,
  onSelectState,
  onSelectShockPreset,
}) => {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [searchPaletteOpen, setSearchPaletteOpen] = useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Global keyboard shortcut: Ctrl+K or / to focus search
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.key.toLowerCase() === 'k') || (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA')) {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const { profile } = useUserProfile();

  const t = (key: string, fallback?: string) => getTranslation(language, key, fallback);

  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <header
      className={`h-16 px-4 sm:px-6 flex items-center justify-between border-b transition-colors z-10 relative ${
        darkMode
          ? 'bg-[#121722] border-slate-800/80 text-slate-100'
          : 'bg-white border-slate-200 text-slate-900'
      }`}
    >
      {/* Left: Title & Search Bar */}
      <div className="flex items-center gap-4 sm:gap-6 flex-1 max-w-2xl">
        <h1 className={`text-xl md:text-2xl font-bold tracking-tight shrink-0 capitalize ${searchPaletteOpen ? 'hidden md:block' : 'block'}`}>
          {title}
        </h1>

        <div className={`relative w-full max-w-sm ${searchPaletteOpen ? 'block' : 'hidden sm:block'}`}>
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder={t('search_placeholder', 'Search all features, states, tools... (Ctrl+K)')}
            value={searchQuery}
            onFocus={() => setSearchPaletteOpen(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchPaletteOpen(true);
            }}
            className={`w-full pl-9 pr-16 py-1.5 rounded-xl text-xs font-medium border transition-colors focus:outline-none focus:ring-1 focus:ring-sky-500 ${
              darkMode
                ? 'bg-[#151c28] border-slate-800 text-slate-200 placeholder-slate-500'
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
            }`}
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searchQuery ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchPaletteOpen(false);
                }}
                className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
                title="Clear Search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border pointer-events-none hidden md:inline ${
                darkMode ? 'bg-slate-800/80 border-slate-700 text-slate-400' : 'bg-slate-200 border-slate-300 text-slate-500'
              }`}>
                ⌘K
              </span>
            )}
          </div>

          {/* Global Omni-Search Feature Palette */}
          <GlobalSearchPalette
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isOpen={searchPaletteOpen}
            onClose={() => setSearchPaletteOpen(false)}
            darkMode={darkMode}
            onNavigate={onNavigate}
            onSelectState={onSelectState}
            onSelectShockPreset={onSelectShockPreset}
            onOpenSettings={onOpenSettings}
            onOpenProfile={onOpenProfile}
            onOpenShortcutModal={onOpenShortcutModal}
            onOpenSecurityCenter={onOpenSecurityCenter}
            onLockSession={onLockSession}
            onLogout={onLogout}
            setDarkMode={setDarkMode}
          />
        </div>
      </div>

      {/* Right Controls: Shortcut Download, Language Selector, Theme Toggle, Notifications, User Profile Avatar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Search Toggle Icon */}
        <button
          onClick={() => {
            setSearchPaletteOpen(!searchPaletteOpen);
            if (!searchPaletteOpen) {
              setTimeout(() => searchInputRef.current?.focus(), 50);
            }
          }}
          className={`sm:hidden p-2 rounded-xl border transition-colors cursor-pointer ${
            darkMode ? 'bg-[#141923] border-slate-800 text-slate-300 hover:bg-slate-800' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
          }`}
          title="Search"
        >
          <Search className="w-4 h-4" />
        </button>
        {/* Download App Shortcut Button */}
        {onOpenShortcutModal && (
          <button
            onClick={onOpenShortcutModal}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              darkMode
                ? 'bg-gradient-to-r from-sky-500/15 to-indigo-500/15 border-sky-500/30 text-sky-300 hover:border-sky-400 hover:text-white hover:shadow-lg hover:shadow-sky-500/10'
                : 'bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100 hover:text-sky-900'
            }`}
            title="Download App Shortcut / Install PWA"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">
              {t('download_app_shortcut', 'Download Shortcut')}
            </span>
          </button>
        )}

        {/* Quick Language Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setLangMenuOpen(!langMenuOpen);
              setNotificationOpen(false);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              darkMode
                ? 'bg-[#141923] border-slate-800 text-slate-200 hover:border-slate-700'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
            title="Change Application Language"
          >
            <span className="text-sm">{currentLangObj.flag}</span>
            <span className="hidden md:inline">{currentLangObj.nativeName}</span>
          </button>

          {langMenuOpen && (
            <div
              className={`absolute right-0 mt-2 w-48 rounded-2xl border shadow-2xl p-2 z-50 animate-in fade-in ${
                darkMode ? 'bg-[#12161f] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/60 mb-1">
                {t('switch_language', 'Language')} / భాష / भाषा
              </div>
              <div className="space-y-0.5">
                {SUPPORTED_LANGUAGES.map((langOpt) => {
                  const isSelected = language === langOpt.code;
                  return (
                    <button
                      key={langOpt.code}
                      onClick={() => {
                        if (setLanguage) setLanguage(langOpt.code);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left cursor-pointer ${
                        isSelected
                          ? darkMode ? 'bg-sky-500/15 text-sky-400 font-bold' : 'bg-sky-50 text-sky-600 font-bold'
                          : darkMode ? 'text-slate-300 hover:bg-slate-800/80 hover:text-white' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{langOpt.flag}</span>
                        <span>{langOpt.nativeName}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-sky-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Security & Hardening Center Button */}
        {onOpenSecurityCenter && (
          <button
            onClick={onOpenSecurityCenter}
            className={`p-2 rounded-xl transition-colors relative cursor-pointer ${
              darkMode
                ? 'hover:bg-slate-800 text-emerald-400 hover:text-emerald-300'
                : 'hover:bg-slate-100 text-emerald-600 hover:text-emerald-700'
            }`}
            title="Security & Trust Center (Tier-4 Enforced)"
            aria-label="Security Center"
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute top-2 right-2 ring-2 ring-[#121722]" />
          </button>
        )}

        {/* Dark/Light Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-2 rounded-xl transition-colors cursor-pointer ${
            darkMode
              ? 'hover:bg-slate-800 text-slate-400 hover:text-white'
              : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
          }`}
          title="Toggle Day/Night Theme"
          aria-label="Toggle theme"
        >
          {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-500" />}
        </button>

        {/* Notifications Icon with Popup */}
        <div className="relative">
          <button
            onClick={() => {
              setNotificationOpen(!notificationOpen);
              setLangMenuOpen(false);
            }}
            className={`p-2 rounded-xl transition-colors relative cursor-pointer ${
              darkMode
                ? 'hover:bg-slate-800 text-slate-400 hover:text-white'
                : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-amber-500 absolute top-2 right-2 animate-pulse" />
          </button>

          {notificationOpen && (
            <div
              className={`absolute right-0 mt-2 w-80 rounded-2xl border shadow-2xl p-4 space-y-3 z-50 animate-in fade-in ${
                darkMode ? 'bg-[#151c27] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between border-b pb-2 border-slate-800/80">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{t('alerts_feed')}</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-950/40 text-amber-300 border border-amber-800/50 font-bold">
                  1 New
                </span>
              </div>
              <div className="text-xs space-y-1">
                <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Gross Margin Slippage Warning
                </div>
                <div className={`text-[11px] leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  {t('alert_text')}
                </div>
              </div>
              <button
                onClick={() => {
                  setNotificationOpen(false);
                  onOpenSettings();
                }}
                className="w-full py-1.5 text-center text-[11px] font-semibold text-sky-400 hover:text-sky-300 hover:underline cursor-pointer"
              >
                {t('configure_thresholds')}
              </button>
            </div>
          )}
        </div>

        {/* User Profile Avatar with Quick Persona Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileMenuOpen(!profileMenuOpen);
              setNotificationOpen(false);
              setLangMenuOpen(false);
            }}
            className={`flex items-center gap-2.5 p-1 rounded-2xl border transition-all cursor-pointer ${
              darkMode
                ? 'bg-[#141923] border-slate-800 hover:border-slate-700 text-white'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-900'
            }`}
            title="Switch Profile or Edit Details"
          >
            <div className="relative">
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-700 shadow-sm"
              />
              <span className="w-2 h-2 rounded-full bg-emerald-500 border border-[#0e1217] absolute bottom-0 right-0" />
            </div>

            <div className="hidden lg:flex flex-col text-left pr-1">
              <span className="text-xs font-bold leading-tight flex items-center gap-1">
                {profile.name}
              </span>
              <span className={`text-[10px] leading-tight truncate max-w-[110px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {profile.title}
              </span>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block mr-1" />
          </button>

          {profileMenuOpen && (
            <div
              className={`absolute right-0 mt-2 w-72 rounded-2xl border shadow-2xl p-3 z-50 animate-in fade-in ${
                darkMode ? 'bg-[#12161f] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              {/* Profile Card Header */}
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800/80">
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-sky-500/40 shadow"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold truncate">{profile.name}</h4>
                  <p className="text-[10px] text-slate-400 truncate">{profile.title}</p>
                  <span className="inline-block mt-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400">
                    Active Session
                  </span>
                </div>
              </div>

              {/* Actions: Edit Profile Details & Settings */}
              <div className="pt-2 space-y-1">
                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    onOpenProfile();
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    darkMode ? 'bg-sky-500/10 text-sky-400 hover:bg-sky-500/20' : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile & Avatar</span>
                </button>

                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    onOpenSettings();
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800/60' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Settings & Preferences</span>
                </button>

                {onOpenSecurityCenter && (
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      onOpenSecurityCenter();
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                      darkMode ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Security Center & 2FA</span>
                  </button>
                )}

                {onLockSession && (
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      onLockSession();
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                      darkMode ? 'text-amber-400 hover:bg-amber-500/10' : 'text-amber-700 hover:bg-amber-50'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Lock Terminal PIN</span>
                  </button>
                )}

                {onLogout && (
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer border-t border-slate-800/60 mt-1 pt-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out of Terminal</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
