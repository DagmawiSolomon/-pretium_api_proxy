import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const PRETIUM_API_URL = process.env.PRETIUM_API_URL;
const PRETIUM_API_KEY = process.env.PRETIUM_API_KEY;

// ---------------------
// CORS configuration
// ---------------------
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow curl, Postman
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json());

// ---------------------
// Proxy middleware
// ---------------------
app.use('/api', createProxyMiddleware({
  target: PRETIUM_API_URL,
  changeOrigin: true,
  pathRewrite: { '^/api': '' }, // /api/v1/... -> /v1/...
  onProxyReq: (proxyReq) => {
    proxyReq.setHeader('x-api-key', PRETIUM_API_KEY); // hide your API key
  },
  logLevel: 'debug',
  onError: (err, req, res) => {
    console.error('Proxy error:', err.message);
    if (!res.headersSent) res.status(502).json({ error: 'Proxy error' });
  }
}));

// ---------------------
// Health check
// ---------------------
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ---------------------
// Start server
// ---------------------
app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));
