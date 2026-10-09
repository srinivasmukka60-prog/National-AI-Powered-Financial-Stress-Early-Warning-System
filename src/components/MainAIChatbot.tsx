import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  X,
  Minimize2,
  Maximize2,
  RotateCcw,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Zap,
  ShieldCheck,
  Landmark,
  Compass,
  Flame,
  User,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { NATIONAL_OVERVIEW, STATES_DATA, SECTORS_DATA, EARLY_WARNING_ALERTS } from '../data/indiaData';
import { useLanguage } from '../context/LanguageContext';
import { SUPPORTED_LANGUAGES } from '../utils/translations';

interface MainAIChatbotProps {
  darkMode: boolean;
  currentTab: string;
  onNavigate: (tab: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  suggestedAction?: {
    label: string;
    tab: string;
  };
}

export const MainAIChatbot: React.FC<MainAIChatbotProps> = ({
  darkMode,
  currentTab,
  onNavigate,
}) => {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: `Hello! I am **SME-SENTINEL AI Copilot**, your real-time economic & financial intelligence assistant for Indian MSMEs.\n\nI can analyze **national financial stress**, evaluate **state & sector risks**, calculate **CFO working capital metrics** (DSO, DSCR, TReDS), or guide you through crisis simulations.\n\nHow can I help you today?`,
      timestamp: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized, loading]);

  // Comprehensive AI domain & general conversation responder
  const processUserQuery = async (query: string): Promise<{ text: string; action?: { label: string; tab: string } }> => {
    const rawQ = query.trim();
    const q = rawQ.toLowerCase();
    const cleanQ = q.replace(/[?!.,;:']/g, '').trim();

    // Check if Gemini API key is available in environment
    const apiKey =
      (typeof process !== 'undefined' && process.env && (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY)) ||
      ((typeof import.meta !== 'undefined' && (import.meta as any).env) ? (import.meta as any).env.VITE_GEMINI_API_KEY : '') ||
      '';

    if (apiKey) {
      try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey });
        const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === language);
        const langDirective = (language && language !== 'en' && currentLangObj)
          ? `Respond fluently in ${currentLangObj.name} (${currentLangObj.nativeName}) using polite, natural, professional phrasing.`
          : 'Respond in English.';

        const prompt = `You are SME-SENTINEL AI, an intelligent, friendly, and helpful AI assistant for the National MSME Financial Stress Early Warning platform.
User Message: "${query}"

Guidelines:
1. Language Directive: ${langDirective}
2. If the user asks a normal casual or personal question (e.g. "did you eat your food", "how are you", "tell me a joke", "what is your name", "who created you", math, etc.), answer conversationally, pleasantly, and naturally like a real modern chatbot!
3. If the user asks about Indian business, MSMEs, financial stress, economy, states, sectors, or finance (DSO, DSCR, TReDS, loans, subsidies), give an insightful, accurate, and structured answer.
4. Keep the tone friendly, helpful, and concise (2-4 paragraphs maximum). Format with clean bullet points where appropriate.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        if (response.text) {
          return { text: response.text };
        }
      } catch (err) {
        console.warn('Live Gemini call fallback in chatbot:', err);
      }
    }

    // 1. Food / Eating / Personal Chit-chat (Directly addresses user's query!)
    if (
      q.includes('food') ||
      q.includes('eat') ||
      q.includes('ate') ||
      q.includes('lunch') ||
      q.includes('dinner') ||
      q.includes('breakfast') ||
      q.includes('meal') ||
      q.includes('hungry')
    ) {
      return {
        text: `Haha, I'm an AI, so I don't eat real food! 😄 My 'fuel' is clean data, code, and electricity! ⚡\n\nThank you so much for being thoughtful and asking! Have you had your food yet? How can I help you today? Feel free to ask me anything!`,
      };
    }

    // 2. How are you / Well-being
    if (
      q.includes('how are you') ||
      q.includes('how r u') ||
      q.includes('how do you do') ||
      q.includes('how is it going') ||
      q.includes('hows your day') ||
      q.includes("what's up") ||
      q.includes('whats up') ||
      q.includes('wassup')
    ) {
      return {
        text: `I'm doing fantastic, thank you for asking! 😊 Ready and happy to help you with anything on your mind.\n\nHow is your day going so far? What would you like to chat about or explore?`,
      };
    }

    // 3. Natural Greetings
    if (
      /^(hi+|hey+|hello+|namaste+|howdy+|sup|yo|hola|good (morning|afternoon|evening)|greetings)(\s|$)/i.test(q) ||
      ['hi', 'hii', 'hiii', 'hello', 'hey', 'heyy', 'namaste', 'morning'].includes(cleanQ)
    ) {
      return {
        text: `Hello there! 😊 Great to connect with you. How are you doing today?\n\nI am **SME-SENTINEL AI**. You can chat with me about everyday questions, learn about how the platform works, or explore Indian financial & economic insights. What's on your mind?`,
      };
    }

    // 4. Identity & Creator
    if (
      q.includes('who are you') ||
      q.includes('what is your name') ||
      q.includes('what are you') ||
      q.includes('tell me about yourself')
    ) {
      return {
        text: `I am **SME-SENTINEL AI**, your friendly AI companion and economic intelligence copilot!\n\nI can:\n• Chat with you and answer general everyday questions\n• Analyze national financial stress and industrial risks across India\n• Provide corporate CFO guidance (cash runway, DSO, DSCR, TReDS invoice discounting)\n• Guide you through the maps, simulators, and early-warning alerts\n\nFeel free to ask me whatever you're curious about!`,
      };
    }

    if (q.includes('who made you') || q.includes('who created you') || q.includes('who built you') || q.includes('who developed you')) {
      return {
        text: `I was created as the AI intelligence copilot for the **SME Sentinel National Early Warning Platform** to help business owners, policymakers, and financial analysts navigate economic stress and make smarter financial decisions! 🚀`,
      };
    }

    if (q.includes('are you human') || q.includes('are you a bot') || q.includes('are you real') || q.includes('are you ai')) {
      return {
        text: `I am an AI assistant! 🤖 While I don't have a physical body or human feelings, I'm designed to chat naturally, answer questions thoughtfully, and assist you with anything you need.`,
      };
    }

    // 5. Jokes & Humor
    if (q.includes('joke') || q.includes('funny') || q.includes('laugh') || q.includes('humor')) {
      const jokes = [
        `Why don't economists like to play hide and seek? Because good luck hiding when the inflation rate keeps rising! 😂`,
        `Why did the banker switch careers? He simply lost interest! 💸😄`,
        `Why was the computer cold? It left its Windows open! 💻❄️`,
      ];
      const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
      return {
        text: `${randomJoke}\n\nWant to hear another one, or is there something else you'd like to ask?`,
      };
    }

    // 6. Politeness & Courtesy
    if (q.includes('thank') || q.includes('thanks') || q.includes('thx') || q.includes('appreciate')) {
      return {
        text: `You're very welcome! Always happy to help. Let me know if you need anything else! 😊`,
      };
    }

    if (q.includes('bye') || q.includes('goodbye') || q.includes('good night') || q.includes('see you') || q.includes('cya')) {
      return {
        text: `Goodbye! Have a wonderful time ahead, and feel free to reach out anytime you have questions! 👋`,
      };
    }

    // 7. Simple Math & Calculations (e.g. "what is 2 + 2", "5 * 10", "15% of 200")
    const mathMatch = cleanQ.match(/(\d+(?:\.\d+)?)\s*([\+\-\*\/x]|plus|minus|times|divided by)\s*(\d+(?:\.\d+)?)/i);
    if (mathMatch) {
      const num1 = parseFloat(mathMatch[1]);
      const op = mathMatch[2].toLowerCase();
      const num2 = parseFloat(mathMatch[3]);
      let result = 0;
      if (op === '+' || op === 'plus') result = num1 + num2;
      else if (op === '-' || op === 'minus') result = num1 - num2;
      else if (op === '*' || op === 'x' || op === 'times') result = num1 * num2;
      else if (op === '/' || op === 'divided by') result = num2 !== 0 ? num1 / num2 : 0;

      return {
        text: `That would be **${result}**! Let me know if you need any other calculations or financial math! 🧮`,
      };
    }

    // 8. General Knowledge (Capital, GDP, Inflation)
    if (q.includes('capital of india')) {
      return { text: `The capital of India is **New Delhi**! 🇮🇳` };
    }
    if (q.includes('prime minister of india') || q.includes('pm of india')) {
      return { text: `The Prime Minister of India is **Narendra Modi**.` };
    }

    if (q.includes('what is inflation') || q.includes('explain inflation')) {
      return {
        text: `**Inflation** is the rate at which the general prices of goods and services rise over time, meaning each unit of currency buys fewer goods than before.\n\nIn business, high inflation increases raw material and transport costs, which compresses operating profit margins unless companies can pass those costs to buyers.`,
      };
    }

    if (q.includes('what is gdp') || q.includes('explain gdp')) {
      return {
        text: `**GDP (Gross Domestic Product)** is the total monetary value of all finished goods and services produced within a country over a specific time period (usually a year or quarter). It serves as the comprehensive scorecard of a country's economic health.`,
      };
    }

    // 9. National Overview / Macro Risk (Explicitly about platform/SME/economy)
    if (
      (q.includes('national') && (q.includes('stress') || q.includes('score') || q.includes('overview') || q.includes('risk'))) ||
      q.includes('national stress') ||
      q.includes('how is india doing') ||
      cleanQ === 'national overview'
    ) {
      return {
        text: `Here is India's **National Financial Stress Overview**:\n\n• **Current Stress Score**: **${NATIONAL_OVERVIEW.stressScore} / 100** (Confidence: ${NATIONAL_OVERVIEW.confidence}%)\n• **Forecast Trajectory**: +30d: **${NATIONAL_OVERVIEW.forecast30}** | +60d: **${NATIONAL_OVERVIEW.forecast60}** | +90d: **${NATIONAL_OVERVIEW.forecast90}**\n• **Banking Credit at Risk**: **₹${NATIONAL_OVERVIEW.creditAtRiskCr.toLocaleString()} Cr** across monitored lenders\n• **Probability of Critical Stress in 60 Days**: **${NATIONAL_OVERVIEW.probabilityOfCritical60d}%**\n• **Primary Vulnerability**: Lengthening corporate debtor collection cycles (average DSO > 75 days vs 45-day statutory MSMED limit).`,
        action: { label: 'Explore National Dashboard', tab: 'dashboard' },
      };
    }

    // 10. States / Regional Risks (STRICT WHOLE-WORD MATCHING ONLY!)
    const stateMatch = STATES_DATA.find((s) => {
      const stateNameRegex = new RegExp(`\\b${s.name.toLowerCase()}\\b`, 'i');
      const hasDistrictMatch = s.districts.some((d) => new RegExp(`\\b${d.name.toLowerCase()}\\b`, 'i').test(q));
      return stateNameRegex.test(q) || hasDistrictMatch;
    });

    if (stateMatch) {
      return {
        text: `**${stateMatch.name} Industrial Stress Telemetry**:\n\n• **Stress Index**: **${stateMatch.stressScore} / 100** (${stateMatch.riskLevel.toUpperCase()} Risk)\n• **+60d Forecast**: **${stateMatch.forecast60}** (${stateMatch.trend === 'worsening' ? 'Contagion Spreading ⚠️' : 'Stable'})\n• **Banking Credit at Risk**: **₹${stateMatch.creditAtRiskCr.toLocaleString()} Cr**\n• **Monitored Clusters**: ${stateMatch.districts.map((d) => `${d.name} (${d.stressScore})`).join(', ')}\n• **Top Driver**: ${stateMatch.topRiskFactors[0]}`,
        action: { label: `View ${stateMatch.name} on Live Map`, tab: 'map' },
      };
    }

    if (q.includes('high risk states') || q.includes('stressed states') || q.includes('which states')) {
      const highRiskStates = STATES_DATA.filter((s) => s.stressScore >= 70);
      return {
        text: `There are currently **${NATIONAL_OVERVIEW.highRiskRegionsCount} high-risk industrial regions** in India.\n\n**Top Stressed States**:\n${highRiskStates
          .map((s) => `• **${s.name}** (Score: ${s.stressScore}) — Key Cluster: ${s.districts[0]?.clusterName || s.keySectors[0]}`)
          .join('\n')}\n\nYou can inspect regional supply chain contagion vectors and satellite imagery on our Live Map.`,
        action: { label: 'Open Live Regional Map', tab: 'map' },
      };
    }

    // 11. Sector Vulnerabilities
    const sectorMatch = SECTORS_DATA.find((s) => new RegExp(`\\b${s.name.toLowerCase()}\\b`, 'i').test(q));
    if (sectorMatch) {
      return {
        text: `**${sectorMatch.name} Sector Intelligence**:\n\n• **Sector Stress Score**: **${sectorMatch.stressScore} / 100** (${sectorMatch.riskLevel.toUpperCase()} Risk)\n• **High Risk Units**: **${sectorMatch.highRiskPercentage}%** of MSMEs in this vertical\n• **Credit Exposure**: **₹${sectorMatch.totalCreditExposureCr.toLocaleString()} Cr**\n• **Vulnerabilities**: ${sectorMatch.keyVulnerabilities.join('; ')}\n• **Key Hubs**: ${sectorMatch.description}`,
        action: { label: 'Analyze Sectors', tab: 'sectors' },
      };
    }

    if (q.includes('sector') || q.includes('industry') || q.includes('textile') || q.includes('auto')) {
      return {
        text: `**Sector Stress Ranking**:\n1. **Textiles & Garments** (78.2 / 100) — Cotton price volatility & 88d DSO\n2. **Auto Components & Ancillary** (68.4 / 100) — Tier-3 supply chain delays\n3. **Foundry & Light Engineering** (62.1 / 100) — Metal inflation & power costs\n4. **Gems & Jewellery** (58.9 / 100) — Export contraction\n\nTextiles is currently our highest monitoring priority due to massive export payment delays.`,
        action: { label: 'View Sector Breakdown', tab: 'sectors' },
      };
    }

    // 12. CFO / Financial Metrics (TReDS, DSO, DSCR, Cash Runway)
    if (q.includes('treds') || q.includes('invoice discounting') || q.includes('factoring')) {
      return {
        text: `**TReDS (Trade Receivables Discounting System)** is an RBI-approved digital auction portal (RXIL, M1xchange) for MSME trade bills.\n\n• **100% Non-Recourse**: If the corporate buyer defaults, the discounting bank bears the loss, not you.\n• **Interest Arbitrage**: Factoring rate is **8.2% – 9.0%** vs bank Cash Credit (CC) of **14.5% – 16.5%** APR.\n• **Cash Release**: Converts 60-90 day stuck receivables into cash within 48 hours.`,
        action: { label: 'Open AI Digital CFO', tab: 'cfo' },
      };
    }

    if (q.includes('dso') || q.includes('debtor days') || (q.includes('receivable') && q.includes('cycle'))) {
      return {
        text: `**DSO (Days Sales Outstanding)** measures invoice collection speed.\n\n• **MSMED Statutory Cap**: **45 days** (buyers must pay within 45 days or owe 3x RBI compounding interest under Section 16).\n• **National MSME Average**: **76 days** (a 31-day working capital lockup).\n• **CFO Solution**: Discount approved corporate invoices on TReDS and institute 1.5% prompt-pay cash discounts.`,
        action: { label: 'Consult AI Digital CFO', tab: 'cfo' },
      };
    }

    if (q.includes('dscr') || q.includes('debt service coverage')) {
      return {
        text: `**DSCR (Debt Service Coverage Ratio)** evaluates your cash flow's ability to pay interest and principal.\n\n• **Safe Zone**: $\\ge 1.30\\text{x}$\n• **Warning Zone**: $< 1.15\\text{x}$ (vulnerable to bank rate hikes)\n• **CFO Strategy**: Convert high-cost revolving overdrafts into soft 3-5 year Working Capital Term Loans under CGTMSE guarantee schemes.`,
        action: { label: 'Test Rate Hikes in CFO', tab: 'cfo' },
      };
    }

    if (q.includes('cgtmse') || q.includes('subsid') || q.includes('government scheme') || q.includes('msme scheme')) {
      return {
        text: `**Top MSME Credit & Relief Schemes**:\n\n1. **CGTMSE**: Collateral-free bank loans up to **₹5 Crore** with 75-85% guarantee cover.\n2. **RBI Interest Subvention**: **200 bps (2%)** interest rate rebate on working capital lines for GST-compliant MSMEs.\n3. **Samadhaan Portal**: Direct statutory dispute filing against non-paying buyers.\n4. **RAMP Scheme**: Grants for technology upgrade and digital accounting adoption.`,
        action: { label: 'View Intervention Simulator', tab: 'intervention' },
      };
    }

    if (q.includes('emergency liquidity') || q.includes('cash runway') || q.includes('out of cash') || q.includes('cash crunch')) {
      return {
        text: `**7-Day Emergency Liquidity Protocol**:\n\n1. **Day 1-2**: Freeze all non-essential capex and overhead expenses.\n2. **Day 3**: Audit top 5 overdue debtors (>60 days) and dispatch formal demand letters citing MSMED interest.\n3. **Day 4-5**: Auction approved corporate trade bills on TReDS for immediate T+2 cash liquidation.\n4. **Day 6-7**: Request your lead bank for a 90-day principal moratorium or temporary 10% emergency credit expansion.`,
        action: { label: 'Generate Full Liquidity Plan in CFO', tab: 'cfo' },
      };
    }

    // 13. Crisis Simulation & Stress Testing
    if (q.includes('simulate') || q.includes('crisis') || q.includes('scenario') || q.includes('shock')) {
      return {
        text: `Our **Crisis Simulator Engine** allows you to stress-test the entire Indian MSME economy against:\n\n• **RBI Repo Rate Hikes** (+100 to +300 bps)\n• **Raw Material Cost Inflation** (+10% to +30%)\n• **Customer Demand Contraction** (-5% to -25%)\n• **Supply Chain Payment Delays** (+15 to +45 days)\n\nYou can run Monte Carlo simulations to calculate projected NPA defaults and vulnerable sectors.`,
        action: { label: 'Open Crisis Simulator', tab: 'simulator' },
      };
    }

    // 14. Conversational Fallback (Answers naturally like a normal friendly AI assistant!)
    return {
      text: `I hear you! You asked: "${query}"\n\nAs your AI assistant, I can help answer questions, share information, or assist with anything on the platform. Could you tell me a bit more about what you're looking for, or would you like to explore any of the tools below?`,
      action: { label: 'Explore Dashboard', tab: 'dashboard' },
    };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: 'user_' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await processUserQuery(text);
      const botMsg: ChatMessage = {
        id: 'bot_' + Date.now(),
        sender: 'bot',
        text: response.text,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        suggestedAction: response.action,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: 'bot_err_' + Date.now(),
          sender: 'bot',
          text: 'Encountered a momentary processing delay. Please try your question again.',
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const QUICK_PROMPTS = [
    { label: '🇮🇳 National Stress Score', prompt: "What is India's national MSME financial stress score?" },
    { label: '🚨 High Risk States', prompt: 'Which Indian states and clusters are at Critical Risk?' },
    { label: '💼 TReDS Invoice Factoring', prompt: 'How does TReDS invoice discounting work?' },
    { label: '⚡ Emergency 7-Day Plan', prompt: 'What is our emergency 7-day cash preservation plan?' },
    { label: '🏛️ MSME Government Subsidies', prompt: 'What government credit schemes (CGTMSE, Interest Subvention) are available?' },
  ];

  return (
    <>
      {/* Persistent Floating Chatbot Launcher Pill (Bottom Right) */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className={`fixed bottom-6 right-6 z-50 p-3 sm:px-4 sm:py-2.5 rounded-full font-medium shadow-xl transition-all duration-200 transform hover:scale-[1.02] cursor-pointer flex items-center gap-2 border ${
            darkMode
              ? 'bg-[#16202e] hover:bg-[#1c293c] text-slate-200 border-slate-700/80 shadow-black/40'
              : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300 shadow-md'
          } group`}
          title="Open Sentinel AI Copilot"
        >
          <div className="relative">
            <Bot className={`w-4 h-4 ${darkMode ? 'text-sky-400' : 'text-sky-600'}`} />
            <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ${darkMode ? 'ring-[#16202e]' : 'ring-white'}`} />
          </div>
          <span className="text-xs font-semibold tracking-normal hidden sm:inline">Ask Sentinel AI</span>
          <Sparkles className={`w-3.5 h-3.5 hidden sm:inline ${darkMode ? 'text-sky-400/70' : 'text-sky-600/70'}`} />
        </button>
      )}

      {/* Expanded / Floating Chat Window */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 shadow-2xl rounded-2xl border flex flex-col ${isMinimized
            ? 'bottom-6 right-6 w-72 h-14 overflow-hidden'
            : 'bottom-6 right-6 w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh]'
            } ${darkMode
              ? 'bg-slate-950/95 border-slate-800 text-slate-100 backdrop-blur-xl'
              : 'bg-white/95 border-slate-200 text-slate-900 backdrop-blur-xl shadow-slate-400/20'
            }`}
        >
          {/* Header Bar */}
          <div className="p-3.5 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between shrink-0 rounded-t-2xl">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-bold shadow-xs">
                <Bot className="w-4 h-4 text-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white tracking-tight">SME-SENTINEL AI</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  Context: <span className="capitalize text-amber-400">{currentTab} View</span>
                </div>
              </div>
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
                title={isMinimized ? 'Expand Chatbot' : 'Minimize Chatbot'}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() =>
                  setMessages([
                    {
                      id: 'welcome_' + Date.now(),
                      sender: 'bot',
                      text: `Chat reset. I am ready to answer any questions regarding national financial stress, MSME debt, or enterprise treasury.`,
                      timestamp: 'Just now',
                    },
                  ])
                }
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
                title="Clear Chat History"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
                title="Close Chatbot"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Chat Body (Hidden when Minimized) */}
          {!isMinimized && (
            <>
              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'bot' && (
                      <div className="w-6 h-6 rounded-md bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-2xl p-3 space-y-1.5 shadow-xs ${msg.sender === 'user'
                        ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-xs'
                        : darkMode
                          ? 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-xs'
                          : 'bg-slate-100 border border-slate-200 text-slate-800 rounded-tl-xs'
                        }`}
                    >
                      {/* Formatted Text */}
                      <div className="space-y-1.5 leading-relaxed">
                        {msg.text.split('\n').map((para, pIdx) => {
                          if (!para.trim()) return <div key={pIdx} className="h-1" />;
                          const parts = para.split(/(\*\*.*?\*\*)/g);
                          return (
                            <p key={pIdx}>
                              {parts.map((part, idx) => {
                                if (part.startsWith('**') && part.endsWith('**')) {
                                  return (
                                    <strong
                                      key={idx}
                                      className={msg.sender === 'user' ? 'font-black' : 'font-bold text-white'}
                                    >
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

                      {/* Suggested Action CTA */}
                      {msg.suggestedAction && (
                        <div className="pt-2 border-t border-slate-800/60 mt-1">
                          <button
                            onClick={() => {
                              onNavigate(msg.suggestedAction!.tab);
                              setIsOpen(false);
                            }}
                            className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <span>{msg.suggestedAction.label}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      <div
                        className={`text-[9px] text-right mt-0.5 ${msg.sender === 'user' ? 'text-slate-800' : 'text-slate-500'
                          }`}
                      >
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Loading indicator */}
                {loading && (
                  <div className="flex gap-2.5 items-center">
                    <div className="w-6 h-6 rounded-md bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                      <Bot className="w-3.5 h-3.5 animate-spin" />
                    </div>
                    <div className="px-3 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                      <span>Synthesizing intelligence...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts Carousel Bar */}
              <div className="p-2 border-t border-slate-800/80 bg-slate-900/40 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
                {QUICK_PROMPTS.map((qp, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(qp.prompt)}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-slate-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    {qp.label}
                  </button>
                ))}
              </div>

              {/* Chat Input Box */}
              <div className="p-3 border-t border-slate-800/80 bg-slate-950 flex items-center gap-2 shrink-0 rounded-b-2xl">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendMessage();
                  }}
                  placeholder="Ask Sentinel AI about MSME stress, risks, CFO advice..."
                  className="flex-1 bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || loading}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${inputValue.trim() && !loading
                    ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-md font-bold'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  title="Send Message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
