# Dataset Description: Real Cloud Carbon & Workload Telemetry

The dataset `dataset/processed/carbon_timeseries_dataset.csv` contains 8,640 records used for training and evaluating the AI-Powered Cloud Carbon Forecaster:

| Property | Value |
| :--- | :--- |
| **Total Rows** | 8,640 hourly observations |
| **Time Period** | 45 consecutive days |
| **Resources Monitored** | 8 cloud resource archetypes (EC2, RDS, Lambda, ECS) |
| **Primary Workload Source** | Microsoft Azure Public Dataset (Azure VM CPU Traces, SOSP'17) |
| **Grid Carbon Source** | Electricity Maps Open Data & Central Electricity Authority (CEA) India |
| **Power Conversion Model** | Standard SPECpower hardware benchmark curves |
| **Operational Validation** | Live AWS CloudWatch telemetry from active resources in `ap-south-1` (Mumbai) |

### CSV Columns:
- `timestamp`: UTC ISO timestamp
- `resource_id`: Cloud resource identifier
- `service`: Cloud service category (Amazon EC2, Amazon RDS, AWS Lambda, Amazon ECS)
- `instance_type`: Hardware configuration / instance class
- `region`: Cloud deployment region (`ap-south-1`, `us-east-1`, `us-west-2`, `eu-north-1`)
- `hour_of_day`: Diurnal hour index (0-23)
- `day_of_week`: Day index (0-6)
- `is_weekend`: Weekend binary indicator
- `cpu_utilization`: Real CPU utilization percentage from Azure VM traces
- `power_watts`: Calculated server power draw in Watts
- `energy_kwh`: Power multiplied by AWS data center PUE (1.18)
- `carbon_kg`: Energy multiplied by real regional hourly grid carbon intensity
