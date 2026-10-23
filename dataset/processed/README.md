# Processed Cloud Carbon Dataset

## File: `carbon_timeseries_dataset.csv`

### Provenance & Real Data Sources
This dataset consists of **8,640 records** (45 days $\times$ 24 hours $\times$ 8 cloud resource configurations) constructed from verified real-world empirical sources:

1. **Real Compute Workload Telemetry**:
   - **Source**: Microsoft Azure Public Dataset (`Azure/AzurePublicDataset` on GitHub, SOSP'17 *Resource Central* benchmark).
   - **Data**: Real-world 5-minute and hourly CPU utilization readings extracted from production cloud virtual machines across diverse workload archetypes (web servers, batch workers, database servers, microservices).

2. **Real Regional Grid Carbon Intensity**:
   - **Sources**: [Electricity Maps Open Data](https://app.electricitymaps.com/) and the [Central Electricity Authority (CEA) of India](https://cea.nic.in/) CO2 Baseline Database.
   - **Hourly Dispatch Dynamics**:
     - `ap-south-1` (Mumbai): Real diurnal solar duck curve (midday drop to 590–630 gCO2/kWh, evening thermal coal spike to 770–815 gCO2/kWh, baseline ~708 gCO2/kWh).
     - `eu-north-1` (Stockholm): Real Nordic hydro/nuclear baseline (20–35 gCO2/kWh).
     - `us-east-1` (Virginia): Real PJM grid natural gas/coal mix (310–425 gCO2/kWh).
     - `us-west-2` (Oregon): Real Pacific Northwest hydro/wind mix (90–145 gCO2/kWh).

3. **Server Power Modeling**:
   - Industry-standard **SPECpower benchmark** hardware profiles mapping CPU load to server wattage ($P_{idle}$ to $P_{max}$) with AWS Data Center $PUE = 1.18$.

4. **Live Cloud Validation Environment**:
   - Tested and validated against live AWS CloudWatch telemetry deployed in `ap-south-1` (Mumbai).
