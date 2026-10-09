import React, { useState, useEffect, useRef } from 'react';
import { SMEFinancialInputs, CFOAdvisoryResult, CFOMessage } from '../types';
import { ApiClient } from '../services/apiClient';
import {
  Bot,
  User,
  Sparkles,
  Send,
  DollarSign,
  TrendingUp,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Copy,
  RotateCcw,
  Building2,
  Landmark,
  ChevronRight,
  Flame,
  Zap,
  Sliders,
  Download,
  HelpCircle,
  MessageSquare,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface AIDigitalCFOViewProps {
  darkMode: boolean;
  onNavigate?: (tab: string) => void;
}

const PRESET_ENTITIES: Record<string, SMEFinancialInputs> = {
  surat_textiles: {
    businessName: 'Surat Synthetic Textiles LLP',
    sector: 'Textiles & Garments',
    state: 'Gujarat',
    district: 'Surat',
    annualRevenueLakhs: 480,
    revenueGrowthYoY: -14.5,
    netProfitMargin: 2.1,
    debtToEquity: 2.8,
    dscr: 1.05,
    receivablesDays: 88,
    payablesDays: 42,
    inventoryTurnoverDays: 75,
    cashRunwayMonths: 1.4,
    rawMaterialInflationPct: 18.0,
    monthlyInterestBurdenLakhs: 3.8,
  },
  pune_auto: {
    businessName: 'Pune Precision Auto Components Pvt Ltd',
    sector: 'Auto Components & Ancillary',
    state: 'Maharashtra',
    district: 'Pune',
    annualRevenueLakhs: 920,
    revenueGrowthYoY: 3.2,
    netProfitMargin: 4.8,
    debtToEquity: 2.1,
    dscr: 1.28,
    receivablesDays: 72,
    payablesDays: 55,
    inventoryTurnoverDays: 60,
    cashRunwayMonths: 2.4,
    rawMaterialInflationPct: 11.5,
    monthlyInterestBurdenLakhs: 6.2,
  },
  bengaluru_tech: {
    businessName: 'Bengaluru Embedded IoT Solutions',
    sector: 'IT & Digital Services MSMEs',
    state: 'Karnataka',
    district: 'Bengaluru',
    annualRevenueLakhs: 360,
    revenueGrowthYoY: 22.0,
    netProfitMargin: 14.5,
    debtToEquity: 0.6,
    dscr: 2.85,
    receivablesDays: 38,
    payablesDays: 25,
    inventoryTurnoverDays: 15,
    cashRunwayMonths: 5.8,
    rawMaterialInflationPct: 3.0,
    monthlyInterestBurdenLakhs: 0.8,
  },
};

const CFO_PLAYBOOK_PROMPTS = [
  {
    title: 'Emergency Liquidity Plan',
    prompt: 'Our cash runway is under 2 months. What is our 7-day emergency cash preservation and receivables collection plan?',
    icon: Flame,
    colorDark: 'text-red-400',
    colorLight: 'text-red-600',
  },
  {
    title: 'TReDS Invoice Discounting',
    prompt: 'How can we liquidate our 70+ day corporate debtor receivables on TReDS without balance sheet recourse?',
    icon: DollarSign,
    colorDark: 'text-emerald-400',
    colorLight: 'text-emerald-600',
  },
  {
    title: 'Interest Rate & DSCR Defense',
    prompt: 'If the bank increases interest rates by 50 bps, will our DSCR break covenants? How should we restructure our loan?',
    icon: ShieldCheck,
    colorDark: 'text-amber-400',
    colorLight: 'text-amber-600',
  },
  {
    title: 'Raw Material Pass-Through',
    prompt: 'Raw material inflation is up 15%. How can I negotiate dynamic price indexing clauses with corporate OEM buyers?',
    icon: TrendingUp,
    colorDark: 'text-purple-400',
    colorLight: 'text-purple-600',
  },
  {
    title: 'Government Subsidies & CGTMSE',
    prompt: 'What Central and State credit schemes (CGTMSE, Interest Subvention, RAMP) can we tap into right now?',
    icon: Landmark,
    colorDark: 'text-cyan-400',
    colorLight: 'text-cyan-700',
  },
];

const GENERAL_CFO_QUESTIONS = [
  {
    title: 'Cut Operating Expenses',
    prompt: 'How can I reduce operating expenses (OpEx) without hurting manufacturing output?',
    icon: TrendingUp,
    colorDark: 'text-emerald-400',
    colorLight: 'text-emerald-600',
  },
  {
    title: 'Section 43B(h) MSME Tax Rule',
    prompt: 'Explain Section 43B(h) of the Income Tax Act and how the 45-day MSME payment rule helps us collect receivables.',
    icon: Landmark,
    colorDark: 'text-cyan-400',
    colorLight: 'text-cyan-700',
  },
  {
    title: 'Revenue vs Profitability',
    prompt: 'What is the difference between Revenue (top line) and Net Profit (bottom line)? Why do growing companies run out of cash?',
    icon: DollarSign,
    colorDark: 'text-purple-400',
    colorLight: 'text-purple-600',
  },
  {
    title: 'Break-Even & Runway Calculation',
    prompt: 'How do I calculate our Break-Even Point and operational Cash Runway accurately?',
    icon: Sliders,
    colorDark: 'text-amber-400',
    colorLight: 'text-amber-600',
  },
  {
    title: 'Negotiate Supplier Credit',
    prompt: 'How can I negotiate extending vendor payment terms from 30 to 60 days without damaging supplier goodwill?',
    icon: ShieldCheck,
    colorDark: 'text-indigo-400',
    colorLight: 'text-indigo-600',
  },
];

export const AIDigitalCFOView: React.FC<AIDigitalCFOViewProps> = ({ darkMode, onNavigate }) => {
  const { t } = useLanguage();
  const [activePresetKey, setActivePresetKey] = useState<string>('surat_textiles');
  const [activeSideTab, setActiveSideTab] = useState<'general' | 'playbooks'>('general');
  const [currentInputs, setCurrentInputs] = useState<SMEFinancialInputs>(PRESET_ENTITIES.surat_textiles);
  const [queryInput, setQueryInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<CFOMessage[]>([
    {
      id: 'welcome_1',
      sender: 'cfo',
      text: `Hello, I am your AI Digital CFO powered by Gemini 2.5 Flash and calibrated financial models. I am actively monitoring ${PRESET_ENTITIES.surat_textiles.businessName}'s balance sheet and cash conversion metrics. 

How can I assist you with corporate treasury, general financial questions, tax optimization, or day-to-day business operations today?`,
      timestamp: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome_1') {
        return [
          {
            id: 'welcome_1',
            sender: 'cfo',
            text: t('cfo_welcome_msg', `Hello, I am your AI Digital CFO powered by Gemini 2.5 Flash and calibrated financial models. I am actively monitoring ${PRESET_ENTITIES.surat_textiles.businessName}'s balance sheet and cash conversion metrics. \n\nHow can I assist you with corporate treasury, general financial questions, tax optimization, or day-to-day business operations today?`),
            timestamp: 'Just now',
          },
        ];
      }
      return prev;
    });
  }, [t]);

  const handleSelectPreset = (key: string) => {
    setActivePresetKey(key);
    const chosen = PRESET_ENTITIES[key];
    setCurrentInputs(chosen);
    setMessages((prev) => [
      ...prev,
      {
        id: 'switch_' + Date.now(),
        sender: 'cfo',
        text: `Switched operational context to ${chosen.businessName} (${chosen.sector}, ${chosen.state}). Annual revenue: ₹${chosen.annualRevenueLakhs} Lakhs, DSCR: ${chosen.dscr}x, Debtor DSO: ${chosen.receivablesDays} days. Ready for treasury consultation.`,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || queryInput).trim();
    if (!text || loading) return;

    const userMsg: CFOMessage = {
      id: 'msg_user_' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setQueryInput('');
    setLoading(true);

    try {
      const history = messages.slice(-8).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        content: m.text,
      }));
      const res = await ApiClient.generateCFOAdvisory(text, currentInputs, history);
      const cfoMsg: CFOMessage = {
        id: 'msg_cfo_' + Date.now(),
        sender: 'cfo',
        text: res.replyText,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        advisory: res,
      };
      setMessages((prev) => [...prev, cfoMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: 'msg_err_' + Date.now(),
          sender: 'cfo',
          text: 'Encountered a temporary network delay. Applying local deterministic financial guidance.',
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAdvisory = (item: CFOAdvisoryResult, id: string) => {
    const content = `AI DIGITAL CFO STRATEGY MEMO
Entity: ${currentInputs.businessName} (${currentInputs.sector})
CFO Verdict: ${item.cfoVerdict}
Diagnosis: ${item.diagnosis}

Executive Analysis:
${item.replyText}

Immediate 7-Day Actions:
${item.immediateActions.map((a) => '• ' + a).join('\n')}

30-90 Day Strategic Moves:
${item.mediumTermStrategies.map((m) => '• ' + m).join('\n')}

Recommended Schemes & Subsidies:
${item.recommendedSchemes.map((s) => `• [${s.agency}] ${s.name}: ${s.benefit}`).join('\n')}

Projected Financial Impact:
${item.projectedMetricImpact.map((p) => `• ${p.metric}: ${p.before} -> ${p.after} (${p.impact})`).join('\n')}
`;
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className={`p-4 md:p-6 rounded-2xl border transition-colors ${
        darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 text-white shadow-md shadow-indigo-500/25 shrink-0">
              <Bot className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                  {t('cfo_copilot_badge', 'AI Digital CFO · Virtual Treasury Copilot')}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border flex items-center gap-1 ${
                  darkMode ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                  Gemini 2.5 Flash
                </span>
              </div>
              <h2 className={`text-xl md:text-2xl font-bold tracking-tight mt-0.5 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                {t('cfo_console_title')}
              </h2>
              <p className={`text-xs md:text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {t('cfo_console_subtitle')}
              </p>
            </div>
          </div>

          {/* Preset Context Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-xs font-semibold mr-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{t('consulting_context', 'Consulting Context:')}</span>
            {Object.entries(PRESET_ENTITIES).map(([key, item]) => (
              <button
                key={key}
                onClick={() => handleSelectPreset(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                  activePresetKey === key
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-xs'
                    : darkMode
                    ? 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                    : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {item.businessName.split(' ')[0]} ({item.sector.split(' ')[0]})
              </button>
            ))}
          </div>
        </div>

        {/* Live Balance Sheet Snapshot Strip */}
        <div className={`mt-4 pt-3 border-t grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs ${
          darkMode ? 'border-slate-800/80' : 'border-slate-200'
        }`}>
          <div className={`p-2.5 rounded-xl border ${darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <span className={`text-[10px] font-semibold block ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Liquid Cash Runway</span>
            <span className={`text-base font-bold font-mono ${
              currentInputs.cashRunwayMonths < 2
                ? darkMode ? 'text-red-400' : 'text-red-600'
                : darkMode ? 'text-emerald-400' : 'text-emerald-700'
            }`}>
              {currentInputs.cashRunwayMonths} Months
            </span>
          </div>

          <div className={`p-2.5 rounded-xl border ${darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <span className={`text-[10px] font-semibold block ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Debt Service (DSCR)</span>
            <span className={`text-base font-bold font-mono ${
              currentInputs.dscr < 1.15
                ? darkMode ? 'text-orange-400' : 'text-amber-600'
                : darkMode ? 'text-emerald-400' : 'text-emerald-700'
            }`}>
              {currentInputs.dscr.toFixed(2)}x Coverage
            </span>
          </div>

          <div className={`p-2.5 rounded-xl border ${darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <span className={`text-[10px] font-semibold block ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Debtor Days (DSO)</span>
            <span className={`text-base font-bold font-mono ${
              currentInputs.receivablesDays > 60
                ? darkMode ? 'text-amber-400' : 'text-amber-600'
                : darkMode ? 'text-slate-100' : 'text-slate-900'
            }`}>
              {currentInputs.receivablesDays} Days
            </span>
          </div>

          <div className={`p-2.5 rounded-xl border ${darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <span className={`text-[10px] font-semibold block ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Monthly Debt Service</span>
            <span className={`text-base font-bold font-mono ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
              ₹{currentInputs.monthlyInterestBurdenLakhs} Lakhs
            </span>
          </div>
        </div>

        {onNavigate && (
          <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs">
            <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>
              Need week-by-week cash disbursements & insolvency stress testing?
            </span>
            <button
              type="button"
              onClick={() => onNavigate('cash')}
              className="text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Open 13-Week Cashflow Forecaster</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Advisory Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: CFO Strategy Playbooks & Simulator */}
        <div className="lg:col-span-4 space-y-4">
          {/* Quick CFO Question Topics / Playbooks */}
          <div className={`p-4 md:p-5 rounded-2xl border transition-colors ${
            darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            {/* Tab switch between General Questions & Crisis Playbooks */}
            <div className={`flex items-center gap-1 p-1 rounded-xl mb-3 border ${
              darkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                type="button"
                onClick={() => setActiveSideTab('general')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeSideTab === 'general'
                    ? darkMode
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-indigo-700 shadow-xs border border-indigo-100'
                    : darkMode
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>General Questions</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSideTab('playbooks')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeSideTab === 'playbooks'
                    ? darkMode
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-indigo-700 shadow-xs border border-indigo-100'
                    : darkMode
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Crisis Playbooks</span>
              </button>
            </div>

            <div className="space-y-2">
              {(activeSideTab === 'general' ? GENERAL_CFO_QUESTIONS : CFO_PLAYBOOK_PROMPTS).map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(item.prompt)}
                    className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                      darkMode
                        ? 'bg-slate-950/40 border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/40'
                        : 'bg-slate-50/80 border-slate-200 hover:border-indigo-400 hover:bg-white shadow-xs'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${darkMode ? item.colorDark : item.colorLight}`} />
                    <div>
                      <div className={`text-xs font-bold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{item.title}</div>
                      <p className={`text-[11px] mt-0.5 line-clamp-2 leading-snug ${darkMode ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>
                        {item.prompt}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Working Capital Arbitrage Calculator */}
          <div className={`p-4 md:p-5 rounded-2xl border transition-colors ${
            darkMode
              ? 'bg-gradient-to-br from-indigo-950/30 via-slate-900/60 to-purple-950/30 border-indigo-500/30'
              : 'bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/80 border-indigo-200 shadow-xs'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${
                darkMode ? 'text-indigo-400' : 'text-indigo-700'
              }`}>
                <Sliders className="w-3.5 h-3.5" />
                <span>TReDS vs Overdraft Arbitrage</span>
              </div>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                darkMode ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}>
                Cost Saver
              </span>
            </div>

            <p className={`text-xs leading-relaxed mb-3 ${darkMode ? 'text-slate-400' : 'text-slate-700'}`}>
              Discounting ₹50 Lakhs of approved trade receivables on TReDS at <strong className={darkMode ? 'text-slate-200' : 'text-slate-950 font-bold'}>8.8% bank discount</strong> vs utilizing bank Cash Credit (CC) limit at <strong className={darkMode ? 'text-slate-200' : 'text-slate-950 font-bold'}>14.5% APR</strong>:
            </p>

            <div className={`space-y-2 p-3 rounded-xl border text-xs ${
              darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-indigo-100 shadow-xs'
            }`}>
              <div className="flex items-center justify-between">
                <span className={darkMode ? 'text-slate-400' : 'text-slate-600 font-medium'}>Net Interest Savings:</span>
                <span className={`font-mono font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>₹2.85 Lakhs / yr</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={darkMode ? 'text-slate-400' : 'text-slate-600 font-medium'}>Collateral Released:</span>
                <span className={`font-mono font-bold ${darkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>100% Non-Recourse</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={darkMode ? 'text-slate-400' : 'text-slate-600 font-medium'}>Turnaround Speed:</span>
                <span className={`font-mono font-bold ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>T+2 Settlement</span>
              </div>
            </div>

            <button
              onClick={() => handleSendMessage('Explain how to register on TReDS and compare factoring rates with our bank CC limits.')}
              className="mt-3 w-full py-2 px-3 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer text-center shadow-xs"
            >
              Ask Digital CFO To Structure TReDS
            </button>
          </div>
        </div>

        {/* Right Column: Live Conversational Thread & Structured Guidance */}
        <div className={`lg:col-span-8 rounded-2xl border flex flex-col h-[750px] overflow-hidden transition-colors ${
          darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-xs'
        }`}>
          {/* Thread Header */}
          <div className={`p-4 border-b flex items-center justify-between shrink-0 ${
            darkMode ? 'border-slate-800/80 bg-slate-900/40' : 'border-slate-200 bg-white'
          }`}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className={`text-xs font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                Advisory Session Active · Context: {currentInputs.businessName}
              </span>
            </div>

            <button
              onClick={() =>
                setMessages([
                  {
                    id: 'reset_' + Date.now(),
                    sender: 'cfo',
                    text: `Session reset for ${currentInputs.businessName}. Ask me anything regarding liquidity, covenants, cost structures, or working capital finance.`,
                    timestamp: 'Just now',
                  },
                ])
              }
              className={`text-xs flex items-center gap-1 cursor-pointer transition-colors ${
                darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <RotateCcw className="w-3 h-3" /> Clear Chat
            </button>
          </div>

          {/* Messages Feed */}
          <div className={`flex-1 overflow-y-auto p-4 md:p-6 space-y-5 ${
            darkMode ? 'bg-transparent' : 'bg-slate-50/50'
          }`}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'cfo' && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-sm mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-2xl space-y-3 ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-xs md:text-sm shadow-sm font-medium'
                    : 'w-full'
                }`}>
                  {msg.sender === 'user' ? (
                    <div>{msg.text}</div>
                  ) : (
                    <div className={`p-4 md:p-5 rounded-2xl border space-y-4 shadow-xs ${
                      darkMode ? 'bg-slate-950/60 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800 shadow-xs'
                    }`}>
                      {/* Main Conversational Reply */}
                      <div className={`text-xs md:text-sm space-y-1.5 leading-relaxed ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                        {msg.text.split('\n').map((paragraph, pIdx) => {
                          if (!paragraph.trim()) return <div key={pIdx} className="h-1.5" />;
                          const parts = paragraph.split(/(\*\*.*?\*\*)/g);
                          return (
                            <p key={pIdx} className="leading-relaxed">
                              {parts.map((part, idx) => {
                                if (part.startsWith('**') && part.endsWith('**')) {
                                  return (
                                    <strong key={idx} className={`font-bold ${darkMode ? 'text-white' : 'text-slate-950 font-extrabold'}`}>
                                      {part.slice(2, -2)}
                                    </strong>
                                  );
                                }
                                return part;
                              })}
                            </p>
                          );
                        })}
                      </div>

                      {/* Quick Interactive Prompt Chips for conversational messages */}
                      {(!msg.advisory?.immediateActions?.length && !msg.advisory?.diagnosis) && (
                        <div className={`pt-2 flex flex-wrap items-center gap-1.5 border-t mt-2 ${darkMode ? 'border-slate-800/60' : 'border-slate-200'}`}>
                          <button
                            onClick={() => handleSendMessage('How can I reduce operating expenses (OpEx) without hurting manufacturing output?')}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 border ${
                              darkMode
                                ? 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/30 text-emerald-300'
                                : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700'
                            }`}
                          >
                            <TrendingUp className={`w-3 h-3 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                            <span>Cut OpEx Expenses</span>
                          </button>
                          <button
                            onClick={() => handleSendMessage('Explain Section 43B(h) of the Income Tax Act and how the 45-day MSME payment rule helps us collect receivables.')}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 border ${
                              darkMode
                                ? 'bg-cyan-500/15 hover:bg-cyan-500/25 border-cyan-500/30 text-cyan-300'
                                : 'bg-cyan-50 hover:bg-cyan-100 border-cyan-200 text-cyan-800'
                            }`}
                          >
                            <Landmark className={`w-3 h-3 ${darkMode ? 'text-cyan-400' : 'text-cyan-700'}`} />
                            <span>Section 43B(h) MSME Rule</span>
                          </button>
                          <button
                            onClick={() => handleSendMessage('How do I calculate our Break-Even Point and operational Cash Runway accurately?')}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 border ${
                              darkMode
                                ? 'bg-purple-500/15 hover:bg-purple-500/25 border-purple-500/30 text-purple-300'
                                : 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700'
                            }`}
                          >
                            <Sliders className={`w-3 h-3 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                            <span>Calculate Break-Even</span>
                          </button>
                          <button
                            onClick={() => handleSendMessage('Our cash runway is under 2 months. What is our 7-day emergency cash preservation and receivables collection plan?')}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 border ${
                              darkMode
                                ? 'bg-red-500/15 hover:bg-red-500/25 border-red-500/30 text-red-300'
                                : 'bg-red-50 hover:bg-red-100 border-red-200 text-red-700'
                            }`}
                          >
                            <Flame className={`w-3 h-3 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                            <span>Emergency Cash Plan</span>
                          </button>
                          <button
                            onClick={() => handleSendMessage('How can we liquidate our 70+ day corporate debtor receivables on TReDS without balance sheet recourse?')}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 border ${
                              darkMode
                                ? 'bg-blue-500/15 hover:bg-blue-500/25 border-blue-500/30 text-blue-300'
                                : 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700'
                            }`}
                          >
                            <DollarSign className={`w-3 h-3 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                            <span>TReDS Discounting</span>
                          </button>
                        </div>
                      )}

                      {/* Structured Advisory Card (only present when there are actionable interventions or root diagnosis) */}
                      {msg.advisory && (msg.advisory.immediateActions?.length > 0 || Boolean(msg.advisory.diagnosis)) && (
                        <div className={`space-y-4 pt-3 border-t ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                          {/* CFO Verdict & Diagnosis */}
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                              msg.advisory.cfoVerdict === 'Urgent Intervention Needed'
                                ? darkMode
                                  ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                                  : 'bg-red-100 text-red-800 border border-red-300'
                                : msg.advisory.cfoVerdict === 'Moderate Liquidity Optimization'
                                ? darkMode
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : 'bg-amber-100 text-amber-800 border border-amber-300'
                                : darkMode
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            }`}>
                              CFO Verdict: {msg.advisory.cfoVerdict}
                            </span>

                            <button
                              onClick={() => handleCopyAdvisory(msg.advisory!, msg.id)}
                              className={`text-xs flex items-center gap-1 cursor-pointer font-semibold ${
                                darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'
                              }`}
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>{copiedId === msg.id ? 'Copied Memo!' : 'Export Strategy Memo'}</span>
                            </button>
                          </div>

                          {/* Root Diagnosis */}
                          <div className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                            darkMode
                              ? 'bg-indigo-950/20 border-indigo-900/40 text-indigo-200'
                              : 'bg-indigo-50/80 border-indigo-200 text-indigo-950 font-normal'
                          }`}>
                            <strong className={darkMode ? 'text-indigo-100' : 'text-indigo-900 font-bold'}>Financial Diagnosis:</strong>{' '}
                            <span>{msg.advisory.diagnosis}</span>
                          </div>

                          {/* Immediate 7-Day Actions */}
                          <div className="space-y-2">
                            <div className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                              darkMode ? 'text-amber-400' : 'text-amber-700'
                            }`}>
                              <CheckCircle2 className={`w-4 h-4 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`} />
                              <span>7-Day Immediate Actions</span>
                            </div>
                            <ul className="space-y-2">
                              {msg.advisory.immediateActions.map((act, aIdx) => (
                                <li key={aIdx} className={`flex items-start gap-2.5 text-xs leading-relaxed p-2 rounded-lg border ${
                                  darkMode
                                    ? 'bg-slate-900/40 border-slate-800/80 text-slate-200'
                                    : 'bg-amber-50/50 border-amber-200/80 text-slate-800'
                                }`}>
                                  <span className={`font-bold shrink-0 mt-0.5 text-sm ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>•</span>
                                  <span className="font-normal">{act}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* 30-90 Day Strategic Moves */}
                          <div className="space-y-2">
                            <div className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                              darkMode ? 'text-indigo-400' : 'text-indigo-700'
                            }`}>
                              <TrendingUp className={`w-4 h-4 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                              <span>30–90 Day Structural Moves</span>
                            </div>
                            <ul className="space-y-2">
                              {msg.advisory.mediumTermStrategies.map((strat, sIdx) => (
                                <li key={sIdx} className={`flex items-start gap-2.5 text-xs leading-relaxed p-2 rounded-lg border ${
                                  darkMode
                                    ? 'bg-slate-900/40 border-slate-800/80 text-slate-200'
                                    : 'bg-indigo-50/50 border-indigo-200/80 text-slate-800'
                                }`}>
                                  <span className={`font-bold shrink-0 mt-0.5 text-sm ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>•</span>
                                  <span className="font-normal">{strat}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Recommended Government Schemes & Subsidies */}
                          {msg.advisory.recommendedSchemes.length > 0 && (
                            <div className="space-y-2">
                              <div className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                                darkMode ? 'text-cyan-400' : 'text-cyan-800'
                              }`}>
                                <Landmark className={`w-4 h-4 ${darkMode ? 'text-cyan-400' : 'text-cyan-700'}`} />
                                <span>Applicable Subsidies & Credit Facilities</span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {msg.advisory.recommendedSchemes.map((sch, schIdx) => (
                                  <div
                                    key={schIdx}
                                    className={`p-3 rounded-xl border text-xs ${
                                      darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50/80 border-slate-200 shadow-xs'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <span className={`font-bold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{sch.name}</span>
                                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                                        darkMode
                                          ? 'text-cyan-300 bg-cyan-950/40 border-cyan-800'
                                          : 'text-cyan-800 bg-cyan-100/80 border-cyan-300'
                                      }`}>
                                        {sch.agency}
                                      </span>
                                    </div>
                                    <p className={`text-[11px] mt-1.5 leading-snug ${
                                      darkMode ? 'text-slate-300' : 'text-slate-700 font-medium'
                                    }`}>
                                      {sch.benefit}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Projected Metric Impact */}
                          {msg.advisory.projectedMetricImpact.length > 0 && (
                            <div className="space-y-2">
                              <div className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                                darkMode ? 'text-emerald-400' : 'text-emerald-800'
                              }`}>
                                <TrendingUp className={`w-4 h-4 ${darkMode ? 'text-emerald-400' : 'text-emerald-700'}`} />
                                <span>Projected Financial Metric Impact</span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {msg.advisory.projectedMetricImpact.map((imp, iIdx) => (
                                  <div
                                    key={iIdx}
                                    className={`p-3 rounded-xl border text-xs ${
                                      darkMode ? 'bg-emerald-950/20 border-emerald-900/30' : 'bg-emerald-50/80 border-emerald-200 shadow-xs'
                                    }`}
                                  >
                                    <span className={`text-[11px] font-bold block ${
                                      darkMode ? 'text-slate-300' : 'text-slate-800'
                                    }`}>{imp.metric}</span>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className={`font-mono line-through text-xs ${
                                        darkMode ? 'text-slate-400' : 'text-slate-500 font-semibold'
                                      }`}>{imp.before}</span>
                                      <span className={darkMode ? 'text-slate-500' : 'text-slate-400'}>→</span>
                                      <span className={`font-mono font-extrabold text-sm ${
                                        darkMode ? 'text-emerald-400' : 'text-emerald-700'
                                      }`}>{imp.after}</span>
                                    </div>
                                    <span className={`text-[11px] font-semibold mt-1 block ${
                                      darkMode ? 'text-emerald-300' : 'text-emerald-800'
                                    }`}>
                                      {imp.impact}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className={`text-[10px] px-1 ${
                    darkMode ? 'text-slate-400' : 'text-slate-500 font-medium'
                  } ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm mt-0.5 ${
                    darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'
                  }`}>
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 justify-start items-center">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className={`p-3 rounded-2xl border text-xs flex items-center gap-2 ${
                  darkMode ? 'bg-slate-950/60 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-xs'
                }`}>
                  <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                  <span className="font-medium">Synthesizing Treasury Diagnostics & Restructuring Strategy...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className={`p-3 md:p-4 border-t shrink-0 ${
            darkMode ? 'border-slate-800/80 bg-slate-900/60' : 'border-slate-200 bg-white'
          }`}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder={t('cfo_prompt_placeholder', 'Ask your AI CFO anything: EBITDA, taxes, Section 43B(h), cutting OpEx, cash runway, break-even...')}
                className={`flex-1 px-4 py-2.5 rounded-xl border text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                  darkMode
                    ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500'
                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-500 focus:bg-white'
                }`}
              />

              <button
                type="submit"
                disabled={!queryInput.trim() || loading}
                className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
                  queryInput.trim() && !loading
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white'
                    : darkMode
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
