const mongoose = require('mongoose');
const Student = require('../models/Student');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const WRITABLE = ['name', 'email', 'department', 'semester', 'contact'];
const OPTIONAL = ['email', 'contact'];

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Copy only the allowed fields from the request body and trim strings.
const clean = (body, fields) => {
  const data = {};
  for (const field of fields) {
    if (body[field] === undefined) continue;
    data[field] = typeof body[field] === 'string' ? body[field].trim() : body[field];
  }
  return data;
};

// :id may be the studentId (ST101) or the MongoDB _id.
const findStudent = (id) => {
  const conditions = [{ studentId: String(id).toUpperCase() }];
  if (mongoose.isValidObjectId(id)) conditions.push({ _id: id });
  return Student.findOne({ $or: conditions });
};

const notFound = (res) => res.status(404).json({ success: false, message: 'Student not found' });

// GET /api/students  (optional ?search=term)
exports.getStudents = asyncHandler(async (req, res) => {
  const term = String(req.query.search || '').trim().slice(0, 60);
  const filter = {};
  if (term) {
    const pattern = new RegExp(escapeRegex(term), 'i');
    filter.$or = [{ studentId: pattern }, { name: pattern }, { email: pattern }, { department: pattern }];
  }
  const students = await Student.find(filter).sort({ createdAt: -1 }).limit(500).lean();
  res.json({ success: true, count: students.length, data: students });
});

// GET /api/students/:id
exports.getStudent = asyncHandler(async (req, res) => {
  const student = await findStudent(req.params.id);
  if (!student) return notFound(res);
  res.json({ success: true, data: student });
});

// POST /api/students
exports.createStudent = asyncHandler(async (req, res) => {
  const data = clean(req.body || {}, ['studentId', ...WRITABLE]);
  for (const field of OPTIONAL) {
    if (data[field] === '') delete data[field];
  }
  const student = await Student.create(data);
  res.status(201).json({ success: true, message: 'Student added successfully', data: student });
});

// PUT /api/students/:id
exports.updateStudent = asyncHandler(async (req, res) => {
  const student = await findStudent(req.params.id);
  if (!student) return notFound(res);

  const data = clean(req.body || {}, WRITABLE); // studentId cannot be changed
  for (const field of OPTIONAL) {
    if (data[field] === '') data[field] = undefined; // clears the field
  }
  student.set(data);
  await student.save();
  res.json({ success: true, message: 'Student updated successfully', data: student });
});

// DELETE /api/students/:id
exports.deleteStudent = asyncHandler(async (req, res) => {
  const student = await findStudent(req.params.id);
  if (!student) return notFound(res);
  await student.deleteOne();
  res.json({ success: true, message: 'Student deleted successfully' });
});
