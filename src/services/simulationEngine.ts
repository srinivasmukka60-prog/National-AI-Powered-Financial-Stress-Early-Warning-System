import { CrisisScenarioParams, SimulationResult, InterventionParams, InterventionSimulationResult } from '../types';
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

export function runInterventionSimulation(
  params: InterventionParams,
  baselineScoreOverride?: number
): InterventionSimulationResult {
  const baselineScore = baselineScoreOverride !== undefined ? baselineScoreOverride : NATIONAL_OVERVIEW.stressScore;

  // Compute individual policy transmission effects
  const eclgsRelief = (params.eclgsCreditExpansionPct / 10) * 3.8; // emergency credit line
  const tredsRelief = (params.tredsEnforcementPct / 10) * 3.4; // factoring & delayed receivables
  const subventionRelief = (params.interestSubventionBps / 100) * 4.4; // rate subvention
  const moratoriumRelief = params.debtMoratoriumMonths * 2.2; // principal moratorium
  const cgtmseRelief = (params.cgtmseCoveragePct / 10) * 1.6; // credit guarantee fee waiver
  const gstRelief = (params.gstRefundAccelerationDays / 15) * 1.7; // accelerated tax credits
  const opexRelief = (params.opexRationalizationPct / 5) * 1.5; // cost efficiency
  const powerRelief = (params.powerTariffSubsidyPct / 5) * 1.4; // energy & logistics rebate

  const rawRelief = eclgsRelief + tredsRelief + subventionRelief + moratoriumRelief + cgtmseRelief + gstRelief + opexRelief + powerRelief;

  // Diminishing returns curve so simultaneous interventions compound realistically
  const effectiveRelief = Math.min(baselineScore - 14, Math.round((rawRelief * 0.74) * 10) / 10);
  const postInterventionScore = Math.max(14.0, Math.round((baselineScore - effectiveRelief) * 10) / 10);
  const stressReliefDelta = Math.round((postInterventionScore - baselineScore) * 10) / 10;

  const baselineRiskLevel = getRiskLevel(baselineScore);
  const postInterventionRiskLevel = getRiskLevel(postInterventionScore);

  // Scaled baseline credit at risk
  const scaling = baselineScore / NATIONAL_OVERVIEW.stressScore;
  const currentCreditAtRisk = Math.round(NATIONAL_OVERVIEW.creditAtRiskCr * scaling);

  // Credit preserved from NPA (₹ Cr)
  const reliefFraction = effectiveRelief / Math.max(1, baselineScore);
  const creditPreservedCr = Math.round(currentCreditAtRisk * Math.min(0.72, reliefFraction * 1.25));

  // Liquidity injected into real economy (₹ Cr)
  const liquidityInjectedCr = Math.round(
    (params.eclgsCreditExpansionPct * 4800) +
    (params.tredsEnforcementPct * 1350) +
    (params.gstRefundAccelerationDays * 380) +
    (params.debtMoratoriumMonths * 5200)
  );

  // Estimated fiscal cost to exchequer / banks (₹ Cr)
  const subventionCost = (params.interestSubventionBps / 100) * 3100;
  const guaranteeCost = (params.cgtmseCoveragePct / 10) * 450;
  const powerCost = (params.powerTariffSubsidyPct / 5) * 890;
  const totalInterventionCostCr = Math.max(450, Math.round(subventionCost + guaranteeCost + powerCost + 750));

  // Multiplier / Benefit-to-Cost ROI
  const roiRatio = Math.round((creditPreservedCr / totalInterventionCostCr) * 10) / 10;

  // Enterprises saved and employment protected
  const enterprisesSavedCount = Math.round(creditPreservedCr * 8.4);
  const jobsProtectedCount = Math.round(enterprisesSavedCount * 13.8);

  // Sector-level relief projection
  const sectorRelief = SECTORS_DATA.map((s) => {
    let sectorElasticity = 1.0;
    if (s.id === 'textiles') sectorElasticity = 1.42;
    else if (s.id === 'auto_components') sectorElasticity = 1.36;
    else if (s.id === 'chemicals') sectorElasticity = 1.28;
    else if (s.id === 'gems_jewellery') sectorElasticity = 1.34;
    else if (s.id === 'ceramics_construction') sectorElasticity = 1.22;
    else if (s.id === 'electronics') sectorElasticity = 1.10;
    else if (s.id === 'it_services_msme') sectorElasticity = 0.65;
    else if (s.id === 'food_processing') sectorElasticity = 0.88;

    const sectorReliefPoints = Math.round(effectiveRelief * sectorElasticity * 10) / 10;
    const simSectorScore = Math.max(12, Math.min(99, Math.round((s.stressScore - sectorReliefPoints) * 10) / 10));

    return {
      sector: s.name,
      beforeScore: s.stressScore,
      afterScore: simSectorScore,
      reliefPoints: sectorReliefPoints,
      riskStatus: getRiskLevel(simSectorScore),
    };
  }).sort((a, b) => b.reliefPoints - a.reliefPoints);

  // State-level relief projection
  const stateRelief = STATES_DATA.map((st) => {
    let stateElasticity = 1.0;
    if (st.code === 'GJ' || st.code === 'TN') stateElasticity = 1.32;
    else if (st.code === 'PB' || st.code === 'MH') stateElasticity = 1.24;
    else if (st.code === 'UP') stateElasticity = 1.18;
    else if (st.code === 'WB') stateElasticity = 1.10;
    else if (st.code === 'KA' || st.code === 'TS') stateElasticity = 0.82;

    const stateReliefPoints = Math.round(effectiveRelief * stateElasticity * 10) / 10;
    const simStateScore = Math.max(12, Math.min(99, Math.round((st.stressScore - stateReliefPoints) * 10) / 10));

    return {
      state: st.name,
      beforeScore: st.stressScore,
      afterScore: simStateScore,
      reliefPoints: stateReliefPoints,
      riskStatus: getRiskLevel(simStateScore),
    };
  }).sort((a, b) => b.reliefPoints - a.reliefPoints);

  // Policy Brief Summary
  let policyBriefSummary = '';
  if (effectiveRelief >= 18) {
    policyBriefSummary = `TRANSFORMATIVE SYSTEMIC RESCUE: Deployed intervention levers compress national MSME stress by ${effectiveRelief.toFixed(1)} points (from ${baselineScore.toFixed(1)} down to ${postInterventionScore.toFixed(1)}). The package injects ₹${liquidityInjectedCr.toLocaleString()} Cr in direct liquidity, safeguarding ₹${creditPreservedCr.toLocaleString()} Cr of vulnerable bank credit with an estimated benefit-to-cost multiplier of ${roiRatio}x.`;
  } else if (effectiveRelief >= 10) {
    policyBriefSummary = `SUBSTANTIAL STABILIZATION: Countermeasures reduce aggregate stress by ${effectiveRelief.toFixed(1)} points to ${postInterventionScore.toFixed(1)}. Working capital friction eases across core industrial belts in Gujarat, Tamil Nadu, and Maharashtra, protecting an estimated ${enterprisesSavedCount.toLocaleString()} MSME units from NPA reclassification.`;
  } else if (effectiveRelief > 0) {
    policyBriefSummary = `TARGETED BUFFER: Policy intervention provides moderate relief of ${effectiveRelief.toFixed(1)} points. Additional credit guarantee or TReDS invoice discounting enforcement is recommended to prevent spillover in higher-leverage sectors.`;
  } else {
    policyBriefSummary = `BASELINE STABILITY: No active counter-intervention levers selected. Baseline stress remains at ${baselineScore.toFixed(1)}. Adjust policy sliders to simulate relief impact.`;
  }

  // Implementation Roadmap
  const actionRoadmap = [
    {
      phase: 'Phase 1: Immediate Directives',
      timeframe: 'Days 1 – 15',
      title: 'Regulatory Notification & Credit Window Activation',
      description: `RBI and MSME Ministry issue notification for ${params.eclgsCreditExpansionPct > 0 ? `${params.eclgsCreditExpansionPct}% ECLGS credit top-up` : 'liquidity window'} and mandatory 45-day TReDS discounting on public procurement.`,
      leadAgency: 'RBI / Ministry of MSME / GeM',
    },
    {
      phase: 'Phase 2: Bank Disbursement',
      timeframe: 'Days 16 – 45',
      title: 'Scheduled Commercial Bank Credit Deployment',
      description: `Public and private sector banks operationalize interest subvention (${params.interestSubventionBps} bps) and credit guarantee expansion (${params.cgtmseCoveragePct}% CGTMSE cover) without requiring additional collateral.`,
      leadAgency: "Indian Banks' Association / SIDBI",
    },
    {
      phase: 'Phase 3: Cluster Verification',
      timeframe: 'Days 46 – 90',
      title: 'Field Auditing & Macroeconomic Stress Re-assessment',
      description: 'District Industries Centres (DIC) and SLBCs audit debtor velocity and re-run early warning models to ensure SME defaults are contained below benchmark thresholds.',
      leadAgency: 'State Level Bankers’ Committee (SLBC)',
    },
  ];

  return {
    baselineStressScore: baselineScore,
    postInterventionScore,
    stressReliefDelta,
    baselineRiskLevel,
    postInterventionRiskLevel,
    creditPreservedCr,
    enterprisesSavedCount,
    jobsProtectedCount,
    totalInterventionCostCr,
    roiRatio,
    liquidityInjectedCr,
    sectorRelief,
    stateRelief,
    policyBriefSummary,
    actionRoadmap,
  };
}

