import React from 'react';
import {
  LayoutGrid,
  FileText,
  Briefcase,
  Percent,
  Wallet,
  TrendingUp,
  Settings,
  LogOut,
  Map,
  ShieldAlert,
  Sliders,
  Sparkles,
  Download,
  ShieldCheck,
  Bot,
} from 'lucide-react';
import { SupportedLanguage, getTranslation } from '../utils/translations';
import { useUserProfile } from '../context/UserProfileContext';

interface AgencySidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  darkMode: boolean;
  language?: SupportedLanguage;
  onOpenSettings: () => void;
  onLogout: () => void;
  onOpenShortcutModal?: () => void;
  onOpenProfile?: () => void;
  onOpenSecurityCenter?: () => void;
}

export const AgencySidebar: React.FC<AgencySidebarProps> = ({
  currentTab,
  setCurrentTab,
  darkMode,
  language = 'en',
  onOpenSettings,
  onLogout,
  onOpenShortcutModal,
  onOpenProfile,
  onOpenSecurityCenter,
}) => {
  const { profile } = useUserProfile();
  const t = (key: string) => getTranslation(language, key);

  const mainNavItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutGrid },
    { id: 'scorecards', label: t('scorecards'), icon: FileText },
    { id: 'clients', label: t('clients'), icon: Briefcase },
    { id: 'profitability', label: t('profitability'), icon: Percent },
    { id: 'cash', label: 'Cash-Flow Forecast', icon: Wallet },
    { id: 'cfo', label: 'AI Digital CFO', icon: Bot },
    { id: 'growth', label: t('growth'), icon: TrendingUp },
  ];

  return (
    <aside
      className={`w-64 shrink-0 flex flex-col justify-between border-r transition-colors z-20 ${
        darkMode ? 'bg-[#121722] border-slate-800/80 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
      }`}
    >
      {/* Top Brand & Navigation */}
      <div className="p-4 space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            A
          </div>
          <span className={`font-bold text-base tracking-tight ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
            Agency Book
          </span>
        </div>

        {/* Primary Nav List */}
        <nav className="space-y-1.5">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left cursor-pointer ${
                  isActive
                    ? darkMode
                      ? 'bg-sky-950/40 text-sky-300 font-semibold border border-sky-500/30 shadow-xs'
                      : 'bg-sky-50 text-sky-600 font-semibold border border-sky-200 shadow-xs'
                    : darkMode
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? (darkMode ? 'text-sky-300' : 'text-sky-600') : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Setting Item */}
          <button
            onClick={onOpenSettings}
            className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left cursor-pointer ${
              darkMode
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>{t('setting')}</span>
          </button>
        </nav>

        {/* Extended Tools / Sentinel Ecosystem */}
        <div className="pt-4 border-t border-slate-800/60">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {t('advanced_intelligence')}
          </div>
          <div className="space-y-1">
            <button
              onClick={() => setCurrentTab('map')}
              className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                currentTab === 'map'
                  ? darkMode ? 'bg-sky-950/40 text-sky-300 border border-sky-500/20' : 'bg-slate-200 text-slate-900'
                  : darkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Map className={`w-3.5 h-3.5 ${currentTab === 'map' ? 'text-sky-300' : 'text-slate-400'}`} />
              <span>{t('real_world_map')}</span>
            </button>

            <button
              onClick={() => setCurrentTab('alerts')}
              className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                currentTab === 'alerts'
                  ? darkMode ? 'bg-sky-950/40 text-sky-300 border border-sky-500/20' : 'bg-slate-200 text-slate-900'
                  : darkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShieldAlert className={`w-3.5 h-3.5 ${currentTab === 'alerts' ? 'text-sky-300' : 'text-slate-400'}`} />
              <span>{t('early_warnings')}</span>
            </button>

            <button
              onClick={() => setCurrentTab('simulator')}
              className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                currentTab === 'simulator'
                  ? darkMode ? 'bg-sky-950/40 text-sky-300 border border-sky-500/20' : 'bg-slate-200 text-slate-900'
                  : darkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sliders className={`w-3.5 h-3.5 ${currentTab === 'simulator' ? 'text-sky-300' : 'text-slate-400'}`} />
              <span>{t('macro_simulator')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Actions: User Profile, Shortcut Download & Logout */}
      <div className="p-4 border-t border-slate-800/60 space-y-2">
        {/* Active Profile Tile */}
        {onOpenProfile && (
          <button
            onClick={onOpenProfile}
            className={`w-full flex items-center gap-2.5 p-2 rounded-xl transition-all text-left cursor-pointer border ${
              darkMode
                ? 'bg-[#151c27] border-slate-800/80 hover:border-slate-700 text-slate-200 hover:bg-slate-800/50'
                : 'bg-slate-100 border-slate-200 hover:bg-slate-200/70 text-slate-900'
            }`}
            title="Switch or Edit Profile"
          >
            <div className="relative shrink-0">
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-7 h-7 rounded-full object-cover border border-slate-700"
              />
              <span className="w-2 h-2 rounded-full bg-emerald-500 absolute bottom-0 right-0 border border-[#0e1217]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold truncate leading-tight">{profile.name}</div>
              <div className={`text-[10px] truncate leading-tight ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {profile.title}
              </div>
            </div>
          </button>
        )}

        {onOpenShortcutModal && (
          <button
            onClick={onOpenShortcutModal}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors text-left cursor-pointer border ${
              darkMode
                ? 'border-sky-500/20 text-sky-400 hover:bg-sky-500/10 hover:border-sky-500/40'
                : 'border-sky-200 text-sky-700 hover:bg-sky-50 hover:border-sky-300'
            }`}
            title="Download desktop shortcut or install app"
          >
            <Download className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="truncate">{t('download_app_shortcut', 'Download Shortcut')}</span>
          </button>
        )}

        {onOpenSecurityCenter && (
          <button
            onClick={onOpenSecurityCenter}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors text-left cursor-pointer border ${
              darkMode
                ? 'border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/40'
                : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300'
            }`}
            title="Security Center & Session Guard"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">Security & 2FA</span>
          </button>
        )}

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors text-left cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-rose-400" />
          <span>{t('logout')}</span>
        </button>
      </div>
    </aside>
  );
};
