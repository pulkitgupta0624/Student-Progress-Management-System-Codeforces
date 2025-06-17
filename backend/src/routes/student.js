const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// Student CRUD routes
router.get('/', studentController.getAllStudents);
router.get('/export/csv', studentController.exportStudentsCSV);
router.get('/:id', studentController.getStudentById);
router.get('/:id/codeforces', studentController.getStudentCodeforcesData); // Add this line
router.post('/', studentController.createStudent);
router.put('/:id', studentController.updateStudent);
router.delete('/:id', studentController.deleteStudent);
router.post('/:id/sync', studentController.syncStudentData); // Add this line too

module.exports = router;