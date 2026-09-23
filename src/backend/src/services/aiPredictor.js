import { REGION_CARBON_INTENSITY } from '../data/mockData.js';

/**
 * Generates 7-day AI carbon emission predictions for aggregate or specific resources.
 */
export function generate7DayForecast(resourcesWithMetrics) {
  const days = ['Day 1 (Today)', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
  const dailyResourceCarbon = resourcesWithMetrics.reduce((acc, resource) => acc + resource.metrics.carbonKgCO2, 0) / 30;
  const optimizationOpportunity = resourcesWithMetrics.reduce((acc, resource) => {
    const carbon = resource.metrics.carbonKgCO2;
    let reduction = 0;

    if (resource.service === 'Amazon EC2' && resource.cpuUtilization < 20) {
      reduction = 0.65;
    } else if ((resource.region === 'ap-south-1' || resource.region === 'us-east-1') && carbon > 30) {
      reduction = 0.25;
    } else if (resource.service === 'Amazon S3' && resource.storageGB > 50000 && resource.region !== 'eu-north-1') {
      reduction = 0.45;
    }

    return acc + (carbon * reduction) / 30;
  }, 0);
  const optimizedDailyCarbon = Math.max(0, dailyResourceCarbon - optimizationOpportunity);

  // Simulated AI Time-Series forecasting model (combines seasonality, grid carbon forecast & load predictions)
  const multipliers = [1.0, 1.04, 0.98, 1.12, 1.08, 0.85, 0.80]; // Weekday vs weekend load drops
  const gridVariance = [1.0, 0.96, 1.02, 0.94, 0.99, 0.91, 0.88]; // Expected green grid energy shift

  const forecast = days.map((dayName, idx) => {
    const baselineDailyKg = parseFloat((dailyResourceCarbon * multipliers[idx]).toFixed(2));
    const optimizedDailyKg = parseFloat((optimizedDailyCarbon * gridVariance[idx]).toFixed(2));
    
    return {
      day: dayName,
      baselineEmissionsKg: baselineDailyKg,
      predictedOptimizedKg: optimizedDailyKg,
      potentialDailySavingsKg: parseFloat((baselineDailyKg - optimizedDailyKg).toFixed(2)),
      confidenceIntervalPct: 94.2 - (idx * 0.8)
    };
  });

  return {
    summary: {
      predicted7DayTotalBaselineKg: parseFloat(forecast.reduce((a, b) => a + b.baselineEmissionsKg, 0).toFixed(2)),
      predicted7DayTotalOptimizedKg: parseFloat(forecast.reduce((a, b) => a + b.predictedOptimizedKg, 0).toFixed(2)),
      totalPotentialSavingsKg: parseFloat(forecast.reduce((a, b) => a + b.potentialDailySavingsKg, 0).toFixed(2)),
      reductionPercentage: parseFloat((((forecast.reduce((total, day) => total + day.potentialDailySavingsKg, 0)) / (forecast.reduce((total, day) => total + day.baselineEmissionsKg, 0) || 1)) * 100).toFixed(1))
    },
    dailyForecast: forecast
  };
}

/**
 * Generates AI-driven Green AI optimization recommendations.
 */
export function generateRecommendations(resourcesWithMetrics) {
  const recs = [];

  resourcesWithMetrics.forEach(res => {
    const m = res.metrics;

    // 1. Idle Resource Shutdown / Right-sizing
    if (res.cpuUtilization < 20 && res.service === 'Amazon EC2') {
      recs.push({
        id: `rec-idle-${res.id}`,
        resourceId: res.id,
        resourceName: res.name,
        service: res.service,
        type: 'Resource Right-Sizing / Idle Reduction',
        severity: 'HIGH',
        impactScore: 92,
        title: `Right-size idle instance ${res.name}`,
        description: `Resource CPU utilization is only ${res.cpuUtilization}%. Downgrading from ${res.instanceType} to t3.medium or turning off during off-peak will save significant energy.`,
        action: `Downgrade instance type to t3.medium or apply Auto-Scaling schedule`,
        estimatedMonthlyCarbonSavingsKg: parseFloat((m.carbonKgCO2 * 0.65).toFixed(2)),
        estimatedMonthlyCostSavingsUsd: 145,
        targetRegion: res.region,
        applied: false
      });
    }

    // 2. Region Migration to Green Grid (e.g., ap-south-1 or us-east-1 -> eu-north-1 or us-west-2)
    if ((res.region === 'ap-south-1' || res.region === 'us-east-1') && m.carbonKgCO2 > 30) {
      const greenRegion = res.region === 'ap-south-1' ? 'eu-north-1' : 'us-west-2';
      const greenRegionInfo = REGION_CARBON_INTENSITY[greenRegion];
      const reductionRatio = (m.carbonIntensity - greenRegionInfo.intensity) / m.carbonIntensity;
      const savedKg = m.carbonKgCO2 * reductionRatio;

      recs.push({
        id: `rec-region-${res.id}`,
        resourceId: res.id,
        resourceName: res.name,
        service: res.service,
        type: 'Carbon-Aware Region Shift',
        severity: 'MEDIUM',
        impactScore: 84,
        title: `Migrate ${res.name} to ${greenRegionInfo.name}`,
        description: `Currently running in ${REGION_CARBON_INTENSITY[res.region].name} (${m.carbonIntensity} gCO2/kWh). Shifting to ${greenRegionInfo.name} (${greenRegionInfo.intensity} gCO2/kWh) reduces emissions by ${Math.round(reductionRatio * 100)}%.`,
        action: `Re-deploy application stack to AWS region ${greenRegion}`,
        estimatedMonthlyCarbonSavingsKg: parseFloat(savedKg.toFixed(2)),
        estimatedMonthlyCostSavingsUsd: 40,
        targetRegion: greenRegion,
        applied: false
      });
    }

    // 3. Storage Optimization for S3
    if (res.service === 'Amazon S3' && res.storageGB > 50000 && res.region !== 'eu-north-1') {
      recs.push({
        id: `rec-storage-${res.id}`,
        resourceId: res.id,
        resourceName: res.name,
        service: res.service,
        type: 'Green Archival Storage Lifecycle',
        severity: 'LOW',
        impactScore: 70,
        title: `Enable Glacier Deep Archive policy for ${res.name}`,
        description: `High capacity storage (${(res.storageGB/1000).toFixed(0)} TB) on S3 Standard. Moving cold data to S3 Glacier Deep Archive reduces power draw per TB by 70%.`,
        action: `Configure S3 Lifecycle Rule for automatic transition after 30 days`,
        estimatedMonthlyCarbonSavingsKg: parseFloat((m.carbonKgCO2 * 0.45).toFixed(2)),
        estimatedMonthlyCostSavingsUsd: 280,
        targetRegion: res.region,
        applied: false
      });
    }
  });

  return recs;
}
