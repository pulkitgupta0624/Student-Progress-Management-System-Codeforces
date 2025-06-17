const mongoose = require('mongoose');

// More flexible submission schema that matches actual Codeforces API
const submissionSchema = new mongoose.Schema({
  id: { type: Number, required: false },
  contestId: { type: Number, required: false },
  creationTimeSeconds: { type: Number, required: false },
  relativeTimeSeconds: { type: Number, required: false },
  problem: {
    contestId: { type: Number, required: false },
    index: { type: String, required: false },
    name: { type: String, required: false },
    type: { type: String, required: false },
    rating: { type: Number, required: false },
    tags: [{ type: String, required: false }]
  },
  author: {
    contestId: { type: Number, required: false },
    members: [{
      handle: { type: String, required: false }
    }],
    participantType: { type: String, required: false },
    ghost: { type: Boolean, required: false },
    startTimeSeconds: { type: Number, required: false }
  },
  programmingLanguage: { type: String, required: false },
  verdict: { type: String, required: false },
  testset: { type: String, required: false },
  passedTestCount: { type: Number, required: false },
  timeConsumedMillis: { type: Number, required: false },
  memoryConsumedBytes: { type: Number, required: false }
}, { _id: false, strict: false });

// Flexible contest schema
const contestSchema = new mongoose.Schema({
  contestId: { type: Number, required: false },
  contestName: { type: String, required: false },
  handle: { type: String, required: false },
  rank: { type: Number, required: false },
  ratingUpdateTimeSeconds: { type: Number, required: false },
  oldRating: { type: Number, required: false },
  newRating: { type: Number, required: false }
}, { _id: false, strict: false });

const codeforcesDataSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  handle: {
    type: String,
    required: true,
    lowercase: true
  },
  submissions: [submissionSchema],
  contests: [contestSchema],
  userInfo: {
    type: mongoose.Schema.Types.Mixed, // Allow any structure
    required: false
  },
  lastSyncTime: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  strict: false // Allow additional fields
});

codeforcesDataSchema.index({ studentId: 1 });
codeforcesDataSchema.index({ handle: 1 });
codeforcesDataSchema.index({ lastSyncTime: 1 });

module.exports = mongoose.model('CodeforcesData', codeforcesDataSchema);