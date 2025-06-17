const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  codeforcesHandle: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  currentRating: {
    type: Number,
    default: 0
  },
  maxRating: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  emailRemindersEnabled: {
    type: Boolean,
    default: true
  },
  reminderCount: {
    type: Number,
    default: 0
  },
  lastReminderSent: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
studentSchema.index({ codeforcesHandle: 1 });
studentSchema.index({ email: 1 });
studentSchema.index({ lastUpdated: 1 });

module.exports = mongoose.model('Student', studentSchema);