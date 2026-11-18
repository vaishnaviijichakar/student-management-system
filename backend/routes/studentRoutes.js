const express = require('express');
const router = express.Router();
const {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  seedStudents,
  getStudentStats,
} = require('../controllers/studentController');

router.route('/').get(getStudents).post(createStudent);
router.route('/stats/summary').get(getStudentStats);
router.route('/seed').post(seedStudents);
router.route('/:id').get(getStudentById).put(updateStudent).delete(deleteStudent);

module.exports = router;
