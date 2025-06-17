const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  cronSchedule: {
    type: String,
    default: '0 2 * * *' // 2 AM daily
  },
  cronFrequency: {
    type: String,
    enum: ['hourly', 'daily', 'weekly'],
    default: 'daily'
  },
  inactivityThreshold: {
    type: Number,
    default: 7 // days
  },
  emailEnabled: {
    type: Boolean,
    default: true
  },
  lastCronRun: {
    type: Date,
    default: null
  },
  adminEmail: {
    type: String,
    default: process.env.ADMIN_EMAIL
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema);