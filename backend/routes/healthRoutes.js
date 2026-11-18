const express = require('express');
const router = express.Router();
const { getConnectionDiagnostics } = require('../config/db');
const { diagnoseAndFix } = require('../config/mongoUriDoctor');

/**
 * Health check endpoint for Render auto-healing & Vercel frontend live ping
 */
router.get('/', (req, res) => {
  const dbInfo = getConnectionDiagnostics();
  const isHealthy = dbInfo.readyState === 1;

  res.status(isHealthy ? 200 : 200).json({
    status: isHealthy ? 'healthy' : 'degraded',
    service: 'Student Management System Backend',
    platform: 'Render',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      status: dbInfo.status,
      readyState: dbInfo.readyStateDescription,
      sanitizedUri: dbInfo.sanitizedUri,
      lastConnected: dbInfo.lastConnected,
      error: dbInfo.error,
      fixesApplied: dbInfo.fixesApplied,
    },
  });
});

/**
 * Dedicated MongoDB Doctor endpoint - test and diagnose any connection URI
 */
router.post('/diagnose-mongo', (req, res) => {
  const { uri } = req.body;
  if (!uri) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a "uri" in request body to diagnose.',
    });
  }

  const diagnosis = diagnoseAndFix(uri);
  return res.status(200).json({
    success: true,
    diagnosis,
  });
});

module.exports = router;
