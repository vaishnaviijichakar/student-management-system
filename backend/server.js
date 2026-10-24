const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');

const connectDatabase = require('./config/database');
const studentRoutes = require('./routes/studentRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

// Only the configured frontend origin(s) may call this API from a browser.
const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);
if (!isProduction) allowedOrigins.push('http://localhost:5173', 'http://127.0.0.1:5173');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin(origin, callback) {
      // No Origin header means curl/Postman/server-to-server, which CORS does not apply to.
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Origin not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  })
);
app.use(express.json({ limit: '10kb' }));
app.use(morgan(isProduction ? 'combined' : 'dev'));

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Student Information Management API is running' });
});

app.get('/api/health', (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.json({
    success: true,
    status: 'ok',
    database: connected ? 'connected' : 'disconnected',
    time: new Date().toISOString(),
  });
});

const requireDatabase = (req, res, next) => {
  if (mongoose.connection.readyState === 1) return next();
  return res.status(503).json({ success: false, message: 'Database is unavailable. Please try again shortly.' });
};

app.use('/api/students', requireDatabase, studentRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not set. Create backend/.env from .env.example (or set it on Render).');
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
  console.log(`Allowed frontend origins: ${allowedOrigins.join(', ') || '(none)'}`);
});

// Keep retrying so a temporary Atlas outage does not kill the server.
const connectWithRetry = async () => {
  try {
    await connectDatabase();
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}. Retrying in 5 seconds...`);
    setTimeout(connectWithRetry, 5000);
  }
};
connectWithRetry();
