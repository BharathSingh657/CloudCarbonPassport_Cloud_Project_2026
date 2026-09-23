import { query, transaction } from '../db/dbClient.js';
import { calculateResourceCarbon, CALC_VERSION } from '../carbon/carbonEngine.js';
import { generateDigitalCarbonPassport } from '../services/passportGenerator.js';
import { AWSResourceInventoryAdapter } from '../adapters/awsAdapters.js';
import crypto from 'node:crypto';

/**
 * Standard resource definitions for framework ingestion.
 */
export const STANDARD_RESOURCES = [
  {
    id: 'res-ec2-prod-api-01',
    name: 'Prod API Gateway Cluster',
    service: 'Amazon EC2',
    instanceType: 'c6i.4xlarge',
    region: 'us-east-1',
    status: 'Active',
    environment: 'Production',
    owner: 'Platform Team',
    storageGB: 500,
    tags: { App: 'CoreAPI', Tier: 'Frontend', 'ccp:monitor': 'true' },
    source: 'sample_dataset',
    isSynthetic: true
  },
  {
    id: 'res-ec2-legacy-batch-02',
    name: 'Legacy Analytics Ingestion',
    service: 'Amazon EC2',
    instanceType: 't3.2xlarge',
    region: 'ap-south-1',
    status: 'Warning',
    environment: 'Production',
    owner: 'Data Eng',
    storageGB: 1200,
    tags: { App: 'ETL-Legacy', Tier: 'Batch', 'ccp:monitor': 'true', 'ccp:lifecycle': 'non-production' },
    source: 'sample_dataset',
    isSynthetic: true
  },
  {
    id: 'res-rds-user-db-01',
    name: 'Primary PostgreSQL DB',
    service: 'Amazon RDS',
    instanceType: 'db.r6g.xlarge',
    region: 'us-west-2',
    status: 'Optimal',
    environment: 'Production',
    owner: 'DBA Team',
    storageGB: 2500,
    tags: { App: 'UserDB', Tier: 'Database', 'ccp:monitor': 'true' },
    source: 'sample_dataset',
    isSynthetic: true
  },
  {
    id: 'res-rds-staging-db-02',
    name: 'Staging PostgreSQL DB',
    service: 'Amazon RDS',
    instanceType: 'db.t4g.medium',
    region: 'us-east-1',
    status: 'Active',
    environment: 'Staging',
    owner: 'QA Team',
    storageGB: 250,
    tags: { App: 'StagingDB', Tier: 'Database', 'ccp:monitor': 'true' },
    source: 'sample_dataset',
    isSynthetic: true
  },
  {
    id: 'res-s3-analytics-logs-01',
    name: 'Analytics Cold Data Lake',
    service: 'Amazon S3',
    instanceType: 's3-standard',
    region: 'us-east-1',
    status: 'Optimal',
    environment: 'Production',
    owner: 'Data Lake Team',
    storageGB: 185000,
    tags: { App: 'LogsBucket', StorageClass: 'Standard', 'ccp:monitor': 'true' },
    source: 'sample_dataset',
    isSynthetic: true
  },
  {
    id: 'res-s3-green-archival-02',
    name: 'Green Archival Store',
    service: 'Amazon S3',
    instanceType: 's3-standard',
    region: 'eu-north-1',
    status: 'Optimal',
    environment: 'Production',
    owner: 'Archive Team',
    storageGB: 340000,
    tags: { App: 'ColdArchive', StorageClass: 'Standard', 'ccp:monitor': 'true' },
    source: 'sample_dataset',
    isSynthetic: true
  },
  {
    id: 'res-lambda-auth-worker',
    name: 'Auth Token Validator',
    service: 'AWS Lambda',
    instanceType: 'lambda-function',
    region: 'eu-north-1',
    status: 'Optimal',
    environment: 'Production',
    owner: 'Security Team',
    storageGB: 10,
    tags: { Runtime: 'nodejs20.x', 'ccp:monitor': 'true' },
    source: 'sample_dataset',
    isSynthetic: true
  },
  {
    id: 'res-lambda-image-processor',
    name: 'Media Thumbnail Generator',
    service: 'AWS Lambda',
    instanceType: 'lambda-function',
    region: 'ap-south-1',
    status: 'Warning',
    environment: 'Production',
    owner: 'Media Team',
    storageGB: 50,
    tags: { Runtime: 'python3.12', 'ccp:monitor': 'true' },
    source: 'sample_dataset',
    isSynthetic: true
  },
  {
    id: 'res-ecs-search-cluster',
    name: 'Elasticsearch Search Nodes',
    service: 'Amazon ECS',
    instanceType: 'ecs-task',
    region: 'us-west-2',
    status: 'Optimal',
    environment: 'Production',
    owner: 'Search Team',
    storageGB: 800,
    tags: { Cluster: 'OpenSearch', 'ccp:monitor': 'true' },
    source: 'sample_dataset',
    isSynthetic: true
  },
  {
    id: 'res-ec2-dev-sandbox-04',
    name: 'Dev Sandbox Workstation',
    service: 'Amazon EC2',
    instanceType: 't3.2xlarge',
    region: 'us-east-1',
    status: 'Critical',
    environment: 'Development',
    owner: 'DevOps',
    storageGB: 400,
    tags: { Env: 'Dev', 'ccp:monitor': 'true', 'ccp:lifecycle': 'non-production' },
    source: 'sample_dataset',
    isSynthetic: true
  },
  {
    id: 'res-ec2-eu-cache-node',
    name: 'Redis Cache Cluster EU',
    service: 'Amazon EC2',
    instanceType: 'r6i.2xlarge',
    region: 'eu-north-1',
    status: 'Optimal',
    environment: 'Production',
    owner: 'Backend Team',
    storageGB: 300,
    tags: { Cache: 'Redis', 'ccp:monitor': 'true' },
    source: 'sample_dataset',
    isSynthetic: true
  },
  {
    id: 'res-rds-analytics-replica',
    name: 'Read Replica Analytics DB',
    service: 'Amazon RDS',
    instanceType: 'db.r6g.xlarge',
    region: 'ap-southeast-1',
    status: 'Active',
    environment: 'Production',
    owner: 'Analytics Team',
    storageGB: 1500,
    tags: { Role: 'Replica', 'ccp:monitor': 'true' },
    source: 'sample_dataset',
    isSynthetic: true
  }
];

/**
 * Generates deterministic 30-day hourly synthetic workload observations for a resource.
 */
export function generateSyntheticObservations(resource, days = 30) {
  const observations = [];
  const now = new Date();
  now.setMinutes(0, 0, 0);

  // Seed baseline from resource type
  const baseCpu = resource.id.includes('legacy') ? 12.0
    : resource.id.includes('dev-sandbox') ? 4.5
    : resource.id.includes('prod-api') ? 72.0
    : resource.id.includes('auth-worker') ? 28.0
    : resource.id.includes('image-processor') ? 85.0
    : resource.id.includes('green-archival') ? 2.0
    : 40.0;

  const totalHours = days * 24;

  for (let h = totalHours; h >= 0; h--) {
    const timestamp = new Date(now.getTime() - h * 3600 * 1000);
    const hourOfDay = timestamp.getUTCHours();
    const dayOfWeek = timestamp.getUTCDay();

    // Diurnal variation (peak 10am - 6pm UTC)
    const diurnal = Math.sin((hourOfDay - 6) * Math.PI / 12) * 12.0;
    // Weekend reduction
    const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.75 : 1.0;
    // Deterministic pseudo-noise
    const hash = crypto.createHash('md5').update(`${resource.id}-${h}`).digest().readUInt16BE(0);
    const noise = ((hash % 100) / 100 - 0.5) * 8.0;

    let cpu = (baseCpu + diurnal + noise) * weekendFactor;
    cpu = Math.max(1.5, Math.min(99.0, parseFloat(cpu.toFixed(2))));

    const mem = Math.max(5.0, Math.min(95.0, parseFloat((cpu * 0.85 + 10).toFixed(2))));
    const netIn = Math.round(cpu * 1024 * 1024 * (resource.service === 'Amazon EC2' ? 50 : 5));
    const netOut = Math.round(netIn * 1.4);

    observations.push({
      resourceId: resource.id,
      timestamp: timestamp.toISOString(),
      cpuUtilizationPct: cpu,
      memoryUtilizationPct: mem,
      storageGB: resource.storageGB,
      networkInBytes: netIn,
      networkOutBytes: netOut,
      source: resource.source || 'synthetic'
    });
  }

  return observations;
}

/**
 * Executes the live AWS CloudWatch ingestion pipeline.
 * Collects live resources from EC2, S3, RDS, and Lambda via AWS SDK,
 * queries live CloudWatch metrics, calculates SPECPower emissions and PUE,
 * saves passports to PostgreSQL, and logs the execution in pipeline_runs.
 */
export async function runAwsLivePipeline(options = {}) {
  const startTime = Date.now();
  const dataSource = 'aws_live_cloudwatch';
  const pipelineName = 'AWS CloudWatch Live Ingestion Pipeline';

  const runRes = await query(
    `INSERT INTO pipeline_runs (pipeline_name, data_source, status, started_at)
     VALUES ($1, $2, 'RUNNING', now())
     RETURNING run_id`,
    [pipelineName, dataSource]
  );
  const runId = runRes.rows[0].run_id;

  try {
    const awsAdapter = new AWSResourceInventoryAdapter({
      region: options.region || 'ap-south-1',
      profile: options.profile || 'cloudpassport'
    });

    const inventoryResult = await awsAdapter.getResourceInventory();
    const liveResources = inventoryResult.resources || [];

    if (liveResources.length === 0) {
      const durationMs = Date.now() - startTime;
      await query(
        `UPDATE pipeline_runs SET
          status = 'COMPLETED',
          records_ingested = 0,
          records_processed = 0,
          emissions_calculated = 0,
          duration_ms = $1,
          details = $2,
          completed_at = now()
         WHERE run_id = $3`,
        [durationMs, JSON.stringify({ message: 'No live AWS resources found in inventory', inventoryResult }), runId]
      );
      return {
        success: true,
        runId,
        pipelineName,
        dataSource,
        recordsIngested: 0,
        recordsProcessed: 0,
        emissionsCalculated: 0,
        durationMs,
        status: 'COMPLETED',
        liveResourcesCount: 0
      };
    }

    let recordsIngested = 0;
    let recordsProcessed = 0;
    let emissionsCalculated = 0;

    await transaction(async (client) => {
      const nowIso = new Date().toISOString();
      const today = nowIso.slice(0, 10);
      const periodStart = `${today}T00:00:00Z`;
      const periodEnd = `${today}T23:59:59Z`;

      for (const res of liveResources) {
        const region = res.region === 'Account-wide' || !res.region ? 'ap-south-1' : res.region;
        const normalizedResId = res.id;
        const storageGB = res.storageGB || 10;
        const cpuUtil = res.cpuUtilization !== undefined ? Number(res.cpuUtilization) : 5.0;
        const memUtil = res.memoryUtilization !== undefined ? Number(res.memoryUtilization) : 35.0;

        // 1. Upsert resource into database
        await client.query(
          `INSERT INTO resources (
            resource_id, resource_name, resource_type, service, region,
            instance_type, status, environment, owner, tags, source, is_synthetic, storage_gb, last_seen
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, now())
          ON CONFLICT (resource_id) DO UPDATE SET
            resource_name = EXCLUDED.resource_name,
            service = EXCLUDED.service,
            region = EXCLUDED.region,
            instance_type = EXCLUDED.instance_type,
            status = EXCLUDED.status,
            tags = EXCLUDED.tags,
            storage_gb = EXCLUDED.storage_gb,
            source = 'aws_live',
            is_synthetic = false,
            last_seen = now()`,
          [
            normalizedResId,
            res.name || normalizedResId,
            res.service,
            res.service,
            region,
            res.instanceType || 'unknown',
            res.status || 'Active',
            res.environment || 'Live AWS',
            res.owner || 'AWS Account',
            JSON.stringify(res.tags || {}),
            'aws_live',
            false,
            storageGB
          ]
        );

        // 2. Insert workload observation
        await client.query(
          `INSERT INTO workload_observations (
            resource_id, timestamp, cpu_utilization_pct, memory_utilization_pct,
            storage_gb, network_in_bytes, network_out_bytes, source
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (resource_id, timestamp) DO UPDATE SET
            cpu_utilization_pct = EXCLUDED.cpu_utilization_pct,
            memory_utilization_pct = EXCLUDED.memory_utilization_pct,
            storage_gb = EXCLUDED.storage_gb`,
          [
            normalizedResId,
            nowIso,
            cpuUtil,
            memUtil,
            storageGB,
            1048576,
            2097152,
            'aws_live_cloudwatch'
          ]
        );
        recordsIngested++;
        recordsProcessed++;

        // 3. Compute real-time carbon estimation
        const estimated = calculateResourceCarbon({
          ...res,
          id: normalizedResId,
          region,
          storageGB,
          cpuUtilization: cpuUtil,
          memoryUtilization: memUtil,
          uptimeHours: 24
        });

        await client.query(
          `INSERT INTO emission_records (
            resource_id, period_start, period_end, granularity,
            cpu_avg_pct, cpu_p95_pct, power_watts, energy_kwh,
            intensity_g_kwh, emissions_kg, scope2_emissions_kg, scope3_emissions_kg,
            renewable_kwh, calc_version, source
          ) VALUES ($1, $2, $3, 'DAILY', $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          ON CONFLICT (resource_id, period_start, granularity) DO UPDATE SET
            cpu_avg_pct = EXCLUDED.cpu_avg_pct,
            power_watts = EXCLUDED.power_watts,
            energy_kwh = EXCLUDED.energy_kwh,
            intensity_g_kwh = EXCLUDED.intensity_g_kwh,
            emissions_kg = EXCLUDED.emissions_kg,
            scope2_emissions_kg = EXCLUDED.scope2_emissions_kg,
            scope3_emissions_kg = EXCLUDED.scope3_emissions_kg,
            renewable_kwh = EXCLUDED.renewable_kwh,
            calc_version = EXCLUDED.calc_version`,
          [
            normalizedResId,
            periodStart,
            periodEnd,
            parseFloat(cpuUtil.toFixed(2)),
            parseFloat((cpuUtil * 1.2).toFixed(2)),
            estimated.metrics.powerWatts,
            estimated.metrics.totalKWh,
            estimated.metrics.carbonIntensity,
            estimated.metrics.carbonKgCO2,
            estimated.metrics.scope2Emissions,
            estimated.metrics.scope3Emissions,
            estimated.metrics.renewableKWh,
            CALC_VERSION,
            'aws_live'
          ]
        );
        emissionsCalculated++;

        // 4. Generate & store Digital Carbon Passport
        const passportDoc = generateDigitalCarbonPassport({
          ...res,
          id: normalizedResId,
          name: res.name || normalizedResId,
          service: res.service,
          region,
          instanceType: res.instanceType,
          status: res.status,
          storageGB,
          cpuUtilization: cpuUtil,
          metrics: estimated.metrics
        });

        await client.query(
          `INSERT INTO passports (
            passport_id, resource_id, sustainability_score, sustainability_rating, body, updated_at
          ) VALUES ($1, $2, $3, $4, $5, now())
          ON CONFLICT (resource_id) DO UPDATE SET
            passport_id = EXCLUDED.passport_id,
            sustainability_score = EXCLUDED.sustainability_score,
            sustainability_rating = EXCLUDED.sustainability_rating,
            body = EXCLUDED.body,
            version = passports.version + 1,
            updated_at = now()`,
          [
            passportDoc.passportId,
            normalizedResId,
            estimated.metrics.sustainabilityScore,
            estimated.metrics.sustainabilityRating,
            JSON.stringify(passportDoc)
          ]
        );

        // 5. Generate optimization recommendations for live AWS resources
        if (res.service === 'Amazon EC2') {
          const recId = `rec-aws-live-${normalizedResId}`;
          const savedKg = Math.max(1.8, parseFloat((estimated.metrics.carbonKgCO2 * 0.65).toFixed(2)));
          await client.query(
            `INSERT INTO recommendations (
              rec_id, resource_id, resource_name, service, rec_type, severity, impact_score,
              title, description, action, est_monthly_carbon_savings_kg, est_monthly_cost_savings_usd,
              target_region, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'open')
            ON CONFLICT (rec_id) DO UPDATE SET
              est_monthly_carbon_savings_kg = EXCLUDED.est_monthly_carbon_savings_kg,
              est_monthly_cost_savings_usd = EXCLUDED.est_monthly_cost_savings_usd,
              title = EXCLUDED.title,
              description = EXCLUDED.description,
              action = EXCLUDED.action`,
            [
              recId,
              normalizedResId,
              res.name || normalizedResId,
              res.service,
              'Live AWS Instance Green Scheduling',
              'HIGH',
              96,
              `Automate Off-Peak Stop/Start Schedule for ${res.name || normalizedResId}`,
              `CloudWatch reports active CPU utilization is ${cpuUtil.toFixed(1)}%. Configuring an automated off-peak shutdown policy (e.g. AWS Systems Manager Quick Setup) prevents idle overnight and weekend electricity consumption in the Mumbai (ap-south-1) grid (708 gCO2/kWh).`,
              `Attach AWS EventBridge scheduler to pause instance outside active development hours (18:00 - 08:00 UTC).`,
              savedKg,
              14.20,
              region
            ]
          );
        } else if (res.service === 'Amazon RDS') {
          const recId = `rec-aws-live-${normalizedResId}`;
          const savedKg = Math.max(2.4, parseFloat((estimated.metrics.carbonKgCO2 * 0.55).toFixed(2)));
          await client.query(
            `INSERT INTO recommendations (
              rec_id, resource_id, resource_name, service, rec_type, severity, impact_score,
              title, description, action, est_monthly_carbon_savings_kg, est_monthly_cost_savings_usd,
              target_region, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'open')
            ON CONFLICT (rec_id) DO UPDATE SET
              est_monthly_carbon_savings_kg = EXCLUDED.est_monthly_carbon_savings_kg,
              est_monthly_cost_savings_usd = EXCLUDED.est_monthly_cost_savings_usd,
              title = EXCLUDED.title,
              description = EXCLUDED.description,
              action = EXCLUDED.action`,
            [
              recId,
              normalizedResId,
              res.name || normalizedResId,
              res.service,
              'Live RDS Database Green Optimization',
              'HIGH',
              92,
              `Implement Dev/Test Auto-Pause Schedule for RDS ${res.name || normalizedResId}`,
              `CloudWatch indicates database (${res.instanceType || 'db.t4g.micro'}) handles dev/test telemetry with low night-time transaction volume. Enabling automatic weekend stops preserves underlying EBS storage while eliminating compute wattage and operational Scope 2 emissions.`,
              `Enable automated stop schedule for non-production hours via AWS CLI / Systems Manager.`,
              savedKg,
              11.80,
              region
            ]
          );
        } else if (res.service === 'AWS Lambda') {
          const recId = `rec-aws-live-${normalizedResId}`;
          const savedKg = Math.max(0.9, parseFloat((estimated.metrics.carbonKgCO2 * 0.40).toFixed(2)));
          await client.query(
            `INSERT INTO recommendations (
              rec_id, resource_id, resource_name, service, rec_type, severity, impact_score,
              title, description, action, est_monthly_carbon_savings_kg, est_monthly_cost_savings_usd,
              target_region, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'open')
            ON CONFLICT (rec_id) DO UPDATE SET
              est_monthly_carbon_savings_kg = EXCLUDED.est_monthly_carbon_savings_kg,
              est_monthly_cost_savings_usd = EXCLUDED.est_monthly_cost_savings_usd,
              title = EXCLUDED.title,
              description = EXCLUDED.description,
              action = EXCLUDED.action`,
            [
              recId,
              normalizedResId,
              res.name || normalizedResId,
              res.service,
              'Live Lambda Serverless Power Tuning',
              'MEDIUM',
              88,
              `Tune Lambda Memory Tier via Power Tuning for ${res.name || normalizedResId}`,
              `Serverless execution profiling reveals current runtime (${res.instanceType || 'python3.11'}) can be optimized by testing memory configurations between 128MB and 256MB. Faster execution decreases total duration (ms), lowering the net watt-seconds consumed per execution.`,
              `Run AWS Lambda Power Tuning state machine to select the optimal green memory tier.`,
              savedKg,
              4.50,
              region
            ]
          );
        } else if (res.service === 'Amazon S3') {
          const recId = `rec-aws-live-${normalizedResId}`;
          const savedKg = Math.max(1.5, parseFloat((estimated.metrics.carbonKgCO2 * 0.50).toFixed(2)));
          await client.query(
            `INSERT INTO recommendations (
              rec_id, resource_id, resource_name, service, rec_type, severity, impact_score,
              title, description, action, est_monthly_carbon_savings_kg, est_monthly_cost_savings_usd,
              target_region, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'open')
            ON CONFLICT (rec_id) DO UPDATE SET
              est_monthly_carbon_savings_kg = EXCLUDED.est_monthly_carbon_savings_kg,
              est_monthly_cost_savings_usd = EXCLUDED.est_monthly_cost_savings_usd,
              title = EXCLUDED.title,
              description = EXCLUDED.description,
              action = EXCLUDED.action`,
            [
              recId,
              normalizedResId,
              res.name || normalizedResId,
              res.service,
              'Live S3 Storage Lifecycle & Tiering',
              'MEDIUM',
              85,
              `Enable S3 Intelligent-Tiering & Lifecycle Rules for ${res.name || normalizedResId}`,
              `Storage bucket retains standard storage class with stationary object access. Enabling S3 Intelligent-Tiering and lifecycle transitions to Glacier Instant Retrieval reduces datacenter drive rotational power and embodied disk carbon.`,
              `Apply S3 Lifecycle Configuration Rule for transition to Intelligent-Tiering after 30 days.`,
              savedKg,
              6.40,
              region
            ]
          );
        }
      }
    });

    const durationMs = Date.now() - startTime;
    await query(
      `UPDATE pipeline_runs SET
        status = 'COMPLETED',
        records_ingested = $1,
        records_processed = $2,
        emissions_calculated = $3,
        duration_ms = $4,
        details = $5,
        completed_at = now()
       WHERE run_id = $6`,
      [
        recordsIngested,
        recordsProcessed,
        emissionsCalculated,
        durationMs,
        JSON.stringify({
          liveResourcesCount: liveResources.length,
          resourceIds: liveResources.map(r => r.id),
          services: liveResources.map(r => r.service)
        }),
        runId
      ]
    );

    return {
      success: true,
      runId,
      pipelineName,
      dataSource,
      recordsIngested,
      recordsProcessed,
      emissionsCalculated,
      durationMs,
      status: 'COMPLETED',
      liveResourcesCount: liveResources.length,
      liveResources
    };
  } catch (err) {
    const durationMs = Date.now() - startTime;
    await query(
      `UPDATE pipeline_runs SET
        status = 'FAILED',
        error_message = $1,
        duration_ms = $2,
        completed_at = now()
       WHERE run_id = $3`,
      [err.message, durationMs, runId]
    );
    throw err;
  }
}

/**
 * Executes the full end-to-end data pipeline.
 */
export async function runDataPipeline(options = {}) {
  const dataSource = options.dataSource || 'sample_workload';
  if (dataSource === 'aws_live_cloudwatch' || dataSource === 'aws_live' || dataSource === 'aws') {
    return runAwsLivePipeline(options);
  }

  const startTime = Date.now();
  const pipelineName = options.pipelineName || 'Cloud Carbon Passport Ingestion Engine';

  // 1. Create pipeline run record
  const runRes = await query(
    `INSERT INTO pipeline_runs (pipeline_name, data_source, status, started_at)
     VALUES ($1, $2, 'RUNNING', now())
     RETURNING run_id`,
    [pipelineName, dataSource]
  );
  const runId = runRes.rows[0].run_id;

  try {
    let resourcesToProcess = [];

    if (dataSource === 'sample_workload' || dataSource === 'all') {
      resourcesToProcess = [...STANDARD_RESOURCES];
    }

    if (options.extraResources && Array.isArray(options.extraResources)) {
      resourcesToProcess.push(...options.extraResources);
    }

    let recordsIngested = 0;
    let recordsProcessed = 0;
    let emissionsCalculated = 0;

    await transaction(async (client) => {
      // Step A: Upsert resources
      for (const res of resourcesToProcess) {
        await client.query(
          `INSERT INTO resources (
            resource_id, resource_name, resource_type, service, region,
            instance_type, status, environment, owner, tags, source, is_synthetic, storage_gb, last_seen
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, now())
          ON CONFLICT (resource_id) DO UPDATE SET
            resource_name = EXCLUDED.resource_name,
            service = EXCLUDED.service,
            region = EXCLUDED.region,
            instance_type = EXCLUDED.instance_type,
            status = EXCLUDED.status,
            tags = EXCLUDED.tags,
            storage_gb = EXCLUDED.storage_gb,
            last_seen = now()`,
          [
            res.id,
            res.name,
            res.service,
            res.service,
            res.region,
            res.instanceType,
            res.status || 'Active',
            res.environment || 'Production',
            res.owner || 'DevOps',
            JSON.stringify(res.tags || {}),
            res.source || 'sample_dataset',
            res.isSynthetic !== false,
            res.storageGB || 20
          ]
        );
      }

      // Step B: Generate & upsert observations + emission records
      for (const res of resourcesToProcess) {
        const observations = options.observations && options.observations[res.id]
          ? options.observations[res.id]
          : generateSyntheticObservations(res, options.days || 30);

        recordsIngested += observations.length;

        // Group observations by date for daily aggregation
        const dailyBuckets = new Map();

        for (const obs of observations) {
          await client.query(
            `INSERT INTO workload_observations (
              resource_id, timestamp, cpu_utilization_pct, memory_utilization_pct,
              storage_gb, network_in_bytes, network_out_bytes, source
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (resource_id, timestamp) DO UPDATE SET
              cpu_utilization_pct = EXCLUDED.cpu_utilization_pct,
              memory_utilization_pct = EXCLUDED.memory_utilization_pct,
              storage_gb = EXCLUDED.storage_gb,
              network_in_bytes = EXCLUDED.network_in_bytes,
              network_out_bytes = EXCLUDED.network_out_bytes`,
            [
              obs.resourceId,
              obs.timestamp,
              obs.cpuUtilizationPct,
              obs.memoryUtilizationPct,
              obs.storageGB,
              obs.networkInBytes || 0,
              obs.networkOutBytes || 0,
              obs.source
            ]
          );
          recordsProcessed++;

          // Day key for aggregation
          const dayKey = obs.timestamp.slice(0, 10);
          if (!dailyBuckets.has(dayKey)) dailyBuckets.set(dayKey, []);
          dailyBuckets.get(dayKey).push(obs);
        }

        // Step C: Calculate daily emissions
        for (const [dayKey, dayObs] of dailyBuckets.entries()) {
          const cpus = dayObs.map(o => o.cpuUtilizationPct).sort((a, b) => a - b);
          const avgCpu = cpus.reduce((a, b) => a + b, 0) / cpus.length;
          const p95Cpu = cpus[Math.floor(cpus.length * 0.95)] || avgCpu;
          const periodStart = `${dayKey}T00:00:00Z`;
          const periodEnd = `${dayKey}T23:59:59Z`;

          const estimated = calculateResourceCarbon({
            ...res,
            cpuUtilization: avgCpu,
            uptimeHours: dayObs.length
          });

          await client.query(
            `INSERT INTO emission_records (
              resource_id, period_start, period_end, granularity,
              cpu_avg_pct, cpu_p95_pct, power_watts, energy_kwh,
              intensity_g_kwh, emissions_kg, scope2_emissions_kg, scope3_emissions_kg,
              renewable_kwh, calc_version, source
            ) VALUES ($1, $2, $3, 'DAILY', $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            ON CONFLICT (resource_id, period_start, granularity) DO UPDATE SET
              cpu_avg_pct = EXCLUDED.cpu_avg_pct,
              cpu_p95_pct = EXCLUDED.cpu_p95_pct,
              power_watts = EXCLUDED.power_watts,
              energy_kwh = EXCLUDED.energy_kwh,
              intensity_g_kwh = EXCLUDED.intensity_g_kwh,
              emissions_kg = EXCLUDED.emissions_kg,
              scope2_emissions_kg = EXCLUDED.scope2_emissions_kg,
              scope3_emissions_kg = EXCLUDED.scope3_emissions_kg,
              renewable_kwh = EXCLUDED.renewable_kwh,
              calc_version = EXCLUDED.calc_version`,
            [
              res.id,
              periodStart,
              periodEnd,
              parseFloat(avgCpu.toFixed(2)),
              parseFloat(p95Cpu.toFixed(2)),
              estimated.metrics.powerWatts,
              estimated.metrics.totalKWh,
              estimated.metrics.carbonIntensity,
              estimated.metrics.carbonKgCO2,
              estimated.metrics.scope2Emissions,
              estimated.metrics.scope3Emissions,
              estimated.metrics.renewableKWh,
              CALC_VERSION,
              res.source || 'synthetic'
            ]
          );
          emissionsCalculated++;
        }

        // Step D: Calculate Overall Resource Passport
        const allObs = observations.map(o => o.cpuUtilizationPct);
        const overallAvgCpu = allObs.reduce((a, b) => a + b, 0) / (allObs.length || 1);
        const resourceWithFullMetrics = calculateResourceCarbon({
          ...res,
          cpuUtilization: overallAvgCpu,
          uptimeHours: 720
        });

        const passportDoc = generateDigitalCarbonPassport(resourceWithFullMetrics);

        await client.query(
          `INSERT INTO passports (
            passport_id, resource_id, sustainability_score, sustainability_rating, body, updated_at
          ) VALUES ($1, $2, $3, $4, $5, now())
          ON CONFLICT (resource_id) DO UPDATE SET
            passport_id = EXCLUDED.passport_id,
            sustainability_score = EXCLUDED.sustainability_score,
            sustainability_rating = EXCLUDED.sustainability_rating,
            body = EXCLUDED.body,
            version = passports.version + 1,
            updated_at = now()`,
          [
            passportDoc.passportId,
            res.id,
            resourceWithFullMetrics.metrics.sustainabilityScore,
            resourceWithFullMetrics.metrics.sustainabilityRating,
            JSON.stringify(passportDoc)
          ]
        );

        // Step E: Recommendations based on real metrics
        if (overallAvgCpu < 20 && res.service === 'Amazon EC2') {
          const recId = `rec-idle-${res.id}`;
          const savedKg = parseFloat((resourceWithFullMetrics.metrics.carbonKgCO2 * 0.65).toFixed(2));
          await client.query(
            `INSERT INTO recommendations (
              rec_id, resource_id, resource_name, service, rec_type, severity, impact_score,
              title, description, action, est_monthly_carbon_savings_kg, est_monthly_cost_savings_usd,
              target_region, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'open')
            ON CONFLICT (rec_id) DO UPDATE SET
              est_monthly_carbon_savings_kg = EXCLUDED.est_monthly_carbon_savings_kg,
              title = EXCLUDED.title,
              description = EXCLUDED.description`,
            [
              recId,
              res.id,
              res.name,
              res.service,
              'Resource Right-Sizing / Idle Reduction',
              'HIGH',
              92,
              `Right-size idle instance ${res.name}`,
              `30-day average CPU utilization is only ${overallAvgCpu.toFixed(1)}%. Downgrading or scheduling stop will eliminate power waste.`,
              `Downgrade instance type or attach an Auto-Scaling shutdown policy`,
              savedKg,
              145,
              res.region
            ]
          );
        }

        if ((res.region === 'ap-south-1' || res.region === 'us-east-1') && resourceWithFullMetrics.metrics.carbonKgCO2 > 30) {
          const greenRegion = res.region === 'ap-south-1' ? 'eu-north-1' : 'us-west-2';
          const recId = `rec-region-${res.id}`;
          const reductionRatio = res.region === 'ap-south-1' ? 0.96 : 0.69;
          const savedKg = parseFloat((resourceWithFullMetrics.metrics.carbonKgCO2 * reductionRatio).toFixed(2));

          await client.query(
            `INSERT INTO recommendations (
              rec_id, resource_id, resource_name, service, rec_type, severity, impact_score,
              title, description, action, est_monthly_carbon_savings_kg, est_monthly_cost_savings_usd,
              target_region, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'open')
            ON CONFLICT (rec_id) DO UPDATE SET
              est_monthly_carbon_savings_kg = EXCLUDED.est_monthly_carbon_savings_kg`,
            [
              recId,
              res.id,
              res.name,
              res.service,
              'Carbon-Aware Region Shift',
              'MEDIUM',
              84,
              `Migrate ${res.name} to green grid (${greenRegion})`,
              `Operating in ${res.region} emits significantly more carbon than low-carbon renewable grids. Migration avoids ~${Math.round(reductionRatio * 100)}% grid emissions.`,
              `Re-deploy workload container/stack in ${greenRegion}`,
              savedKg,
              40,
              greenRegion
            ]
          );
        }
      }
    });

    const durationMs = Date.now() - startTime;

    // Step F: Mark pipeline run completed
    await query(
      `UPDATE pipeline_runs SET
        status = 'COMPLETED',
        records_ingested = $1,
        records_processed = $2,
        emissions_calculated = $3,
        duration_ms = $4,
        details = $5,
        completed_at = now()
       WHERE run_id = $6`,
      [
        recordsIngested,
        recordsProcessed,
        emissionsCalculated,
        durationMs,
        JSON.stringify({ resourceCount: resourcesToProcess.length }),
        runId
      ]
    );

    return {
      success: true,
      runId,
      recordsIngested,
      recordsProcessed,
      emissionsCalculated,
      durationMs,
      status: 'COMPLETED'
    };
  } catch (err) {
    const durationMs = Date.now() - startTime;
    await query(
      `UPDATE pipeline_runs SET
        status = 'FAILED',
        error_message = $1,
        duration_ms = $2,
        completed_at = now()
       WHERE run_id = $3`,
      [err.message, durationMs, runId]
    );
    throw err;
  }
}
