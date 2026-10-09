import React, { useState } from 'react';
import { UserRole } from '../types';
import { Moon, Sun, ChevronDown, Menu, X, Landmark, Building2, User } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  onOpenTour?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  userRole,
  setUserRole,
  darkMode,
  setDarkMode,
  onOpenTour,
}) => {
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'map', label: 'Live Map' },
    { id: 'heatmap', label: 'Risk Heatmap' },
    { id: 'analyzer', label: 'AI Risk Analyzer' },
    { id: 'sectors', label: 'Sectors' },
    { id: 'forecast', label: 'Forecast' },
    { id: 'simulator', label: 'Crisis Simulator' },
    { id: 'intervention', label: 'Intervention Simulator' },
    { id: 'alerts', label: 'Early Warnings' },
    { id: 'insights', label: 'AI Insights' },
  ];

  const roleMeta = {
    government: { label: 'Government / Policy', icon: Landmark, badge: 'Policy Intelligence' },
    financial_institution: { label: 'Financial Institution', icon: Building2, badge: 'Credit Risk' },
    sme_owner: { label: 'SME Owner', icon: User, badge: 'Enterprise Sandbox' },
  };

  const CurrentRoleIcon = roleMeta[userRole].icon;

  return (
    <header className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors ${
      darkMode ? 'bg-slate-950/90 border-slate-800' : 'bg-white/90 border-slate-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-sm">
              <span className="font-bold text-white text-base tracking-tighter">SS</span>
            </div>
            <div>
              <span className={`text-lg font-extrabold tracking-tight block ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                SME-SENTINEL
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((link) => {
            const isActive = currentTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setCurrentTab(link.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? darkMode
                      ? 'bg-slate-800 text-amber-400 shadow-xs'
                      : 'bg-slate-100 text-slate-900 shadow-xs font-semibold'
                    : darkMode
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions (Role Selector, Presentation Tour, Dark Mode) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Role Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                darkMode
                  ? 'bg-slate-900 border-slate-700 text-slate-200 hover:border-slate-600'
                  : 'bg-slate-50 border-slate-300 text-slate-800 hover:border-slate-400'
              }`}
            >
              <CurrentRoleIcon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap font-medium">{roleMeta[userRole].label}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {roleMenuOpen && (
              <div
                className={`absolute right-0 mt-2 w-56 rounded-xl border p-1.5 shadow-xl z-50 ${
                  darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
                }`}
              >
                <div className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Active View Role
                </div>
                {(['government', 'financial_institution', 'sme_owner'] as UserRole[]).map((role) => {
                  const item = roleMeta[role];
                  const Icon = item.icon;
                  const isSelected = userRole === role;
                  return (
                    <button
                      key={role}
                      onClick={() => {
                        setUserRole(role);
                        setRoleMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 text-xs rounded-lg transition-colors text-left cursor-pointer ${
                        isSelected
                          ? darkMode
                            ? 'bg-amber-500/15 text-amber-300 font-medium'
                            : 'bg-amber-50 text-amber-900 font-semibold'
                          : darkMode
                          ? 'text-slate-300 hover:bg-slate-800'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>{item.label}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{item.badge}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
              darkMode
                ? 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900'
            }`}
            aria-label="Toggle color theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`lg:hidden p-2 rounded-lg border transition-colors cursor-pointer ${
              darkMode ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className={`lg:hidden border-b px-4 py-3 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="grid grid-cols-2 gap-1.5">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  setCurrentTab(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-2 text-xs font-medium rounded-lg text-left transition-colors cursor-pointer ${
                  currentTab === link.id
                    ? darkMode
                      ? 'bg-amber-500/20 text-amber-300 font-semibold'
                      : 'bg-amber-50 text-amber-900 font-semibold'
                    : darkMode
                    ? 'text-slate-300 hover:bg-slate-800'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
