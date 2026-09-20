import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { query, checkDatabaseHealth, transaction, runMigrations, pool } from '../src/db/dbClient.js';

describe('PostgreSQL Database Persistence Tests', () => {
  it('connects to PostgreSQL database and checks health', async () => {
    const health = await checkDatabaseHealth();
    assert.equal(health.connected, true);
    assert.equal(health.database, 'carbon_passport');
    assert.equal(typeof health.latencyMs, 'number');
  });

  it('runs schema migrations idempotently', async () => {
    await runMigrations();
    const res = await query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    const tables = res.rows.map(r => r.table_name);
    assert.equal(tables.includes('resources'), true);
    assert.equal(tables.includes('emission_records'), true);
    assert.equal(tables.includes('passports'), true);
    assert.equal(tables.includes('predictions'), true);
    assert.equal(tables.includes('pipeline_runs'), true);
  });

  it('rolls back aborted transaction properly', async () => {
    const testId = 'res-rollback-test-' + Date.now();
    try {
      await transaction(async (client) => {
        await client.query(
          `INSERT INTO resources (resource_id, resource_name, resource_type, service, region, source)
           VALUES ($1, 'Test Rollback', 'EC2', 'Amazon EC2', 'ap-south-1', 'test')`,
          [testId]
        );
        throw new Error('Forced transaction failure');
      });
    } catch (err) {
      assert.equal(err.message, 'Forced transaction failure');
    }

    const check = await query('SELECT * FROM resources WHERE resource_id = $1', [testId]);
    assert.equal(check.rows.length, 0);
  });

  after(async () => {
    await pool.end();
  });
});
