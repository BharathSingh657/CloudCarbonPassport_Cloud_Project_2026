import { REGION_CARBON_INTENSITY, INSTANCE_POWER_PROFILES } from '../data/mockData.js';

// Standard Data Center PUE (Power Usage Effectiveness)
const DEFAULT_PUE = 1.18; // Typical AWS cloud datacenter PUE

/**
 * Calculates environmental sustainability metrics for a given cloud resource.
 */
export function calculateResourceCarbon(resource) {
  const regionInfo = REGION_CARBON_INTENSITY[resource.region] || REGION_CARBON_INTENSITY['us-east-1'];
  const powerProfile = INSTANCE_POWER_PROFILES[resource.instanceType] || INSTANCE_POWER_PROFILES['t3.medium'];

  // Calculate dynamic power consumption in Watts based on CPU utilization
  const cpuFraction = (resource.cpuUtilization || 50) / 100;
  let powerWatts = powerProfile.idleW + cpuFraction * (powerProfile.maxW - powerProfile.idleW);
  
  // Storage power adjustment (S3 or extra disk)
  if (resource.service === 'Amazon S3') {
    const storageTB = resource.storageGB / 1000;
    powerWatts = storageTB * powerProfile.idleW;
  } else if (resource.storageGB > 500) {
    powerWatts += (resource.storageGB / 1000) * 0.5; // SSD power overhead
  }

  // Energy consumption in kWh over uptime (including PUE overhead)
  const totalKWh = (powerWatts * (resource.uptimeHours || 720) * DEFAULT_PUE) / 1000;
  
  // Carbon intensity (gCO2eq per kWh)
  const carbonIntensity = regionInfo.intensity;
  
  // Carbon Emissions in kgCO2eq
  const carbonKgCO2 = (totalKWh * carbonIntensity) / 1000;

  // Scope 2 (Grid Electricity) & Scope 3 (Embodied Hardware Mfg & Lifecycle)
  const scope2Emissions = carbonKgCO2 * 0.82;
  const scope3Emissions = carbonKgCO2 * 0.18;

  // Renewable energy portion in kWh
  const renewableKWh = totalKWh * (regionInfo.renewablePct / 100);
  const nonRenewableKWh = totalKWh - renewableKWh;

  // Calculate Sustainability Score (0 to 100)
  // Factors: CPU Efficiency (+), Grid Cleanliness (+), Waste Penalty (-)
  let wastePenalty = 0;
  if (resource.cpuUtilization < 15) {
    wastePenalty = 35; // Severe penalty for idle instances hogging grid power
  } else if (resource.cpuUtilization < 30) {
    wastePenalty = 15;
  }

  const gridCleanlinessBonus = Math.min(40, (100 - (carbonIntensity / 8))); // Higher score for clean grids like eu-north-1
  const utilizationScore = Math.min(40, (resource.cpuUtilization * 0.5));
  const renewableBonus = (regionInfo.renewablePct * 0.2);

  let rawScore = Math.round(gridCleanlinessBonus + utilizationScore + renewableBonus - wastePenalty);
  const sustainabilityScore = Math.max(12, Math.min(99, rawScore));

  // Determine Sustainability Rating
  let rating = 'C';
  let badgeColor = 'amber';
  if (sustainabilityScore >= 85) {
    rating = 'A+';
    badgeColor = 'emerald';
  } else if (sustainabilityScore >= 75) {
    rating = 'A';
    badgeColor = 'emerald';
  } else if (sustainabilityScore >= 60) {
    rating = 'B';
    badgeColor = 'cyan';
  } else if (sustainabilityScore >= 45) {
    rating = 'C';
    badgeColor = 'amber';
  } else {
    rating = 'D (Inefficient)';
    badgeColor = 'rose';
  }

  return {
    ...resource,
    metrics: {
      powerWatts: parseFloat(powerWatts.toFixed(2)),
      totalKWh: parseFloat(totalKWh.toFixed(2)),
      carbonKgCO2: parseFloat(carbonKgCO2.toFixed(2)),
      carbonTonsCO2: parseFloat((carbonKgCO2 / 1000).toFixed(4)),
      carbonIntensity: carbonIntensity,
      renewablePct: regionInfo.renewablePct,
      renewableKWh: parseFloat(renewableKWh.toFixed(2)),
      nonRenewableKWh: parseFloat(nonRenewableKWh.toFixed(2)),
      scope2Emissions: parseFloat(scope2Emissions.toFixed(2)),
      scope3Emissions: parseFloat(scope3Emissions.toFixed(2)),
      pue: DEFAULT_PUE,
      gridProvider: regionInfo.provider,
      sustainabilityScore,
      rating,
      badgeColor,
      isIdle: resource.cpuUtilization < 20
    }
  };
}

/**
 * Calculates global aggregated infrastructure metrics for the dashboard.
 */
export function calculateAggregateMetrics(resourcesWithMetrics) {
  const totalResources = resourcesWithMetrics.length;
  let totalCarbonKg = 0;
  let totalKWh = 0;
  let totalRenewableKWh = 0;
  let scoreSum = 0;
  let idleCount = 0;

  const serviceBreakdown = {};
  const regionBreakdown = {};

  resourcesWithMetrics.forEach(res => {
    const m = res.metrics;
    totalCarbonKg += m.carbonKgCO2;
    totalKWh += m.totalKWh;
    totalRenewableKWh += m.renewableKWh;
    scoreSum += m.sustainabilityScore;
    if (m.isIdle) idleCount++;

    // Service breakdown
    if (!serviceBreakdown[res.service]) {
      serviceBreakdown[res.service] = { service: res.service, carbonKg: 0, kWh: 0, count: 0 };
    }
    serviceBreakdown[res.service].carbonKg += m.carbonKgCO2;
    serviceBreakdown[res.service].kWh += m.totalKWh;
    serviceBreakdown[res.service].count += 1;

    // Region breakdown
    if (!regionBreakdown[res.region]) {
      regionBreakdown[res.region] = { region: res.region, carbonKg: 0, count: 0 };
    }
    regionBreakdown[res.region].carbonKg += m.carbonKgCO2;
    regionBreakdown[res.region].count += 1;
  });

  const avgSustainabilityScore = Math.round(scoreSum / (totalResources || 1));
  const renewableRatioPct = Math.round((totalRenewableKWh / (totalKWh || 1)) * 100);
  const carbonTons = parseFloat((totalCarbonKg / 1000).toFixed(3));

  // Equivalent real-world impact metrics
  const treesRequiredToOffset = Math.round(totalCarbonKg / 21.8); // 1 mature tree absorbs ~21.8 kg CO2/year
  const milesDrivenGasCar = Math.round(totalCarbonKg * 2.5); // ~0.4 kg CO2 per mile driven

  return {
    totalResources,
    totalCarbonKg: parseFloat(totalCarbonKg.toFixed(2)),
    totalCarbonTons: carbonTons,
    totalKWh: parseFloat(totalKWh.toFixed(2)),
    avgSustainabilityScore,
    renewableRatioPct,
    idleCount,
    impactEquivalents: {
      treesRequiredToOffset,
      milesDrivenGasCar
    },
    serviceBreakdown: Object.values(serviceBreakdown).map(s => ({
      ...s,
      carbonKg: parseFloat(s.carbonKg.toFixed(2)),
      kWh: parseFloat(s.kWh.toFixed(2))
    })),
    regionBreakdown: Object.values(regionBreakdown).map(r => ({
      ...r,
      carbonKg: parseFloat(r.carbonKg.toFixed(2))
    }))
  };
}
