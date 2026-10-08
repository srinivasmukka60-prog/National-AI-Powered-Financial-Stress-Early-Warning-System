import { GoogleGenAI } from '@google/genai';

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
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

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
