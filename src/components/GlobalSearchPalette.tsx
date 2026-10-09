import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  LayoutGrid,
  FileText,
  Briefcase,
  Percent,
  Wallet,
  TrendingUp,
  Map,
  ShieldAlert,
  Sliders,
  Flame,
  FileCheck2,
  Cpu,
  Bot,
  Settings,
  User,
  Download,
  Smartphone,
  Globe,
  Sun,
  Moon,
  ChevronRight,
  Sparkles,
  MapPin,
  ArrowRight,
  X,
  Command,
  Zap,
  Activity,
  AlertTriangle,
  ShieldCheck,
  Lock,
  LogOut,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export interface SearchItem {
  id: string;
  title: string;
  category: 'Simulate' | 'Views' | 'Clusters' | 'Actions' | 'SME Cases';
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  tags: string[];
  tab?: string;
  stateId?: string;
  presetId?: string;
  action?: 'settings' | 'profile' | 'shortcut' | 'mobile_qr' | 'theme' | 'ai_copilot' | 'language' | 'security' | 'lock' | 'logout';
}

interface GlobalSearchPaletteProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  onNavigate?: (tab: string) => void;
  onSelectState?: (stateId: string) => void;
  onSelectShockPreset?: (presetId: string) => void;
  onOpenSettings?: () => void;
  onOpenProfile?: () => void;
  onOpenShortcutModal?: () => void;
  onOpenSecurityCenter?: () => void;
  onLockSession?: () => void;
  onLogout?: () => void;
  setDarkMode?: (d: boolean) => void;
}

export const GlobalSearchPalette: React.FC<GlobalSearchPaletteProps> = ({
  searchQuery,
  setSearchQuery,
  isOpen,
  onClose,
  darkMode,
  onNavigate,
  onSelectState,
  onSelectShockPreset,
  onOpenSettings,
  onOpenProfile,
  onOpenShortcutModal,
  setDarkMode,
}) => {
  const { t } = useLanguage();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const paletteRef = useRef<HTMLDivElement>(null);

  // Search items catalog covering all features, views, simulation shocks, states, and actions
  const searchCatalog: SearchItem[] = useMemo(() => [
    // 1. ECONOMIC SHOCK SIMULATION (Direct Deep Action Matching User Request)
    {
      id: 'simulate-economic-shock',
      title: 'Simulate Economic Shock (Macro Stress Test)',
      category: 'Simulate',
      subtitle: 'Simulate interest rate hikes, commodity inflation, demand drop & loan multiplier shocks',
      icon: Sliders,
      tags: [
        'simulate economic shock',
        'economic shock',
        'simulate economic s shock',
        'simulate shock',
        'economic shocks',
        'simulate economic',
        'simulate shocks',
        'macro shock',
        'crisis shock',
        'economic crisis',
        'simulate crisis',
        'stress simulation',
        'shock',
        'simulate',
      ],
      tab: 'simulator',
      presetId: 'crude_commodity_shock',
    },
    {
      id: 'simulate-commodity-fuel-shock',
      title: 'Simulate Crude Oil & Commodity Fuel Spike (+20%)',
      category: 'Simulate',
      subtitle: 'Crude breaks $95/bbl, +18% raw material inflation, +12% opex surge across manufacturing',
      icon: Zap,
      tags: [
        'commodity shock',
        'fuel shock',
        'crude oil shock',
        'oil spike',
        'raw material inflation',
        'simulate oil',
        'simulate commodity',
        'economic shock',
      ],
      tab: 'simulator',
      presetId: 'crude_commodity_shock',
    },
    {
      id: 'simulate-rbi-rate-hike',
      title: 'Simulate RBI 200 bps Rate Hike & Liquidity Squeeze',
      category: 'Simulate',
      subtitle: 'Central bank monetary tightening pushing MSME borrowing rates to 11.5% with 25-day payment delays',
      icon: TrendingUp,
      tags: [
        'rbi rate hike',
        'rate hike',
        'monetary shock',
        'interest rate shock',
        'liquidity squeeze',
        'repo rate',
        'simulate rate hike',
        'economic shock',
      ],
      tab: 'simulator',
      presetId: 'rbi_tightening_squeeze',
    },
    {
      id: 'simulate-export-recession',
      title: 'Simulate Western Export Recession & Trade Chokepoint',
      category: 'Simulate',
      subtitle: '-22% demand contraction in US/EU markets hitting apparel, gems & engineering export MSMEs',
      icon: AlertTriangle,
      tags: [
        'export recession',
        'trade shock',
        'demand contraction',
        'export slowdown',
        'tariff chokepoint',
        'simulate trade',
        'economic shock',
      ],
      tab: 'simulator',
      presetId: 'export_recession_slowdown',
    },
    {
      id: 'simulate-policy-intervention',
      title: 'Simulate Policy Interventions & Factoring Relief',
      category: 'Simulate',
      subtitle: 'Model ₹2,500 Cr TReDS factoring windows, 90-day bank loan moratoriums & GST refunds',
      icon: ShieldAlert,
      tags: [
        'simulate intervention',
        'policy intervention',
        'treds factoring',
        'loan moratorium',
        'relief package',
        'policy simulation',
        'simulate relief',
      ],
      tab: 'intervention',
    },
    {
      id: 'simulate-what-if-sme',
      title: 'Simulate SME What-If Balance Sheet Stress Test',
      category: 'Simulate',
      subtitle: 'Test individual SME cash reserves against customer delays, inventory write-downs & rate hikes',
      icon: Sparkles,
      tags: [
        'what if shock',
        'sme what if',
        'simulate balance sheet',
        'stress test sme',
        'shap what if',
        'simulate sme',
      ],
      tab: 'scorecards',
    },

    // 2. CORE VIEWS & INTELLIGENCE ENGINES
    {
      id: 'view-dashboard',
      title: t('dashboard', 'Dashboard'),
      category: 'Views',
      subtitle: 'Main Agency Book KPI overview, cashflow spline, momentum gauge ($4,900 target)',
      icon: LayoutGrid,
      tags: ['home', 'overview', 'kpi', 'revenue', 'gross margin', 'cashflow', 'momentum', 'net profit', 'dashboard'],
      tab: 'dashboard',
    },
    {
      id: 'view-scorecards',
      title: `${t('scorecards', 'Scorecards')} & AI Risk Analyzer`,
      category: 'Views',
      subtitle: 'Evaluate individual SME risk scores (0-100), SHAP feature importance & credit covenants',
      icon: FileText,
      tags: ['scorecard', 'scorecards', 'analyzer', 'credit risk', 'shap', 'gst', 'bank covenant', 'sme risk'],
      tab: 'scorecards',
    },
    {
      id: 'view-clients',
      title: t('clients', 'Clients Directory'),
      category: 'Views',
      subtitle: 'National SME client portfolio, risk health, sector filters and credit monitoring',
      icon: Briefcase,
      tags: ['clients', 'msme', 'directory', 'portfolio', 'customers', 'borrowers', 'borrower list'],
      tab: 'clients',
    },
    {
      id: 'view-profitability',
      title: `${t('profitability', 'Profitability')} & Sector Margins`,
      category: 'Views',
      subtitle: 'Sector-by-sector gross margin analysis, inflation trends and stress ranking',
      icon: Percent,
      tags: ['profit', 'profitability', 'margin', 'sectors', 'textiles', 'auto', 'chemicals', 'ebitda'],
      tab: 'profitability',
    },
    {
      id: 'view-cash',
      title: 'Cash-Flow Forecasting & Treasury Engine',
      category: 'Views',
      subtitle: 'Predictive 13-week treasury cashflow, customer debtor delays (DSO), OpEx inflation & zero-cash runway guard',
      icon: Wallet,
      tags: ['cash', 'liquidity', 'runway', 'expenses', 'income', 'balance', 'dso', 'cashflow', 'cash flow', 'cashflow forecast', 'cash-flow forecast', 'forecasting', '13 week', 'burn rate', 'treasury'],
      tab: 'cash',
    },
    {
      id: 'view-cfo',
      title: 'AI Digital CFO Console',
      category: 'Views',
      subtitle: 'Autonomous advisory engine: 7-day liquidity moves & 30-90 day balance sheet restructuring',
      icon: Bot,
      tags: ['cfo', 'advisor', 'digital cfo', 'liquidity', 'working capital', 'restructuring', 'ask cfo', 'gemini'],
      tab: 'cfo',
    },
    {
      id: 'view-growth',
      title: `${t('growth', 'Growth')} & Forecast Engine`,
      category: 'Views',
      subtitle: '30-60-90 day forward stress trajectory models, gradient boosting predictions',
      icon: TrendingUp,
      tags: ['growth', 'forecast', 'predictor', 'future', 'trend', 'gradient boosting', '30 day', '60 day'],
      tab: 'growth',
    },
    {
      id: 'view-map',
      title: t('real_world_map', 'Real-World Satellite Map'),
      category: 'Views',
      subtitle: 'Interactive India satellite map: live cluster distress hotspots & regional telemetry',
      icon: Map,
      tags: ['map', 'satellite', 'india map', 'gis', 'leaflet', 'clusters', 'districts', 'hotspots', 'regional'],
      tab: 'map',
    },
    {
      id: 'view-alerts',
      title: t('early_warnings', 'Early Warnings Feed'),
      category: 'Views',
      subtitle: 'Autonomous triggers signaling impending working capital breaches 30-90 days ahead',
      icon: ShieldAlert,
      tags: ['alerts', 'early warnings', 'watch', 'critical', 'breach', 'insolvency', 'treds', 'lead bank'],
      tab: 'alerts',
    },
    {
      id: 'view-heatmap',
      title: 'Risk Heatmap Matrix',
      category: 'Views',
      subtitle: 'Cross-tabulated state and sector vulnerability matrix with intensity heatmaps',
      icon: Flame,
      tags: ['heatmap', 'matrix', 'risk grid', 'vulnerability', 'correlation'],
      tab: 'heatmap',
    },
    {
      id: 'view-insights',
      title: 'Executive AI Briefings',
      category: 'Views',
      subtitle: 'Automated executive state briefings powered by Google Gemini generative AI',
      icon: FileCheck2,
      tags: ['insights', 'briefing', 'executive', 'gemini', 'state summary', 'rbi report'],
      tab: 'insights',
    },
    {
      id: 'view-methodology',
      title: 'System Methodology & Architecture',
      category: 'Views',
      subtitle: 'Mathematical formulation, XGBoost pipeline, SHAP tree explainability & schema',
      icon: Cpu,
      tags: ['methodology', 'architecture', 'xgboost', 'pipeline', 'math', 'weights', 'data sources'],
      tab: 'methodology',
    },

    // 3. STATES & INDUSTRIAL CLUSTERS
    {
      id: 'state-gj',
      title: 'Gujarat (Surat, Morbi, Ankleshwar, Rajkot)',
      category: 'Clusters',
      subtitle: 'High stress (74.2) · Surat textiles & diamonds, Morbi ceramic LNG cost spike',
      icon: MapPin,
      tags: ['gujarat', 'surat', 'morbi', 'ankleshwar', 'rajkot', 'ahmedabad', 'gj', 'diamond', 'textiles'],
      stateId: 'GJ',
      tab: 'insights',
    },
    {
      id: 'state-tn',
      title: 'Tamil Nadu (Tiruppur, Coimbatore, Chennai, Ranipet)',
      category: 'Clusters',
      subtitle: 'Critical knitwear export delays (72.8) · Coimbatore foundry power surcharges',
      icon: MapPin,
      tags: ['tamil nadu', 'tiruppur', 'coimbatore', 'chennai', 'ranipet', 'ambur', 'tn', 'knitwear'],
      stateId: 'TN',
      tab: 'insights',
    },
    {
      id: 'state-mh',
      title: 'Maharashtra (Pune, Mumbai SEEPZ, Solapur, Nashik)',
      category: 'Clusters',
      subtitle: 'High risk (66.4) · Pune precision auto tier-3 supply delays, jewelry exports',
      icon: MapPin,
      tags: ['maharashtra', 'pune', 'mumbai', 'solapur', 'nashik', 'mh', 'auto components'],
      stateId: 'MH',
      tab: 'insights',
    },
    {
      id: 'state-ka',
      title: 'Karnataka (Bengaluru, Belagavi, Peenya)',
      category: 'Clusters',
      subtitle: 'Moderate risk (52.1) · Bengaluru IoT services, Belagavi foundry & casting',
      icon: MapPin,
      tags: ['karnataka', 'bengaluru', 'bangalore', 'belagavi', 'peenya', 'ka', 'iot', 'deeptech'],
      stateId: 'KA',
      tab: 'insights',
    },
    {
      id: 'state-pb',
      title: 'Punjab (Ludhiana, Jalandhar)',
      category: 'Clusters',
      subtitle: 'High risk (68.9) · Ludhiana hosiery wool spinning & bicycle parts margin squeeze',
      icon: MapPin,
      tags: ['punjab', 'ludhiana', 'jalandhar', 'pb', 'hosiery', 'bicycles', 'sports goods'],
      stateId: 'PB',
      tab: 'insights',
    },
    {
      id: 'state-up',
      title: 'Uttar Pradesh (Kanpur, Noida, Agra)',
      category: 'Clusters',
      subtitle: 'Moderate stress (61.4) · Kanpur leather tanning, Agra footwear export slump',
      icon: MapPin,
      tags: ['uttar pradesh', 'kanpur', 'noida', 'agra', 'up', 'leather', 'footwear'],
      stateId: 'UP',
      tab: 'insights',
    },

    // 4. SME DEMO PRESETS
    {
      id: 'case-surat',
      title: 'Surat Synthetic Textiles Demo Case',
      category: 'SME Cases',
      subtitle: 'Critical stress (82.5) · 88-day DSO debtor cycle, yarn price inflation',
      icon: Sparkles,
      tags: ['surat textiles', 'demo', 'case study', 'critical case', 'high risk sme', 'surat'],
      tab: 'scorecards',
    },
    {
      id: 'case-pune',
      title: 'Pune Precision Auto Components Demo Case',
      category: 'SME Cases',
      subtitle: 'Moderate stress (65.2) · Tier-3 OEM payment delays and machining capex',
      icon: Sparkles,
      tags: ['pune auto', 'demo', 'moderate case', 'auto components case', 'pune'],
      tab: 'scorecards',
    },
    {
      id: 'case-bengaluru',
      title: 'Bengaluru DeepTech IoT Services Demo Case',
      category: 'SME Cases',
      subtitle: 'Healthy entity (28.4) · 14-day receivable turnaround, low leverage',
      icon: Sparkles,
      tags: ['bengaluru iot', 'healthy case', 'low risk demo', 'software', 'bengaluru'],
      tab: 'scorecards',
    },

    // 5. QUICK ACTIONS & TOOLS
    {
      id: 'action-mobile-qr',
      title: 'Download App on Mobile Phone',
      category: 'Actions',
      subtitle: 'Scan live QR code with iPhone or Android camera to install on phone',
      icon: Smartphone,
      tags: ['mobile', 'phone', 'qr code', 'iphone', 'android', 'camera', 'install phone', 'download mobile'],
      action: 'mobile_qr',
    },
    {
      id: 'action-shortcut',
      title: 'Download Desktop Shortcut (.url)',
      category: 'Actions',
      subtitle: 'Download 1-click Windows desktop shortcut or progressive web app',
      icon: Download,
      tags: ['download', 'shortcut', 'desktop', 'windows', 'pwa', 'url', 'install', 'bat'],
      action: 'shortcut',
    },
    {
      id: 'action-settings',
      title: 'Open Settings & Preferences',
      category: 'Actions',
      subtitle: 'Configure currency, notification thresholds, timezone, and integrations',
      icon: Settings,
      tags: ['settings', 'preferences', 'thresholds', 'currency', 'usd', 'inr', 'configure'],
      action: 'settings',
    },
    {
      id: 'action-profile',
      title: 'Edit User Profile & Photo',
      category: 'Actions',
      subtitle: 'Update your name, job title, email address and executive portrait photo',
      icon: User,
      tags: ['profile', 'user', 'name', 'avatar', 'photo', 'account', 'edit profile'],
      action: 'profile',
    },
    {
      id: 'action-language',
      title: 'Switch App Language (English, Telugu, Hindi, Marathi)',
      category: 'Actions',
      subtitle: 'Change whole application interface language to English, తెలుగు, हिन्दी, or मराठी',
      icon: Globe,
      tags: ['language', 'english', 'telugu', 'తెలుగు', 'hindi', 'हिन्दी', 'marathi', 'मराठी', 'translate'],
      action: 'language',
    },
    {
      id: 'action-theme',
      title: 'Toggle Day / Night Mode Theme',
      category: 'Actions',
      subtitle: `Switch current theme to ${darkMode ? 'Day Light Mode' : 'Night Dark Mode'}`,
      icon: darkMode ? Sun : Moon,
      tags: ['theme', 'dark mode', 'light mode', 'day', 'night', 'colors'],
      action: 'theme',
    },
    {
      id: 'action-security-center',
      title: 'Security & Trust Center (2FA, Sessions & Audit)',
      category: 'Actions',
      subtitle: 'Manage zero-trust encryption, 2FA enforcement, active devices, and security audit trail',
      icon: ShieldCheck,
      tags: ['security', 'auth', 'authentication', '2fa', 'two factor', 'sessions', 'audit', 'audit trail', 'devices', 'trusted', 'security center'],
      action: 'security',
    },
    {
      id: 'action-lock-screen',
      title: 'Lock Terminal Screen (PIN Keypad)',
      category: 'Actions',
      subtitle: 'Instantly lock the screen with confidential blurred overlay and PIN security pad',
      icon: Lock,
      tags: ['lock', 'lock screen', 'pin', 'pad', 'terminal lock', 'lock session', 'privacy'],
      action: 'lock',
    },
    {
      id: 'action-logout',
      title: 'Sign Out / Disconnect Terminal',
      category: 'Actions',
      subtitle: 'Securely terminate the active session and return to executive clearance login',
      icon: LogOut,
      tags: ['logout', 'sign out', 'log out', 'exit', 'disconnect', 'switch user'],
      action: 'logout',
    },
  ], [t, darkMode]);

  // Intelligent Fuzzy & Multi-Term Matching Engine
  const filteredItems = useMemo(() => {
    const raw = searchQuery.trim().toLowerCase();
    if (!raw) {
      return searchCatalog.slice(0, 7); // Default suggestions when empty
    }

    // Clean typos like "economic s shock" -> ["simulate", "economic", "shock"]
    const cleaned = raw.replace(/\b(s)\b/g, ' ').replace(/\s+/g, ' ').trim();
    const queryTerms = cleaned.split(' ').filter(Boolean);

    // Compute scoring for each item
    const scored = searchCatalog
      .map((item) => {
        let score = 0;
        const titleLower = item.title.toLowerCase();
        const subtitleLower = item.subtitle.toLowerCase();
        const categoryLower = item.category.toLowerCase();
        const tags = item.tags.map((t) => t.toLowerCase());

        // 1. Exact raw query matching
        if (titleLower.includes(raw) || tags.includes(raw)) score += 100;
        if (titleLower.includes(cleaned)) score += 80;
        if (tags.some((t) => t.includes(cleaned))) score += 75;

        // 2. Term-by-term matching
        let matchedTermsCount = 0;
        for (const term of queryTerms) {
          if (titleLower.includes(term)) {
            score += 30;
            matchedTermsCount++;
          } else if (tags.some((t) => t.includes(term))) {
            score += 25;
            matchedTermsCount++;
          } else if (subtitleLower.includes(term)) {
            score += 15;
            matchedTermsCount++;
          } else if (categoryLower.includes(term)) {
            score += 10;
            matchedTermsCount++;
          }
        }

        // Bonus if ALL search words matched somewhere
        if (matchedTermsCount === queryTerms.length) {
          score += 50;
        }

        return { item, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score);

    return scored.map(({ item }) => item);
  }, [searchQuery, searchCatalog]);

  // Execute selection
  const handleSelectItem = (item: SearchItem) => {
    if (item.presetId && onSelectShockPreset) {
      onSelectShockPreset(item.presetId);
    }
    if (item.tab && onNavigate) {
      onNavigate(item.tab);
    }

    if (item.stateId && onSelectState) {
      onSelectState(item.stateId);
    }

    if (item.action) {
      if (item.action === 'settings' && onOpenSettings) onOpenSettings();
      if (item.action === 'profile' && onOpenProfile) onOpenProfile();
      if ((item.action === 'shortcut' || item.action === 'mobile_qr') && onOpenShortcutModal) {
        onOpenShortcutModal();
      }
      if (item.action === 'theme' && setDarkMode) {
        setDarkMode(!darkMode);
      }
      if (item.action === 'language' && onOpenSettings) {
        onOpenSettings();
      }
      if (item.action === 'security' && onOpenSecurityCenter) {
        onOpenSecurityCenter();
      }
      if (item.action === 'lock' && onLockSession) {
        onLockSession();
      }
      if (item.action === 'logout' && onLogout) {
        onLogout();
      }
    }

    onClose();
    setSearchQuery('');
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          handleSelectItem(filteredItems[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (paletteRef.current && !paletteRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={paletteRef}
      className={`absolute left-0 top-full mt-2 w-full min-w-[340px] max-w-xl rounded-2xl border shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 ${
        darkMode ? 'bg-[#0f141d] border-slate-800 text-white shadow-black/80' : 'bg-white border-slate-200 text-slate-900 shadow-slate-300'
      }`}
    >
      {/* Search Header Badge & Result Count */}
      <div className={`px-4 py-2 border-b flex items-center justify-between text-[11px] ${
        darkMode ? 'border-slate-800/80 bg-[#121824] text-slate-400' : 'border-slate-100 bg-slate-50 text-slate-500'
      }`}>
        <div className="flex items-center gap-1.5 font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span>{searchQuery ? `Searching for "${searchQuery}"` : 'Quick Navigation & Action Index'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 font-bold">
            {filteredItems.length} {filteredItems.length === 1 ? 'match' : 'matches'}
          </span>
          <span className="text-[10px] hidden sm:inline text-slate-500">
            Press ↵ to open
          </span>
        </div>
      </div>

      {/* Results List */}
      <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <Search className="w-8 h-8 mx-auto text-slate-500 opacity-50" />
            <p className="text-xs font-semibold text-slate-300">No matching features found.</p>
            <p className="text-[11px] text-slate-500">
              Try: "simulate economic shock", "cfo", "surat", "gujarat", "cash", "alerts", or "shortcut".
            </p>
          </div>
        ) : (
          filteredItems.map((item, index) => {
            const Icon = item.icon;
            const isSelected = index === selectedIndex;

            const categoryColor =
              item.category === 'Simulate'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : item.category === 'Views'
                ? 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                : item.category === 'Clusters'
                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                : item.category === 'Actions'
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'bg-purple-500/15 text-purple-400 border-purple-500/30';

            return (
              <button
                key={item.id}
                onClick={() => handleSelectItem(item)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer group ${
                  isSelected
                    ? darkMode
                      ? 'bg-sky-500/20 border border-sky-500/40 text-white'
                      : 'bg-sky-50 border border-sky-300 text-slate-900'
                    : darkMode
                    ? 'border border-transparent hover:bg-slate-800/60 text-slate-300'
                    : 'border border-transparent hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                      : item.category === 'Simulate'
                      ? 'bg-rose-500/15 text-rose-400 group-hover:bg-rose-500 group-hover:text-white'
                      : darkMode
                      ? 'bg-[#18202d] text-slate-300 group-hover:text-white'
                      : 'bg-slate-100 text-slate-600 group-hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold truncate group-hover:text-sky-300 transition-colors">
                      {item.title}
                    </span>
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border ${categoryColor}`}>
                      {item.category}
                    </span>
                  </div>
                  <p className={`text-[11px] truncate mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {item.subtitle}
                  </p>
                </div>

                <div className={`shrink-0 flex items-center gap-1 text-[11px] font-semibold text-sky-400 transition-opacity ${
                  isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}>
                  <span className="hidden sm:inline">
                    {item.category === 'Simulate' ? 'Run Shock' : 'Jump'}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Palette Footer Shortcuts */}
      <div className={`px-4 py-2 border-t flex items-center justify-between text-[10px] ${
        darkMode ? 'border-slate-800/80 bg-[#0d121a] text-slate-500' : 'border-slate-100 bg-slate-50 text-slate-500'
      }`}>
        <div className="flex items-center gap-3">
          <span><kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">↑</kbd> <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">↓</kbd> Navigate</span>
          <span><kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">↵</kbd> Select</span>
        </div>
        <span className="font-semibold text-slate-400">
          Global Feature & Action Search
        </span>
      </div>
    </div>
  );
};
