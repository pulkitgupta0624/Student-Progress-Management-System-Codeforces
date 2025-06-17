const express = require('express');
const router = express.Router();
const codeforcesController = require('../controllers/codeforcesController');

router.post('/sync-all', codeforcesController.syncAllStudents);
router.get('/analytics/:studentId', codeforcesController.getStudentAnalytics);

module.exports = router;