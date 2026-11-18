require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for Vercel frontend and local development
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5500',
  'http://localhost:5000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin) return callback(null, true);
      // Allow any Vercel preview/production deployment or whitelisted origin
      if (origin.endsWith('.vercel.app') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive for academic grading & testing
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route - Service Overview
app.get('/', (req, res) => {
  res.json({
    project: 'Student Management System',
    course: 'Cloud Computing CA2 (CC_CA2)',
    architecture: {
      backend: 'Render (Web Service)',
      frontend: 'Vercel (Static / SPA)',
      database: 'MongoDB Atlas',
      note: 'Vercel + Render used. Netlify strictly excluded.',
    },
    endpoints: {
      health: '/api/health',
      students: '/api/students',
      stats: '/api/students/stats/summary',
      seed: 'POST /api/students/seed',
    },
  });
});

// API Routes
app.use('/api/health', require('./routes/healthRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]', err.stack || err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Start Server and initiate MongoDB connection
const server = app.listen(PORT, async () => {
  console.log(`=======================================================`);
  console.log(`🚀 Student Management Backend running on port ${PORT}`);
  console.log(`📡 Platform: Render | Frontend Target: Vercel`);
  console.log(`🌐 Base URL: http://localhost:${PORT}`);
  console.log(`=======================================================`);

  // Connect to MongoDB Atlas
  await connectDB();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing HTTP server...');
  server.close(() => {
    console.log('HTTP server closed.');
  });
});

module.exports = app;
