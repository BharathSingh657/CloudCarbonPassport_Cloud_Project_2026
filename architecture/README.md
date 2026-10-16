# Architecture

This folder captures the project architecture from the review document and the supplied AWS reference diagram.

## Included artifacts

- `AWS_Deployment_Guide.md` - full deployment guide derived from the review document and attached project notes.
- `Workflow.md` - concise implementation workflow and architecture summary for this repository.

## Seven-layer AWS reference architecture

| Layer | Purpose | AWS services |
|---|---|---|
| 1. User Layer | Administrators, cloud engineers, and sustainability officers use the system | Amazon Cognito user groups |
| 2. API Layer | Secure REST access and permissions | Amazon Cognito, API Gateway, IAM |
| 3. Application Layer | Backend API, carbon calculation, scheduling, and ETL | Amazon EC2, AWS Lambda, EventBridge, AWS Glue |
| 4. AI Processing Layer | Forecast emissions and create green recommendations | Amazon SageMaker |
| 5. Database & Storage Layer | Store passports, datasets, and PDF reports | Amazon RDS PostgreSQL, Amazon S3 |
| 6. Analytics Layer | Query and visualize sustainability analytics | Amazon Athena, Amazon QuickSight |
| 7. Monitoring & Notification Layer | Logs, metrics, alerts, and notification emails | Amazon CloudWatch, Amazon SNS |

## Repository alignment

- `src/frontend/` implements the carbon passport dashboard, resource views, recommendations, forecast views, AWS infrastructure view, and architecture screen.
- `src/backend/` exposes the API and carbon passport calculations used by the frontend.
- `src/ml_model/` contains the local ML training assets used for project experimentation.
- `dataset/` contains sample and processed datasets for local development.
- `docs/` stores the submitted review document and supporting AWS IAM policy notes.
