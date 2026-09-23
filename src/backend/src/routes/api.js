import express from 'express';
import { initialResources } from '../data/mockData.js';
import { calculateResourceCarbon, calculateAggregateMetrics } from '../services/carbonEngine.js';
import { generateDigitalCarbonPassport } from '../services/passportGenerator.js';
import { generate7DayForecast, generateRecommendations } from '../services/aiPredictor.js';

const router = express.Router();

// In-memory state of cloud resources
let currentResources = [...initialResources];
let appliedRecommendations = new Set();

// Utility helper to get resources with carbon metrics applied
function getProcessedResources() {
  return currentResources.map(res => calculateResourceCarbon(res));
}

// 1. Dashboard Global KPIs
router.get('/dashboard/stats', (req, res) => {
  const processed = getProcessedResources();
  const aggregate = calculateAggregateMetrics(processed);
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    data: aggregate
  });
});

// 2. Dashboard Charts & Visualizations
router.get('/dashboard/charts', (req, res) => {
  const processed = getProcessedResources();
  const aggregate = calculateAggregateMetrics(processed);

  // Simulated 30-day historical carbon trend line
  const historicalTrend = [];
  const now = new Date();
  for (let i = 30; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const fluctuation = 1 + (Math.sin(i * 0.4) * 0.08) + ((Math.random() - 0.5) * 0.05);
    const dailyKg = parseFloat(((aggregate.totalCarbonKg / 30) * fluctuation).toFixed(2));
    const dailyKWh = parseFloat(((aggregate.totalKWh / 30) * fluctuation).toFixed(2));
    
    historicalTrend.push({
      date: dateStr,
      carbonKg: dailyKg,
      kWh: dailyKWh,
      renewablePct: Math.min(100, Math.max(20, Math.round(aggregate.renewableRatioPct + Math.sin(i * 0.3) * 10)))
    });
  }

  res.json({
    success: true,
    data: {
      historicalTrend,
      serviceBreakdown: aggregate.serviceBreakdown,
      regionBreakdown: aggregate.regionBreakdown
    }
  });
});

// 3. Resources List with Filtering & Searching
router.get('/resources', (req, res) => {
  const { search, service, region, status, minScore } = req.query;
  let processed = getProcessedResources();

  if (search) {
    const q = search.toLowerCase();
    processed = processed.filter(r => 
      r.name.toLowerCase().includes(q) || 
      r.id.toLowerCase().includes(q) || 
      r.instanceType.toLowerCase().includes(q)
    );
  }

  if (service && service !== 'All') {
    processed = processed.filter(r => r.service === service);
  }

  if (region && region !== 'All') {
    processed = processed.filter(r => r.region === region);
  }

  if (status && status !== 'All') {
    processed = processed.filter(r => r.status === status);
  }

  if (minScore) {
    processed = processed.filter(r => r.metrics.sustainabilityScore >= parseInt(minScore));
  }

  res.json({
    success: true,
    count: processed.length,
    data: processed
  });
});

// 4. Single Resource Detail
router.get('/resources/:id', (req, res) => {
  const processed = getProcessedResources();
  const resource = processed.find(r => r.id === req.params.id);
  
  if (!resource) {
    return res.status(404).json({ success: false, message: 'Resource not found' });
  }

  res.json({
    success: true,
    data: resource
  });
});

// 5. Digital Carbon Passport for Resource
router.get('/resources/:id/passport', (req, res) => {
  const processed = getProcessedResources();
  const resource = processed.find(r => r.id === req.params.id);
  
  if (!resource) {
    return res.status(404).json({ success: false, message: 'Resource not found' });
  }

  const passport = generateDigitalCarbonPassport(resource);
  res.json({
    success: true,
    data: passport
  });
});

// 6. 7-Day AI Emission Forecast
router.get('/predictions', (req, res) => {
  const processed = getProcessedResources();
  const forecast = generate7DayForecast(processed);
  res.json({
    success: true,
    data: forecast
  });
});

// 7. AI Recommendations
router.get('/recommendations', (req, res) => {
  const processed = getProcessedResources();
  const recs = generateRecommendations(processed);
  const updatedRecs = recs.map(r => ({
    ...r,
    applied: appliedRecommendations.has(r.id)
  }));

  res.json({
    success: true,
    count: updatedRecs.length,
    data: updatedRecs
  });
});

// 8. Apply AI Recommendation (Simulated Optimization)
router.post('/recommendations/:id/apply', (req, res) => {
  const { id } = req.params;
  const processed = getProcessedResources();
  const recs = generateRecommendations(processed);
  const rec = recs.find(r => r.id === id);

  if (!rec) {
    return res.status(404).json({ success: false, message: 'Recommendation not found' });
  }

  appliedRecommendations.add(id);

  // Mutate target resource to simulate applied optimization
  currentResources = currentResources.map(r => {
    if (r.id === rec.resourceId) {
      if (rec.type.includes('Right-Sizing')) {
        return { ...r, instanceType: 't3.medium', cpuUtilization: 68.0, status: 'Optimal' };
      }
      if (rec.type.includes('Region Shift')) {
        return { ...r, region: rec.targetRegion, status: 'Optimal' };
      }
      if (rec.type.includes('Storage Lifecycle')) {
        return { ...r, status: 'Optimal' };
      }
    }
    return r;
  });

  res.json({
    success: true,
    message: `Optimization applied successfully to ${rec.resourceName}!`,
    appliedRecommendationId: id,
    updatedResource: currentResources.find(r => r.id === rec.resourceId)
  });
});

export default router;
