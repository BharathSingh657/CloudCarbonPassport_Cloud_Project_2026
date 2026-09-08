import coefficients from './coefficients.json' with { type: 'json' };

export const CALC_VERSION = '2.0.0-GHG-CCF';

/**
 * Validates and clamps numerical inputs to physically meaningful boundaries.
 */
function sanitizeNumber(value, min = 0, max = Infinity, fallback = 0) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return fallback;
  }
  const n = Number(value);
  if (n < min) return min;
  if (n > max) return max;
  return n;
}

/**
 * Computes power draw in Watts for a given resource and workload observation.
 *
 * P_total = P_compute(CPU) + P_memory + P_storage
 * P_compute(u) = P_idle + (u / 100) * (P_max - P_idle)
 */
export function calculatePowerWatts(resource, options = {}) {
  const instanceType = resource.instanceType || 't3.medium';
  const profile = coefficients.instanceProfiles[instanceType] || coefficients.instanceProfiles['t3.medium'];
  const cpuPct = sanitizeNumber(resource.cpuUtilization ?? resource.cpu_avg_pct, 0, 100, 20);

  let computePower = 0;
  if (resource.service === 'Amazon S3') {
    const storageTB = sanitizeNumber(resource.storageGB, 0, 1e8, 10) / 1000;
    computePower = storageTB * profile.idleW;
  } else {
    computePower = profile.idleW + (cpuPct / 100) * (profile.maxW - profile.idleW);
  }

  // Memory power calculation
  const memGB = sanitizeNumber(resource.memGB || profile.memGB, 0, 1024, profile.memGB || 4);
  const memPct = sanitizeNumber(resource.memoryUtilization ?? resource.mem_avg_pct, 0, 100, 35);
  const memoryPower = (memGB * (memPct / 100)) * (coefficients.memoryWattsPerGB * 1000); // normalized to Watts

  // Storage power calculation
  const storageGB = sanitizeNumber(resource.storageGB, 0, 1e9, 20);
  const isS3 = resource.service === 'Amazon S3';
  const storageFactor = isS3 ? coefficients.storageWattsPerGB.s3Standard : coefficients.storageWattsPerGB.ssd;
  const storagePower = isS3 ? 0 : storageGB * storageFactor;

  const totalWatts = computePower + memoryPower + storagePower;
  return {
    totalWatts: parseFloat(totalWatts.toFixed(4)),
    computeWatts: parseFloat(computePower.toFixed(4)),
    memoryWatts: parseFloat(memoryPower.toFixed(4)),
    storageWatts: parseFloat(storagePower.toFixed(4))
  };
}

/**
 * Computes sustainability score (0 - 100) based on documented formula:
 * score = 100 * (0.40 * efficiency + 0.30 * clean_grid + 0.30 * activity)
 */
export function calculateSustainabilityScore({ cpuPct, carbonIntensity, isIdle }) {
  const targetCpu = 65.0; // Benchmark healthy target utilization
  const maxRefIntensity = 900.0; // Reference peak coal-heavy grid (gCO2e/kWh)

  // 1. Efficiency: optimal use of provisioned capacity up to target
  const efficiency = Math.min(1.0, Math.max(0.05, cpuPct / targetCpu));

  // 2. Clean Grid: higher when grid carbon intensity is lower
  const clampedIntensity = Math.min(maxRefIntensity, Math.max(0, carbonIntensity));
  const cleanGrid = 1.0 - (clampedIntensity / maxRefIntensity);

  // 3. Activity: penalty for idle resources hogging power
  const activity = isIdle ? 0.35 : 1.0;

  const rawScore = 100 * (0.40 * efficiency + 0.30 * cleanGrid + 0.30 * activity);
  const score = Math.max(10, Math.min(99, Math.round(rawScore)));

  let rating = 'C';
  let badgeColor = 'amber';
  if (score >= 85) {
    rating = 'A+';
    badgeColor = 'emerald';
  } else if (score >= 75) {
    rating = 'A';
    badgeColor = 'emerald';
  } else if (score >= 60) {
    rating = 'B';
    badgeColor = 'cyan';
  } else if (score >= 45) {
    rating = 'C';
    badgeColor = 'amber';
  } else {
    rating = 'D (Inefficient)';
    badgeColor = 'rose';
  }

  return {
    score,
    rating,
    badgeColor,
    components: {
      efficiency: parseFloat(efficiency.toFixed(3)),
      cleanGrid: parseFloat(cleanGrid.toFixed(3)),
      activity: parseFloat(activity.toFixed(3))
    }
  };
}

/**
 * Full carbon calculation for a single cloud resource.
 *
 * Integrates:
 * Energy (kWh) = (Power (W) * Uptime (h) * PUE) / 1000
 * Emissions (kg CO2e) = Energy (kWh) * CarbonIntensity (gCO2e/kWh) / 1000
 */
export function calculateResourceCarbon(resource, options = {}) {
  const region = resource.region || 'ap-south-1';
  const regionInfo = coefficients.gridCarbonIntensity[region] || coefficients.gridCarbonIntensity['ap-south-1'];
  const carbonIntensity = options.carbonIntensityOverride ?? regionInfo.intensity;
  const pue = options.pueOverride ?? coefficients.defaultPue;
  const uptimeHours = sanitizeNumber(resource.uptimeHours ?? options.durationHours, 0, 8760, 720);
  const cpuPct = sanitizeNumber(resource.cpuUtilization ?? resource.cpu_avg_pct, 0, 100, 20);

  const power = calculatePowerWatts(resource, options);
  const totalKWh = (power.totalWatts * uptimeHours * pue) / 1000;
  const emissionsKg = (totalKWh * carbonIntensity) / 1000;

  const scope2Emissions = emissionsKg * coefficients.scope2GridRatio;
  const scope3Emissions = emissionsKg * coefficients.scope3EmbodiedRatio;
  const renewableKWh = totalKWh * (regionInfo.renewablePct / 100);
  const nonRenewableKWh = totalKWh - renewableKWh;

  const isIdle = cpuPct < 15 && resource.service !== 'Amazon S3';
  const sustainability = calculateSustainabilityScore({
    cpuPct,
    carbonIntensity,
    isIdle
  });

  return {
    ...resource,
    metrics: {
      powerWatts: parseFloat(power.totalWatts.toFixed(2)),
      computeWatts: parseFloat(power.computeWatts.toFixed(2)),
      memoryWatts: parseFloat(power.memoryWatts.toFixed(2)),
      storageWatts: parseFloat(power.storageWatts.toFixed(2)),
      totalKWh: parseFloat(totalKWh.toFixed(4)),
      carbonKgCO2: parseFloat(emissionsKg.toFixed(4)),
      carbonTonsCO2: parseFloat((emissionsKg / 1000).toFixed(6)),
      carbonIntensity: parseFloat(carbonIntensity.toFixed(1)),
      carbonIntensityUnit: 'gCO2e/kWh',
      renewablePct: regionInfo.renewablePct,
      renewableKWh: parseFloat(renewableKWh.toFixed(4)),
      nonRenewableKWh: parseFloat(nonRenewableKWh.toFixed(4)),
      scope2Emissions: parseFloat(scope2Emissions.toFixed(4)),
      scope3Emissions: parseFloat(scope3Emissions.toFixed(4)),
      pue,
      gridProvider: regionInfo.name,
      sustainabilityScore: sustainability.score,
      sustainabilityRating: sustainability.rating,
      badgeColor: sustainability.badgeColor,
      scoreComponents: sustainability.components,
      isIdle,
      provenance: {
        calcVersion: CALC_VERSION,
        method: coefficients.methodology,
        inputDataSource: resource.source || options.source || 'sample_dataset',
        calculationTimestamp: new Date().toISOString(),
        assumptions: `PUE=${pue}, Grid=${regionInfo.zone} (${regionInfo.source}), Scope2=${coefficients.scope2GridRatio}, Scope3=${coefficients.scope3EmbodiedRatio}`
      }
    }
  };
}

/**
 * Aggregates carbon metrics across an array of resources.
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

  resourcesWithMetrics.forEach((res) => {
    const m = res.metrics;
    totalCarbonKg += m.carbonKgCO2;
    totalKWh += m.totalKWh;
    totalRenewableKWh += m.renewableKWh;
    scoreSum += m.sustainabilityScore;
    if (m.isIdle) idleCount += 1;

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

  const avgSustainabilityScore = totalResources ? Math.round(scoreSum / totalResources) : 0;
  const renewableRatioPct = totalKWh ? Math.round((totalRenewableKWh / totalKWh) * 100) : 0;
  const carbonTons = parseFloat((totalCarbonKg / 1000).toFixed(4));

  // Equivalents
  const treesRequiredToOffset = Math.round(totalCarbonKg / 21.8);
  const milesDrivenGasCar = Math.round(totalCarbonKg * 2.5);

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
    serviceBreakdown: Object.values(serviceBreakdown).map((s) => ({
      ...s,
      carbonKg: parseFloat(s.carbonKg.toFixed(2)),
      kWh: parseFloat(s.kWh.toFixed(2))
    })),
    regionBreakdown: Object.values(regionBreakdown).map((r) => ({
      ...r,
      carbonKg: parseFloat(r.carbonKg.toFixed(2))
    }))
  };
}
