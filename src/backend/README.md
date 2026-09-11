# Backend

Express API for the AI-Powered Cloud Digital Carbon Passport Framework.

## AWS Integration

When `AWS_USE_LIVE=true`, the main passport APIs use live AWS inventory as their resource source:

- `GET /api/dashboard/stats`
- `GET /api/dashboard/charts`
- `GET /api/resources`
- `GET /api/resources/:id/passport`
- `GET /api/predictions`
- `GET /api/recommendations`

The backend reads EC2, RDS, Lambda, S3, and CloudWatch metrics through the configured AWS profile. If AWS access fails or no resources are returned, the API falls back to the local sample dataset so the project remains usable.

## Run Locally

```powershell
aws sts get-caller-identity --profile cloudpassport
cd src/backend
npm install
npm run dev
```

Copy `.env.example` to `.env` and set:

```text
AWS_REGION=ap-south-1
AWS_PROFILE=cloudpassport
AWS_USE_LIVE=true
AWS_RESOURCE_CACHE_MS=60000
```

## Required Read Permissions

- `ec2:DescribeInstances`
- `rds:DescribeDBInstances`
- `lambda:ListFunctions`
- `s3:ListAllMyBuckets`
- `cloudwatch:GetMetricData`
- `cloudwatch:ListMetrics`
- `ce:GetCostAndUsage` for the Cost Explorer panel

No API route creates, updates, starts, stops, or deletes AWS resources. Recommendation apply actions are recorded in the app only; live AWS changes must go through normal AWS change control.

## AWS-Specific Endpoints

```text
GET /api/aws/status
GET /api/aws/inventory
GET /api/aws/costs
GET /api/cloudwatch/usage?hours=24
```

Cost Explorer returns billing data, not emissions. CloudWatch usage reports AWS API call metrics, not workload energy. Carbon passport values are estimates calculated from inventory, CloudWatch utilization where available, regional grid factors, power profiles, and the project PUE assumption.
