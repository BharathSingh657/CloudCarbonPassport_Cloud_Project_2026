import {
  CloudWatchClient,
  GetMetricDataCommand,
  ListMetricsCommand
} from '@aws-sdk/client-cloudwatch';
import { CostExplorerClient, GetCostAndUsageCommand } from '@aws-sdk/client-cost-explorer';
import { EC2Client, DescribeInstancesCommand } from '@aws-sdk/client-ec2';
import { RDSClient, DescribeDBInstancesCommand } from '@aws-sdk/client-rds';
import { LambdaClient, ListFunctionsCommand } from '@aws-sdk/client-lambda';
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';
import { fromIni } from '@aws-sdk/credential-providers';

function getAwsCredentialSource(profile) {
  if (profile && profile !== 'default') {
    return fromIni({ profile });
  }
  return undefined;
}

export class AWSCloudWatchAdapter {
  constructor({ region = 'ap-south-1', profile = 'cloudpassport' } = {}) {
    this.region = region;
    this.profile = profile;
    this.client = new CloudWatchClient({
      region,
      credentials: getAwsCredentialSource(profile)
    });
  }

  async getUsageMetrics(hours = 24) {
    const metrics = [];
    let nextToken;

    do {
      const response = await this.client.send(new ListMetricsCommand({
        Namespace: 'AWS/Usage',
        MetricName: 'CallCount',
        NextToken: nextToken
      }));

      metrics.push(...(response.Metrics || []));
      nextToken = response.NextToken;
    } while (nextToken && metrics.length < 100);

    const selectedMetrics = metrics.slice(0, 100);
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - hours * 60 * 60 * 1000);
    const queries = selectedMetrics.map((metric, index) => ({
      Id: `metric_${index}`,
      Label: metric.Dimensions?.map(({ Name, Value }) => `${Name}=${Value}`).join(', ') || `CallCount ${index + 1}`,
      MetricStat: {
        Metric: {
          Namespace: metric.Namespace,
          MetricName: metric.MetricName,
          Dimensions: metric.Dimensions
        },
        Period: 3600,
        Stat: 'Sum'
      },
      ReturnData: true
    }));

    const result = queries.length
      ? await this.client.send(new GetMetricDataCommand({
        StartTime: startTime,
        EndTime: endTime,
        ScanBy: 'TimestampAscending',
        MetricDataQueries: queries
      }))
      : { MetricDataResults: [] };

    const metricResults = new Map(
      (result.MetricDataResults || []).map((metricResult) => [metricResult.Id, metricResult])
    );
    const series = selectedMetrics.map((metric, index) => {
      const metricResult = metricResults.get(`metric_${index}`);
      const datapoints = (metricResult?.Timestamps || []).map((timestamp, pointIndex) => ({
        timestamp: timestamp.toISOString(),
        calls: metricResult.Values?.[pointIndex] ?? 0
      })).sort((left, right) => left.timestamp.localeCompare(right.timestamp));
      const dimensions = Object.fromEntries(
        (metric.Dimensions || []).map(({ Name, Value }) => [Name, Value])
      );

      return {
        service: dimensions.Service || 'Unknown service',
        resource: dimensions.Resource || 'Unknown API',
        type: dimensions.Type || 'Unknown type',
        class: dimensions.Class || 'None',
        totalCalls: datapoints.reduce((total, point) => total + point.calls, 0),
        datapoints
      };
    });

    const hourlyTotals = new Map();
    for (const metric of series) {
      for (const point of metric.datapoints) {
        hourlyTotals.set(
          point.timestamp,
          (hourlyTotals.get(point.timestamp) || 0) + point.calls
        );
      }
    }

    return {
      source: 'CloudWatch AWS/Usage CallCount',
      region: this.region,
      profile: this.profile,
      periodHours: hours,
      periodSeconds: 3600,
      collectedAt: new Date().toISOString(),
      truncated: metrics.length > selectedMetrics.length || Boolean(nextToken),
      totalCalls: series.reduce((total, metric) => total + metric.totalCalls, 0),
      seriesCount: series.length,
      series,
      timeline: [...hourlyTotals.entries()]
        .map(([timestamp, calls]) => ({ timestamp, calls }))
        .sort((left, right) => left.timestamp.localeCompare(right.timestamp))
    };
  }
}

export class AWSResourceInventoryAdapter {
  constructor({ region = 'ap-south-1', profile = 'cloudpassport' } = {}) {
    this.region = region;
    this.profile = profile;
    this.cloudWatchClient = new CloudWatchClient({
      region,
      credentials: getAwsCredentialSource(profile)
    });
    this.ec2Client = new EC2Client({
      region,
      credentials: getAwsCredentialSource(profile)
    });
    this.rdsClient = new RDSClient({
      region,
      credentials: getAwsCredentialSource(profile)
    });
    this.lambdaClient = new LambdaClient({
      region,
      credentials: getAwsCredentialSource(profile)
    });
    this.s3Client = new S3Client({
      region,
      credentials: getAwsCredentialSource(profile)
    });
  }

  async getAverageMetric({ namespace, metricName, dimensions, hours = 24, stat = 'Average', period = 3600 }) {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - hours * 60 * 60 * 1000);
    try {
      const response = await this.cloudWatchClient.send(new GetMetricDataCommand({
        StartTime: startTime,
        EndTime: endTime,
        ScanBy: 'TimestampAscending',
        MetricDataQueries: [{
          Id: 'metric_0',
          MetricStat: {
            Metric: {
              Namespace: namespace,
              MetricName: metricName,
              Dimensions: dimensions
            },
            Period: period,
            Stat: stat
          },
          ReturnData: true
        }]
      }));

      const values = response.MetricDataResults?.[0]?.Values || [];
      if (!values.length) return null;
      return Number((values.reduce((total, value) => total + value, 0) / values.length).toFixed(2));
    } catch {
      return null;
    }
  }

  async getEc2CpuAverage(instanceId) {
    return this.getAverageMetric({
      namespace: 'AWS/EC2',
      metricName: 'CPUUtilization',
      dimensions: [{ Name: 'InstanceId', Value: instanceId }]
    });
  }

  async getRdsCpuAverage(dbIdentifier) {
    return this.getAverageMetric({
      namespace: 'AWS/RDS',
      metricName: 'CPUUtilization',
      dimensions: [{ Name: 'DBInstanceIdentifier', Value: dbIdentifier }]
    });
  }

  async getLambdaUtilizationProxy(functionName) {
    const invocations = await this.getAverageMetric({
      namespace: 'AWS/Lambda',
      metricName: 'Invocations',
      dimensions: [{ Name: 'FunctionName', Value: functionName }],
      stat: 'Sum'
    });
    const duration = await this.getAverageMetric({
      namespace: 'AWS/Lambda',
      metricName: 'Duration',
      dimensions: [{ Name: 'FunctionName', Value: functionName }]
    });

    if (invocations === null && duration === null) return null;
    const invocationScore = Math.min(70, (invocations || 0) / 10);
    const durationScore = Math.min(30, (duration || 0) / 100);
    return Number(Math.max(1, invocationScore + durationScore).toFixed(2));
  }

  buildBaseResource(resource) {
    return {
      cpuUtilization: 35,
      memoryUtilization: 35,
      storageGB: 10,
      uptimeHours: 720,
      owner: 'AWS Account',
      environment: 'Live AWS',
      tags: {},
      source: 'aws',
      telemetrySource: 'AWS APIs and CloudWatch'
    };
  }

  getResourceHealth(status) {
    if (!status) return 'Unknown';
    const normalized = status.toLowerCase();
    if (normalized.includes('running') || normalized.includes('available') || normalized.includes('active')) {
      return 'Active';
    }
    if (normalized.includes('stopped')) return 'Stopped';
    if (normalized.includes('pending')) return 'Pending';
    return status;
  }

  safeNumber(value, fallback = 0) {
    if (value === undefined || value === null || Number.isNaN(Number(value))) {
      return fallback;
    }
    return Number(value);
  }

  async getResourceInventory() {
    const inventory = [];
    const errors = [];

    try {
      const ec2Response = await this.ec2Client.send(new DescribeInstancesCommand({}));
      const ec2Instances = [];
      for (const reservation of ec2Response.Reservations || []) {
        for (const instance of reservation.Instances || []) {
          const tags = Object.fromEntries((instance.Tags || []).map(tag => [tag.Key, tag.Value]));
          ec2Instances.push({
            ...this.buildBaseResource(),
            id: instance.InstanceId,
            name: tags.Name || instance.InstanceId,
            service: 'Amazon EC2',
            instanceType: instance.InstanceType || 'unknown',
            region: this.region,
            status: this.getResourceHealth(instance.State?.Name),
            storageGB: Math.max(8, this.safeNumber(instance.BlockDeviceMappings?.length, 1) * 8),
            tags,
            launchTime: instance.LaunchTime?.toISOString()
          });
        }
      }
      const enrichedEc2Instances = await Promise.all(ec2Instances.map(async (resource) => ({
        ...resource,
        cpuUtilization: (await this.getEc2CpuAverage(resource.id)) ?? resource.cpuUtilization
      })));
      inventory.push(...enrichedEc2Instances);
    } catch (error) {
      errors.push({ service: 'EC2', message: error.message });
    }

    try {
      const rdsResponse = await this.rdsClient.send(new DescribeDBInstancesCommand({}));
      const dbInstances = [];
      for (const db of rdsResponse.DBInstances || []) {
        const tags = { dbInstanceIdentifier: db.DBInstanceIdentifier };
        dbInstances.push({
          ...this.buildBaseResource(),
          id: db.DBInstanceArn || db.DbiResourceId || db.DBInstanceIdentifier,
          name: db.DBName || db.DBInstanceIdentifier,
          service: 'Amazon RDS',
          instanceType: db.DBInstanceClass || 'unknown',
          region: this.region,
          status: this.getResourceHealth(db.DBInstanceStatus),
          storageGB: this.safeNumber(db.AllocatedStorage, 0),
          tags,
          dbInstanceIdentifier: db.DBInstanceIdentifier
        });
      }
      const enrichedDbInstances = await Promise.all(dbInstances.map(async (resource) => ({
        ...resource,
        cpuUtilization: (await this.getRdsCpuAverage(resource.dbInstanceIdentifier)) ?? resource.cpuUtilization
      })));
      inventory.push(...enrichedDbInstances);
    } catch (error) {
      errors.push({ service: 'RDS', message: error.message });
    }

    try {
      const lambdaResponse = await this.lambdaClient.send(new ListFunctionsCommand({}));
      const functions = (lambdaResponse.Functions || []).map((fn) => ({
        ...this.buildBaseResource(),
        id: fn.FunctionArn,
        name: fn.FunctionName,
        service: 'AWS Lambda',
        instanceType: 'lambda-function',
        region: this.region,
        status: 'Listed',
        storageGB: Number(((fn.EphemeralStorage?.Size || 512) / 1024).toFixed(2)),
        memoryUtilization: Math.min(100, Math.round(((fn.MemorySize || 128) / 1024) * 35)),
        tags: { runtime: fn.Runtime || 'unknown' },
        runtime: fn.Runtime || 'unknown'
      }));
      const enrichedFunctions = await Promise.all(functions.map(async (resource) => ({
        ...resource,
        cpuUtilization: (await this.getLambdaUtilizationProxy(resource.name)) ?? resource.cpuUtilization
      })));
      inventory.push(...enrichedFunctions);
    } catch (error) {
      errors.push({ service: 'Lambda', message: error.message });
    }

    try {
      const s3Response = await this.s3Client.send(new ListBucketsCommand({}));
      for (const bucket of s3Response.Buckets || []) {
        inventory.push({
          ...this.buildBaseResource(),
          id: bucket.Name,
          name: bucket.Name,
          service: 'Amazon S3',
          instanceType: 's3-standard',
          region: 'Account-wide',
          status: 'Listed',
          cpuUtilization: 5,
          memoryUtilization: 5,
          storageGB: 1,
          tags: { bucketName: bucket.Name },
          createdAt: bucket.CreationDate?.toISOString()
        });
      }
    } catch (error) {
      errors.push({ service: 'S3', message: error.message });
    }

    return {
      source: 'aws',
      region: this.region,
      profile: this.profile,
      collectedAt: new Date().toISOString(),
      count: inventory.length,
      resources: inventory,
      errors
    };
  }
}

export class AWSCostExplorerAdapter {
  constructor({ profile = 'cloudpassport' } = {}) {
    this.profile = profile;
    this.client = new CostExplorerClient({
      region: 'us-east-1',
      credentials: getAwsCredentialSource(profile)
    });
  }

  async getDailyCosts(days = 30) {
    const end = new Date();
    end.setUTCHours(0, 0, 0, 0);
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - days);

    const response = await this.client.send(new GetCostAndUsageCommand({
      TimePeriod: {
        Start: start.toISOString().slice(0, 10),
        End: end.toISOString().slice(0, 10)
      },
      Granularity: 'DAILY',
      Metrics: ['UnblendedCost'],
      GroupBy: [{ Type: 'DIMENSION', Key: 'SERVICE' }]
    }));

    const byService = new Map();
    const daily = (response.ResultsByTime || []).map((period) => {
      let amount = 0;
      for (const group of period.Groups || []) {
        const value = Number(group.Metrics?.UnblendedCost?.Amount || 0);
        amount += value;
        const service = group.Keys?.[0] || 'Other';
        byService.set(service, (byService.get(service) || 0) + value);
      }
      return {
        date: period.TimePeriod?.Start,
        amount: Number(amount.toFixed(4))
      };
    });

    const currency = response.ResultsByTime?.[0]?.Groups?.[0]?.Metrics?.UnblendedCost?.Unit || 'USD';
    return {
      source: 'AWS Cost Explorer GetCostAndUsage',
      profile: this.profile,
      currency,
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
      total: Number(daily.reduce((sum, point) => sum + point.amount, 0).toFixed(4)),
      daily,
      services: [...byService.entries()]
        .map(([service, amount]) => ({ service, amount: Number(amount.toFixed(4)) }))
        .sort((left, right) => right.amount - left.amount)
    };
  }
}

export class AWSSageMakerAdapter {
  constructor() {
    this.endpointName = 'green-ai-carbon-forecaster-v1';
    this.isMock = true;
  }

  async predictCarbonEmissions(resourcePayload) {
    // In Phase 2: return await sagemakerRuntimeClient.send(new InvokeEndpointCommand(...));
    return {
      predictedEmissionsKg: (resourcePayload.powerWatts * 0.45).toFixed(2),
      confidence: 0.96
    };
  }
}

export class AWSS3PassportStoreAdapter {
  constructor(bucketName = 'cloud-carbon-passports-vault') {
    this.bucketName = bucketName;
    this.isMock = true;
  }

  async storePassportDocument(passportId, passportJson) {
    // In Phase 2: return await s3Client.send(new PutObjectCommand({ Bucket: this.bucketName, Key: `${passportId}.json`, Body: JSON.stringify(passportJson) }));
    return {
      s3Location: `s3://${this.bucketName}/passports/${passportId}.json`,
      etag: `"${Math.random().toString(36).substring(7)}"`
    };
  }
}
