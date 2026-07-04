const mongoose = require('mongoose');

const TopicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  status: { type: String, enum: ['Not Started', 'In Progress', 'Completed'], default: 'Not Started' }
});

const SubjectSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. 'math', 'cs', 'reason'
  displayName: { type: String, required: true },
  topics: [TopicSchema]
});

const SyllabusSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  subjects: [SubjectSchema]
}, { timestamps: true });

module.exports = mongoose.model('Syllabus', SyllabusSchema);
