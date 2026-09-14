import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculatePowerWatts,
  calculateSustainabilityScore,
  calculateResourceCarbon,
  calculateAggregateMetrics,
  CALC_VERSION
} from '../src/carbon/carbonEngine.js';

describe('Carbon Estimation Engine Tests', () => {
  it('calculates baseline power for idle t3.medium', () => {
    const power = calculatePowerWatts({
      instanceType: 't3.medium',
      cpuUtilization: 0,
      memoryUtilization: 0,
      storageGB: 0
    });
    // For t3.medium idleW is 8.5
    assert.equal(power.computeWatts, 8.5);
    assert.equal(power.totalWatts >= 8.5, true);
  });

  it('interpolates power linearly at 100% CPU', () => {
    const power = calculatePowerWatts({
      instanceType: 't3.medium',
      cpuUtilization: 100,
      memoryUtilization: 0,
      storageGB: 0
    });
    // For t3.medium maxW is 32.0
    assert.equal(power.computeWatts, 32.0);
  });

  it('interpolates power at 50% CPU correctly', () => {
    const power = calculatePowerWatts({
      instanceType: 't3.medium',
      cpuUtilization: 50,
      memoryUtilization: 0,
      storageGB: 0
    });
    // 8.5 + 0.5 * (32.0 - 8.5) = 8.5 + 11.75 = 20.25
    assert.equal(power.computeWatts, 20.25);
  });

  it('produces zero energy and emissions when uptime is zero', () => {
    const result = calculateResourceCarbon({
      id: 'res-test-01',
      service: 'Amazon EC2',
      instanceType: 't3.medium',
      region: 'ap-south-1',
      cpuUtilization: 75,
      uptimeHours: 0
    });
    assert.equal(result.metrics.totalKWh, 0);
    assert.equal(result.metrics.carbonKgCO2, 0);
    assert.equal(result.metrics.carbonTonsCO2, 0);
  });

  it('clamps negative CPU utilization to 0%', () => {
    const powerNeg = calculatePowerWatts({
      instanceType: 't3.medium',
      cpuUtilization: -45,
      memoryUtilization: 0,
      storageGB: 0
    });
    const powerZero = calculatePowerWatts({
      instanceType: 't3.medium',
      cpuUtilization: 0,
      memoryUtilization: 0,
      storageGB: 0
    });
    assert.equal(powerNeg.computeWatts, powerZero.computeWatts);
  });

  it('clamps excessive CPU utilization above 100% to 100%', () => {
    const powerOver = calculatePowerWatts({
      instanceType: 't3.medium',
      cpuUtilization: 180,
      memoryUtilization: 0,
      storageGB: 0
    });
    const powerMax = calculatePowerWatts({
      instanceType: 't3.medium',
      cpuUtilization: 100,
      memoryUtilization: 0,
      storageGB: 0
    });
    assert.equal(powerOver.computeWatts, powerMax.computeWatts);
  });

  it('properly applies PUE overhead to energy calculation', () => {
    const resultStandardPue = calculateResourceCarbon(
      {
        id: 'res-pue-1',
        service: 'Amazon EC2',
        instanceType: 't3.medium',
        region: 'ap-south-1',
        cpuUtilization: 50,
        uptimeHours: 100
      },
      { pueOverride: 1.0 }
    );

    const resultElevatedPue = calculateResourceCarbon(
      {
        id: 'res-pue-2',
        service: 'Amazon EC2',
        instanceType: 't3.medium',
        region: 'ap-south-1',
        cpuUtilization: 50,
        uptimeHours: 100
      },
      { pueOverride: 1.5 }
    );

    assert.equal(
      parseFloat((resultElevatedPue.metrics.totalKWh / resultStandardPue.metrics.totalKWh).toFixed(2)),
      1.5
    );
  });

  it('verifies Scope 2 and Scope 3 emissions sum to total emissions', () => {
    const result = calculateResourceCarbon({
      id: 'res-scope-test',
      service: 'Amazon EC2',
      instanceType: 'c6i.4xlarge',
      region: 'us-east-1',
      cpuUtilization: 65,
      uptimeHours: 720
    });
    const sumScopes = result.metrics.scope2Emissions + result.metrics.scope3Emissions;
    assert.equal(Math.abs(sumScopes - result.metrics.carbonKgCO2) < 0.05, true);
  });

  it('verifies sustainability score stays strictly within 10 to 99 range', () => {
    const low = calculateSustainabilityScore({ cpuPct: 0, carbonIntensity: 1000, isIdle: true });
    const high = calculateSustainabilityScore({ cpuPct: 65, carbonIntensity: 10, isIdle: false });

    assert.equal(low.score >= 10 && low.score <= 99, true);
    assert.equal(high.score >= 10 && high.score <= 99, true);
    assert.equal(high.score > low.score, true);
  });

  it('attaches complete data provenance and calculation metadata', () => {
    const result = calculateResourceCarbon({
      id: 'res-prov-test',
      service: 'Amazon EC2',
      instanceType: 't3.micro',
      region: 'ap-south-1',
      source: 'aws_live'
    });

    assert.equal(result.metrics.provenance.calcVersion, CALC_VERSION);
    assert.equal(result.metrics.provenance.inputDataSource, 'aws_live');
    assert.equal(typeof result.metrics.provenance.calculationTimestamp, 'string');
    assert.equal(result.metrics.provenance.assumptions.includes('PUE='), true);
  });

  it('aggregates metrics correctly across multiple resources', () => {
    const res1 = calculateResourceCarbon({
      id: 'r1',
      service: 'Amazon EC2',
      instanceType: 't3.medium',
      region: 'ap-south-1',
      cpuUtilization: 50,
      uptimeHours: 100
    });
    const res2 = calculateResourceCarbon({
      id: 'r2',
      service: 'Amazon RDS',
      instanceType: 'db.t4g.medium',
      region: 'us-east-1',
      cpuUtilization: 40,
      uptimeHours: 100
    });

    const agg = calculateAggregateMetrics([res1, res2]);
    assert.equal(agg.totalResources, 2);
    assert.equal(
      agg.totalCarbonKg,
      parseFloat((res1.metrics.carbonKgCO2 + res2.metrics.carbonKgCO2).toFixed(2))
    );
    assert.equal(
      agg.totalKWh,
      parseFloat((res1.metrics.totalKWh + res2.metrics.totalKWh).toFixed(2))
    );
    assert.equal(agg.serviceBreakdown.length, 2);
    assert.equal(agg.regionBreakdown.length, 2);
  });
});
