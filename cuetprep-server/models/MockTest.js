const mongoose = require('mongoose');

const mockTestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  testDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  score: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  sections: {
    type: Map,
    of: Number,
    default: {}
  },
  questions: [{
    questionText: String,
    options: [String],
    correctAnswer: String,
    userAnswer: String,
    isCorrect: Boolean,
    explanation: String,
    subject: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('MockTest', mockTestSchema);
