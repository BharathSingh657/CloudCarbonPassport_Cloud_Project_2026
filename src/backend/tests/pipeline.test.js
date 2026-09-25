import { describe, it, after } from 'node:test';
import assert from 'node:assert/strict';
import { runDataPipeline, STANDARD_RESOURCES } from '../src/pipeline/dataPipeline.js';
import { query, pool } from '../src/db/dbClient.js';

describe('Data Pipeline End-to-End Tests', () => {
  it('executes the data pipeline and populates PostgreSQL tables', async () => {
    // Run pipeline for 7 days
    const result = await runDataPipeline({
      dataSource: 'sample_workload',
      days: 7
    });

    assert.equal(result.success, true);
    assert.equal(result.status, 'COMPLETED');
    assert.equal(result.recordsIngested > 0, true);
    assert.equal(result.emissionsCalculated > 0, true);

    // Verify database counts
    const resCount = await query('SELECT count(*) as count FROM resources');
    assert.equal(Number(resCount.rows[0].count) >= STANDARD_RESOURCES.length, true);

    const obsCount = await query('SELECT count(*) as count FROM workload_observations');
    assert.equal(Number(obsCount.rows[0].count) > 0, true);

    const emissionCount = await query('SELECT count(*) as count FROM emission_records');
    assert.equal(Number(emissionCount.rows[0].count) > 0, true);

    const passportCount = await query('SELECT count(*) as count FROM passports');
    assert.equal(Number(passportCount.rows[0].count) >= STANDARD_RESOURCES.length, true);

    const recCount = await query('SELECT count(*) as count FROM recommendations');
    assert.equal(Number(recCount.rows[0].count) > 0, true);

    const runCount = await query('SELECT count(*) as count FROM pipeline_runs WHERE status = $1', ['COMPLETED']);
    assert.equal(Number(runCount.rows[0].count) > 0, true);
  });

  it('runs idempotently without creating duplicate primary keys or unique constraint violations', async () => {
    const run1 = await runDataPipeline({ dataSource: 'sample_workload', days: 3 });
    const run2 = await runDataPipeline({ dataSource: 'sample_workload', days: 3 });

    assert.equal(run1.success, true);
    assert.equal(run2.success, true);

    // Check that sample resources count did not double
    const resCount = await query('SELECT count(*) as count FROM resources WHERE source = $1', ['sample_dataset']);
    assert.equal(Number(resCount.rows[0].count), STANDARD_RESOURCES.length);
  });

  after(async () => {
    await pool.end();
  });
});
