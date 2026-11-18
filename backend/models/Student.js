const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    rollNumber: {
      type: String,
      required: [true, 'Roll number is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      enum: {
        values: [
          'Computer Science',
          'Information Technology',
          'Electronics & Communication',
          'Mechanical Engineering',
          'Civil Engineering',
          'Electrical Engineering',
          'Data Science',
        ],
        message: '{VALUE} is not a supported department',
      },
    },
    year: {
      type: Number,
      required: [true, 'Academic year is required'],
      min: [1, 'Year must be at least 1'],
      max: [4, 'Year cannot exceed 4'],
      default: 1,
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: [1, 'Semester must be between 1 and 8'],
      max: [8, 'Semester must be between 1 and 8'],
      default: 1,
    },
    gpa: {
      type: Number,
      min: [0.0, 'GPA cannot be less than 0.0'],
      max: [10.0, 'GPA cannot exceed 10.0'],
      default: 8.0,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Graduated', 'Suspended'],
      default: 'Active',
    },
    courses: {
      type: [String],
      default: ['Cloud Computing', 'Database Management Systems'],
    },
  },
  {
    timestamps: true,
  }
);

// Virtual index for fast searching
studentSchema.index({ name: 'text', rollNumber: 'text', email: 'text' });

module.exports = mongoose.model('Student', studentSchema);
