// Optional: inserts sample students (skips IDs that already exist).
// Run with:  npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const connectDatabase = require('./config/database');
const Student = require('./models/Student');

const samples = [
  { studentId: 'ST101', name: 'Rahul Sharma', email: 'rahul@example.com', department: 'Computer Science', semester: 5, contact: '9876543210' },
  { studentId: 'ST102', name: 'Priya Patil', email: 'priya@example.com', department: 'Information Technology', semester: 3, contact: '9123456780' },
  { studentId: 'ST103', name: 'Amit Deshmukh', email: 'amit@example.com', department: 'Electronics', semester: 7, contact: '9988776655' },
  { studentId: 'ST104', name: 'Sneha Kulkarni', email: 'sneha@example.com', department: 'Mechanical', semester: 2, contact: '9012345678' },
];

(async () => {
  try {
    await connectDatabase();
    const result = await Student.bulkWrite(
      samples.map((s) => ({
        updateOne: { filter: { studentId: s.studentId }, update: { $setOnInsert: s }, upsert: true },
      }))
    );
    console.log(`Seed complete. Inserted ${result.upsertedCount} new student(s).`);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
