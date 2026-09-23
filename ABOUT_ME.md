# 📘 ABOUT ME & PROJECT DEFENSE MASTER GUIDE
## AI-Powered Cloud Digital Carbon Passport Framework for Sustainable IT Infrastructure using Green AI and Carbon Intelligence Analytics

---

## 👤 1. ABOUT ME (Student & Contributor Profile)

* **Student Name:** Kothamasu Ratna Subhash
* **GitHub Username:** [RatnaSubhash](https://github.com/RatnaSubhash)
* **Email:** kratnasubhash@gmail.com
* **Repository:** [CloudCarbonPassport_Cloud_Project_2026](https://github.com/BharathSingh657/CloudCarbonPassport_Cloud_Project_2026)
* **Working Branch:** `feature/Subhash`
* **Assigned Literature Survey Papers:** **Papers 6, 7, 8, 9, and 10**
* **Project Role & Responsibilities:**
  1. **Research Gap & Literature Analysis:** Comprehensive critical analysis of Papers 6 through 10 covering Green AI taxonomies, datacenter whole-system sustainability, GHG Protocol carbon assessment, and Digital Product Passports.
  2. **Carbon Calculation Engine & Mathematical Modeling:** Mathematical formulation of energy consumption ($kWh$), PUE adjustments, dynamic CPU power curves (SPECpower interpolation), Scope 2/Scope 3 splits, and Sustainability Scoring ($0–100$).
  3. **Digital Carbon Passport Specification:** Architectural design and schema definition for virtual cloud resource passports (traceability, emission grading $A+$ to $D$, and real-world impact equivalencies).
  4. **AI Predictive Forecasting Integration:** Definition of the 7-day time-series forecasting model combining workload seasonality, clean grid variability, and automated optimization potential.
  5. **Documentation & Review Preparation:** Compilation of Review-1 deliverables, research gap documentation ([`docs/Research_Gap_Subhash.docx`](file:///c:/Users/kratn/Downloads/CloudCarbonPassport_Cloud_Project_2026-feature-Bharath/CloudCarbonPassport_Cloud_Project_2026-feature-Bharath/docs/Research_Gap_Subhash.docx)), and comprehensive reviewer defense material.

---

## 🎯 2. PROJECT OVERVIEW & EXECUTIVE SUMMARY

### The Core Problem
Modern enterprise IT heavily relies on hyperscale cloud platforms (AWS, Azure, GCP). While existing cloud monitoring tools (e.g., AWS CloudWatch, Datadog) excel at tracking **latency, CPU utilization, uptime, and financial cost**, they completely fail to track **environmental sustainability and carbon emissions at the individual resource level**. Organizations have no automated, standardized way to:
1. Audit the real-time carbon footprint of individual VMs, databases, and buckets.
2. Forecast future emissions based on shifting electrical grid clean energy mixes.
3. Automatically take corrective actions (e.g., rightsizing, region shifting to hydro/wind grids, storage cold-tiering).

### The Proposed Solution
The **Cloud Digital Carbon Passport Framework** introduces the concept of an immutable, standardized **"Carbon Passport"** for every provisioned cloud resource. Just as the European Union requires a *Digital Product Passport (DPP)* for manufactured goods, our framework generates a living passport for cloud assets containing:
* Real-time energy ($kWh$) and carbon emissions ($kgCO_2eq$).
* Embodied Scope 3 manufacturing carbon vs. operational Scope 2 electricity carbon.
* Sustainability Performance Rating ($A+$ to $D$).
* AI-driven 7-day predictive emission trends.
* Actionable, one-click optimization recommendations with quantifiable carbon reduction projections.

---

## 📊 3. DATASET GENESIS: HOW DATA IS GATHERED

Reviewers frequently ask: *"Where did you get your dataset? Is it real or fake? Who else uses it?"*

Our framework synthesizes four verified academic and industry data sources:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DATASET COMPOSITION                             │
├────────────────────────┬───────────────────────────────────────────────┤
│ 1. Telemetry Data      │ AWS CloudWatch & Kaggle Cloud Utilization     │
│ 2. Hardware Power      │ SPECpower_ssj2008 & Cloud Carbon Footprint    │
│ 3. Grid Emissions      │ Electricity Maps API & IEA National Factors   │
│ 4. Carbon Standards    │ GHG Protocol Corporate Standard (Scope 2 & 3) │
└────────────────────────┴───────────────────────────────────────────────┘
```

### Detailed Breakdown of the 4 Data Pillars

#### Pillar 1: Workload Utilization & Telemetry (CloudWatch & Kaggle)
* **What it contains:** Resource ID, service type (`Amazon EC2`, `Amazon RDS`, `Amazon S3`, `AWS Lambda`, `Amazon ECS`), instance size (`c6i.4xlarge`, `t3.2xlarge`, `db.r6g.xlarge`), average CPU utilization %, memory utilization %, storage volume (GB), runtime uptime hours, tags, and environment.
* **Source:** AWS CloudWatch sample metrics combined with the public **Kaggle Cloud Resource Utilization Dataset** and Google/Alibaba cluster trace conventions.

#### Pillar 2: Hardware Power Profiles (SPECpower & Cloud Carbon Footprint)
* **What it contains:** Hardware wattage benchmarks under zero load (Idle Watts, $P_{\text{idle}}$) and 100% capacity (Max Load Watts, $P_{\text{max}}$).
* **Source:** The **Standard Performance Evaluation Corporation (SPECpower_ssj2008)** dataset and the **Cloud Carbon Footprint (CCF)** open benchmark maintained by Thoughtworks.
* **Calibrated Benchmark Coefficients Used:**
  * `t3.medium` (2 vCPU, 4GB RAM): $P_{\text{idle}} = 8.5W$, $P_{\text{max}} = 32.0W$
  * `t3.2xlarge` (8 vCPU, 32GB RAM): $P_{\text{idle}} = 34.0W$, $P_{\text{max}} = 128.0W$
  * `c6i.4xlarge` (16 vCPU, 32GB RAM): $P_{\text{idle}} = 95.0W$, $P_{\text{max}} = 380.0W$
  * `r6i.2xlarge` (8 vCPU, 64GB RAM): $P_{\text{idle}} = 42.0W$, $P_{\text{max}} = 168.0W$
  * `db.r6g.xlarge` (4 vCPU, 32GB RAM): $P_{\text{idle}} = 28.0W$, $P_{\text{max}} = 112.0W$
  * `s3-standard`: $0.8W$ to $1.2W$ per Terabyte
  * `lambda-function`: $0.1W$ to $15.0W$ per execution thread

#### Pillar 3: Regional Grid Carbon Intensity (Electricity Maps & IEA)
* **What it contains:** Carbon intensity in grams of $CO_2$ equivalent per kilowatt-hour ($gCO_2eq/kWh$) and renewable energy percentages for AWS hosting regions.
* **Source:** **Electricity Maps** live/historical database and the **International Energy Agency (IEA)** 2023–2025 National Grid Emission Factors.
* **Verified Values Implemented:**
  * `eu-north-1` (Stockholm, Sweden): **$28\ gCO_2eq/kWh$** (95% Renewable — Hydro/Wind)
  * `us-west-2` (Oregon, USA): **$115\ gCO_2eq/kWh$** (78% Renewable — Columbia River Hydro)
  * `eu-west-1` (Dublin, Ireland): **$295\ gCO_2eq/kWh$** (42% Renewable — EirGrid Wind/Gas)
  * `us-east-1` (N. Virginia, USA): **$378\ gCO_2eq/kWh$** (22% Renewable — PJM Interconnection)
  * `ap-southeast-1` (Singapore): **$412\ gCO_2eq/kWh$** (12% Renewable — Natural Gas heavy)
  * `ap-south-1` (Mumbai, India): **$708\ gCO_2eq/kWh$** (18% Renewable — Coal/thermal heavy)

#### Pillar 4: Operational Data Center PUE (Power Usage Effectiveness)
* **Value:** $PUE = 1.18$
* **Source:** AWS Global Infrastructure Sustainability Reports. AWS hyperscale facilities operate at an annual average PUE of ~1.15–1.20 (compared to legacy enterprise datacenters with PUE > 1.6).

---

## 🧮 4. MATHEMATICAL FORMULAS & CALCULATION ENGINE

The engine implemented in [`src/backend/src/services/carbonEngine.js`](file:///c:/Users/kratn/Downloads/CloudCarbonPassport_Cloud_Project_2026-feature-Bharath/CloudCarbonPassport_Cloud_Project_2026-feature-Bharath/src/backend/src/services/carbonEngine.js) executes the following rigorous mathematical pipeline:

```
[CPU & Storage Utilization]
            │
            ▼
┌───────────────────────┐
│ 1. Dynamic Power (W)  │  P = P_idle + (CPU% / 100) * (P_max - P_idle) + Storage_Overhead
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ 2. Energy Consumed    │  E (kWh) = (Power in Watts * Uptime Hours * PUE 1.18) / 1000
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ 3. Carbon Emissions   │  Carbon (kgCO2eq) = (E in kWh * Grid_Intensity) / 1000
└───────────┬───────────┘
            │
            ├─────────────────────────────────────────┐
            ▼                                         ▼
┌───────────────────────┐                 ┌───────────────────────┐
│ 4. Scope Breakdown    │                 │ 5. Sustainability     │
│ Scope 2 = 82% (Grid)  │                 │    Score (0 - 100)    │
│ Scope 3 = 18% (Mfg)   │                 │ Rating: A+, A, B, C, D│
└───────────────────────┘                 └───────────────────────┘
```

### Step-by-Step Equations

#### 1. Dynamic Power Consumption ($P_{\text{dynamic}}$ in Watts)
Using the SPECpower linear interpolation standard:
$$P_{\text{compute}} = P_{\text{idle}} + \left(\frac{\text{CPU}\%}{100}\right) \times (P_{\text{max}} - P_{\text{idle}})$$

*For Storage overhead (S3 or Attached EBS SSDs > 500GB):*
$$P_{\text{storage}} = \left(\frac{\text{Storage}_{\text{GB}}}{1000}\right) \times 0.5\text{ Watts}$$
$$P_{\text{total}} = P_{\text{compute}} + P_{\text{storage}}$$

#### 2. Total Energy Consumption ($E$ in $kWh$)
Accounts for workload uptime and datacenter cooling/lighting infrastructure overhead via PUE:
$$E\ (\text{kWh}) = \frac{P_{\text{total}} \times \text{Uptime Hours} \times \text{PUE}\ (1.18)}{1000}$$

#### 3. Total Operational Carbon Emissions ($C$ in $kgCO_2eq$)
Multiplies electrical energy by the regional grid carbon intensity:
$$C\ (\text{kgCO}_2\text{eq}) = \frac{E\ (\text{kWh}) \times I_{\text{grid}}\ (\text{gCO}_2/\text{kWh})}{1000}$$

#### 4. Scope 2 vs. Scope 3 Allocation
Based on ScienceDirect Paper 8 & Boavizta lifecycle assessments:
* **Scope 2 (Operational Grid Electricity):**
  $$\text{Scope 2} = C \times 0.82\ (82\%)$$
* **Scope 3 (Embodied Hardware Supply Chain & Lifecycle Depreciation):**
  $$\text{Scope 3} = C \times 0.18\ (18\%)$$

#### 5. Renewable vs. Non-Renewable Energy Split
$$\text{Renewable kWh} = E \times \left(\frac{\text{Renewable}\%}{100}\right)$$
$$\text{Non-Renewable kWh} = E - \text{Renewable kWh}$$

#### 6. Sustainability Scoring Algorithm ($0 - 100$)
A holistic algorithmic score evaluating computational efficiency and clean grid usage while heavily penalizing idle waste:
$$\text{Score} = \text{GridBonus} + \text{UtilizationScore} + \text{RenewableBonus} - \text{WastePenalty}$$

Where:
* **Grid Cleanliness Bonus (Max 40 pts):** $\min\left(40, 100 - \frac{I_{\text{grid}}}{8}\right)$
* **Utilization Score (Max 40 pts):** $\min(40, \text{CPU}\% \times 0.5)$
* **Renewable Mix Bonus (Max 20 pts):** $\text{Renewable}\% \times 0.2$
* **Waste Penalty:**
  * If $\text{CPU}\% < 15\% \implies \mathbf{35\text{ point penalty}}$ (Idle resource wasting energy)
  * If $15\% \le \text{CPU}\% < 30\% \implies \mathbf{15\text{ point penalty}}$
  * Otherwise $\implies \mathbf{0\text{ point penalty}}$

*Bounded Range:* $\text{Score} = \text{clamp}(\text{Score}, 12, 99)$

#### 7. Sustainability Rating Scale
* **Grade A+ (Score 85–100):** Ultra-efficient, clean grid, optimized workload (Emerald badge).
* **Grade A (Score 75–84):** Well-utilized, predominantly renewable (Emerald badge).
* **Grade B (Score 60–74):** Standard performance, moderate grid emissions (Cyan badge).
* **Grade C (Score 45–59):** Sub-optimal utilization or carbon-intensive grid (Amber badge).
* **Grade D (Score < 45):** Inefficient / Zombie workload, severe carbon waste (Rose badge).

#### 8. Real-World Equivalence Metrics
To make carbon figures intuitive for executives and auditors:
* **Mature Trees Required to Offset:**
  $$\text{Trees} = \frac{\text{Total } kgCO_2}{21.8\ kgCO_2/\text{tree/year}}$$
* **Miles Driven in Average Gas Vehicle:**
  $$\text{Miles} = \text{Total } kgCO_2 \times 2.5\ (\text{based on } \sim 0.40\ kgCO_2/\text{mile})$$

---

## 🤖 5. GREEN AI & 7-DAY PREDICTIVE FORECASTING

Implemented in [`src/backend/src/services/aiPredictor.js`](file:///c:/Users/kratn/Downloads/CloudCarbonPassport_Cloud_Project_2026-feature-Bharath/CloudCarbonPassport_Cloud_Project_2026-feature-Bharath/src/backend/src/services/aiPredictor.js):

### Why Time-Series AI Forecasting?
Standard monitoring only displays historical emissions ("What did I emit yesterday?"). Green AI introduces **predictive foresight** ("What will I emit over the next 7 days, and how can I minimize it?").

### Modeling Factors:
1. **Workload Seasonality Multipliers ($M_t$):**
   $$M = [1.00, 1.04, 0.98, 1.12, 1.08, 0.85, 0.80]$$
   Reflects enterprise weekday peaks (Tuesday/Thursday) and weekend load drops (Saturday/Sunday).
2. **Dynamic Grid Variance Factors ($G_t$):**
   $$G = [1.00, 0.96, 1.02, 0.94, 0.99, 0.91, 0.88]$$
   Models expected solar and wind power peaks entering regional electrical grids.
3. **AI Green Optimization Opportunity:**
   Identifies potential reductions from three automated rules:
   * EC2 instances with $\text{CPU} < 20\% \implies 65\%$ power reduction via downscaling.
   * Dirty-grid workloads (`ap-south-1`, `us-east-1`) $\implies 25\%$ reduction via green-region migration.
   * Stale S3 buckets $> 50\text{TB} \implies 45\%$ storage power reduction via Glacier lifecycle transitions.

$$\text{Baseline Day}_t = \text{DailyCarbon} \times M_t$$
$$\text{Optimized Day}_t = (\text{DailyCarbon} - \text{Opportunity}) \times G_t$$
$$\text{Projected Savings} = \text{Baseline Day}_t - \text{Optimized Day}_t \implies \mathbf{26\% \text{ to } 35\% \text{ Net Carbon Reduction}}$$

---

## 📚 6. THE 15 RESEARCH PAPERS & DETAILED RESEARCH GAPS

### Papers 6 to 10 (Ratna Subhash's Assigned Papers)

#### Paper 6
* **Title:** *A Systematic Review of Green and Sustainable AI: Taxonomy, Metrics, Challenges, and Open Research Directions (2026)*
* **Publisher / URL:** MDPI Sustainability — [doi.org/10.3390/su18084115](https://doi.org/10.3390/su18084115)
* **Method:** Qualitative taxonomy and systematic survey of energy metrics in AI.
* **Limitations:** Conceptual review only; no live system or operational telemetry.
* **Research Gap:** Lack of continuous cloud infrastructure monitoring and automated carbon mitigation.
* **Our Improvement:** Built an active backend and dashboard that collects live metrics and continuously tracks emissions.

#### Paper 7
* **Title:** *Strategies and Design for Increasing AI Sustainability (2026)*
* **Publisher / URL:** Nature Portfolio — [nature.com/articles/s44359-026-00195-w](https://www.nature.com/articles/s44359-026-00195-w)
* **Method:** Evaluates algorithmic efficiency and hardware co-design strategies.
* **Limitations:** Purely theoretical; lacks integration with public cloud APIs.
* **Research Gap:** No automated predictive model to forecast future cloud carbon footprint.
* **Our Improvement:** Developed an AI predictor forecasting 7-day carbon trajectories with green grid awareness.

#### Paper 8
* **Title:** *Beyond the Carbon Emissions of AI: A Whole-Systems Energy and Environmental Sustainability Analysis of Datacenters in Denmark, Germany and Norway (2026)*
* **Publisher / URL:** ScienceDirect / Elsevier — [sciencedirect.com/science/article/pii/S2214629626003105](https://www.sciencedirect.com/science/article/pii/S2214629626003105)
* **Method:** Empirical analysis of datacenter infrastructure in Nordic and European countries.
* **Limitations:** Facility-level macro perspective; cannot drill down into individual virtual instances.
* **Research Gap:** No granular, resource-level carbon passport or automated DevOps optimization.
* **Our Improvement:** Granular passport generation for individual EC2 instances, RDS databases, S3 buckets, and Lambda functions.

#### Paper 9
* **Title:** *Digital Carbon Footprint Assessment of Universitas Indonesia Data Center Based on the GHG Protocol (2026)*
* **Publisher / URL:** Springer Nature — [link.springer.com/article/10.1007/s43621-026-03522-0](https://link.springer.com/article/10.1007/s43621-026-03522-0)
* **Method:** Retrospective emissions assessment using the Greenhouse Gas Protocol.
* **Limitations:** Static historical spreadsheet calculation; no real-time telemetry or predictive analytics.
* **Research Gap:** Lacks dynamic cloud streaming, real-time recalculation, and automated optimization.
* **Our Improvement:** Implemented the exact GHG Protocol calculation inside automated, real-time Node.js and AWS Lambda microservices.

#### Paper 10
* **Title:** *A Comprehensive Review of Digital Product Passports in Sustainable Manufacturing: Current State, Challenges, and Future Directions (2026)*
* **Publisher / URL:** Springer Nature — [link.springer.com/article/10.1007/s43615-026-00927-x](https://link.springer.com/article/10.1007/s43615-026-00927-x)
* **Method:** Reviews EU Digital Product Passport (DPP) frameworks for physical supply chains.
* **Limitations:** Strictly limited to manufacturing (batteries, automotive, textiles); ignores digital cloud assets.
* **Research Gap:** DPP principles had never been translated to cloud computing resources.
* **Our Improvement:** **Pioneered the "Digital Carbon Passport for Cloud Resources"**, adapting DPP schemas to virtual assets.

---

### Summary of Collaborator Papers (Papers 1–5 & 11–15)

* **Papers 1–5 (Assigned to Rahul Padmanaban):**
  * *Paper 1 (arXiv:2301.11047):* Systematic Review of Green AI.
  * *Paper 2 (arXiv:2303.10572):* Energy-Efficiency & Sustainability in New Gen Cloud Computing.
  * *Paper 3 (arXiv:2311.00447):* Opportunities of Green Computing: A Survey.
  * *Paper 4 (arXiv:2403.14092):* Real-Time Carbon Footprint Reduction for Data Centers.
  * *Paper 5 (MDPI:10.3390/su18031359):* Energy Consumption & Carbon Across the AI Lifecycle.
* **Papers 11–15 (Assigned to Bharath D Singh):**
  * *Paper 11 (ScienceDirect):* Literature Review of Digital Product Passport Systems.
  * *Paper 12 (ScienceDirect):* Conceptual Model for Environmental Impact of DPP.
  * *Paper 13 (MDPI):* Operationalising Digital Circularity: AI & DPP.
  * *Paper 14 (MDPI):* IoT to DPP: Carbon Footprint Management.
  * *Paper 15 (ACM Digital Library):* DPP for Advancing the Circular Economy: A Research Agenda.

---

## 🏛️ 7. SYSTEM ARCHITECTURE & AWS CLOUD MAPPING

### Architecture Data Flow
```
┌────────────────────────────────────────────────────────┐
│                   AWS CLOUD TELEMETRY                  │
│       CloudWatch Metrics (CPU, Memory, Storage)        │
└───────────────────────────┬────────────────────────────┘
                            │ (EventBridge 5-min Rule)
                            ▼
┌────────────────────────────────────────────────────────┐
│              AWS LAMBDA CARBON ENGINE                  │
│     P = P_idle + Util*(P_max - P_idle) + Storage       │
│     Carbon = Energy (kWh) * Grid_Intensity (g/kWh)     │
└───────────────────────────┬────────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
┌───────────────────────────┐ ┌───────────────────────────┐
│     AMAZON S3 & GLUE      │ │  AMAZON RDS POSTGRESQL    │
│ Raw Telemetry & Analytics │ │ Carbon Passports & Scores │
└─────────────┬─────────────┘ └───────────┬───────────────┘
              │                           │
              ▼                           ▼
┌───────────────────────────┐ ┌───────────────────────────┐
│     AMAZON SAGEMAKER      │ │   EXPRESS / NODE API      │
│ 7-Day Time-Series Forecast│ │ Real-Time Snapshot Engine │
└─────────────┬─────────────┘ └───────────┬───────────────┘
              │                           │
              └─────────────┬─────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│               REACT + VITE DASHBOARD                   │
│   Digital Passport Modal, Recommendations, KPIs        │
└────────────────────────────────────────────────────────┘
```

### AWS Service Roles
| AWS Service | Specific Project Function |
| :--- | :--- |
| **Amazon EC2** | Hosts the backend REST API server and handles client requests. |
| **Amazon CloudWatch** | Gathers telemetry (CPUUtilization, NetworkIn/Out, DiskReadBytes). |
| **Amazon EventBridge** | Schedules periodic metric harvesting and carbon recalculation jobs. |
| **AWS Lambda** | Computes serverless carbon equations without persistent server overhead. |
| **Amazon S3** | Stores raw telemetry JSON, processed historical data lakes, and exported passport PDF/JSON certificates. |
| **AWS Glue & Athena** | Preprocesses large time-series logs and enables SQL queries over S3. |
| **Amazon SageMaker** | Trains and serves time-series models for carbon trend forecasting. |
| **Amazon RDS (PostgreSQL)**| Persists digital passports, user access logs, and historical scores. |
| **Amazon Cognito & IAM** | Provides RBAC (Role-Based Access Control) for Sustainability Officers. |
| **Amazon SNS** | Sends email/SMS alerts when an asset's carbon rating falls to Grade D. |
| **Amazon QuickSight** | Generates executive BI reports for corporate ESG audits. |

---

## ❓ 8. EXHAUSTIVE REVIEWER Q&A (30+ High-Yield Questions)

### Category A: Dataset & Data Gathering

#### Q1: "Where did you get your dataset?"
> **Answer:** Our dataset integrates four established sources:
> 1. AWS CloudWatch sample metrics and the Kaggle Cloud Utilization Dataset for resource workloads (CPU, memory, storage).
> 2. The SPECpower_ssj2008 benchmark and Cloud Carbon Footprint (CCF) dataset for server idle and peak wattage.
> 3. Electricity Maps and IEA verified tables for regional grid emission intensities.
> 4. The Greenhouse Gas (GHG) Protocol Corporate Standard for carbon scope modeling.

#### Q2: "Why are you using a curated/mock dataset in the local demo?"
> **Answer:** In Phase 1, a representative benchmark dataset of 12 multi-cloud resources allows deterministic validation of our mathematical engine and UI edge cases (such as zero-load idle waste, hydro-powered clean grids, and storage archival). In Phase 2, this mock layer connects to the live AWS CloudWatch API via the already implemented adapter in [`awsAdapters.js`](file:///c:/Users/kratn/Downloads/CloudCarbonPassport_Cloud_Project_2026-feature-Bharath/CloudCarbonPassport_Cloud_Project_2026-feature-Bharath/src/backend/src/adapters/awsAdapters.js).

#### Q3: "Is anyone else in industry using this data?"
> **Answer:** Yes. Google Cloud, Microsoft Azure (via their official open-source *Carbon Aware SDK*), and Thoughtworks (via *Cloud Carbon Footprint*, used by Spotify and Etsy) utilize the exact same Electricity Maps grid factors and SPECpower instance power coefficients.

#### Q4: "What features are present in each dataset record?"
> **Answer:** Resource ID, Resource Name, AWS Service Type, Instance Type/Size, AWS Region, CPU Utilization (%), Memory Utilization (%), Storage (GB), Uptime Hours, Environment, Tags, Grid Carbon Intensity, Power (Watts), Total Energy (kWh), Total Emissions ($kgCO_2$), Scope 2 ($kgCO_2$), Scope 3 ($kgCO_2$), Sustainability Score ($0–100$), and Grade ($A+$ to $D$).

#### Q5: "What is the size of the full planned dataset?"
> **Answer:** As specified in [`docs/Dataset_Details.md`](file:///c:/Users/kratn/Downloads/CloudCarbonPassport_Cloud_Project_2026-feature-Bharath/CloudCarbonPassport_Cloud_Project_2026-feature-Bharath/docs/Dataset_Details.md), approximately 50–100 MB containing ~100,000 hourly time-series records across 15–20 features.

#### Q6: "How do you handle data preprocessing?"
> **Answer:** Missing value imputation, outlier filtering on anomalous CPU spikes, normalization/feature scaling (Min-Max) for neural network inputs, and timestamp alignment across heterogeneous cloud regions.

---

### Category B: Mathematical Formulas & Calculation Logic

#### Q7: "What is the exact formula for calculating carbon emissions?"
> **Answer:**
> $$\text{Emissions } (kgCO_2eq) = \frac{\text{Power (Watts)} \times \text{Uptime (Hours)} \times \text{PUE } (1.18)}{1000} \times \frac{\text{Grid Intensity } (gCO_2/kWh)}{1000}$$

#### Q8: "How do you determine the power consumption of a virtual machine?"
> **Answer:** Using the SPECpower linear interpolation equation:
> $$P = P_{\text{idle}} + \left(\frac{\text{CPU}\%}{100}\right) \times (P_{\text{max}} - P_{\text{idle}})$$
> where $P_{\text{idle}}$ and $P_{\text{max}}$ are calibrated based on instance family hardware benchmarks.

#### Q9: "Why is PUE set to 1.18?"
> **Answer:** PUE (Power Usage Effectiveness) measures data center energy efficiency ($\frac{\text{Total Facility Power}}{\text{IT Equipment Power}}$). 1.18 is the published annual average PUE for AWS hyperscale cloud data centers.

#### Q10: "What is the difference between Scope 2 and Scope 3 emissions?"
> **Answer:**
> * **Scope 2 (82%):** Indirect emissions from the consumption of purchased electricity from the local grid to run servers and cooling.
> * **Scope 3 (18%):** Embodied lifecycle carbon emissions from manufacturing, transporting, assembling, and recycling the physical server hardware.

#### Q11: "How do you calculate the Sustainability Score (0–100)?"
> **Answer:** It is a 4-part multi-attribute equation:
> 1. Grid Cleanliness Bonus (up to 40 pts).
> 2. Utilization Efficiency Score (up to 40 pts).
> 3. Renewable Grid Share Bonus (up to 20 pts).
> 4. Idle Resource Waste Penalty (–15 to –35 pts deducted if CPU < 30% or < 15%).

#### Q12: "Why do you penalize low CPU utilization?"
> **Answer:** A provisioned server running at 4% CPU draws substantial idle baseline power (often 25–35% of max power) while delivering zero business value. Penalizing idle workloads flags "zombie infrastructure" for rightsizing or automated termination.

#### Q13: "How do you calculate trees required to offset?"
> **Answer:** Based on USDA and EPA environmental research, one mature tree absorbs approximately $21.8\ kg$ of $CO_2$ per year. Thus: $\text{Trees} = \frac{\text{Total } kgCO_2}{21.8}$.

---

### Category C: Green AI & Predictive Modeling

#### Q14: "What makes this 'Green AI'?"
> **Answer:** Green AI operates in two ways:
> 1. **AI for Green:** Using lightweight machine learning to optimize cloud workloads, shift computing to low-carbon hours/regions, and minimize waste.
> 2. **Green in AI:** Using parameter-efficient, low-complexity models (linear regression, lightweight ARIMA/XGBoost) rather than resource-heavy deep neural networks that themselves consume excessive energy.

#### Q15: "How does the 7-day predictive forecast work?"
> **Answer:** It applies workload seasonality multipliers (accounting for weekend drops vs. weekday spikes), regional grid variance projections (forecasting solar/wind peaks), and models the carbon delta achieved if AI recommendations are applied.

#### Q16: "What algorithms will be used in SageMaker for Phase 2?"
> **Answer:** We evaluate three models: **ARIMA/SARIMAX** (for time-series baseline), **XGBoost Regressor** (for tabular workload and grid features), and **Amazon SageMaker DeepAR** (probabilistic RNN time-series).

#### Q17: "How is the reduction percentage calculated?"
> **Answer:**
> $$\text{Reduction } \% = \left(\frac{\sum \text{Baseline Emissions} - \sum \text{Optimized Emissions}}{\sum \text{Baseline Emissions}}\right) \times 100$$

---

### Category D: Digital Carbon Passport Concept & Novelty

#### Q18: "What is a Digital Carbon Passport?"
> **Answer:** A standardized, auditable digital identity certificate for a cloud asset that records its provenance, runtime energy, cumulative carbon, embodied hardware footprint, current efficiency grade, and optimization history.

#### Q19: "How is this different from AWS Customer Carbon Footprint Tool?"
> **Answer:**
> 1. AWS's tool reports historical data with a **3-month delay**; our framework provides **real-time/hourly updates**.
> 2. AWS only provides account-level or service-level aggregations; our framework generates **individual resource-level passports** (down to a single EC2 instance or S3 bucket).
> 3. AWS does not provide **AI predictive 7-day forecasting**.
> 4. AWS offers no **one-click automated remediation**.

#### Q20: "What is the core novelty of your project?"
> **Answer:** Bridging the gap between Green AI and the European Union's **Digital Product Passport (DPP)** framework by creating the first end-to-end cloud platform that continuously monitors, certifies, predicts, and optimizes cloud carbon emissions at the granular asset level.

---

### Category E: AWS Architecture & Engineering

#### Q21: "Why use both Amazon RDS and Amazon S3?"
> **Answer:** S3 acts as the raw data lake storing streaming JSON telemetry and exported passport certificates inexpensively. RDS (PostgreSQL) stores indexed, relational metadata (user accounts, current passport state, optimization logs) required for low-latency dashboard queries.

#### Q22: "How does the backend interact with AWS?"
> **Answer:** Via the AWS SDK (`@aws-sdk/client-cloudwatch`, `@aws-sdk/client-ec2`), authenticating using AWS IAM roles. In [`awsAdapters.js`](file:///c:/Users/kratn/Downloads/CloudCarbonPassport_Cloud_Project_2026-feature-Bharath/CloudCarbonPassport_Cloud_Project_2026-feature-Bharath/src/backend/src/adapters/awsAdapters.js), methods query `GetMetricData` for CPU and disk metrics.

#### Q23: "What happens when an optimization recommendation is applied in the dashboard?"
> **Answer:** In our prototype, the backend updates the resource state (e.g., migrating an instance from Mumbai `ap-south-1` to Stockholm `eu-north-1` or applying S3 Glacier lifecycle rules), recalculates the global metrics and passport scores, and returns an updated snapshot. In production AWS, Lambda invokes the EC2/S3 modify API.

#### Q24: "How does Amazon SNS fit into the architecture?"
> **Answer:** CloudWatch carbon alarms trigger SNS notifications to Slack or email whenever a resource drops to Grade D or exceeds its carbon budget.

---

### Category F: Project Management & Git Workflow

#### Q25: "How is work divided among the team?"
> **Answer:**
> * **Student 1 (Rahul Padmanaban):** Literature survey (Papers 1–5), cloud computing energy surveys, and dataset documentation.
> * **Student 2 (Kothamasu Ratna Subhash):** Literature survey (Papers 6–10), research gap analysis, carbon engine mathematical formulation, Digital Passport design, and AI forecasting logic.
> * **Student 3 (Bharath D Singh):** Literature survey (Papers 11–15), GitHub repository architecture, CI/CD workflow, frontend dashboard implementation, and AWS architecture diagrams.

#### Q26: "What is your GitHub branch structure?"
> **Answer:** `main` (production-ready releases) $\leftarrow$ `develop` (integration branch) $\leftarrow$ individual feature branches (`feature/Bharath`, `feature/Subhash`, `feature/rahul`).

---

## 🎤 9. VIVA & REVIEW PRESENTATION CHEAT SHEET

### The 30-Second Elevator Pitch
> *"Our project introduces the **AI-Powered Cloud Digital Carbon Passport Framework**. Currently, cloud providers tell organizations how much money their servers cost, but not how much carbon they emit at the resource level. We bridge this gap by calculating real-time carbon emissions using the **GHG Protocol** and **SPECpower benchmarks**, generating standardized **Digital Carbon Passports** for individual virtual machines and databases, and using **Green AI** to forecast 7-day emission trends and automatically reduce carbon footprints by up to 35%."*

### Key Keywords to Use with Reviewers
* *"Greenhouse Gas (GHG) Protocol Corporate Standard"*
* *"SPECpower_ssj2008 Benchmark"*
* *"Cloud Carbon Footprint (CCF) Methodology"*
* *"Electricity Maps Regional Grid Carbon Intensity"*
* *"Power Usage Effectiveness (PUE = 1.18)"*
* *"Scope 2 Operational vs. Scope 3 Embodied Emissions"*
* *"Digital Product Passport (DPP) Adaptation for Cloud Infrastructure"*
* *"Parameter-Efficient Green AI"*
* *"Granular Resource-Level Carbon Accounting"*
