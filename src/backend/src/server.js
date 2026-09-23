import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';
import { runMigrations, checkDatabaseHealth } from './db/dbClient.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Log incoming API requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Mount API routes
app.use('/api', apiRoutes);

// Root health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'AI-Powered Cloud Digital Carbon Passport Framework API',
    version: '2.0.0-PROD',
    endpoints: [
      '/api/health',
      '/api/dashboard/stats',
      '/api/dashboard/charts',
      '/api/resources',
      '/api/resources/:id',
      '/api/resources/:id/passport',
      '/api/predictions',
      '/api/recommendations',
      '/api/recommendations/:id/apply',
      '/api/pipeline/run',
      '/api/pipeline/status',
      '/api/aws/status',
      '/api/aws/inventory',
      '/api/aws/costs',
      '/api/cloudwatch/usage'
    ]
  });
});

async function startServer() {
  try {
    console.log('[Startup] Verifying PostgreSQL connection & migrations...');
    await runMigrations();
    const dbHealth = await checkDatabaseHealth();
    console.log(`[Startup] PostgreSQL connected: ${dbHealth.connected} (${dbHealth.database} on latency ${dbHealth.latencyMs}ms)`);
  } catch (err) {
    console.warn(`[Startup Warning] Database initialization: ${err.message}. Backend will attempt reconnection on demand.`);
  }

  app.listen(PORT, () => {
    console.log(`=================================================================`);
    console.log(`Carbon Passport Backend API running on http://localhost:${PORT}`);
    console.log(`=================================================================`);
  });
}

startServer();
