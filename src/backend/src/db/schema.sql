-- Smart Cloud Carbon Passport Database Schema
-- Compatible with PostgreSQL 14+

CREATE TABLE IF NOT EXISTS resources (
  resource_id     TEXT PRIMARY KEY,
  resource_name   TEXT NOT NULL,
  resource_type   TEXT NOT NULL,
  service         TEXT NOT NULL,
  region          TEXT NOT NULL,
  instance_type   TEXT,
  status          TEXT DEFAULT 'Active',
  environment     TEXT DEFAULT 'Production',
  owner           TEXT,
  tags            JSONB DEFAULT '{}',
  source          TEXT NOT NULL DEFAULT 'sample_dataset',
  is_synthetic    BOOLEAN DEFAULT FALSE,
  storage_gb      NUMERIC(14,2) DEFAULT 0,
  first_seen      TIMESTAMPTZ DEFAULT now(),
  last_seen       TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS carbon_intensity (
  zone            TEXT NOT NULL,
  region          TEXT NOT NULL,
  ts              TIMESTAMPTZ NOT NULL,
  gco2_per_kwh    NUMERIC(10,2) NOT NULL,
  renewable_pct   NUMERIC(6,2) DEFAULT 0,
  source          TEXT,
  PRIMARY KEY (zone, ts)
);

CREATE TABLE IF NOT EXISTS workload_observations (
  observation_id          BIGSERIAL PRIMARY KEY,
  resource_id             TEXT REFERENCES resources(resource_id) ON DELETE CASCADE,
  timestamp               TIMESTAMPTZ NOT NULL,
  cpu_utilization_pct     NUMERIC(6,2),
  memory_utilization_pct  NUMERIC(6,2),
  storage_gb              NUMERIC(14,2),
  network_in_bytes        NUMERIC(18,2) DEFAULT 0,
  network_out_bytes       NUMERIC(18,2) DEFAULT 0,
  source                  TEXT NOT NULL,
  CONSTRAINT uq_workload_resource_ts UNIQUE (resource_id, timestamp)
);

CREATE TABLE IF NOT EXISTS emission_records (
  record_id               BIGSERIAL PRIMARY KEY,
  resource_id             TEXT REFERENCES resources(resource_id) ON DELETE CASCADE,
  period_start            TIMESTAMPTZ NOT NULL,
  period_end              TIMESTAMPTZ NOT NULL,
  granularity             TEXT NOT NULL CHECK (granularity IN ('HOURLY','DAILY','MONTHLY')),
  cpu_avg_pct             NUMERIC(6,2),
  cpu_p95_pct             NUMERIC(6,2),
  power_watts             NUMERIC(10,2),
  energy_kwh              NUMERIC(14,6),
  intensity_g_kwh         NUMERIC(10,2),
  emissions_kg            NUMERIC(14,6),
  scope2_emissions_kg     NUMERIC(14,6),
  scope3_emissions_kg     NUMERIC(14,6),
  renewable_kwh           NUMERIC(14,6),
  calc_version            TEXT NOT NULL,
  source                  TEXT NOT NULL,
  created_at              TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_emissions_resource_period UNIQUE (resource_id, period_start, granularity)
);

CREATE TABLE IF NOT EXISTS passports (
  passport_id             TEXT PRIMARY KEY,
  resource_id             TEXT UNIQUE REFERENCES resources(resource_id) ON DELETE CASCADE,
  sustainability_score    NUMERIC(5,2),
  sustainability_rating   TEXT,
  body                    JSONB NOT NULL,
  pdf_s3_key              TEXT,
  version                 INT NOT NULL DEFAULT 1,
  created_at              TIMESTAMPTZ DEFAULT now(),
  updated_at              TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS predictions (
  prediction_id           BIGSERIAL PRIMARY KEY,
  resource_id             TEXT REFERENCES resources(resource_id) ON DELETE CASCADE,
  made_at                 TIMESTAMPTZ NOT NULL,
  horizon_days            INT NOT NULL,
  predicted_cpu_pct       NUMERIC(6,2),
  predicted_energy_kwh    NUMERIC(14,6),
  predicted_kg            NUMERIC(14,6),
  baseline_kg             NUMERIC(14,6),
  confidence_pct          NUMERIC(5,2),
  model_version           TEXT NOT NULL,
  CONSTRAINT uq_prediction_horizon UNIQUE (resource_id, made_at, horizon_days)
);

CREATE TABLE IF NOT EXISTS recommendations (
  rec_id                          TEXT PRIMARY KEY,
  resource_id                     TEXT REFERENCES resources(resource_id) ON DELETE CASCADE,
  resource_name                   TEXT,
  service                         TEXT,
  rec_type                        TEXT NOT NULL,
  severity                        TEXT NOT NULL,
  impact_score                    NUMERIC(5,2),
  title                           TEXT NOT NULL,
  description                     TEXT,
  action                          TEXT,
  est_monthly_carbon_savings_kg   NUMERIC(14,2),
  est_monthly_cost_savings_usd    NUMERIC(14,2),
  target_region                   TEXT,
  status                          TEXT DEFAULT 'open',
  applied                         BOOLEAN DEFAULT FALSE,
  created_at                      TIMESTAMPTZ DEFAULT now(),
  applied_at                      TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS pipeline_runs (
  run_id                  BIGSERIAL PRIMARY KEY,
  pipeline_name           TEXT NOT NULL,
  data_source             TEXT NOT NULL,
  status                  TEXT NOT NULL,
  records_ingested        INT DEFAULT 0,
  records_processed       INT DEFAULT 0,
  emissions_calculated    INT DEFAULT 0,
  duration_ms             INT DEFAULT 0,
  details                 JSONB DEFAULT '{}',
  error_message           TEXT,
  started_at              TIMESTAMPTZ DEFAULT now(),
  completed_at            TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS alert_rules (
  rule_id                 BIGSERIAL PRIMARY KEY,
  metric                  TEXT NOT NULL,
  threshold               NUMERIC(14,6) NOT NULL,
  severity                TEXT DEFAULT 'MEDIUM',
  enabled                 BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS reports (
  report_id               BIGSERIAL PRIMARY KEY,
  report_title            TEXT NOT NULL,
  period_month            DATE NOT NULL,
  s3_key                  TEXT,
  report_data             JSONB,
  generated_at            TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_emission_records_start ON emission_records(period_start);
CREATE INDEX IF NOT EXISTS idx_workload_obs_ts ON workload_observations(timestamp);
CREATE INDEX IF NOT EXISTS idx_resources_service ON resources(service);
CREATE INDEX IF NOT EXISTS idx_resources_region ON resources(region);
CREATE INDEX IF NOT EXISTS idx_recommendations_res ON recommendations(resource_id);
