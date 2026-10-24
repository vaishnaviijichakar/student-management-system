const mongoose = require('mongoose');

const connectDatabase = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set. Add it to backend/.env (local) or to the Render environment variables.');
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, {
    dbName: process.env.DB_NAME || 'studentDB',
    serverSelectionTimeoutMS: 10000,
  });
  console.log(`MongoDB connected: database "${mongoose.connection.name}"`);
};

module.exports = connectDatabase;
