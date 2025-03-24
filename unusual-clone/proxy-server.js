/**
 * Simple CORS Proxy Server for Unusual Clone
 * 
 * This server proxies requests to Supabase to bypass CORS restrictions.
 * It should be run locally alongside your application or deployed to a server.
 */

const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'apikey'],
}));

// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Proxy requests to Supabase Edge Functions
app.use('/functions', createProxyMiddleware({
  target: 'https://gckvjovozupvteqivjiv.supabase.co',
  changeOrigin: true,
  pathRewrite: {
    '^/functions': '/functions'
  },
  onProxyReq: (proxyReq, req, res) => {
    // Add authorization header if it exists in the original request
    if (req.headers.authorization) {
      proxyReq.setHeader('Authorization', req.headers.authorization);
    }
  }
}));

// Proxy requests to Supabase REST API
app.use('/rest', createProxyMiddleware({
  target: 'https://gckvjovozupvteqivjiv.supabase.co',
  changeOrigin: true,
  pathRewrite: {
    '^/rest': '/rest'
  },
  onProxyReq: (proxyReq, req, res) => {
    // Add any required headers
    if (req.headers.apikey) {
      proxyReq.setHeader('apikey', req.headers.apikey);
    }
    if (req.headers.authorization) {
      proxyReq.setHeader('Authorization', req.headers.authorization);
    }
  }
}));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`CORS Proxy Server running on port ${PORT}`);
  console.log(`Use http://localhost:${PORT}/functions/v1/get_content for Edge Function calls`);
  console.log(`Use http://localhost:${PORT}/rest/v1/rpc/get_content for RPC calls`);
}); 