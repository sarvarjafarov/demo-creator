import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import env from './config/env.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.isDev ? 'dev' : 'combined'));

// --- Serve local uploads when S3 is not configured ---
app.use('/uploads', express.static(resolve(__dirname, '../uploads')));

// --- API Routes ---
app.use('/api', routes);

// --- Serve client build in production ---
if (!env.isDev) {
  const clientPath = resolve(__dirname, '../..', env.clientBuildPath);
  app.use(express.static(clientPath));
  app.get('*', (req, res) => {
    res.sendFile(resolve(clientPath, 'index.html'));
  });
}

// --- Error handling ---
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
