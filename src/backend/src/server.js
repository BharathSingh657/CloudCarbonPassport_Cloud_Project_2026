import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';

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
    version: '1.0.0-MVP',
    endpoints: [
      '/api/dashboard/stats',
      '/api/dashboard/charts',
      '/api/resources',
      '/api/resources/:id/passport',
      '/api/predictions',
      '/api/recommendations'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`=================================================================`);
  console.log(`🚀 Carbon Passport Backend API running on http://localhost:${PORT}`);
  console.log(`=================================================================`);
});
