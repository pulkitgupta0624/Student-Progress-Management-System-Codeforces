const Settings = require('../models/Settings');
const cronService = require('../services/cronService');

exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCronSchedule = async (req, res) => {
  try {
    const { schedule } = req.body;
    
    await cronService.updateSyncSchedule(schedule);
    
    await Settings.findOneAndUpdate(
      {},
      { cronSchedule: schedule },
      { upsert: true }
    );
    
    res.json({ message: 'Cron schedule updated successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.manualSync = async (req, res) => {
  try {
    const results = await cronService.manualSync();
    res.json({
      message: 'Manual sync completed',
      results
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};