import pg from 'pg';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbConfig = {
  host: process.env.DB_HOST || process.env.PGHOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || process.env.PGPORT || 5433),
  database: process.env.DB_NAME || process.env.PGDATABASE || 'carbon_passport',
  user: process.env.DB_USER || process.env.PGUSER || 'postgres',
  password: process.env.DB_PASSWORD || process.env.PGPASSWORD || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
};

export const pool = new Pool(dbConfig);

pool.on('error', (err) => {
  console.error('[PostgreSQL Pool Error]', err.message);
});

export async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (err) {
    console.error(`[DB Query Error] ${err.message} \nQuery: ${text}`);
    throw err;
  }
}

export async function transaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function checkDatabaseHealth() {
  try {
    const start = Date.now();
    const res = await query('SELECT version(), current_database() as db, count(*) as res_count FROM resources');
    const latencyMs = Date.now() - start;
    return {
      connected: true,
      latencyMs,
      database: res.rows[0].db,
      version: res.rows[0].version,
      resourceCount: Number(res.rows[0].res_count)
    };
  } catch (err) {
    return {
      connected: false,
      error: err.message,
      target: `${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`
    };
  }
}

export async function runMigrations() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await query(schemaSql);
    console.log('[DB] Database schema verified and up-to-date.');
  }
}
