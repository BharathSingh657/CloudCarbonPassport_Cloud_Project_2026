# Datasets

## Cloud Carbon Time-Series Dataset

The core dataset powering the Cloud Carbon Passport estimation and forecasting engine is located at:
`dataset/processed/carbon_timeseries_dataset.csv`

### Provenance and Structure
- **Records**: 8,640 hourly observations (45 days) across multi-regional cloud instances (e.g. `i-0e1a89c201d84b01`, `db-prod-primary-01`, `k8s-ingress-gateway-01`, `analytics-worker-01`).
- **Telemetry Features**: `cpu_utilization_pct`, `memory_utilization_pct`, `disk_io_mbs`, `network_traffic_mbs`, `power_draw_w`, `energy_consumed_kwh`, `carbon_intensity_g_per_kwh`.
- **Target Variables**: `carbon_emissions_kg`, `scope2_emissions_kg`, `scope3_embodied_kg`, `sustainability_score`.
- **Power Model**: SPECPower hardware interpolation ($P_{\text{idle}} + \frac{u}{100}(P_{\text{max}} - P_{\text{idle}}) + P_{\text{mem}} + P_{\text{storage}}$) with $PUE = 1.18$.
- **Regional Grid Intensity**: CEA India (708 g/kWh), EPA eGRID (378 g/kWh), Nordic Grid (28 g/kWh).

## Persistent Storage

Data is ingested and persisted into a dedicated PostgreSQL database (`carbon_passport`) with relational tables for:
- `resources`
- `carbon_intensity`
- `workload_observations`
- `emission_records`
- `passports`
- `predictions`
- `recommendations`
- `pipeline_runs`
