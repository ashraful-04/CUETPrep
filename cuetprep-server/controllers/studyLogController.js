const StudyLog = require('../models/StudyLog');
const User = require('../models/User');

// @desc    Get all study logs for user
// @route   GET /api/studylog
// @access  Private
const getStudyLogs = async (req, res) => {
  try {
    const logs = await StudyLog.find({ userId: req.user._id }).sort({ createdAt: -1 });
    const user = await User.findById(req.user._id).select('streakDays totalStudyHours lastLogDate');
    
    res.status(200).json({
      logs,
      streakDays: user.streakDays || 0,
      totalStudyHours: user.totalStudyHours || 0,
      lastLogDate: user.lastLogDate
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add a new study log
// @route   POST /api/studylog
// @access  Private
const addStudyLog = async (req, res) => {
  const { subject, description, durationHours, date } = req.body;

  if (!subject || !description || !durationHours) {
    return res.status(400).json({ message: 'Please provide subject, description, and durationHours' });
  }

  try {
    const logDate = date ? new Date(date) : new Date();
    
    const log = await StudyLog.create({
      userId: req.user._id,
      subject,
      description,
      durationHours,
      date: logDate
    });

    const user = await User.findById(req.user._id);
    user.totalStudyHours = (user.totalStudyHours || 0) + Number(durationHours);
    user.streakDays = user.streakDays || 0;
    
    // Streak logic
    const todayStr = logDate.toISOString().split('T')[0];
    const lastLogStr = user.lastLogDate ? user.lastLogDate.toISOString().split('T')[0] : null;

    if (!lastLogStr) {
      // First log ever
      user.streakDays = 1;
      user.lastLogDate = logDate;
    } else if (todayStr !== lastLogStr) {
      // Check if the difference is exactly 1 day
      const todayDate = new Date(todayStr);
      const lastDate = new Date(lastLogStr);
      const diffTime = Math.abs(todayDate - lastDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      if (diffDays === 1) {
        user.streakDays += 1; // Logged consecutive day
      } else if (diffDays > 1) {
        user.streakDays = 1; // Streak broken, reset to 1
      }
      user.lastLogDate = logDate;
    }
    // If todayStr === lastLogStr, they already logged today, streak remains unchanged
    
    await user.save();

    res.status(201).json(log);
  } catch (error) {
    console.error("API ERROR:", error);
    require('fs').appendFileSync('error.log', new Date().toISOString() + ' ' + error.message + '\n' + error.stack + '\n');
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getStudyLogs, addStudyLog };
