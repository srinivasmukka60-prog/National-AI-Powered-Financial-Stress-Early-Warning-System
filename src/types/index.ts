export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export type UserRole = 'government' | 'financial_institution' | 'sme_owner';

export interface DistrictData {
  id: string;
  name: string;
  stateId: string;
  stressScore: number;
  riskLevel: RiskLevel;
  clusterName: string;
  mainSectors: string[];
  dominantIssue: string;
  totalMSMEs: number;
}

export interface StateData {
  id: string;
  name: string;
  code: string;
  stressScore: number;
  riskLevel: RiskLevel;
  forecast30: number;
  forecast60: number;
  forecast90: number;
  trend: 'improving' | 'stable' | 'worsening';
  totalSMEs: number;
  activeStressedSMEs: number;
  creditAtRiskCr: number; // in INR Crores
  topRiskFactors: string[];
  recommendedInterventions: string[];
  districts: DistrictData[];
  keySectors: string[];
  // SVG boundary data
  svgPath: string;
  labelCoord: [number, number]; // [x, y]
}

export interface SectorData {
  id: string;
  name: string;
  category: 'manufacturing' | 'services' | 'trade' | 'agro';
  stressScore: number;
  riskLevel: RiskLevel;
  forecast30: number;
  forecast60: number;
  forecast90: number;
  changePct: number;
  highRiskPercentage: number;
  totalCreditExposureCr: number; // in INR Crores
  keyVulnerabilities: string[];
  topContributingFactors: {
    factor: string;
    impact: number; // positive increases stress
  }[];
  description: string;
}

export interface EarlyWarningAlert {
  id: string;
  urgency: 'critical' | 'high' | 'moderate';
  timestamp: string;
  region: string;
  state: string;
  district?: string;
  sector: string;
  riskLevel: RiskLevel;
  expectedDays: 30 | 60 | 90;
  headline: string;
  causes: string[];
  suggestedIntervention: string;
  estimatedExposureCr: number;
  status: 'active' | 'monitoring' | 'addressed';
}

export interface SMEFinancialInputs {
  businessName: string;
  sector: string;
  state: string;
  district: string;
  annualRevenueLakhs: number; // In Lakhs
  revenueGrowthYoY: number; // Percentage, e.g. -12
  netProfitMargin: number; // Percentage, e.g. 4.5
  debtToEquity: number; // Ratio, e.g. 2.4
  dscr: number; // Debt Service Coverage Ratio, e.g. 1.15
  receivablesDays: number; // DSO, e.g. 78
  payablesDays: number; // DPO, e.g. 45
  inventoryTurnoverDays: number; // e.g. 60
  cashRunwayMonths: number; // e.g. 1.8
  rawMaterialInflationPct: number; // e.g. 14
  monthlyInterestBurdenLakhs: number; // e.g. 2.5
}

export interface ShapFactor {
  factor: string;
  impact: number; // positive = increased stress, negative = reduced stress
  direction: 'increase' | 'decrease';
  category: 'liquidity' | 'revenue' | 'debt' | 'external';
  description: string;
}

export interface RecommendationItem {
  id: string;
  category: 'working_capital' | 'debt' | 'operations' | 'government_schemes';
  title: string;
  priority: 'critical' | 'high' | 'medium';
  impactEstimate: string;
  actionSteps: string[];
}

export interface SMEAnalysisResult {
  score: number;
  riskLevel: RiskLevel;
  probabilityOfStress60d: number; // 0-100%
  confidenceScore: number; // 0-100%
  forecastTrajectory: {
    period: 'Current' | '30 Days' | '60 Days' | '90 Days';
    score: number;
    lowerBound: number;
    upperBound: number;
  }[];
  cashFlowForecast: {
    month: string;
    inflow: number;
    outflow: number;
    netBalance: number;
  }[];
  shapWaterfall: ShapFactor[];
  recommendations: RecommendationItem[];
}

export interface CrisisScenarioParams {
  interestRateDelta: number; // percentage points, e.g. +2.0
  revenueGrowthDelta: number; // percentage points, e.g. -10
  rawMaterialCostDelta: number; // percentage points, e.g. +12
  customerDemandDelta: number; // percentage points, e.g. -15
  operatingExpensesDelta: number; // percentage points, e.g. +8
  paymentDelayDaysDelta: number; // days, e.g. +20
  loanAmountMultiplier: number; // e.g. 1.0 = baseline, 1.2 = +20%
}

export interface NationalShockPreset {
  id: string;
  title: string;
  description: string;
  badge: string;
  params: CrisisScenarioParams;
}

export interface SimulationResult {
  baselineScore: number;
  simulatedScore: number;
  delta: number;
  baselineLevel: RiskLevel;
  simulatedLevel: RiskLevel;
  mostVulnerableSectors: {
    sector: string;
    baseline: number;
    simulated: number;
    delta: number;
  }[];
  mostVulnerableStates: {
    state: string;
    baseline: number;
    simulated: number;
    delta: number;
  }[];
  impactSummary: string;
  recommendedBufferCr: number;
}
