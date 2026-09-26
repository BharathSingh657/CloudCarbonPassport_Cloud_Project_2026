import express from 'express';
import { query, transaction, checkDatabaseHealth } from '../db/dbClient.js';
import { calculateResourceCarbon, calculateAggregateMetrics } from '../carbon/carbonEngine.js';
import { generateDigitalCarbonPassport } from '../services/passportGenerator.js';
import { generate7DayForecast } from '../services/aiPredictor.js';
import { runDataPipeline, STANDARD_RESOURCES } from '../pipeline/dataPipeline.js';
import {
  AWSCostExplorerAdapter,
  AWSCloudWatchAdapter,
  AWSResourceInventoryAdapter
} from '../adapters/awsAdapters.js';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const router = express.Router();
const awsUseLiveData = !['false', '0'].includes((process.env.AWS_USE_LIVE || 'true').toLowerCase());
const awsRegion = process.env.AWS_REGION || 'ap-south-1';
const awsProfile = process.env.AWS_PROFILE || 'cloudpassport';
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const workloadSummaryPath = path.join(projectRoot, 'src', 'ml_model', 'workload_model_summary.json');
const carbonForecasterSummaryPath = path.join(projectRoot, 'src', 'ml_model', 'carbon_forecaster_summary.json');

// Prevent caching of live operational endpoints
router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// =========================================================================
// 1. SYSTEM & DATABASE HEALTH
// =========================================================================
router.get('/health', async (req, res) => {
  const dbHealth = await checkDatabaseHealth();
  res.json({
    status: dbHealth.connected ? 'HEALTHY' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    database: dbHealth,
    aws: {
      profile: awsProfile,
      region: awsRegion,
      liveEnabled: awsUseLiveData
    }
  });
});

// =========================================================================
// 2. AWS INTEGRATION STATUS, INVENTORY, COSTS & USAGE
// =========================================================================
router.get('/aws/status', (req, res) => {
  res.json({
    success: true,
    data: {
      enabled: awsUseLiveData,
      region: awsRegion,
      profile: awsProfile,
      liveMode: awsUseLiveData,
      description: awsUseLiveData
        ? `Live AWS integration active for profile "${awsProfile}" in ${awsRegion}. Queries are read-only.`
        : 'Live AWS collection is disabled.'
    }
  });
});

router.get('/aws/inventory', async (req, res) => {
  if (!awsUseLiveData) {
    return res.status(503).json({
      success: false,
      message: 'AWS live mode is disabled in environment configuration.'
    });
  }

  try {
    const adapter = new AWSResourceInventoryAdapter({ region: awsRegion, profile: awsProfile });
    const inventory = await adapter.getResourceInventory();
    return res.json({
      success: true,
      source: 'aws_live',
      data: inventory
    });
  } catch (error) {
    console.error('[AWS inventory error]', error);
    return res.status(502).json({
      success: false,
      source: 'aws_live',
      message: `Failed to retrieve AWS inventory: ${error.message}`,
      errors: [{ service: 'AWS', message: error.message }]
    });
  }
});

router.get('/aws/costs', async (req, res) => {
  if (!awsUseLiveData) {
    return res.status(503).json({
      success: false,
      message: 'AWS live mode is disabled.'
    });
  }

  try {
    const adapter = new AWSCostExplorerAdapter({ profile: awsProfile });
    const data = await adapter.getDailyCosts(30);
    return res.json({ success: true, source: 'aws_cost_explorer', data });
  } catch (error) {
    console.error(`[AWS Cost Explorer error] ${error.name}: ${error.message}`);
    return res.status(502).json({
      success: false,
      source: 'aws_cost_explorer',
      message: `Could not read AWS Cost Explorer data: ${error.message}. Ensure '${awsProfile}' has ce:GetCostAndUsage permission.`
    });
  }
});

router.get('/cloudwatch/usage', async (req, res) => {
  if (!awsUseLiveData) {
    return res.status(503).json({
      success: false,
      message: 'AWS live mode is disabled.'
    });
  }

  const hours = Number(req.query.hours ?? 24);
  if (!Number.isInteger(hours) || hours < 1 || hours > 168) {
    return res.status(400).json({
      success: false,
      message: 'hours parameter must be an integer between 1 and 168.'
    });
  }

  try {
    const adapter = new AWSCloudWatchAdapter({ region: awsRegion, profile: awsProfile });
    const data = await adapter.getUsageMetrics(hours);
    return res.json({ success: true, source: 'aws_cloudwatch', data });
  } catch (error) {
    console.error(`[CloudWatch usage error] ${error.name}: ${error.message}`);
    return res.status(502).json({
      success: false,
      source: 'aws_cloudwatch',
      message: `Could not read CloudWatch AWS/Usage metrics: ${error.message}`
    });
  }
});

// =========================================================================
// 3. PIPELINE EXECUTION & STATUS
// =========================================================================
router.post('/pipeline/run', async (req, res) => {
  try {
    const { days = 30, dataSource = 'aws_live' } = req.body || {};
    const result = await runDataPipeline({ days: Number(days), dataSource });
    const isAws = dataSource.includes('aws');
    res.json({
      success: true,
      message: isAws
        ? `AWS Live Pipeline completed! Ingested live CloudWatch telemetry for ${result.liveResourcesCount || result.recordsProcessed} AWS cloud resources and issued Digital Carbon Passports.`
        : `Benchmark Pipeline executed! Processed ${result.recordsProcessed} workload observations and calculated ${result.emissionsCalculated} emission records.`,
      data: result
    });
  } catch (error) {
    console.error('[Pipeline Run Error]', error);
    res.status(500).json({
      success: false,
      message: `Data pipeline execution failed: ${error.message}`
    });
  }
});

router.get('/pipeline/status', async (req, res) => {
  try {
    const [allRuns, awsRuns, sampleRuns] = await Promise.all([
      query(`SELECT * FROM pipeline_runs ORDER BY started_at DESC LIMIT 25`),
      query(`SELECT * FROM pipeline_runs WHERE data_source = 'aws_live_cloudwatch' ORDER BY started_at DESC LIMIT 15`),
      query(`SELECT * FROM pipeline_runs WHERE data_source != 'aws_live_cloudwatch' ORDER BY started_at DESC LIMIT 15`)
    ]);

    res.json({
      success: true,
      data: {
        latestRun: allRuns.rows[0] || null,
        latestAwsRun: awsRuns.rows[0] || null,
        latestSampleRun: sampleRuns.rows[0] || null,
        recentRuns: allRuns.rows,
        awsRuns: awsRuns.rows,
        sampleRuns: sampleRuns.rows,
        awsCount: awsRuns.rows.length,
        sampleCount: sampleRuns.rows.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Could not query pipeline status: ${error.message}`
    });
  }
});

// =========================================================================
// 4. PERSISTED RESOURCES & CARBON ESTIMATES
// =========================================================================
router.get('/resources', async (req, res) => {
  const { search, service, region, status, minScore, source } = req.query;

  try {
    let sql = `
      SELECT r.*, p.sustainability_score, p.sustainability_rating, p.body as passport_body
      FROM resources r
      LEFT JOIN passports p ON r.resource_id = p.resource_id
      WHERE 1=1
    `;
    const params = [];

    if (source && source !== 'All') {
      params.push(source);
      sql += ` AND r.source = $${params.length}`;
    }

    if (service && service !== 'All') {
      params.push(service);
      sql += ` AND r.service = $${params.length}`;
    }

    if (region && region !== 'All') {
      params.push(region);
      sql += ` AND r.region = $${params.length}`;
    }

    if (status && status !== 'All') {
      params.push(status);
      sql += ` AND r.status = $${params.length}`;
    }

    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      sql += ` AND (LOWER(r.resource_name) LIKE $${params.length} OR LOWER(r.resource_id) LIKE $${params.length} OR LOWER(r.instance_type) LIKE $${params.length})`;
    }

    sql += ` ORDER BY (r.source = 'aws_live') DESC, r.first_seen ASC`;

    const dbRes = await query(sql, params);

    // If DB is empty, run auto-ingestion
    if (dbRes.rows.length === 0 && (!source || source === 'sample_dataset')) {
      await runDataPipeline({ days: 14 });
      const refetch = await query(sql, params);
      dbRes.rows = refetch.rows;
    }

    // Map into frontend resource shape
    const formatted = dbRes.rows.map(row => {
      const passport = row.passport_body || {};
      const metrics = passport.metrics || {};
      return {
        id: row.resource_id,
        name: row.resource_name,
        service: row.service,
        instanceType: row.instance_type,
        region: row.region,
        status: row.status,
        environment: row.environment,
        owner: row.owner,
        storageGB: Number(row.storage_gb || 0),
        tags: row.tags || {},
        source: row.source,
        isLiveAws: row.source === 'aws_live',
        isSynthetic: row.is_synthetic,
        metrics: {
          powerWatts: metrics.powerWatts || 20.0,
          totalKWh: metrics.totalKWh || 15.0,
          carbonKgCO2: metrics.carbonKgCO2 || 5.0,
          carbonTonsCO2: metrics.carbonKgCO2 ? Number((metrics.carbonKgCO2 / 1000).toFixed(4)) : 0.005,
          carbonIntensity: metrics.carbonIntensity || 378,
          renewablePct: metrics.renewablePct || 22,
          sustainabilityScore: Number(row.sustainability_score || 70),
          sustainabilityRating: row.sustainability_rating || 'B',
          badgeColor: Number(row.sustainability_score || 70) >= 75 ? 'emerald' : Number(row.sustainability_score || 70) >= 50 ? 'amber' : 'rose',
          isIdle: row.status === 'Warning' || Number(row.sustainability_score || 70) < 45
        }
      };
    });

    res.json({
      success: true,
      source: 'postgresql_persistence',
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    console.error('[Resources query error]', error);
    res.status(500).json({
      success: false,
      message: `Failed to retrieve resources: ${error.message}`
    });
  }
});

router.get('/resources/:id', async (req, res) => {
  try {
    const resResult = await query(
      `SELECT r.*, p.sustainability_score, p.sustainability_rating, p.body as passport_body
       FROM resources r
       LEFT JOIN passports p ON r.resource_id = p.resource_id
       WHERE r.resource_id = $1`,
      [req.params.id]
    );

    if (resResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    const row = resResult.rows[0];
    const passport = row.passport_body || {};

    res.json({
      success: true,
      source: row.source,
      data: {
        id: row.resource_id,
        name: row.resource_name,
        service: row.service,
        instanceType: row.instance_type,
        region: row.region,
        status: row.status,
        environment: row.environment,
        owner: row.owner,
        storageGB: Number(row.storage_gb || 0),
        tags: row.tags || {},
        source: row.source,
        metrics: passport.metrics || {}
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =========================================================================
// 5. DIGITAL CARBON PASSPORT FOR RESOURCE
// =========================================================================
router.get('/resources/:id/passport', async (req, res) => {
  try {
    const passResult = await query(
      `SELECT p.body, r.source, r.is_synthetic
       FROM passports p
       JOIN resources r ON p.resource_id = r.resource_id
       WHERE p.resource_id = $1`,
      [req.params.id]
    );

    if (passResult.rows.length === 0) {
      // Fallback: generate and persist on the fly
      const r = await query('SELECT * FROM resources WHERE resource_id = $1', [req.params.id]);
      if (r.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Resource not found' });
      }
      const calculated = calculateResourceCarbon({
        id: r.rows[0].resource_id,
        name: r.rows[0].resource_name,
        service: r.rows[0].service,
        instanceType: r.rows[0].instance_type,
        region: r.rows[0].region,
        storageGB: Number(r.rows[0].storage_gb || 20),
        cpuUtilization: 45
      });
      const passport = generateDigitalCarbonPassport(calculated);
      return res.json({ success: true, source: r.rows[0].source, data: passport });
    }

    res.json({
      success: true,
      source: passResult.rows[0].source,
      data: passResult.rows[0].body
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =========================================================================
// 6. DASHBOARD GLOBAL KPIS & HISTORICAL EMISSION TRENDS
// =========================================================================
router.get('/dashboard/stats', async (req, res) => {
  try {
    // Read persisted resources from database
    const resResult = await query(`
      SELECT r.resource_id, r.service, r.region, r.source, p.body as passport_body
      FROM resources r
      LEFT JOIN passports p ON r.resource_id = p.resource_id
    `);

    if (resResult.rows.length === 0) {
      await runDataPipeline({ days: 14 });
      const refetch = await query(`
        SELECT r.resource_id, r.service, r.region, r.source, p.body as passport_body
        FROM resources r
        LEFT JOIN passports p ON r.resource_id = p.resource_id
      `);
      resResult.rows = refetch.rows;
    }

    const resourcesWithMetrics = resResult.rows.map(r => {
      const p = r.passport_body || {};
      const m = p.metrics || {};
      return {
        service: r.service,
        region: r.region,
        source: r.source,
        metrics: {
          carbonKgCO2: m.carbonKgCO2 || 12.0,
          totalKWh: m.totalKWh || 30.0,
          renewableKWh: m.renewableKWh || 6.0,
          sustainabilityScore: p.sustainabilityScore || 70,
          isIdle: p.sustainabilityScore < 45
        }
      };
    });

    const aggregate = calculateAggregateMetrics(resourcesWithMetrics);
    const awsResources = resourcesWithMetrics.filter(r => r.source === 'aws_live');
    const sampleResources = resourcesWithMetrics.filter(r => r.source !== 'aws_live');
    const awsLiveStats = awsResources.length > 0 ? calculateAggregateMetrics(awsResources) : null;
    const sampleStats = sampleResources.length > 0 ? calculateAggregateMetrics(sampleResources) : null;

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      source: 'postgresql_persistence',
      data: {
        ...aggregate,
        awsLiveStats,
        sampleStats,
        awsLiveCount: awsResources.length,
        sampleCount: sampleResources.length
      }
    });
  } catch (error) {
    console.error('[Dashboard stats error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/dashboard/charts', async (req, res) => {
  try {
    // 1. Query daily historical carbon & energy trends from emission_records table
    const [trendRes, serviceRes, regionRes, awsTrendRes, awsServiceRes] = await Promise.all([
      query(`
        SELECT
          TO_CHAR(period_start, 'YYYY-MM-DD') as date,
          ROUND(SUM(emissions_kg)::numeric, 4) as "carbonKg",
          ROUND(SUM(energy_kwh)::numeric, 4) as "kWh",
          ROUND((SUM(renewable_kwh) / NULLIF(SUM(energy_kwh), 0) * 100)::numeric, 0) as "renewablePct"
        FROM emission_records
        WHERE granularity = 'DAILY'
        GROUP BY TO_CHAR(period_start, 'YYYY-MM-DD')
        ORDER BY date ASC
        LIMIT 30
      `),
      query(`
        SELECT
          r.service,
          ROUND(SUM(e.emissions_kg)::numeric, 4) as "carbonKg",
          ROUND(SUM(e.energy_kwh)::numeric, 4) as "kWh",
          COUNT(DISTINCT r.resource_id) as count
        FROM resources r
        JOIN emission_records e ON r.resource_id = e.resource_id
        WHERE e.granularity = 'DAILY'
        GROUP BY r.service
        ORDER BY "carbonKg" DESC
      `),
      query(`
        SELECT
          r.region,
          ROUND(SUM(e.emissions_kg)::numeric, 4) as "carbonKg",
          COUNT(DISTINCT r.resource_id) as count
        FROM resources r
        JOIN emission_records e ON r.resource_id = e.resource_id
        WHERE e.granularity = 'DAILY'
        GROUP BY r.region
        ORDER BY "carbonKg" DESC
      `),
      query(`
        SELECT
          TO_CHAR(period_start, 'YYYY-MM-DD') as date,
          ROUND(SUM(emissions_kg)::numeric, 4) as "carbonKg",
          ROUND(SUM(energy_kwh)::numeric, 4) as "kWh",
          ROUND((SUM(renewable_kwh) / NULLIF(SUM(energy_kwh), 0) * 100)::numeric, 0) as "renewablePct"
        FROM emission_records
        WHERE source = 'aws_live'
        GROUP BY TO_CHAR(period_start, 'YYYY-MM-DD')
        ORDER BY date ASC
      `),
      query(`
        SELECT
          r.service,
          ROUND(SUM(e.emissions_kg)::numeric, 4) as "carbonKg",
          ROUND(SUM(e.energy_kwh)::numeric, 4) as "kWh",
          COUNT(DISTINCT r.resource_id) as count
        FROM resources r
        JOIN emission_records e ON r.resource_id = e.resource_id
        WHERE r.source = 'aws_live'
        GROUP BY r.service
        ORDER BY "carbonKg" DESC
      `)
    ]);

    let historicalTrend = trendRes.rows;
    if (historicalTrend.length === 0) {
      await runDataPipeline({ days: 14 });
      const refetch = await query(`
        SELECT
          TO_CHAR(period_start, 'YYYY-MM-DD') as date,
          ROUND(SUM(emissions_kg)::numeric, 2) as "carbonKg",
          ROUND(SUM(energy_kwh)::numeric, 2) as "kWh",
          ROUND((SUM(renewable_kwh) / NULLIF(SUM(energy_kwh), 0) * 100)::numeric, 0) as "renewablePct"
        FROM emission_records
        WHERE granularity = 'DAILY'
        GROUP BY TO_CHAR(period_start, 'YYYY-MM-DD')
        ORDER BY date ASC
        LIMIT 30
      `);
      historicalTrend = refetch.rows;
    }

    res.json({
      success: true,
      source: 'postgresql_persistence',
      data: {
        historicalTrend,
        serviceBreakdown: serviceRes.rows,
        regionBreakdown: regionRes.rows,
        awsHistoricalTrend: awsTrendRes.rows,
        awsServiceBreakdown: awsServiceRes.rows
      }
    });
  } catch (error) {
    console.error('[Dashboard charts error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =========================================================================
// 7. GREEN AI TIME-SERIES PREDICTIONS
// =========================================================================
router.get('/predictions', async (req, res) => {
  try {
    // Read resources from DB to supply baseline
    const resResult = await query(`
      SELECT r.resource_id, r.resource_name, r.service, r.region, r.source, p.body as passport_body
      FROM resources r
      LEFT JOIN passports p ON r.resource_id = p.resource_id
    `);

    const resourcesWithMetrics = resResult.rows.map(r => {
      const p = r.passport_body || {};
      const m = p.metrics || {};
      return {
        id: r.resource_id,
        name: r.resource_name,
        service: r.service,
        region: r.region,
        source: r.source,
        metrics: {
          carbonKgCO2: m.carbonKgCO2 || 10.0,
          totalKWh: m.totalKWh || 20.0
        }
      };
    });

    const awsLiveResources = resourcesWithMetrics.filter(r => r.source === 'aws_live');
    const sampleResources = resourcesWithMetrics.filter(r => r.source !== 'aws_live');

    const overallForecast = generate7DayForecast(resourcesWithMetrics);
    const awsLiveForecast = awsLiveResources.length > 0 ? generate7DayForecast(awsLiveResources) : null;
    const sampleForecast = sampleResources.length > 0 ? generate7DayForecast(sampleResources) : null;

    // Read model evaluation metadata if available
    let modelMeta = null;
    try {
      modelMeta = JSON.parse(await readFile(carbonForecasterSummaryPath, 'utf8'));
    } catch {
      // optional
    }

    res.json({
      success: true,
      source: 'green_ai_model',
      data: {
        ...overallForecast,
        awsLiveForecast,
        sampleForecast,
        awsResourcesCount: awsLiveResources.length,
        sampleResourcesCount: sampleResources.length,
        modelEvaluation: modelMeta ? modelMeta.metrics : null
      }
    });
  } catch (error) {
    console.error('[Predictions error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =========================================================================
// 8. EVIDENCE-BASED SUSTAINABILITY RECOMMENDATIONS
// =========================================================================
router.get('/recommendations', async (req, res) => {
  try {
    const recResult = await query(`
      SELECT rec.*, r.source, r.is_synthetic, r.region as resource_region
      FROM recommendations rec
      LEFT JOIN resources r ON rec.resource_id = r.resource_id
      ORDER BY (r.source = 'aws_live' OR rec.rec_id LIKE 'rec-aws-live%') DESC, rec.applied ASC, rec.impact_score DESC, rec.created_at DESC
    `);

    const formatted = recResult.rows.map(row => ({
      id: row.rec_id,
      resourceId: row.resource_id,
      resourceName: row.resource_name,
      service: row.service,
      type: row.rec_type,
      severity: row.severity,
      impactScore: Number(row.impact_score),
      title: row.title,
      description: row.description,
      action: row.action,
      estimatedMonthlyCarbonSavingsKg: Number(row.est_monthly_carbon_savings_kg),
      estimatedMonthlyCostSavingsUsd: Number(row.est_monthly_cost_savings_usd),
      targetRegion: row.target_region,
      applied: row.applied,
      status: row.status,
      source: row.source || (row.rec_id.includes('aws-live') ? 'aws_live' : 'sample_workload'),
      isLiveAws: row.source === 'aws_live' || row.rec_id.includes('aws-live')
    }));

    res.json({
      success: true,
      source: 'postgresql_persistence',
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    console.error('[Recommendations query error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/recommendations/:id/apply', async (req, res) => {
  const { id } = req.params;
  try {
    const recCheck = await query('SELECT * FROM recommendations WHERE rec_id = $1', [id]);
    if (recCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Recommendation not found' });
    }

    await query(
      `UPDATE recommendations
       SET applied = TRUE, status = 'accepted', applied_at = now()
       WHERE rec_id = $1`,
      [id]
    );

    const rec = recCheck.rows[0];
    res.json({
      success: true,
      message: `Recommendation "${rec.title}" applied successfully. Workload optimization recorded in persistent audit trail.`,
      appliedRecommendationId: id
    });
  } catch (error) {
    console.error('[Apply recommendation error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
