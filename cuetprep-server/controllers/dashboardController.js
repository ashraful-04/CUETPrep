const User = require('../models/User');
const StudyLog = require('../models/StudyLog');
const MockTest = require('../models/MockTest');

// @desc    Get dashboard data
// @route   GET /api/dashboard
// @access  Private
const getDashboardData = async (req, res) => {
  try {
    const user = req.user;
    
    // Get recent study logs for the user
    const recentLogs = await StudyLog.find({ userId: user._id })
      .sort({ date: -1 })
      .limit(5);

    // Get mock test history
    const mockTests = await MockTest.find({ userId: user._id })
      .sort({ testDate: -1 });

    res.status(200).json({
      name: user.name,
      streakDays: user.streakDays,
      totalStudyHours: user.totalStudyHours,
      targetExam: user.targetExam,
      recentLogs,
      mockTests
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getDashboardData };
