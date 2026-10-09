import { NATIONAL_OVERVIEW, STATES_DATA, SECTORS_DATA, EARLY_WARNING_ALERTS } from '../data/indiaData';
import { SMEFinancialInputs, SMEAnalysisResult, CrisisScenarioParams, SimulationResult, AIRiskScoreResult, CFOAdvisoryResult } from '../types';
import { analyzeSMEFinancials } from './mlEngine';
import { runCrisisSimulation } from './simulationEngine';
import { generateAIPolicyBriefing, AIInsightReport, generateAIRiskScore, generateCFOAdvisory } from './geminiService';

/**
 * Robust API Client with built-in instant local fallback for 100% offline & zero-latency reliability.
 */
export const ApiClient = {
  async getNationalOverview() {
    try {
      const res = await fetch('/api/national-stress');
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return NATIONAL_OVERVIEW;
  },

  async getStates() {
    try {
      const res = await fetch('/api/states');
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return STATES_DATA;
  },

  async getSectors() {
    try {
      const res = await fetch('/api/sectors');
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return SECTORS_DATA;
  },

  async getAlerts() {
    try {
      const res = await fetch('/api/alerts');
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return EARLY_WARNING_ALERTS;
  },

  async predictSMEStress(inputs: SMEFinancialInputs): Promise<SMEAnalysisResult> {
    try {
      const res = await fetch('/api/predict-sme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return analyzeSMEFinancials(inputs);
  },

  async simulateCrisis(params: CrisisScenarioParams): Promise<SimulationResult> {
    try {
      const res = await fetch('/api/simulate-crisis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return runCrisisSimulation(params);
  },

  async getPolicyInsights(context: {
    regionName?: string;
    sectorName?: string;
    stressScore: number;
    riskLevel: string;
    primaryIssues: string[];
  }): Promise<AIInsightReport> {
    try {
      const res = await fetch('/api/generate-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(context),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return await generateAIPolicyBriefing(context);
  },

  async generateAIRiskScore(
    inputs: SMEFinancialInputs,
    mlBaselineScore?: number
  ): Promise<AIRiskScoreResult> {
    try {
      const res = await fetch('/api/ai-risk-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs, mlBaselineScore }),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return await generateAIRiskScore(inputs, mlBaselineScore);
  },

  async generateCFOAdvisory(
    userQuery: string,
    inputs: SMEFinancialInputs,
    conversationHistory?: { role: string; content: string }[]
  ): Promise<CFOAdvisoryResult> {
    try {
      const res = await fetch('/api/digital-cfo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userQuery, inputs, conversationHistory }),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return await generateCFOAdvisory(userQuery, inputs, conversationHistory);
  },
};
