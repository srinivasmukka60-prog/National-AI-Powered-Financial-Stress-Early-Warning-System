import { CrisisScenarioParams, SimulationResult } from '../types';
import { NATIONAL_OVERVIEW, SECTORS_DATA, STATES_DATA } from '../data/indiaData';
import { getRiskLevel } from './mlEngine';

export function runCrisisSimulation(params: CrisisScenarioParams): SimulationResult {
  const baselineScore = NATIONAL_OVERVIEW.stressScore;

  // Calculate stress delta based on economic elasticity weights:
  // - Interest rate (+100 bps -> ~+3.8 stress points for leveraged MSMEs)
  // - Revenue growth delta (-10% -> ~+7.5 stress points)
  // - Raw material cost delta (+10% -> ~+6.2 stress points)
  // - Customer demand delta (-10% -> ~+6.8 stress points)
  // - Operating expenses delta (+10% -> ~+4.5 stress points)
  // - Payment delay days (+15 days -> ~+5.2 stress points)
  // - Loan multiplier

  const interestRateImpact = params.interestRateDelta * 3.8;
  const revenueGrowthImpact = (params.revenueGrowthDelta < 0 ? Math.abs(params.revenueGrowthDelta) * 0.75 : -params.revenueGrowthDelta * 0.4);
  const rawMaterialImpact = (params.rawMaterialCostDelta > 0 ? params.rawMaterialCostDelta * 0.62 : params.rawMaterialCostDelta * 0.25);
  const demandImpact = (params.customerDemandDelta < 0 ? Math.abs(params.customerDemandDelta) * 0.68 : -params.customerDemandDelta * 0.3);
  const opexImpact = (params.operatingExpensesDelta > 0 ? params.operatingExpensesDelta * 0.45 : params.operatingExpensesDelta * 0.2);
  const paymentDelayImpact = (params.paymentDelayDaysDelta > 0 ? (params.paymentDelayDaysDelta / 5) * 1.7 : (params.paymentDelayDaysDelta / 5) * 0.8);
  const loanBurdenImpact = (params.loanAmountMultiplier - 1.0) * 15.0;

  const totalDelta = interestRateImpact + revenueGrowthImpact + rawMaterialImpact + demandImpact + opexImpact + paymentDelayImpact + loanBurdenImpact;

  const simulatedScore = Math.max(12, Math.min(98, Math.round((baselineScore + totalDelta) * 10) / 10));
  const roundedDelta = Math.round((simulatedScore - baselineScore) * 10) / 10;

  const baselineLevel = getRiskLevel(baselineScore);
  const simulatedLevel = getRiskLevel(simulatedScore);

  // Sector elasticity models
  const mostVulnerableSectors = SECTORS_DATA.map((s) => {
    let sectorElasticity = 1.0;
    if (s.id === 'textiles' || s.id === 'auto_components' || s.id === 'gems_jewellery') {
      sectorElasticity = 1.35; // high sensitivity to credit & exports
    } else if (s.id === 'chemicals' || s.id === 'leather_footwear') {
      sectorElasticity = 1.25;
    } else if (s.id === 'it_services_msme' || s.id === 'food_processing') {
      sectorElasticity = 0.65; // defensive
    }

    const sectorDelta = Math.round(totalDelta * sectorElasticity * 10) / 10;
    const simSectorScore = Math.max(10, Math.min(99, Math.round((s.stressScore + sectorDelta) * 10) / 10));

    return {
      sector: s.name,
      baseline: s.stressScore,
      simulated: simSectorScore,
      delta: sectorDelta,
    };
  }).sort((a, b) => b.delta - a.delta);

  // State elasticity models
  const mostVulnerableStates = STATES_DATA.map((st) => {
    let stateElasticity = 1.0;
    if (st.code === 'GJ' || st.code === 'TN' || st.code === 'PB') {
      stateElasticity = 1.3; // heavy export and manufacturing clusters
    } else if (st.code === 'MH' || st.code === 'UP') {
      stateElasticity = 1.15;
    } else if (st.code === 'KA' || st.code === 'TS') {
      stateElasticity = 0.85; // higher tech/services share
    }

    const stateDelta = Math.round(totalDelta * stateElasticity * 10) / 10;
    const simStateScore = Math.max(10, Math.min(99, Math.round((st.stressScore + stateDelta) * 10) / 10));

    return {
      state: st.name,
      baseline: st.stressScore,
      simulated: simStateScore,
      delta: stateDelta,
    };
  }).sort((a, b) => b.delta - a.delta);

  // Estimate required national liquidity buffer in INR Crores
  const recommendedBufferCr = Math.round(Math.max(10000, (NATIONAL_OVERVIEW.creditAtRiskCr * 0.12) + (totalDelta > 0 ? totalDelta * 4800 : 0)));

  // Generate executive summary
  let impactSummary = '';
  if (simulatedScore > 80) {
    impactSummary = `CRITICAL SYSTEMIC STRESS: Under this scenario, the national MSME stress index surges by +${roundedDelta.toFixed(1)} points to ${simulatedScore}. Over 48% of export and manufacturing MSMEs in Gujarat, Tamil Nadu, and Punjab would breach loan covenants within 60 days, requiring a mandatory ₹${recommendedBufferCr.toLocaleString()} Cr emergency liquidity backstop.`;
  } else if (simulatedScore > 65) {
    impactSummary = `ELEVATED STRESS THRESHOLD: Stress expands by +${roundedDelta.toFixed(1)} points to ${simulatedScore}. Auto ancillary and textile units experience immediate working-capital depletion as debtor cycles expand, requiring targeted TReDS discounting support.`;
  } else if (roundedDelta < 0) {
    impactSummary = `MACRO STABILITY EXPANSION: Accommodative financial conditions reduce national MSME stress by ${Math.abs(roundedDelta).toFixed(1)} points to ${simulatedScore}. Cash-flow margins recover across all monitored clusters.`;
  } else {
    impactSummary = `CONTROLLED PRESSURE: Stress ticks up marginally by +${roundedDelta.toFixed(1)} points to ${simulatedScore}. Vulnerabilities remain concentrated primarily in energy-intensive and delayed-payment clusters.`;
  }

  return {
    baselineScore,
    simulatedScore,
    delta: roundedDelta,
    baselineLevel,
    simulatedLevel,
    mostVulnerableSectors,
    mostVulnerableStates,
    impactSummary,
    recommendedBufferCr,
  };
}
