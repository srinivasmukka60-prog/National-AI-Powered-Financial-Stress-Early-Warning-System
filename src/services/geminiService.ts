import { GoogleGenAI } from '@google/genai';
import { SMEFinancialInputs, AIRiskScoreResult, CreditRiskGrade, RiskLevel, CFOAdvisoryResult } from '../types';

export interface AIInsightReport {
  title: string;
  executiveSummary: string;
  rootCauses: { title: string; explanation: string; severity: 'high' | 'critical' | 'medium' }[];
  policyRecommendations: { title: string; timeHorizon: string; owner: string; description: string }[];
  creditRiskGuidance: string;
  timestamp: string;
  isAiGenerated: boolean;
}

export async function generateAIPolicyBriefing(context: {
  regionName?: string;
  sectorName?: string;
  stressScore: number;
  riskLevel: string;
  primaryIssues: string[];
}): Promise<AIInsightReport> {
  const apiKey =
    (typeof process !== 'undefined' && process.env && (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY)) ||
    ((typeof import.meta !== 'undefined' && (import.meta as any).env) ? (import.meta as any).env.VITE_GEMINI_API_KEY : '') ||
    '';

  // Deterministic domain-grounded fallback
  const fallbackReport: AIInsightReport = {
    title: `SME-SENTINEL Intelligence Memo: ${context.regionName || context.sectorName || 'National MSME Landscape'}`,
    executiveSummary: `The ${context.regionName || context.sectorName || 'national industrial cluster'} registers an elevated financial stress score of ${context.stressScore}/100 (${context.riskLevel.toUpperCase()}). High working capital friction, extended debtor days (avg 78-92 days), and raw material price pressures are tightening cash flow runways across micro and small enterprises.`,
    rootCauses: [
      {
        title: 'Working Capital Lockup in Supply Chain Receivables',
        explanation: 'Downstream institutional buyers and large corporate OEMs have stretched credit payment cycles to 90+ days, exceeding statutory MSMED Act 45-day caps.',
        severity: 'critical',
      },
      {
        title: 'Input Cost Inflation Without Dynamic Escalation Clauses',
        explanation: 'Elevated raw material (metals, chemicals, power) input costs are eroding gross margins because tier-2 and tier-3 sub-contractors lack price pass-through mechanisms.',
        severity: 'high',
      },
      {
        title: 'Interest Burden on Unrated Credit Lines',
        explanation: 'Commercial bank debt servicing (DSCR < 1.15) under current interest rates absorbs over 34% of operating cash flows for leveraged MSME units.',
        severity: 'high',
      },
    ],
    policyRecommendations: [
      {
        title: 'Mandatory TReDS Factoring Enforcement',
        timeHorizon: 'Immediate (15 Days)',
        owner: 'Ministry of MSME & RBI',
        description: 'Mandate digital invoice acceptance on TReDS platforms for all CPSEs and corporates with turnover > ₹250 Cr, unlocking liquidity at non-recourse bank discount rates.',
      },
      {
        title: 'Emergency Working Capital Liquidity Window',
        timeHorizon: 'Short-Term (30 Days)',
        owner: 'SIDBI & Lead Commercial Banks',
        description: 'Deploy a soft working capital credit line backed by CGTMSE with 12-month interest subvention of 200 bps for verified stressed cluster units.',
      },
      {
        title: 'State Cluster Raw Material Depot Linkages',
        timeHorizon: 'Medium-Term (60 Days)',
        owner: 'State Industrial Development Corporations',
        description: 'Establish consortium procurement warehouses for essential inputs (pig iron, cotton yarn, polymers) to insulate small manufacturers from spot-market price spikes.',
      },
    ],
    creditRiskGuidance: 'Financial institutions should avoid sudden drawing-power contractions; instead, offer 6-month loan tenure extensions and bridge overdraft facilities against verified GST e-way bills.',
    timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' IST',
    isAiGenerated: false,
  };

  if (!apiKey) {
    return fallbackReport;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are the Chief Macroeconomic Risk Officer for India's National MSME Early-Warning Intelligence System (SME-SENTINEL).
Analyze the following scenario and generate a structured JSON policy intelligence briefing:
Region/State: ${context.regionName || 'National'}
Sector: ${context.sectorName || 'Cross-Sector Aggregate'}
Current Financial Stress Score: ${context.stressScore}/100 (${context.riskLevel} risk)
Observed Vulnerabilities: ${context.primaryIssues.join(', ')}

Output valid JSON matching this schema:
{
  "title": string,
  "executiveSummary": string,
  "rootCauses": [{"title": string, "explanation": string, "severity": "high"|"critical"|"medium"}],
  "policyRecommendations": [{"title": string, "timeHorizon": string, "owner": string, "description": string}],
  "creditRiskGuidance": string
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    if (response.text) {
      const parsed = JSON.parse(response.text);
      return {
        ...parsed,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' IST',
        isAiGenerated: true,
      };
    }
    return fallbackReport;
  } catch (err) {
    console.warn('Gemini briefing generation fallback applied:', err);
    return fallbackReport;
  }
}

function mapScoreToGrade(score: number): CreditRiskGrade {
  if (score <= 18) return 'AAA';
  if (score <= 30) return 'AA';
  if (score <= 45) return 'A';
  if (score <= 58) return 'BBB';
  if (score <= 70) return 'BB';
  if (score <= 82) return 'B';
  if (score <= 92) return 'CCC';
  return 'D';
}

function mapScoreToRiskLevel(score: number): RiskLevel {
  if (score <= 30) return 'low';
  if (score <= 60) return 'moderate';
  if (score <= 80) return 'high';
  return 'critical';
}

/**
 * AI Risk Score Engine:
 * Generates multidimensional financial risk evaluation (Credit grade, 5 sub-pillar scores,
 * qualitative early warnings, stress tolerance metrics, and prescriptive mitigations).
 */
export async function generateAIRiskScore(
  inputs: SMEFinancialInputs,
  mlBaselineScore?: number
): Promise<AIRiskScoreResult> {
  const apiKey =
    (typeof process !== 'undefined' && process.env && (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY)) ||
    ((typeof import.meta !== 'undefined' && (import.meta as any).env) ? (import.meta as any).env.VITE_GEMINI_API_KEY : '') ||
    '';

  // 1. Calculate deterministic subscores based on financial health ratios
  const dsoGap = Math.max(0, inputs.receivablesDays - 45);
  const dsoRatio = Math.min(100, (inputs.receivablesDays / Math.max(1, inputs.payablesDays)) * 32);
  const runwayScore = inputs.cashRunwayMonths < 1.0 ? 96 : inputs.cashRunwayMonths < 2.0 ? 82 : inputs.cashRunwayMonths < 3.0 ? 62 : inputs.cashRunwayMonths < 5.0 ? 32 : 12;
  const liquidityRisk = Math.min(100, Math.max(5, Math.round(dsoRatio * 0.45 + runwayScore * 0.55)));

  const dscrRisk = inputs.dscr < 1.0 ? 95 : inputs.dscr < 1.15 ? 82 : inputs.dscr < 1.3 ? 58 : inputs.dscr < 1.8 ? 32 : 10;
  const deRisk = inputs.debtToEquity > 3.0 ? 92 : inputs.debtToEquity > 2.0 ? 74 : inputs.debtToEquity > 1.0 ? 42 : 14;
  const debtSolvencyRisk = Math.min(100, Math.max(5, Math.round(dscrRisk * 0.65 + deRisk * 0.35)));

  const marginRisk = inputs.netProfitMargin < 0 ? 95 : inputs.netProfitMargin < 3 ? 78 : inputs.netProfitMargin < 7 ? 48 : inputs.netProfitMargin < 12 ? 24 : 8;
  const growthRisk = inputs.revenueGrowthYoY < -12 ? 92 : inputs.revenueGrowthYoY < 0 ? 72 : inputs.revenueGrowthYoY < 10 ? 38 : 12;
  const operationalEfficiencyRisk = Math.min(100, Math.max(5, Math.round(marginRisk * 0.55 + growthRisk * 0.45)));

  const invRisk = inputs.inventoryTurnoverDays > 85 ? 84 : inputs.inventoryTurnoverDays > 60 ? 64 : inputs.inventoryTurnoverDays > 30 ? 38 : 18;
  const inflRisk = inputs.rawMaterialInflationPct > 15 ? 88 : inputs.rawMaterialInflationPct > 10 ? 68 : inputs.rawMaterialInflationPct > 5 ? 42 : 16;
  const supplyChainExposure = Math.min(100, Math.max(5, Math.round(invRisk * 0.5 + inflRisk * 0.5)));

  const marketMacroRisk = Math.min(95, Math.max(10, Math.round(48 + (inputs.rawMaterialInflationPct * 1.4) - (inputs.revenueGrowthYoY * 0.3))));

  // Baseline overall risk calculation
  const calculatedScore = Math.min(99, Math.max(5, Math.round(
    liquidityRisk * 0.32 +
    debtSolvencyRisk * 0.30 +
    operationalEfficiencyRisk * 0.16 +
    supplyChainExposure * 0.14 +
    marketMacroRisk * 0.08
  )));

  const finalScore = mlBaselineScore ? Math.round((calculatedScore * 0.6) + (mlBaselineScore * 0.4)) : calculatedScore;
  const grade = mapScoreToGrade(finalScore);
  const level = mapScoreToRiskLevel(finalScore);

  // Identify strengths & vulnerabilities
  const strengths: string[] = [];
  const vulnerabilities: string[] = [];
  const warnings: string[] = [];

  if (inputs.cashRunwayMonths >= 3.5) strengths.push(`Healthy cash runway buffer of ${inputs.cashRunwayMonths} months`);
  if (inputs.dscr >= 1.4) strengths.push(`Robust debt servicing capability (DSCR ${inputs.dscr.toFixed(2)}x)`);
  if (inputs.revenueGrowthYoY > 8) strengths.push(`Positive top-line growth trajectory (+${inputs.revenueGrowthYoY}%)`);
  if (inputs.debtToEquity <= 1.2) strengths.push(`Conservative leverage structure (D/E ${inputs.debtToEquity})`);
  if (strengths.length === 0) strengths.push('Established local operating history and core operational asset base');

  if (inputs.receivablesDays > 60) vulnerabilities.push(`Extended debtor collection cycle (${inputs.receivablesDays} days vs statutory 45-day cap)`);
  if (inputs.dscr < 1.2) vulnerabilities.push(`Tightly squeezed debt coverage (DSCR ${inputs.dscr.toFixed(2)} leaves slim operating buffer)`);
  if (inputs.rawMaterialInflationPct > 10) vulnerabilities.push(`Unhedged exposure to input cost inflation (+${inputs.rawMaterialInflationPct}%)`);
  if (inputs.cashRunwayMonths < 2.0) vulnerabilities.push(`Critical liquidity runway restriction (${inputs.cashRunwayMonths} months remaining)`);
  if (inputs.debtToEquity > 2.2) vulnerabilities.push(`Elevated financial leverage ratio (D/E ${inputs.debtToEquity})`);

  if (inputs.receivablesDays > inputs.payablesDays + 25) {
    warnings.push('Negative working capital cash conversion cycle — payments to vendors occur faster than collections');
  }
  if (inputs.dscr < 1.15) {
    warnings.push('High vulnerability to RBI repo rate revisions or interest rate shock');
  }
  if (inputs.inventoryTurnoverDays > 70) {
    warnings.push('Working capital locked in slow-moving inventory buffers');
  }
  if (warnings.length === 0) {
    warnings.push('Macro volatility and seasonal demand variations remain key monitoring priorities');
  }

  // Stress tolerances
  const rateHikeToleranceBps = Math.max(0, Math.round((Math.max(0, inputs.dscr - 1.0) / 0.15) * 100));
  const revenueDropTolerancePct = Math.max(0, Math.round((Math.max(0, inputs.netProfitMargin + 2)) * 1.5));
  const paymentDelayBufferDays = Math.max(0, Math.round(inputs.cashRunwayMonths * 22));

  // Prescriptive mitigations
  const mitigations = [
    {
      action: 'Register & Liquidate Receivables via TReDS Platform',
      priority: 'immediate' as const,
      expectedRiskReductionPoints: Math.min(18, Math.round(dsoGap * 0.3 + 4)),
      details: 'Discount pending corporate and PSU trade bills on RXIL/M1xchange to shorten DSO by 25–40 days without recourse.',
    },
    {
      action: 'Restructure Short-Term CC/OD into Term Debt',
      priority: inputs.dscr < 1.2 ? ('immediate' as const) : ('medium-term' as const),
      expectedRiskReductionPoints: inputs.dscr < 1.2 ? 14 : 7,
      details: 'Negotiate 12–18 month tenor extension with primary lending institution under CGTMSE guarantee schemes to lift DSCR above 1.35x.',
    },
    {
      action: 'Vendor Consolidation & Dynamic Price Indexing',
      priority: 'strategic' as const,
      expectedRiskReductionPoints: Math.min(10, Math.round(inputs.rawMaterialInflationPct * 0.5)),
      details: 'Incorporate quarterly raw material price adjustment clauses in buyer agreements to protect gross operating margin.',
    },
  ];

  const fallbackAIRiskResult: AIRiskScoreResult = {
    overallScore: finalScore,
    riskGrade: grade,
    riskLevel: level,
    confidenceLevel: 94,
    subScores: {
      liquidityRisk,
      debtSolvencyRisk,
      operationalEfficiencyRisk,
      supplyChainExposure,
      marketMacroRisk,
    },
    executiveSummary: `The AI Risk Assessment for ${inputs.businessName} (${inputs.sector}, ${inputs.state}) indicates an overall risk score of ${finalScore}/100, corresponding to an investment/credit grade of "${grade}" (${level.toUpperCase()} Risk). Principal vulnerability stems from ${
      liquidityRisk > debtSolvencyRisk ? 'working capital debtor delays and constrained cash runway' : 'debt service pressure and capital leverage'
    }. Projected debt covenant resilience stands at ${rateHikeToleranceBps} bps before coverage reaches breach limits.`,
    keyStrengths: strengths,
    criticalVulnerabilities: vulnerabilities,
    earlyWarningSignals: warnings,
    prescriptiveMitigations: mitigations,
    stressTolerance: {
      rateHikeToleranceBps,
      revenueDropTolerancePct,
      paymentDelayBufferDays,
    },
    timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' IST',
    isAiGenerated: false,
  };

  if (!apiKey) {
    return fallbackAIRiskResult;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are the Senior Chief Credit Risk & Early-Warning AI Analyst for India's MSME Sentinel Financial Platform.
Evaluate the financial health and credit risk profile of the following Indian enterprise:
Business Name: ${inputs.businessName}
Sector: ${inputs.sector}
Location: ${inputs.district}, ${inputs.state}
Annual Revenue: ₹${inputs.annualRevenueLakhs} Lakhs
YoY Revenue Growth: ${inputs.revenueGrowthYoY}%
Net Profit Margin: ${inputs.netProfitMargin}%
Debt to Equity: ${inputs.debtToEquity}
DSCR: ${inputs.dscr}
Receivables Days (DSO): ${inputs.receivablesDays} days
Payables Days (DPO): ${inputs.payablesDays} days
Inventory Turnover Days: ${inputs.inventoryTurnoverDays} days
Cash Runway: ${inputs.cashRunwayMonths} months
Raw Material Inflation: ${inputs.rawMaterialInflationPct}%
Monthly Interest Burden: ₹${inputs.monthlyInterestBurdenLakhs} Lakhs

Provide a rigorous AI Risk Score (0-100 where higher = higher risk), Credit Grade (AAA/AA/A/BBB/BB/B/CCC/D), 5 sub-pillar scores (0-100), executive summary, strengths, vulnerabilities, early warnings, prescriptive mitigations with expected points reduction, and stress tolerance thresholds.

Respond ONLY with valid JSON matching this schema:
{
  "overallScore": number,
  "riskGrade": "AAA"|"AA"|"A"|"BBB"|"BB"|"B"|"CCC"|"D",
  "riskLevel": "low"|"moderate"|"high"|"critical",
  "confidenceLevel": number,
  "subScores": {
    "liquidityRisk": number,
    "debtSolvencyRisk": number,
    "operationalEfficiencyRisk": number,
    "supplyChainExposure": number,
    "marketMacroRisk": number
  },
  "executiveSummary": string,
  "keyStrengths": [string],
  "criticalVulnerabilities": [string],
  "earlyWarningSignals": [string],
  "prescriptiveMitigations": [
    {
      "action": string,
      "priority": "immediate"|"medium-term"|"strategic",
      "expectedRiskReductionPoints": number,
      "details": string
    }
  ],
  "stressTolerance": {
    "rateHikeToleranceBps": number,
    "revenueDropTolerancePct": number,
    "paymentDelayBufferDays": number
  }
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    if (response.text) {
      const parsed = JSON.parse(response.text);
      return {
        ...parsed,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' IST',
        isAiGenerated: true,
      };
    }
    return fallbackAIRiskResult;
  } catch (err) {
    console.warn('Gemini AI Risk Score generation fallback applied:', err);
    return fallbackAIRiskResult;
  }
}

/**
 * AI Digital CFO Advisory Engine:
 * Generates tailored executive financial advice, restructuring plans, and government scheme mappings for MSMEs.
 */
export async function generateCFOAdvisory(
  userQuery: string,
  inputs: SMEFinancialInputs,
  conversationHistory: { role: string; content: string }[] = []
): Promise<CFOAdvisoryResult> {
  const apiKey =
    (typeof process !== 'undefined' && process.env && (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY)) ||
    ((typeof import.meta !== 'undefined' && (import.meta as any).env) ? (import.meta as any).env.VITE_GEMINI_API_KEY : '') ||
    (typeof window !== 'undefined' && window.localStorage ? (window.localStorage.getItem('gemini_api_key') || window.localStorage.getItem('sme_gemini_api_key') || '') : '') ||
    '';

  const rawQ = userQuery.trim();
  const q = rawQ.toLowerCase();
  const cleanQ = q.replace(/[?!.,;:']/g, '').trim();

  // 1. Natural Greetings & Casual Chit-Chat
  const isGreeting =
    /^(hi+|hey+|hello+|namaste+|howdy+|sup|yo|hola|good (morning|afternoon|evening)|greetings)(\s|$)/i.test(q) ||
    ['hi', 'hii', 'hiii', 'hello', 'hey', 'heyy', 'namaste', 'morning'].includes(cleanQ);

  const isCasualChitChat =
    q.includes('how are you') ||
    q.includes('how r u') ||
    q.includes('how is your day') ||
    q.includes('how do you do') ||
    q.includes("what's up") ||
    q.includes('whats up') ||
    q.includes('wassup') ||
    q.includes('how is it going');

  const isFoodOrPersonal =
    q.includes('food') ||
    q.includes('eat') ||
    q.includes('lunch') ||
    q.includes('dinner') ||
    q.includes('breakfast') ||
    q.includes('hungry') ||
    q.includes('coffee') ||
    q.includes('tea');

  const isThanks =
    cleanQ === 'thanks' ||
    cleanQ === 'thank you' ||
    q.startsWith('thank you') ||
    q.startsWith('thanks') ||
    q.includes('good job') ||
    q.includes('awesome') ||
    q.includes('great advice');

  // 2. Identity / Capabilities ("who are you", "what can you do", "help")
  const isIdentityOrHelp =
    q.includes('who are you') ||
    q.includes('what can you do') ||
    q.includes('what do you do') ||
    q.includes('your role') ||
    q.includes('help me') ||
    q.includes('capabilities') ||
    cleanQ === 'help';

  // 3. Status & Health Overview ("how are we doing", "financial status", "overview")
  const isStatusQuery =
    q.includes('how are we doing') ||
    q.includes('financial health') ||
    q.includes('company status') ||
    q.includes('health check') ||
    q.includes('financial pulse') ||
    q.includes('performance overview') ||
    q.includes('summary of financials') ||
    (q.includes('balance sheet') && (q.includes('status') || q.includes('health') || q.includes('check')));

  // 4. Taxes & Regulatory Compliance (General Questions)
  const isTaxSection43BH =
    q.includes('43b') ||
    q.includes('43b(h)') ||
    q.includes('43bh') ||
    (q.includes('45 day') && (q.includes('tax') || q.includes('deduction') || q.includes('disallowance')));

  const isGSTQuery =
    q.includes('gst') ||
    q.includes('input tax credit') ||
    q.includes('itc') ||
    q.includes('reverse charge') ||
    q.includes('rcm') ||
    q.includes('gstr');

  const isTaxGeneral =
    !isTaxSection43BH &&
    !isGSTQuery &&
    (q.includes('tax') ||
      q.includes('income tax') ||
      q.includes('tax saving') ||
      q.includes('reduce tax') ||
      q.includes('lower tax') ||
      q.includes('advance tax') ||
      q.includes('depreciation') ||
      q.includes('tds'));

  // 5. Profitability, Revenue & Margins (General Questions)
  const isEBITDA =
    q.includes('ebitda') ||
    q.includes('operating profit') ||
    q.includes('what is ebitda');

  const isRevVsProfit =
    (q.includes('revenue') && q.includes('profit')) ||
    (q.includes('topline') && q.includes('bottomline')) ||
    (q.includes('top line') && q.includes('bottom line')) ||
    q.includes('difference between revenue and profit') ||
    q.includes('turnover vs profit');

  const isMarginsGeneral =
    q.includes('gross margin') ||
    q.includes('net margin') ||
    q.includes('profit margin') ||
    q.includes('margin vs markup') ||
    q.includes('markup vs margin') ||
    q.includes('improve margin') ||
    q.includes('increase profit');

  const isSalesGrowth =
    q.includes('improve sales') ||
    q.includes('increase sales') ||
    q.includes('grow sales') ||
    q.includes('boost sales') ||
    q.includes('how to grow revenue') ||
    q.includes('expand revenue');

  // 6. Cash Flow & Working Capital (General Questions)
  const isWorkingCapitalConcept =
    q.includes('what is working capital') ||
    q.includes('explain working capital') ||
    q.includes('working capital cycle') ||
    q.includes('net working capital') ||
    q.includes('current ratio') ||
    q.includes('quick ratio');

  const isBreakEven =
    q.includes('break even') ||
    q.includes('breakeven') ||
    q.includes('break-even') ||
    q.includes('bep');

  const isCashVsProfit =
    (q.includes('cash flow') && q.includes('profit')) ||
    q.includes('profit but no cash') ||
    q.includes('profitable but out of cash') ||
    q.includes('why profitable companies go bankrupt');

  const isPayrollInCrunch =
    q.includes('payroll') ||
    q.includes('salary') ||
    q.includes('salaries') ||
    q.includes('pay employees') ||
    q.includes('wage delay');

  // 7. Cost Reduction & Expense Management (General Questions)
  const isCostCutting =
    q.includes('cut cost') ||
    q.includes('reduce cost') ||
    q.includes('lower cost') ||
    q.includes('reduce expense') ||
    q.includes('cut expense') ||
    q.includes('lower expense') ||
    q.includes('opex') ||
    q.includes('overhead') ||
    q.includes('fixed cost vs variable cost') ||
    q.includes('fixed vs variable');

  // 8. Specific Metric Explanations
  const isDSOExplain = q.includes('what is dso') || q.includes('explain dso') || q.includes('what is debtor days') || q.includes('receivable days');
  const isDSCRExplain = q.includes('what is dscr') || q.includes('explain dscr') || q.includes('debt service coverage');
  const isTReDSExplain = q.includes('what is treds') || q.includes('explain treds') || q.includes('how does treds work') || q.includes('how to register on treds');
  const isCGTMSEExplain = q.includes('what is cgtmse') || q.includes('explain cgtmse') || q.includes('credit guarantee scheme');
  const isRunwayExplain = q.includes('what is cash runway') || q.includes('explain cash runway') || q.includes('what is runway') || q.includes('burn rate');

  // 9. Debtors & Collections Strategy (General Questions)
  const isDebtorCollectionGeneral =
    q.includes('client not paying') ||
    q.includes('customer not paying') ||
    q.includes('overdue payment') ||
    q.includes('recover money') ||
    q.includes('collect overdue') ||
    q.includes('bad debt') ||
    q.includes('unpaid invoice') ||
    q.includes('samadhaan') ||
    q.includes('section 16 interest');

  // 10. Vendor & Supplier Negotiations (General Questions)
  const isVendorNegotiation =
    q.includes('supplier') ||
    q.includes('vendor') ||
    q.includes('payables') ||
    q.includes('extend credit') ||
    q.includes('negotiate payment terms');

  // 11. Bank Loans, Debt & Equity Financing (General Questions)
  const isDebtVsEquity =
    (q.includes('debt') && q.includes('equity')) ||
    q.includes('equity vs debt') ||
    q.includes('dilution') ||
    q.includes('funding options');

  const isBankLoanGeneral =
    q.includes('bank loan') ||
    q.includes('working capital loan') ||
    q.includes('cc limit') ||
    q.includes('cash credit') ||
    q.includes('overdraft') ||
    q.includes('od limit') ||
    q.includes('cma data') ||
    q.includes('cibil') ||
    q.includes('cmr rank') ||
    q.includes('apply for loan');

  // 12. Strategic Playbooks
  const isEmergencyLiquidity =
    q.includes('emergency') ||
    q.includes('liquidity') ||
    q.includes('runway is under') ||
    q.includes('cash preservation') ||
    q.includes('cash crunch') ||
    q.includes('out of cash');

  const isReceivablesAction =
    q.includes('liquidate') ||
    q.includes('debtor receivables') ||
    q.includes('treds invoice discounting') ||
    q.includes('delayed payment') ||
    q.includes('unblock receivables');

  const isDebtAction =
    q.includes('interest rate') ||
    q.includes('dscr defense') ||
    q.includes('covenant') ||
    q.includes('restructure') ||
    q.includes('rate hike');

  const isInflationAction =
    q.includes('inflation') ||
    q.includes('raw material') ||
    q.includes('price indexing') ||
    q.includes('cost increase') ||
    q.includes('margin squeeze');

  const isSchemeAction =
    q.includes('subsidy') ||
    q.includes('scheme') ||
    q.includes('government grant') ||
    q.includes('cgtmse') ||
    q.includes('ramp') ||
    q.includes('mudra');

  let verdict: CFOAdvisoryResult['cfoVerdict'] =
    inputs.dscr < 1.15 || inputs.cashRunwayMonths < 2.0
      ? 'Urgent Intervention Needed'
      : inputs.dscr < 1.4 || inputs.receivablesDays > 60
      ? 'Moderate Liquidity Optimization'
      : 'Capital Expansion Ready';

  let replyText = '';
  let diagnosis = '';
  let immediateActions: string[] = [];
  let mediumTermStrategies: string[] = [];
  let recommendedSchemes: CFOAdvisoryResult['recommendedSchemes'] = [];
  let projectedMetricImpact: CFOAdvisoryResult['projectedMetricImpact'] = [];

  // Respond accurately according to the specific user prompt:
  if (isGreeting) {
    replyText = `Hello! I am your AI Digital CFO for **${inputs.businessName}**. 

I am actively monitoring your balance sheet, cash velocity, and debt covenants. Here is our live snapshot:
• **Annual Turnover**: ₹${inputs.annualRevenueLakhs} Lakhs (${inputs.sector}, ${inputs.district}, ${inputs.state})
• **Cash Runway**: ${inputs.cashRunwayMonths} months buffer
• **Debtor Collection (DSO)**: ${inputs.receivablesDays} days vs 45-day MSMED benchmark
• **Debt Service Coverage (DSCR)**: ${inputs.dscr.toFixed(2)}x (Interest burden: ₹${inputs.monthlyInterestBurdenLakhs}L/mo)

How can I assist your treasury today? You can ask me to structure a **TReDS invoice discounting plan**, test a **50 bps interest rate hike on DSCR**, find **government credit subsidies**, or ask any specific financial question!`;
  } else if (isIdentityOrHelp) {
    replyText = `I am your enterprise **AI Digital CFO**, calibrated specifically for Indian MSMEs and mid-market corporates.

Here are the strategic areas I can manage for **${inputs.businessName}**:
1. **Working Capital & Receivables**: Accelerating debtor collections, statutory MSMED 45-day compliance, and non-recourse invoice discounting via TReDS (RXIL/M1xchange).
2. **Banking Covenants & Debt Protection**: Stress-testing DSCR against RBI repo rate revisions and restructuring high-interest CC/OD lines into soft term loans.
3. **Emergency Liquidity Modeling**: Formulating 7-day cash preservation models and rolling 13-week cash flow forecasts.
4. **Inflation Defense**: Drafting raw material price indexing clauses for OEM buyer contracts.
5. **Government Schemes & Subsidies**: Directly linking you to CGTMSE collateral-free guarantees, Interest Subvention, and RAMP grants.

What challenge would you like us to tackle right now?`;
  } else if (isStatusQuery) {
    replyText = `Here is our **Executive Balance Sheet Health Check** for **${inputs.businessName}**:

• **Solvency & Debt**: DSCR is **${inputs.dscr.toFixed(2)}x** with Debt-to-Equity at **${inputs.debtToEquity}**. ${inputs.dscr < 1.15 ? '⚠️ Warning: Debt servicing leaves very thin margin for error.' : 'Debt service coverage is in a manageable range.'}
• **Working Capital Cycle**: Debtor days stand at **${inputs.receivablesDays} days** compared to vendor payables of **${inputs.payablesDays} days**. Trapped receivables total ~₹${Math.round((inputs.annualRevenueLakhs / 365) * Math.max(0, inputs.receivablesDays - 45))} Lakhs beyond the 45-day statutory limit.
• **Liquidity Buffer**: Operating cash runway is **${inputs.cashRunwayMonths} months** (₹${inputs.monthlyInterestBurdenLakhs} Lakhs/mo debt service).
• **Profitability**: Net profit margin is **${inputs.netProfitMargin}%** under YoY growth of **${inputs.revenueGrowthYoY}%** facing **${inputs.rawMaterialInflationPct}%** input inflation.

**CFO Top Priority**: ${inputs.receivablesDays > 60 ? 'Unlock trapped debtor receivables via TReDS.' : 'Build cash runway buffer beyond 3.5 months.'}`;
  } else if (isDSOExplain) {
    replyText = `**DSO (Days Sales Outstanding)** measures the average number of days it takes for your company to collect cash from customers after issuing an invoice.

**Our Current Situation at ${inputs.businessName}**:
• Current DSO: **${inputs.receivablesDays} days**
• MSMED Act Statutory Cap: **45 days**
• Gap / Overdue Delay: **${Math.max(0, inputs.receivablesDays - 45)} days**
• Capital Locked: **₹${Math.round((inputs.annualRevenueLakhs / 365) * Math.max(0, inputs.receivablesDays - 45))} Lakhs**

Because your suppliers must be paid in **${inputs.payablesDays} days**, you have a negative working capital gap of **${inputs.receivablesDays - inputs.payablesDays} days** funded entirely through expensive bank overdrafts or delayed vendor payments. I recommend discounting eligible invoices on TReDS to compress this down to T+2 days.`;
  } else if (isDSCRExplain) {
    replyText = `**DSCR (Debt Service Coverage Ratio)** measures your operational cash flow's ability to cover interest and principal debt obligations:
$$\\text{DSCR} = \\frac{\\text{Net Operating Income}}{\\text{Total Debt Service}}$$

**Our Metric at ${inputs.businessName}**:
• Current DSCR: **${inputs.dscr.toFixed(2)}x**
• Minimum Bank Covenant: **1.20x**
• Assessment: ${inputs.dscr < 1.15 ? '⚠️ High risk of loan covenant breach. A 50-75 bps interest rate hike would push us below 1.0x (insolvency zone).' : 'Healthy coverage with sufficient operating cushion.'}

To defend our DSCR, we should convert short-term high-cost cash credit into 3-5 year term debt under CGTMSE guarantee schemes.`;
  } else if (isTReDSExplain) {
    replyText = `**TReDS (Trade Receivables Discounting System)** is an RBI-authorized electronic platform (RXIL, M1xchange, Invoicemart) that enables MSMEs to auction approved trade bills from corporate buyers and PSUs to banks at competitive discount rates.

**Key Advantages for ${inputs.businessName}**:
1. **100% Non-Recourse**: If the corporate buyer defaults, the discounting bank bears the loss, not you.
2. **Cost Arbitrage**: Factoring rate is **8.2% – 9.0%** annualized compared to bank Cash Credit (CC) / OD rates of **14.0% – 16.5%**.
3. **Liquidity**: Converts 60–90 day receivables into liquid bank funds within 48 hours.
4. **Registration**: Requires GSTIN, PAN, Udyam Registration, and active banking mandate.`;
  } else if (isCGTMSEExplain) {
    replyText = `**CGTMSE (Credit Guarantee Fund Trust for Micro and Small Enterprises)** provides collateral-free credit guarantees up to **₹5 Crore** set up by the Ministry of MSME and SIDBI.

**How ${inputs.businessName} Can Benefit**:
• Obtain working capital term loans without pledging commercial or residential property.
• Guarantee cover extends up to **75% to 85%** of the sanctioned loan facility.
• Annual guarantee fee is capped between 0.37% and 1.35% depending on loan slab.
• Ideal for restructuring high-cost unsecured NBFC debt or funding clean machinery modernization.`;
  } else if (isEmergencyLiquidity) {
    replyText = `As your Digital CFO, our immediate priority for ${inputs.businessName} is implementing a **7-Day Emergency Liquidity & Cash Preservation Plan**. With our current cash runway at **${inputs.cashRunwayMonths} months**, we cannot rely on conventional bank credit lines. We must immediately halt discretionary outlays, institute weekly rolling collections, and enforce statutory debtor terms.`;
    diagnosis = `Acute Liquidity Constraint: Operating cash runway of ${inputs.cashRunwayMonths} months leaves less than 60 days before potential payroll and debt service friction.`;
    immediateActions = [
      'Establish a 7-day executive freeze on all non-production capex, travel, and discretionary operational overhead.',
      'Audit the top 5 debtors with balances overdue >60 days and dispatch formal demand letters citing MSMED Section 16 interest clauses.',
      'Approach primary banker for a 90-day moratorium or ad-hoc 10% credit line enhancement under emergency MSME credit provisions.',
    ];
    mediumTermStrategies = [
      'Transition billing terms to 30% advance on order placement and 70% against delivery / GST e-way bill verification.',
      'Rationalize SKU inventory holding from current 75 days to 45 days to liberate trapped capital.',
    ];
    recommendedSchemes = [
      { name: 'Emergency Working Capital Line', benefit: 'Pre-approved collateral-free 10-15% top-up on existing bank limits at concessional interest.', agency: 'Public Sector Banks / SLBC' },
      { name: 'Samadhaan Dispute Portal', benefit: 'Statutory conciliation filing against delinquent corporate buyers under MSMED Act.', agency: 'Ministry of MSME' },
    ];
    projectedMetricImpact = [
      { metric: 'Operating Cash Runway', before: `${inputs.cashRunwayMonths} Months`, after: `${(inputs.cashRunwayMonths + 1.8).toFixed(1)} Months`, impact: '+1.8 months emergency runway' },
      { metric: 'Weekly Free Cash Flow', before: `Negative`, after: `+₹4.2 Lakhs / wk`, impact: 'Restores operating payroll stability' },
    ];
  } else if (isReceivablesAction) {
    replyText = `Digital CFO Receivables Directive for ${inputs.businessName}: Our Debtor Days (DSO) of **${inputs.receivablesDays} days** exceeds the 45-day statutory limit by **${Math.max(0, inputs.receivablesDays - 45)} days**, locking up ~**₹${Math.round((inputs.annualRevenueLakhs / 365) * Math.max(0, inputs.receivablesDays - 45))} Lakhs** in trapped working capital. I recommend executing a non-recourse digital invoice discounting workflow via TReDS and establishing tiered buyer discount incentives.`;
    diagnosis = `Working Capital Lockup: Debtor cycle (${inputs.receivablesDays}d) significantly exceeds payables cycle (${inputs.payablesDays}d), resulting in a negative cash conversion gap.`;
    immediateActions = [
      'Onboard your firm to RBI-regulated TReDS portals (RXIL / M1xchange) for non-recourse digital invoice discounting within 5 business days.',
      'Audit the top 3 corporate/PSU debtors accounting for >60% of outstanding receivables and demand GST e-way bill reconciliation.',
      'Institute a 1.5% prompt payment cash discount incentive for buyers settling within 15 days.',
    ];
    mediumTermStrategies = [
      'Incorporate MSMED statutory 45-day payment clause with 3x RBI bank rate compounding interest in all upcoming purchase orders.',
      'Transition key repeat institutional clients to Letter of Credit (LC) or Bank Guarantee backed contracts.',
    ];
    recommendedSchemes = [
      { name: 'TReDS Factoring Facility', benefit: 'Immediate receivables liquidation at competitive 8.2% - 9.1% bank discount rates without corporate recourse.', agency: 'RBI / RXIL' },
      { name: 'Samadhaan Delayed Payment Portal', benefit: 'Statutory dispute arbitration filing against non-compliant buyers under MSMED Act Section 18.', agency: 'Ministry of MSME' },
    ];
    projectedMetricImpact = [
      { metric: 'Debtor Collection Cycle (DSO)', before: `${inputs.receivablesDays} Days`, after: `${Math.max(38, inputs.receivablesDays - 35)} Days`, impact: 'Releases 35 days of liquid cash' },
      { metric: 'Operating Cash Runway', before: `${inputs.cashRunwayMonths} Months`, after: `${(inputs.cashRunwayMonths + 2.2).toFixed(1)} Months`, impact: '+2.2 months emergency buffer' },
    ];
  } else if (isDebtAction) {
    replyText = `Analyzing our debt profile for ${inputs.businessName}: DSCR currently stands at **${inputs.dscr.toFixed(2)}x** with monthly debt charges of **₹${inputs.monthlyInterestBurdenLakhs} Lakhs** against a Debt-to-Equity of **${inputs.debtToEquity}**. If the bank increases lending rates by 50 bps, our DSCR would drop to **${Math.max(0.85, inputs.dscr - 0.12).toFixed(2)}x**, breaching standard debt covenants. We must immediately convert utilized Cash Credit into a term loan structure and claim interest subventions.`;
    diagnosis = `Leverage Stress: Monthly debt service (DSCR ${inputs.dscr.toFixed(2)}x) absorbs significant operating cash flow, leaving high vulnerability to interest rate hikes.`;
    immediateActions = [
      'Request lead bank to convert 40% of utilized Cash Credit (CC) limits into a 3-year Working Capital Term Loan (WCTL) to soften repayment pressure.',
      'Verify eligibility for 2% interest subvention under RBI priority sector relief schemes for manufacturing units.',
      'Freeze non-essential machinery capex commitments until DSCR recovers above 1.35x.',
    ];
    mediumTermStrategies = [
      'Refinance unsecured NBFC promoter loans (typically 16-18% APR) with SIDBI direct loan facilities at 9.5-10.5%.',
      'Set an internal debt ceiling not exceeding 1.8x Debt-to-Equity to protect solvency ratings.',
    ];
    recommendedSchemes = [
      { name: 'CGTMSE Credit Guarantee Scheme', benefit: 'Collateral-free credit coverage up to ₹5 Crore with reduced margin requirements and lender assurance.', agency: 'SIDBI & Ministry of MSME' },
      { name: 'Interest Subvention Scheme', benefit: '200 bps annualized interest rebate on working capital loans for compliant GST registered MSMEs.', agency: 'Reserve Bank of India' },
    ];
    projectedMetricImpact = [
      { metric: 'Debt Service Coverage (DSCR)', before: `${inputs.dscr.toFixed(2)}x`, after: `${(inputs.dscr + 0.35).toFixed(2)}x`, impact: '+0.35x covenant headroom' },
      { metric: 'Monthly Interest Burden', before: `₹${inputs.monthlyInterestBurdenLakhs} Lakhs`, after: `₹${Math.max(0.4, Number((inputs.monthlyInterestBurdenLakhs * 0.78).toFixed(2)))} Lakhs`, impact: 'Saves 22% monthly cash charges' },
    ];
  } else if (isInflationAction) {
    replyText = `Input cost analysis for ${inputs.businessName}: Raw material inflation is running at **+${inputs.rawMaterialInflationPct}%**, severely eroding our operating net margin (**${inputs.netProfitMargin}%**). To stop margin bleed, we must implement dynamic price indexing in institutional contracts and organize collective cluster buying.`;
    diagnosis = `Margin Erosion: Unhedged exposure to raw material price inflation (${inputs.rawMaterialInflationPct}%) against fixed contract pricing.`;
    immediateActions = [
      'Insert a quarterly dynamic commodity indexing clause linked to Wholesale Price Index (WPI) in all customer master service agreements.',
      'Negotiate 30-day price locks or forward contracts with primary raw material suppliers.',
      'Conduct value-engineering review to substitute non-critical materials with cost-optimized alternatives.',
    ];
    mediumTermStrategies = [
      'Form or join a regional consortium of MSME peers in ${inputs.district} for bulk raw material procurement, targeting 6-8% volume discounts.',
      'Implement just-in-time inventory tracking to avoid holding over-priced input stock.',
    ];
    recommendedSchemes = [
      { name: 'MSME Cluster Development Programme (MSE-CDP)', benefit: 'Grant assistance for common raw material banks, testing centers, and bulk storage facilities.', agency: 'Ministry of MSME' },
      { name: 'Raw Material Assistance Scheme', benefit: 'Financing support against bank guarantee for procurement of indigenous raw materials.', agency: 'NSIC (National Small Industries Corporation)' },
    ];
    projectedMetricImpact = [
      { metric: 'Net Profit Margin', before: `${inputs.netProfitMargin}%`, after: `${(inputs.netProfitMargin + 2.8).toFixed(1)}%`, impact: '+280 bps margin restoration' },
      { metric: 'Gross Raw Material Cost', before: `Baseline`, after: `-7.5% Savings`, impact: 'Achieved through consortium purchasing' },
    ];
  } else if (isSchemeAction) {
    replyText = `Policy & Subsidies Audit for ${inputs.businessName} (${inputs.sector}, ${inputs.state}): There are multiple Central and State fiscal programs specifically designed to lower our capital cost, subsidize technology adoption, and guarantee working capital loans.`;
    diagnosis = `Under-leveraged Policy Support: Enterprise has not yet fully accessed available Central & State credit subventions and MSME performance grants.`;
    immediateActions = [
      'Verify Udyam Registration validity and classify active enterprise under Micro/Small criteria to unlock priority sector benefits.',
      'Apply for CGTMSE collateral-free guarantee cover for next debt renewal at lead lending bank.',
      'File pending GST input tax refund claims on exports and inverted duty structure via GST portal.',
    ];
    mediumTermStrategies = [
      'Enroll in the World Bank backed RAMP initiative for subsidized digital ERP and automated accounting compliance.',
      'Submit application for State MSME capital investment and power tariff subsidy schemes.',
    ];
    recommendedSchemes = [
      { name: 'CGTMSE Collateral-Free Scheme', benefit: 'Credit guarantee cover up to ₹5 Crore for manufacturing MSMEs.', agency: 'SIDBI / MSME Ministry' },
      { name: 'RAMP (Raising & Accelerating MSME Performance)', benefit: 'Technical assistance grants and digital transformation funding.', agency: 'World Bank & MSME Ministry' },
      { name: 'Interest Subvention Scheme', benefit: '200 bps annualized rebate on working capital lines for GST-compliant MSMEs.', agency: 'Reserve Bank of India' },
    ];
    projectedMetricImpact = [
      { metric: 'Annual Capital Subsidies Claimed', before: `₹0 Lakhs`, after: `₹3.6 Lakhs`, impact: 'Direct bottom-line fiscal support' },
      { metric: 'Effective Cost of Capital', before: `14.2% APR`, after: `10.8% APR`, impact: '-340 bps interest reduction' },
    ];
  } else if (isCasualChitChat) {
    replyText = `I am doing very well, thank you for asking! 😊 Fully engaged and analyzing **${inputs.businessName}**'s financial health.

As your digital CFO, I am ready to advise you on anything from corporate tax planning, cost cutting, and working capital acceleration to general business strategy. How is your day going, and what's on your financial agenda today?`;
  } else if (isFoodOrPersonal) {
    replyText = `Haha, as an AI Digital CFO, I don't eat real food! 😄 My fuel is clean accounting ledgers, cash flow splines, and financial models! ⚡

Thank you for the friendly check-in though! Have you taken time for a meal today? Whenever you're ready, feel free to ask me any general business or treasury questions!`;
  } else if (isThanks) {
    replyText = `You are very welcome! 😊 It is my job as your AI Digital CFO to help **${inputs.businessName}** protect margins, optimize cash runway, and make sound financial decisions.

Feel free to ask anytime you need guidance on taxes, costs, bank loans, or day-to-day business operations!`;
  } else if (isTaxSection43BH) {
    replyText = `### Section 43B(h) of the Income Tax Act: MSME 45-Day Payment Rule

Section 43B(h) was introduced to protect MSMEs against delayed payments. Here is how it works and how it affects **${inputs.businessName}**:

1. **The Core Rule**:
   Any business buying goods or services from a registered **Micro or Small enterprise** (with Udyam registration) must settle payments within:
   • **15 days** if there is no written agreement.
   • **Up to 45 days** if there is a written agreement specifying credit terms.

2. **The Penalty for Buyers**:
   If a buyer fails to pay within 45 days, the buyer **cannot claim tax deduction** for that expenditure in that financial year! The entire unpaid amount is added back to their taxable income and taxed at corporate rates (~30%). Deduction is allowed only in the year the payment is actually made.

3. **How We Can Leverage This at ${inputs.businessName}**:
   • **Print Udyam Number on Invoices**: Clearly print your Udyam Registration Number and MSME classification (Micro/Small) on all tax invoices.
   • **Send Reminder on Day 30**: Send a polite reminder to corporate debtors referencing Section 43B(h) and MSMED Section 15. Because corporate buyers fear tax disallowance, this is our strongest legal lever to collect our **${inputs.receivablesDays}-day receivables** before financial year-end!`;
  } else if (isGSTQuery) {
    replyText = `### GST & Input Tax Credit (ITC) Advisory for ${inputs.businessName}

Managing GST cash outflows and ensuring 100% Input Tax Credit (ITC) capture is critical for preserving working capital:

1. **Reconciling GSTR-2B vs Books**:
   Under current GST rules, you can only claim ITC if your vendor has uploaded the invoice and it reflects in your auto-generated **GSTR-2B**. Reconcile vendor ledgers monthly to ensure no vendor fails to file GSTR-1, which would trap your tax credits.

2. **Inverted Duty Structure Refunds**:
   In sectors like ${inputs.sector}, if the GST rate on raw materials (e.g. 18%) is higher than the output GST rate on finished goods (e.g. 5% or 12%), accumulated unutilized ITC can be refunded directly into your bank account under Section 54(3).

3. **Vendor Retention Mechanism**:
   Institute a policy where the GST component of vendor invoices (18%) is withheld or settled only after verifying that the invoice has reflected in GSTR-2B. This protects your cash flow from non-compliant suppliers.`;
  } else if (isTaxGeneral) {
    replyText = `### Practical Corporate Tax Optimization for ${inputs.businessName}

Here are legitimate, high-impact strategies to optimize your corporate tax liability without triggering scrutiny:

1. **Accelerated & Written-Down Value (WDV) Depreciation**:
   Under Section 32 of the Income Tax Act, capital expenditures on industrial machinery, computer equipment (40% rate), and energy-saving devices qualify for accelerated depreciation, reducing taxable profits directly.

2. **MSME Interest Deductions**:
   Ensure all interest payments on bank Cash Credit (CC), term loans, and NBFC borrowing (currently ₹${inputs.monthlyInterestBurdenLakhs} Lakhs/month for ${inputs.businessName}) are booked properly as deductible business expenses.

3. **Managing Advance Tax Installments**:
   Pay advance tax in the mandatory 4 installments (15% by June 15, 45% by Sept 15, 75% by Dec 15, 100% by March 15) to avoid penal interest under Sections 234B and 234C (1% per month).

4. **Section 115BAA Concessional Tax Regime**:
   If organized as a domestic company, evaluate opting for Section 115BAA (flat 22% corporate tax rate + surcharge/cess = effective ~25.17%), provided you forego certain deductions.`;
  } else if (isEBITDA) {
    replyText = `### What is EBITDA and Why Does It Matter for ${inputs.businessName}?

**EBITDA** stands for **Earnings Before Interest, Taxes, Depreciation, and Amortization**.

$$\\text{EBITDA} = \\text{Operating Revenue} - \\text{Operating Expenses (Raw Materials + Labor + SG\\&A)}$$

1. **Why Banks and Lenders Focus on EBITDA**:
   Lenders look at EBITDA because it strips away non-operational variables (debt structure, tax regimes, and accounting depreciation methods) to reveal the **pure cash-generating ability** of your core operations.

2. **How Banks Use It for ${inputs.businessName}**:
   • **DSCR Calculation**: Bank Debt Service Coverage Ratio (DSCR) divides EBITDA by your annual debt service (Principal + Interest).
   • **Interest Coverage Ratio**: EBITDA / Annual Interest Expense.
   With your current interest burden at ₹${inputs.monthlyInterestBurdenLakhs} Lakhs/month (₹${(inputs.monthlyInterestBurdenLakhs * 12).toFixed(1)} Lakhs/year), maintaining strong EBITDA is what prevents bank credit lines from getting downgraded.

3. **How to Improve EBITDA**:
   Focus on widening the spread between selling price and direct variable unit costs (raw materials and freight).`;
  } else if (isRevVsProfit) {
    replyText = `### Difference Between Revenue and Profit (Top Line vs Bottom Line)

Many entrepreneurs confuse revenue growth with business health. Here is the vital distinction:

1. **Revenue (Top Line)**:
   Total gross money generated from invoicing goods or services sold before deducting any costs.
   • For **${inputs.businessName}**, your annual revenue is **₹${inputs.annualRevenueLakhs} Lakhs**.

2. **Gross Profit**:
   Revenue minus direct Cost of Goods Sold (COGS: raw materials, factory wages, direct power).
   • Reflects production efficiency.

3. **Operating Profit (EBITDA)**:
   Gross Profit minus operational overhead (office salaries, marketing, administration, rent).

4. **Net Profit (Bottom Line)**:
   What remains after paying interest to banks, depreciation, and income taxes to the government.
   • For **${inputs.businessName}**, your net profit margin is **${inputs.netProfitMargin}%**, leaving ~**₹${((inputs.annualRevenueLakhs * inputs.netProfitMargin) / 100).toFixed(1)} Lakhs** in annual retained earnings.

**The CFO Golden Rule**: *"Revenue is vanity, profit is sanity, but cash in bank is reality."* A company can grow revenue by 30% and still go insolvent if customers take 90 days to pay while raw material costs rise.`;
  } else if (isMarginsGeneral) {
    replyText = `### Strategies to Protect & Expand Profit Margins at ${inputs.businessName}

Your current Net Profit Margin is **${inputs.netProfitMargin}%**, under raw material inflation of **${inputs.rawMaterialInflationPct}%**. Here is how we can expand margins:

1. **Pareto SKU Margin Audit (80/20 Rule)**:
   Analyze all product lines by gross margin percentage. Discontinue or repricing the bottom 20% of SKUs that consume factory floor capacity but deliver sub-5% gross margins.

2. **Shift From Markup to Margin Calculation**:
   • **Markup** is profit divided by cost: $\\text{Markup} = \\frac{\\text{Profit}}{\\text{Cost}}$.
   • **Margin** is profit divided by revenue: $\\text{Margin} = \\frac{\\text{Profit}}{\\text{Price}}$.
   A 20% markup yields only a 16.6% margin! Ensure sales quotation teams calculate true margins.

3. **Raw Material Pass-Through**:
   With ${inputs.rawMaterialInflationPct}% input cost increases, negotiate dynamic price adjustment clauses tied to commodity indices (e.g. ICIS, Platts, or wholesale index) on all buyer contracts.`;
  } else if (isSalesGrowth) {
    replyText = `### CFO Roadmap for Sustainable Sales & Revenue Growth

Growing revenue without straining working capital requires disciplined execution:

1. **Diversify Customer Concentration**:
   Ensure no single corporate buyer accounts for more than 25% of total sales. Heavy concentration gives buyers unfair pricing leverage and stretches debtor days.

2. **Target High-Margin Niche Applications**:
   In ${inputs.sector}, transition product mix toward specialized, value-added industrial applications where buyers prioritize delivery reliability and technical precision over lowest bid price.

3. **B2B Pre-Payment Incentives**:
   Pair new sales pushes with structured payment terms (e.g. 30% advance on order, 70% against delivery/e-way bill) so growing sales expands cash reserves rather than expanding trapped debt.`;
  } else if (isWorkingCapitalConcept) {
    replyText = `### What is Working Capital and How Do We Calculate It?

**Working Capital** is the liquid capital a business needs to fund day-to-day operations (procuring raw materials, paying factory wages, meeting utility bills) while waiting for customers to pay their invoices.

$$\\text{Net Working Capital (NWC)} = \\text{Current Assets (Cash + Inventory + Debtors)} - \\text{Current Liabilities (Creditors + Short-term CC)}$$

**Our Metrics at ${inputs.businessName}**:
• **Debtor Days (DSO)**: **${inputs.receivablesDays} days** (Cash tied up in customer credit)
• **Inventory Days (DIO)**: **${inputs.inventoryTurnoverDays} days** (Cash tied up in raw stock & WIP)
• **Payables Days (DPO)**: **${inputs.payablesDays} days** (Credit provided by vendors)

$$\\text{Cash Conversion Cycle (CCC)} = \\text{DSO} + \\text{DIO} - \\text{DPO} = ${inputs.receivablesDays} + ${inputs.inventoryTurnoverDays} - ${inputs.payablesDays} = ${inputs.receivablesDays + inputs.inventoryTurnoverDays - inputs.payablesDays}\\text{ days}$$

This means cash is trapped for **${inputs.receivablesDays + inputs.inventoryTurnoverDays - inputs.payablesDays} days** in every production cycle! To improve liquidity, our goal is compressing DSO through TReDS invoice discounting.`;
  } else if (isBreakEven) {
    const fixedCostsEstimate = Math.round(inputs.annualRevenueLakhs * 0.35);
    const contributionMarginEstimate = Math.max(0.15, (inputs.netProfitMargin + 20) / 100);
    const breakEvenRevenue = Math.round(fixedCostsEstimate / contributionMarginEstimate);

    replyText = `### Break-Even Point (BEP) Analysis for ${inputs.businessName}

The **Break-Even Point** is the minimum sales turnover where total revenue equals total costs—meaning the company makes zero profit and zero loss.

$$\\text{Break-Even Revenue} = \\frac{\\text{Total Fixed Costs}}{\\text{Contribution Margin Ratio}}$$

**Estimated Baseline for ${inputs.businessName}**:
• **Annual Fixed Costs** (Salaries, Rent, Plant Depreciation, Bank Interest): ~₹${fixedCostsEstimate} Lakhs
• **Contribution Margin Ratio**: ~${Math.round(contributionMarginEstimate * 100)}%
• **Break-Even Sales Threshold**: ~**₹${breakEvenRevenue} Lakhs / year** (~₹${Math.round(breakEvenRevenue / 12)} Lakhs / month)
• **Current Annual Turnover**: **₹${inputs.annualRevenueLakhs} Lakhs**

**Safety Margin Cushion**:
Your safety margin is $\\frac{${inputs.annualRevenueLakhs} - ${breakEvenRevenue}}{${inputs.annualRevenueLakhs}} \\times 100 \\approx ${Math.max(0, Math.round(((inputs.annualRevenueLakhs - breakEvenRevenue) / inputs.annualRevenueLakhs) * 100))}\\%$. Any revenue drop greater than this cushion pushes the enterprise into operational losses.`;
  } else if (isCashVsProfit) {
    replyText = `### Why Profitable Companies Run Out of Cash (The Cash vs Profit Mismatch)

It is one of the most common paradoxes in business: an enterprise shows healthy accounting profits on its P&L, yet struggles to pay employee salaries and vendor bills on Friday.

**Here is why this happens**:
1. **Accrual Accounting vs Cash Velocity**:
   Revenue is recognized the moment you issue a tax invoice. If you deliver ₹50 Lakhs of goods today, your P&L shows ₹50 Lakhs revenue and ₹5 Lakhs profit immediately. But if the buyer pays in 90 days, you have zero cash to pay suppliers!
2. **Inventory Accumulation**:
   Buying raw materials does not count as an expense on the P&L until the goods are sold. Cash leaves the bank account immediately, but the expense is deferred, masking cash outflows.
3. **Debt Principal Amortization**:
   Repaying bank loan principal is not an expense on the P&L (only interest is an expense), but it directly drains liquid bank cash every single month!
4. **For ${inputs.businessName}**:
   With **${inputs.receivablesDays} debtor days** and **${inputs.cashRunwayMonths} months runway**, timing mismatches are our primary vulnerability. Managing weekly cash velocity is just as critical as managing quarterly profits.`;
  } else if (isPayrollInCrunch) {
    replyText = `### Managing Payroll & Working Capital During a Cash Crunch

Meeting employee payroll is a non-negotiable moral and legal priority. If cash runway is tight (${inputs.cashRunwayMonths} months), here is how to navigate:

1. **TReDS Liquidation**:
   Discount eligible corporate invoices immediately on TReDS to inject liquid cash within 48 hours to fund salary disbursement accounts.
2. **Prioritize Statutory Dues (PF / ESI / TDS)**:
   Always deposit employee PF and TDS on schedule. Directors face personal liability and heavy compounding penalties for statutory defaults.
3. **Open Transparent Communication**:
   If there is a brief milestone delay, communicate proactively with senior team members and offer flexible leave or temporary bonuses once institutional receivables clear.
4. **Freeze Non-Core Outlays**:
   Immediately pause contractor hiring, marketing retainers, and capex disbursements to conserve cash for payroll.`;
  } else if (isCostCutting) {
    replyText = `### Practical Cost Reduction & Expense Optimization Framework

Here is a structured CFO approach to rationalizing operating costs at **${inputs.businessName}** without hurting core manufacturing capacity:

1. **Fixed Costs vs Variable Costs Audit**:
   • **Variable Costs** (Raw materials, direct power, packaging): Negotiate bulk consortium discounts or alternate material blends.
   • **Fixed Costs** (Plant rent, software SaaS subscriptions, administrative retainers): Audit all subscriptions; cancel unused seats and renegotiate warehouse leases.
2. **Industrial Power & Utility Tariff Optimization**:
   In ${inputs.state}, check your factory power load. Move energy-intensive machinery cycles to off-peak tariff hours (Time of Day - ToD metering) to reduce electricity bills by 10-15%.
3. **Consolidate Logistics & Freight**:
   Combine LTL (Less than Truckload) shipments into scheduled weekly full-truck dispatch cycles to save 12-18% on transport overhead.`;
  } else if (isDebtorCollectionGeneral) {
    replyText = `### How to Collect Overdue Receivables Without Losing Clients

Collecting from delinquent buyers while preserving long-term commercial relationships requires a tiered, professional approach:

1. **Tier 1 (Day 15 - Courtesy Notice)**:
   Automated statement of account and friendly confirmation of invoice receipt, GST credit verification, and payment schedule.
2. **Tier 2 (Day 30 - Commercial Incentive)**:
   Offer a 1.5% prompt-pay cash discount for immediate RTGS clearance, or offer to invoice-discount the bill via TReDS so the buyer retains credit terms while a bank pays you.
3. **Tier 3 (Day 45 - Statutory MSMED & Tax Reference)**:
   Formal demand note citing **Section 15 of MSMED Act** and **Section 43B(h) of Income Tax Act**. Inform the buyer's CFO that failure to settle within 45 days will disqualify their tax deduction and incur compound interest at **3x RBI bank rate** under MSMED Section 16.
4. **Tier 4 (Day 60+ - MSME Samadhaan Filing)**:
   File a dispute petition on the Ministry of MSME's **Samadhaan portal** for statutory conciliation and recovery.`;
  } else if (isVendorNegotiation) {
    replyText = `### How to Negotiate Longer Credit Terms (DPO) With Suppliers

At **${inputs.businessName}**, your payables period is **${inputs.payablesDays} days**, while your debtors take **${inputs.receivablesDays} days**. To close this working capital gap:

1. **Propose Tiered Staggered Payments**:
   Instead of 100% at 30 days, propose 50% at 30 days and 50% at 60 days. This offers vendors predictable cash flow while halving your weekly payout pressure.
2. **Offer Volume Commitment**:
   Offer to sign a 6-month or 12-month preferred vendor contract in exchange for extending credit terms from 30 to 45 or 60 days.
3. **Consignment Inventory**:
   Negotiate for key raw materials to be stored on consignment at your facility—you pay only when goods are pulled into active production, keeping holding costs off your balance sheet.`;
  } else if (isDebtVsEquity) {
    replyText = `### Debt Financing vs Equity Financing for MSMEs

Choosing between debt and equity depends on cash flow predictability and ownership goals:

1. **Debt Financing (Bank Loans, Cash Credit, Term Debt)**:
   • **Pros**: You retain 100% equity ownership and control; interest payments are tax-deductible.
   • **Cons**: Requires fixed monthly interest (currently ₹${inputs.monthlyInterestBurdenLakhs}L/mo for ${inputs.businessName}) and principal repayment regardless of whether business is making profit; risks insolvency if DSCR slips below 1.0x.
   • **Best For**: Predictable operational working capital, equipment purchasing with clear cash payback.

2. **Equity Financing (Angel Investors, Private Equity, Strategic Partners)**:
   • **Pros**: Zero mandatory monthly repayment or debt service burden; brings strategic guidance and industry connections.
   • **Cons**: Permanent dilution of your ownership and future profit shares; requires board reporting and shared decision-making.
   • **Best For**: High-risk R&D, market expansion, or turnaround when bank borrowing capacity is maxed out.`;
  } else if (isBankLoanGeneral) {
    replyText = `### Working Capital Loans & Preparing for Bank Credit Committee

Navigating bank borrowing (Cash Credit/Overdraft) for **${inputs.businessName}**:

1. **Cash Credit (CC) vs Overdraft (OD) vs Term Loan**:
   • **Cash Credit (CC)**: Sanctioned against hypothecation of raw stock, work-in-progress, and book debts (subject to drawing power margin).
   • **Overdraft (OD)**: Flexible line against fixed collateral or bank deposits.
   • **Term Loan**: Fixed tenure loan (3–7 years) for plant machinery with structured EMI.
2. **Preparing CMA (Credit Monitoring Arrangement) Data**:
   Banks evaluate your past 3 years' audited financials and 2 years' projections. Key metrics they verify:
   • **DSCR**: Must be >= 1.20x (our baseline is ${inputs.dscr.toFixed(2)}x).
   • **Current Ratio**: Minimum 1.33x.
   • **Debt-to-Equity**: Ideal ratio below 2.5:1 (our baseline is ${inputs.debtToEquity}:1).
3. **Collateral Relief via CGTMSE**:
   If lacking real estate collateral, request the branch manager to process the facility under CGTMSE guarantee cover (up to ₹5 Crore collateral-free).`;
  } else {
    // Dynamic Intelligent General Question Reasoner
    replyText = `### AI Digital CFO Executive Advisory: "${userQuery}"

Here is my direct, conversational assessment on this topic for **${inputs.businessName}** (${inputs.sector}, ${inputs.state}):

1. **Strategic Principle & Direct Answer**:
   When addressing "${userQuery}", the core financial objective is balancing operational cash velocity with margin preservation. In your industry (${inputs.sector}), capital efficiency and strict payment discipline dictate whether an initiative strengthens or strains the balance sheet.

2. **Application to ${inputs.businessName}'s Current Numbers**:
   • With annual turnover of **₹${inputs.annualRevenueLakhs} Lakhs** and an operating cash runway of **${inputs.cashRunwayMonths} months**, any decision must safeguard liquid reserves to ensure payroll and debt service (₹${inputs.monthlyInterestBurdenLakhs}L/mo) remain uninterrupted.
   • Your Debtor Days currently stand at **${inputs.receivablesDays} days** and DSCR is **${inputs.dscr.toFixed(2)}x**. Prioritize moves that compress this collection cycle rather than expanding uncollateralized credit lines.

3. **Actionable Next Steps**:
   • Audit your monthly cash inflows against fixed commitments using a rolling 13-week forecast.
   • Ensure all buyer and supplier agreements include clear milestone triggers and 45-day MSMED payment compliance.
   • Leverage digital financing tools like TReDS and CGTMSE to minimize balance sheet leverage.

Would you like me to dive deeper into any specific detail, provide calculations, or structure an implementation roadmap for this?`;
  }

  const fallbackResult: CFOAdvisoryResult = {
    replyText,
    diagnosis,
    immediateActions,
    mediumTermStrategies,
    recommendedSchemes,
    projectedMetricImpact,
    cfoVerdict: verdict,
    isAiGenerated: false,
  };

  if (!apiKey) {
    return fallbackResult;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const historySnippet = conversationHistory.length > 0
      ? `\nPrior Conversation History:\n` + conversationHistory.slice(-8).map(m => `${m.role === 'user' ? 'Client' : 'CFO'}: ${m.content}`).join('\n') + '\n'
      : '';

    const prompt = `You are the enterprise Chief Financial Officer (AI Digital CFO) for an Indian MSME enterprise. You speak directly, conversationally, and insightfully with the business owner.

Enterprise Financial Snapshot:
Company: ${inputs.businessName}
Sector: ${inputs.sector}
Location: ${inputs.district}, ${inputs.state}
Annual Turnover: ₹${inputs.annualRevenueLakhs} Lakhs
YoY Growth: ${inputs.revenueGrowthYoY}%
Net Margin: ${inputs.netProfitMargin}%
Debt to Equity: ${inputs.debtToEquity}
DSCR: ${inputs.dscr}
Debtor Days (DSO): ${inputs.receivablesDays} days
Payables Days (DPO): ${inputs.payablesDays} days
Inventory Days: ${inputs.inventoryTurnoverDays} days
Cash Runway: ${inputs.cashRunwayMonths} months
Input Inflation: ${inputs.rawMaterialInflationPct}%
Monthly Interest: ₹${inputs.monthlyInterestBurdenLakhs} Lakhs
${historySnippet}
User's Message / Query: "${userQuery}"

CRITICAL INSTRUCTIONS:
- Act like a real, helpful human Chief Financial Officer and trusted strategic advisor.
- If the user asks a general question (e.g. "what is ebitda", "how to cut costs", "difference between revenue and profit", "how are you", "can you help me with marketing budget", "explain tax deductions", "did you eat", general chit-chat, etc.), answer THAT question directly, naturally, conversationally, and thoroughly!
- Never output rigid, repetitive templates or canned saved descriptions.
- Only include immediateActions and recommendedSchemes if the user is asking for actionable crisis playbooks or operational reform. For general inquiries, chit-chat, or educational questions, keep immediateActions and recommendedSchemes as empty arrays ([]).

Respond with valid JSON matching this schema:
{
  "replyText": string (Conversational CFO answer with numbers and rationale formatted in clean markdown),
  "diagnosis": string (Root diagnostic cause if diagnosing, or empty string if general question/conversation),
  "immediateActions": string[] (Concrete 7-day tactical steps if requested, or empty array [] if general question),
  "mediumTermStrategies": string[] (30-90 day structural moves if requested, or empty array []),
  "recommendedSchemes": [{"name": string, "benefit": string, "agency": string}],
  "projectedMetricImpact": [{"metric": string, "before": string, "after": string, "impact": string}],
  "cfoVerdict": "Urgent Intervention Needed" | "Moderate Liquidity Optimization" | "Capital Expansion Ready"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    if (response.text) {
      const parsed = JSON.parse(response.text);
      return {
        ...parsed,
        isAiGenerated: true,
      };
    }
    return fallbackResult;
  } catch (err) {
    console.warn('Gemini Digital CFO generation fallback applied:', err);
    return fallbackResult;
  }
}

