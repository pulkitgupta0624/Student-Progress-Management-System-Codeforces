const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');

router.get('/', settingsController.getSettings);
router.put('/cron', settingsController.updateCronSchedule);
router.post('/sync', settingsController.manualSync);

module.exports = router;