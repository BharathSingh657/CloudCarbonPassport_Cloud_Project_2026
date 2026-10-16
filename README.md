# AI-Powered Cloud Digital Carbon Passport Framework for Sustainable IT Infrastructure using Green AI and Carbon Intelligence Analytics

## Project Overview

This project develops an AI-powered cloud framework that monitors cloud resource utilization, estimates carbon emissions, and generates Digital Carbon Passports for sustainable IT infrastructure. The framework integrates Green AI principles with Carbon Intelligence Analytics, SPECPower-aligned energy models, PostgreSQL persistence, and an AWS reference architecture to provide actionable sustainability insights and reduce the environmental impact of cloud computing.

---

## Team Members

| Name | Registration Number |
|------|----------------------|
| Kothamasu Ratna Subhash | 24BIT0489 |
| Bharath D Singh | 24BIT0458 |
| R. Rahul Padmanaban | 24BIT0473 |

---

## Proposed Objectives

- Monitor cloud resource utilization across live AWS services and telemetry traces.
- Estimate Scope 2 and Scope 3 carbon emissions from cloud infrastructure.
- Generate Digital Carbon Passports with unique audit provenance for cloud resources.
- Provide AI-driven sustainability insights, time-series forecasting, and optimization recommendations.
- Visualize carbon analytics through an interactive dashboard with live AWS CloudWatch feeds.

---

## Primary Capabilities & Data Flow

The project implements an end-to-end data processing workflow matching the 7-layer target architecture:

```text
DATA SOURCES (AWS CloudWatch Live / Multi-Resource Workload Telemetry)
    │
    ▼
INGESTION & DATA PIPELINE (Validation, Unit Normalization, Deduplication)
    │
    ▼
WORKLOAD & RESOURCE ANALYSIS (Power interpolation, PUE integration)
    │
    ▼
CARBON ESTIMATION ENGINE (Scope 2 / Scope 3, Regional Grid Intensity factors)
    │
    ▼
MACHINE LEARNING FORECASTING (Random Forest time-series forecaster, R²=0.8929)
    │
    ▼
DATABASE PERSISTENCE (PostgreSQL 16: resources, observations, emissions, passports, predictions)
    │
    ▼
REST API (Node.js Express backend on port 5001)
    │
    ▼
FRONTEND DASHBOARD (React + Vite SPA on port 5173 with Live AWS and Pipeline Views)
    │
    ▼
SUSTAINABILITY RECOMMENDATIONS & DIGITAL PASSPORT AUDIT TRAIL
```

---

## Architecture Mapping

| Layer | Components | Implementation Status |
|---|---|---|
| **1. User Layer** | Administrator, Cloud Engineer, Sustainability Officer | Supported through role and provenance metadata |
| **2. API Layer** | API Gateway REST Endpoints, IAM permissions | Express API with CORS, rate-limiting, and error handling |
| **3. Application Layer** | Backend Services, Carbon Calculation, Event-driven Ingestion | `src/backend/src/carbon/carbonEngine.js`, `src/backend/src/pipeline/dataPipeline.js` |
| **4. AI Processing Layer** | Green AI Prediction & Carbon Intelligence | `src/ml_model/train_carbon_forecaster.py` (`1.0.0-TS-RF`) |
| **5. Database & Storage Layer** | PostgreSQL Carbon Passport DB & Local Persistence | PostgreSQL 16 schema (`src/backend/src/db/schema.sql`) |
| **6. Analytics Layer** | Sustainability Analytics & KPI Trends | `DashboardView`, `PipelineView`, `ForecastView` |
| **7. Monitoring Layer** | CloudWatch & Cost Explorer live integration | Real SDK queries in `src/backend/src/adapters/awsAdapters.js` |

---

## Repository Structure

```text
architecture/       AWS architecture diagrams, workflow, and deployment guides
dataset/            Raw and processed telemetry, public traces, and local DB cluster
docs/               Project documentation, research papers, and IAM policies
results/            ML model evaluation reports and training metrics
src/
    frontend/       React 18 + Vite dashboard with live AWS and pipeline telemetry
    backend/        Express API, database pool, carbon engine, data pipeline, and AWS adapters
    ml_model/       Time-series training scripts, inference tools, and saved model artifacts
```

---

## Quick Start Guide

### 1. Run Backend Automated Test Suite

```bash
cd src/backend
npm test
```

Executes 16 comprehensive unit and integration tests across:
- Carbon engine calculations, power interpolation, and boundary conditions
- PostgreSQL database connections, schema migrations, and transaction rollbacks
- End-to-end data pipeline execution and idempotency

### 2. Run the Backend API

```bash
cd src/backend
npm install
npm start
```

Runs on `http://localhost:5001`.

### 3. Run the Frontend Dashboard

```bash
cd src/frontend
npm install
npm run dev
```

Opens at `http://localhost:5173`.

### 4. Train the ML Carbon Forecaster

```cmd
run_carbon_model.cmd
```

Trains the Random Forest time-series model on out-of-time chronological holdouts and saves artifacts to `src/ml_model/carbon_forecaster.joblib`.

---

## AWS Integration & Security

- Configured AWS profile: `cloudpassport` in `ap-south-1`.
- Verified live IAM identity: `arn:aws:iam::126716541919:user/cloudwatch-project-user`.
- Real read-only SDK calls implemented for EC2, RDS, Lambda, S3, CloudWatch, and Cost Explorer.
- Empty account inventories are handled gracefully without generating fabricated resources.
- Clear provenance tags distinguish live AWS data (`aws_live`), persisted pipeline data (`postgresql_persistence`), and demonstration data (`sample_dataset`).

---

## License

This repository is maintained for academic purposes as part of the Cloud Architecture Design course.
