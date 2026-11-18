/**
 * Standalone MongoDB URI Diagnostic & Test Runner
 * Run with: node test-mongo.js "<YOUR_MONGODB_URI>"
 * Or with:  node test-mongo.js (reads from .env)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { applyDnsFix, diagnoseAndFix } = require('./config/mongoUriDoctor');

async function testConnection() {
  const targetUri = process.argv[2] || process.env.MONGODB_URI;

  console.log('====================================================');
  console.log('   MongoDB URI Health & Diagnostic Solver (CC_CA2)  ');
  console.log('====================================================');

  if (!targetUri) {
    console.error('❌ Error: No MongoDB URI provided.');
    console.log('Usage: node test-mongo.js "mongodb+srv://user:pass@cluster.mongodb.net/dbname"');
    console.log('Or add MONGODB_URI to your .env file.\n');
    process.exit(1);
  }

  // 1. Analyze URI
  console.log('\n[1/3] Analyzing MongoDB URI with URI Doctor...');
  const diagnosis = diagnoseAndFix(targetUri);

  console.log(`- Sanitized URI: ${diagnosis.sanitizedUri}`);
  if (diagnosis.issuesFound.length > 0) {
    console.log('\n⚠️  Issues Detected:');
    diagnosis.issuesFound.forEach((issue) => console.log(`   - ${issue}`));
  } else {
    console.log('✓ No obvious URI structure issues.');
  }

  if (diagnosis.fixesApplied.length > 0) {
    console.log('\n🔧 Auto-Fixes Applied:');
    diagnosis.fixesApplied.forEach((fix) => console.log(`   ✔ ${fix}`));
  }

  // 2. Apply DNS Fix
  console.log('\n[2/3] Configuring High-Reliability Cloud DNS...');
  const dnsRes = applyDnsFix();
  console.log(`✓ ${dnsRes.message}`);

  // 3. Attempt Connection
  console.log('\n[3/3] Attempting connection to MongoDB Atlas...');
  try {
    const conn = await mongoose.connect(diagnosis.repairedUri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
    });

    console.log('\n====================================================');
    console.log('🎉 CONNECTION SUCCESSFUL!');
    console.log(`- Host:     ${conn.connection.host}`);
    console.log(`- Database: ${conn.connection.name}`);
    console.log(`- Port:     ${conn.connection.port}`);
    console.log('====================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('\n====================================================');
    console.error('❌ CONNECTION FAILED:');
    console.error(`- Error: ${err.message}`);
    console.error('----------------------------------------------------');
    console.error('PROVEN SOLUTIONS:');
    if (err.message.includes('querySrv ENOTFOUND') || err.message.includes('ESERVFAIL')) {
      console.error('👉 DNS SRV failure: Use the non-SRV standard connection string from Atlas');
      console.error('   or ensure public DNS (8.8.8.8) is reachable.');
    } else if (err.message.includes('bad auth') || err.message.includes('Authentication failed')) {
      console.error('👉 Authentication Failed:');
      console.error('   1. Verify your database username and password in Atlas -> Database Access.');
      console.error('   2. Ensure special characters in password are URL encoded (e.g. @ becomes %40).');
    } else if (err.message.includes('Server selection timed out') || err.message.includes('connection timed out')) {
      console.error('👉 Network Access / IP Whitelist:');
      console.error('   In MongoDB Atlas -> Network Access -> Add IP Address: 0.0.0.0/0 (Allow access from anywhere).');
      console.error('   Render and Vercel will FAIL without 0.0.0.0/0 because their IPs change dynamically.');
    }
    console.error('====================================================\n');
    process.exit(1);
  }
}

testConnection();
