const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  targetExam: {
    type: String,
    default: 'CUET PG MCA'
  },
  streakDays: {
    type: Number,
    default: 0
  },
  lastLogDate: {
    type: Date
  },
  totalStudyHours: {
    type: Number,
    default: 0
  },
  pushSubscription: {
    type: Object,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
