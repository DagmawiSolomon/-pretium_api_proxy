import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const PRETIUM_API_URL = process.env.PRETIUM_API_URL;
const PRETIUM_API_KEY = process.env.PRETIUM_API_KEY;

const pretiumProxy = createProxyMiddleware({
  target: PRETIUM_API_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api': '',   // removes "/api" so /api/v1/... -> /v1/...
  },
  onProxyReq: (proxyReq) => {
    proxyReq.setHeader('x-api-key', PRETIUM_API_KEY);
  },
  logLevel: 'debug'
});


app.use('/api', pretiumProxy);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



