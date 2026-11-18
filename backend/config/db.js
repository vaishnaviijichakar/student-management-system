const mongoose = require('mongoose');
const { applyDnsFix, diagnoseAndFix } = require('./mongoUriDoctor');

// Global connection cache for serverless & container environments
let isConnected = false;
let connectionDiagnostics = {
  status: 'disconnected',
  lastConnected: null,
  error: null,
  sanitizedUri: null,
  fixesApplied: [],
};

/**
 * Connect to MongoDB with automated issue resolution
 */
async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // 1. Apply DNS fix for cloud container environments (Render / Docker)
  const dnsResult = applyDnsFix();
  console.log(`[MongoDB Doctor] ${dnsResult.message}`);

  // 2. Fetch and sanitize/repair MongoDB URI
  const rawUri = process.env.MONGODB_URI;
  if (!rawUri) {
    const errorMsg = 'CRITICAL: MONGODB_URI environment variable is missing.';
    console.error(`[MongoDB Error] ${errorMsg}`);
    connectionDiagnostics.status = 'error';
    connectionDiagnostics.error = errorMsg;
    return null;
  }

  const diagnosis = diagnoseAndFix(rawUri);
  connectionDiagnostics.sanitizedUri = diagnosis.sanitizedUri;
  connectionDiagnostics.fixesApplied = diagnosis.fixesApplied;

  if (diagnosis.fixesApplied.length > 0) {
    console.log('[MongoDB Doctor] Auto-fixes applied to connection string:');
    diagnosis.fixesApplied.forEach((fix) => console.log(`  ✓ ${fix}`));
  }

  console.log(`[MongoDB Doctor] Connecting to: ${diagnosis.sanitizedUri}`);

  // 3. Connect with robust timeout & pool settings
  const options = {
    serverSelectionTimeoutMS: 10000, // Timeout after 10s if cluster unreachable
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    minPoolSize: 1,
  };

  try {
    const conn = await mongoose.connect(diagnosis.repairedUri, options);
    isConnected = true;
    connectionDiagnostics.status = 'connected';
    connectionDiagnostics.lastConnected = new Date().toISOString();
    connectionDiagnostics.error = null;

    console.log(`[MongoDB Success] Connected to MongoDB Atlas host: ${conn.connection.host}`);
    console.log(`[MongoDB Success] Database: ${conn.connection.name}`);

    // Event listeners
    mongoose.connection.on('error', (err) => {
      console.error('[MongoDB Error] Runtime error:', err.message);
      connectionDiagnostics.status = 'error';
      connectionDiagnostics.error = err.message;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB Warning] Lost connection. Attempting auto-reconnect...');
      isConnected = false;
      connectionDiagnostics.status = 'reconnecting';
    });

    return conn;
  } catch (error) {
    isConnected = false;
    connectionDiagnostics.status = 'failed';
    connectionDiagnostics.error = error.message;

    console.error('[MongoDB Critical] Connection failed:', error.message);
    console.error('\n--- MongoDB URI Troubleshooting Guide ---');
    console.error('1. Check Atlas IP Access List: Ensure 0.0.0.0/0 is added in Network Access.');
    console.error('2. Check Database User: Ensure user exists and has readWriteAnyDatabase permission.');
    console.error('3. Check Special Characters: The URI Doctor has encoded your credentials.');
    console.error('4. Check DNS: Render requires public DNS resolvers, which have been configured.');
    console.error('-----------------------------------------\n');

    return null;
  }
}

function getConnectionDiagnostics() {
  return {
    ...connectionDiagnostics,
    readyState: mongoose.connection.readyState,
    readyStateDescription: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown',
  };
}

module.exports = {
  connectDB,
  getConnectionDiagnostics,
};
