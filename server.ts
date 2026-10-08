import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { NATIONAL_OVERVIEW, STATES_DATA, SECTORS_DATA, EARLY_WARNING_ALERTS } from './src/data/indiaData.ts';
import { analyzeSMEFinancials } from './src/services/mlEngine.ts';
import { runCrisisSimulation } from './src/services/simulationEngine.ts';
import { generateAIPolicyBriefing } from './src/services/geminiService.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // API Endpoints
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'healthy',
      system: 'SME-SENTINEL Early Warning Platform',
      version: '2.4.0-sentinel',
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/api/national-stress', (_req, res) => {
    res.json(NATIONAL_OVERVIEW);
  });

  app.get('/api/states', (_req, res) => {
    res.json(STATES_DATA);
  });

  app.get('/api/sectors', (_req, res) => {
    res.json(SECTORS_DATA);
  });

  app.get('/api/alerts', (_req, res) => {
    res.json(EARLY_WARNING_ALERTS);
  });

  app.post('/api/predict-sme', (req, res) => {
    try {
      const inputs = req.body;
      const result = analyzeSMEFinancials(inputs);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Invalid financial inputs' });
    }
  });

  app.post('/api/simulate-crisis', (req, res) => {
    try {
      const params = req.body;
      const result = runCrisisSimulation(params);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Invalid simulation parameters' });
    }
  });

  app.post('/api/generate-insights', async (req, res) => {
    try {
      const context = req.body;
      const report = await generateAIPolicyBriefing(context);
      res.json(report);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Error generating policy insight' });
    }
  });

  // Mount Vite middlewares in development
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SME-SENTINEL Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
