const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: [true, 'Student ID is required'],
      unique: true,
      uppercase: true,
      trim: true,
      match: [/^[A-Z0-9-]{3,20}$/, 'Student ID must be 3 to 20 letters, digits or hyphens'],
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must have at least 2 characters'],
      maxlength: [80, 'Name must have at most 80 characters'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Enter a valid email address'],
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      maxlength: [80, 'Department must have at most 80 characters'],
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: [1, 'Semester must be between 1 and 8'],
      max: [8, 'Semester must be between 1 and 8'],
      validate: { validator: Number.isInteger, message: 'Semester must be a whole number' },
      cast: 'Semester must be a number between 1 and 8',
    },
    contact: {
      type: String,
      trim: true,
      match: [/^\d{10}$/, 'Contact must be a 10-digit number'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema, 'students');
