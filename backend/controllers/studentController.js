const Student = require('../models/Student');
const mongoose = require('mongoose');

// Helper: check if DB is connected
const checkDB = () => mongoose.connection.readyState === 1;

/**
 * @desc    Get all students with optional search, filter & pagination
 * @route   GET /api/students
 */
exports.getStudents = async (req, res) => {
  try {
    if (!checkDB()) {
      return res.status(503).json({
        success: false,
        message: 'Database currently disconnected. Check MongoDB connection settings.',
      });
    }

    const { department, status, search, year } = req.query;
    const filter = {};

    if (department && department !== 'All') {
      filter.department = department;
    }
    if (status && status !== 'All') {
      filter.status = status;
    }
    if (year) {
      filter.year = Number(year);
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const students = await Student.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch students',
      error: error.message,
    });
  }
};

/**
 * @desc    Get single student by ID
 * @route   GET /api/students/:id
 */
exports.getStudentById = async (req, res) => {
  try {
    if (!checkDB()) {
      return res.status(503).json({ success: false, message: 'Database disconnected' });
    }

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    return res.status(200).json({ success: true, data: student });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Create new student
 * @route   POST /api/students
 */
exports.createStudent = async (req, res) => {
  try {
    if (!checkDB()) {
      return res.status(503).json({ success: false, message: 'Database disconnected' });
    }

    const { name, rollNumber, email, department, year, semester, gpa, status, courses } = req.body;

    // Check duplicate roll number or email
    const existing = await Student.findOne({
      $or: [{ rollNumber: rollNumber?.toUpperCase() }, { email: email?.toLowerCase() }],
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A student with this Roll Number or Email already exists',
      });
    }

    const student = await Student.create({
      name,
      rollNumber,
      email,
      department,
      year: year || 1,
      semester: semester || 1,
      gpa: gpa || 8.0,
      status: status || 'Active',
      courses: courses || ['Cloud Computing', 'Database Systems'],
    });

    return res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: student,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Failed to create student',
      error: error.message,
    });
  }
};

/**
 * @desc    Update student details
 * @route   PUT /api/students/:id
 */
exports.updateStudent = async (req, res) => {
  try {
    if (!checkDB()) {
      return res.status(503).json({ success: false, message: 'Database disconnected' });
    }

    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: student,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Failed to update student',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete student
 * @route   DELETE /api/students/:id
 */
exports.deleteStudent = async (req, res) => {
  try {
    if (!checkDB()) {
      return res.status(503).json({ success: false, message: 'Database disconnected' });
    }

    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Student deleted successfully',
      data: student,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Seed initial dummy students
 * @route   POST /api/students/seed
 */
exports.seedStudents = async (req, res) => {
  try {
    if (!checkDB()) {
      return res.status(503).json({ success: false, message: 'Database disconnected' });
    }

    const sampleStudents = [
      {
        name: 'Aarav Sharma',
        rollNumber: 'CS2026-001',
        email: 'aarav.sharma@college.edu',
        department: 'Computer Science',
        year: 3,
        semester: 6,
        gpa: 9.4,
        status: 'Active',
        courses: ['Cloud Computing', 'Distributed Systems', 'DevOps & MCP'],
      },
      {
        name: 'Priya Patel',
        rollNumber: 'IT2026-042',
        email: 'priya.patel@college.edu',
        department: 'Information Technology',
        year: 4,
        semester: 7,
        gpa: 8.9,
        status: 'Active',
        courses: ['Cloud Computing', 'Information Security', 'Microservices'],
      },
      {
        name: 'Rohan Verma',
        rollNumber: 'DS2026-015',
        email: 'rohan.verma@college.edu',
        department: 'Data Science',
        year: 2,
        semester: 4,
        gpa: 9.1,
        status: 'Active',
        courses: ['Machine Learning', 'Big Data Analytics', 'Cloud Computing'],
      },
      {
        name: 'Ananya Iyer',
        rollNumber: 'EC2026-088',
        email: 'ananya.iyer@college.edu',
        department: 'Electronics & Communication',
        year: 3,
        semester: 5,
        gpa: 8.7,
        status: 'Active',
        courses: ['Embedded Systems', 'IoT Architecture', 'Signals'],
      },
      {
        name: 'Vikram Singh',
        rollNumber: 'ME2026-104',
        email: 'vikram.singh@college.edu',
        department: 'Mechanical Engineering',
        year: 4,
        semester: 8,
        gpa: 7.9,
        status: 'Graduated',
        courses: ['Thermodynamics', 'Robotics Automation'],
      },
    ];

    // Upsert so re-running seed doesn't crash on duplicates
    const operations = sampleStudents.map((s) => ({
      updateOne: {
        filter: { rollNumber: s.rollNumber },
        update: { $set: s },
        upsert: true,
      },
    }));

    await Student.bulkWrite(operations);
    const count = await Student.countDocuments();

    return res.status(200).json({
      success: true,
      message: 'Sample students seeded successfully',
      totalStudents: count,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Get dashboard metrics / stats
 * @route   GET /api/students/stats/summary
 */
exports.getStudentStats = async (req, res) => {
  try {
    if (!checkDB()) {
      return res.status(200).json({
        success: true,
        data: {
          total: 0,
          active: 0,
          graduated: 0,
          avgGpa: 0,
          dbStatus: 'disconnected',
        },
      });
    }

    const total = await Student.countDocuments();
    const active = await Student.countDocuments({ status: 'Active' });
    const graduated = await Student.countDocuments({ status: 'Graduated' });

    const gpaAgg = await Student.aggregate([
      { $group: { _id: null, avgGpa: { $avg: '$gpa' } } },
    ]);
    const avgGpa = gpaAgg.length > 0 ? parseFloat(gpaAgg[0].avgGpa.toFixed(2)) : 0;

    return res.status(200).json({
      success: true,
      data: {
        total,
        active,
        graduated,
        avgGpa,
        dbStatus: 'connected',
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
