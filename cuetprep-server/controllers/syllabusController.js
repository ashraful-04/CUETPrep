const Syllabus = require('../models/Syllabus');

const defaultSyllabus = [
  {
    name: 'math',
    displayName: 'Mathematics',
    topics: [
      { name: 'Set Theory' },
      { name: 'Probability and Statistics' },
      { name: 'Algebra' },
      { name: 'Coordinate Geometry' },
      { name: 'Calculus' }
    ]
  },
  {
    name: 'cs',
    displayName: 'Computer Science',
    topics: [
      { name: 'Operating System' },
      { name: 'Data Structure' },
      { name: 'Digital Fundamentals' }
    ]
  },
  {
    name: 'reason',
    displayName: 'Thinking and Decision Making',
    topics: [
      { name: 'Geometrical Designs' },
      { name: 'Analogies & Relations' },
      { name: 'Odd One Out' },
      { name: 'Numerical Series' },
      { name: 'Fill in the Blanks' },
      { name: 'Syllogisms' }
    ]
  }
];

// @desc    Get user's syllabus progress
// @route   GET /api/syllabus
// @access  Private
const getSyllabusProgress = async (req, res) => {
  try {
    let syllabus = await Syllabus.findOne({ userId: req.user._id });
    
    // If no syllabus exists for this user, create one using the defaults
    if (!syllabus) {
      syllabus = await Syllabus.create({
        userId: req.user._id,
        subjects: defaultSyllabus
      });
    }
    
    res.status(200).json(syllabus);
  } catch (error) {
    console.error('Error fetching syllabus:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a topic's status
// @route   PUT /api/syllabus/topic
// @access  Private
const updateTopicStatus = async (req, res) => {
  try {
    const { subjectName, topicName, status } = req.body;
    
    const syllabus = await Syllabus.findOne({ userId: req.user._id });
    if (!syllabus) {
      return res.status(404).json({ message: 'Syllabus not found' });
    }
    
    const subject = syllabus.subjects.find(s => s.name === subjectName);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    
    const topic = subject.topics.find(t => t.name === topicName);
    if (!topic) return res.status(404).json({ message: 'Topic not found' });
    
    topic.status = status;
    await syllabus.save();
    
    res.status(200).json(syllabus);
  } catch (error) {
    console.error('Error updating topic:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getSyllabusProgress, updateTopicStatus };
