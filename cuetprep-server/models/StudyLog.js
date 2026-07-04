const mongoose = require('mongoose');

const studyLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  subject: {
    type: String,
    required: true,
    enum: ['Mathematics', 'Computers', 'Reasoning']
  },
  description: {
    type: String,
    required: true
  },
  durationHours: {
    type: Number,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('StudyLog', studyLogSchema);
