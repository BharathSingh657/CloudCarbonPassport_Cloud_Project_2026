// Region carbon intensity (gCO2eq / kWh) based on regional power grid mixes
export const REGION_CARBON_INTENSITY = {
  'us-east-1': { name: 'US East (N. Virginia)', intensity: 378, renewablePct: 22, provider: 'PJM Grid' },
  'us-west-2': { name: 'US West (Oregon)', intensity: 115, renewablePct: 78, provider: 'BPA Hydro' },
  'eu-north-1': { name: 'Europe (Stockholm)', intensity: 28, renewablePct: 95, provider: 'Nordic Hydro/Wind' },
  'eu-west-1': { name: 'Europe (Ireland)', intensity: 295, renewablePct: 42, provider: 'EirGrid' },
  'ap-south-1': { name: 'Asia Pacific (Mumbai)', intensity: 708, renewablePct: 18, provider: 'Tata/State Grid' },
  'ap-southeast-1': { name: 'Asia Pacific (Singapore)', intensity: 412, renewablePct: 12, provider: 'EMA Grid' }
};

// Power consumption profiles (Watts at idle / Watts at max load)
export const INSTANCE_POWER_PROFILES = {
  't3.medium': { idleW: 8.5, maxW: 32, vCPU: 2, memGB: 4 },
  't3.2xlarge': { idleW: 34.0, maxW: 128, vCPU: 8, memGB: 32 },
  'c6i.4xlarge': { idleW: 95.0, maxW: 380, vCPU: 16, memGB: 32 },
  'm6i.xlarge': { idleW: 24.0, maxW: 96, vCPU: 4, memGB: 16 },
  'r6i.2xlarge': { idleW: 42.0, maxW: 168, vCPU: 8, memGB: 64 },
  'db.r6g.xlarge': { idleW: 28.0, maxW: 112, vCPU: 4, memGB: 32 },
  'db.t4g.medium': { idleW: 9.0, maxW: 36, vCPU: 2, memGB: 4 },
  's3-standard': { idleW: 0.8, maxW: 1.2, vCPU: 0, memGB: 0 }, // per TB
  'lambda-function': { idleW: 0.1, maxW: 15, vCPU: 2, memGB: 2 },
  'ecs-task': { idleW: 12.0, maxW: 48, vCPU: 2, memGB: 8 }
};

// Initial Cloud Resources Mock Dataset
export const initialResources = [
  {
    id: 'res-ec2-prod-api-01',
    name: 'Prod API Gateway Cluster',
    service: 'Amazon EC2',
    instanceType: 'c6i.4xlarge',
    region: 'us-east-1',
    status: 'Active',
    cpuUtilization: 78.4,
    memoryUtilization: 65.2,
    storageGB: 500,
    uptimeHours: 720,
    owner: 'Platform Team',
    environment: 'Production',
    tags: { App: 'CoreAPI', Tier: 'Frontend' }
  },
  {
    id: 'res-ec2-legacy-batch-02',
    name: 'Legacy Analytics Ingestion',
    service: 'Amazon EC2',
    instanceType: 't3.2xlarge',
    region: 'ap-south-1',
    status: 'Warning',
    cpuUtilization: 14.2, // Idle resource wasting power!
    memoryUtilization: 22.0,
    storageGB: 1200,
    uptimeHours: 720,
    owner: 'Data Eng',
    environment: 'Production',
    tags: { App: 'ETL-Legacy', Tier: 'Batch' }
  },
  {
    id: 'res-rds-user-db-01',
    name: 'Primary PostgreSQL DB',
    service: 'Amazon RDS',
    instanceType: 'db.r6g.xlarge',
    region: 'us-west-2',
    status: 'Optimal',
    cpuUtilization: 42.1,
    memoryUtilization: 71.5,
    storageGB: 2500,
    uptimeHours: 720,
    owner: 'DBA Team',
    environment: 'Production',
    tags: { App: 'UserDB', Tier: 'Database' }
  },
  {
    id: 'res-rds-staging-db-02',
    name: 'Staging PostgreSQL DB',
    service: 'Amazon RDS',
    instanceType: 'db.t4g.medium',
    region: 'us-east-1',
    status: 'Active',
    cpuUtilization: 18.5,
    memoryUtilization: 35.0,
    storageGB: 250,
    uptimeHours: 720,
    owner: 'QA Team',
    environment: 'Staging',
    tags: { App: 'StagingDB', Tier: 'Database' }
  },
  {
    id: 'res-s3-analytics-logs-01',
    name: 'Analytics Cold Data Lake',
    service: 'Amazon S3',
    instanceType: 's3-standard',
    region: 'us-east-1',
    status: 'Optimal',
    cpuUtilization: 5.0,
    memoryUtilization: 5.0,
    storageGB: 185000, // 185 TB
    uptimeHours: 720,
    owner: 'Data Lake Team',
    environment: 'Production',
    tags: { App: 'LogsBucket', StorageClass: 'Standard' }
  },
  {
    id: 'res-s3-green-archival-02',
    name: 'Green Archival Store',
    service: 'Amazon S3',
    instanceType: 's3-standard',
    region: 'eu-north-1',
    status: 'Optimal',
    cpuUtilization: 2.0,
    memoryUtilization: 2.0,
    storageGB: 340000,
    uptimeHours: 720,
    owner: 'Compliance',
    environment: 'Production',
    tags: { App: 'Archive', StorageClass: 'Glacier-Deep' }
  },
  {
    id: 'res-lambda-auth-worker',
    name: 'Auth Token Validator',
    service: 'AWS Lambda',
    instanceType: 'lambda-function',
    region: 'eu-north-1',
    status: 'Optimal',
    cpuUtilization: 32.0,
    memoryUtilization: 28.0,
    storageGB: 10,
    uptimeHours: 140, // Serverless executions
    owner: 'SecOps',
    environment: 'Production',
    tags: { App: 'AuthService', Architecture: 'Serverless' }
  },
  {
    id: 'res-lambda-image-processor',
    name: 'Media Thumbnail Generator',
    service: 'AWS Lambda',
    instanceType: 'lambda-function',
    region: 'ap-south-1',
    status: 'Warning',
    cpuUtilization: 88.0,
    memoryUtilization: 92.0,
    storageGB: 50,
    uptimeHours: 310,
    owner: 'Media Team',
    environment: 'Production',
    tags: { App: 'MediaProc', Architecture: 'Serverless' }
  },
  {
    id: 'res-ecs-search-cluster',
    name: 'Elasticsearch Search Nodes',
    service: 'Amazon ECS',
    instanceType: 'ecs-task',
    region: 'us-west-2',
    status: 'Optimal',
    cpuUtilization: 54.0,
    memoryUtilization: 68.0,
    storageGB: 800,
    uptimeHours: 720,
    owner: 'Search Team',
    environment: 'Production',
    tags: { App: 'SearchEngine', Tier: 'Middleware' }
  },
  {
    id: 'res-ec2-dev-sandbox-04',
    name: 'Dev Sandbox Workstation',
    service: 'Amazon EC2',
    instanceType: 't3.2xlarge',
    region: 'us-east-1',
    status: 'Critical', // Extremely wasteful
    cpuUtilization: 4.1,
    memoryUtilization: 11.2,
    storageGB: 400,
    uptimeHours: 720,
    owner: 'Dev-Team-A',
    environment: 'Development',
    tags: { App: 'DevSandbox', WasteFactor: 'High' }
  },
  {
    id: 'res-ec2-eu-cache-node',
    name: 'Redis Cache Cluster EU',
    service: 'Amazon EC2',
    instanceType: 'r6i.2xlarge',
    region: 'eu-north-1',
    status: 'Optimal',
    cpuUtilization: 62.0,
    memoryUtilization: 84.0,
    storageGB: 300,
    uptimeHours: 720,
    owner: 'Platform Team',
    environment: 'Production',
    tags: { App: 'Caching', Grid: 'Hydro-Powered' }
  },
  {
    id: 'res-rds-analytics-replica',
    name: 'Read Replica Analytics DB',
    service: 'Amazon RDS',
    instanceType: 'db.r6g.xlarge',
    region: 'ap-southeast-1',
    status: 'Active',
    cpuUtilization: 29.8,
    memoryUtilization: 44.5,
    storageGB: 1500,
    uptimeHours: 720,
    owner: 'BI Team',
    environment: 'Production',
    tags: { App: 'BI-Reporting', Type: 'ReadReplica' }
  }
];
