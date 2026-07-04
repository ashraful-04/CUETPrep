const StudyLog = require('../models/StudyLog');
const MockTest = require('../models/MockTest');

// @desc    Get user analytics data
// @route   GET /api/analytics
// @access  Private
const getAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch all logs and mock tests
    const studyLogs = await StudyLog.find({ userId });
    const mockTests = await MockTest.find({ userId }).sort({ testDate: 1 }); // Sort ascending for trend

    // 1. Total Study Time & Most Studied Subject & Study Time Distribution
    let totalStudyTime = 0;
    const subjectHours = {};

    studyLogs.forEach(log => {
      totalStudyTime += (log.durationHours || 0);
      if (log.subject) {
        if (!subjectHours[log.subject]) subjectHours[log.subject] = 0;
        subjectHours[log.subject] += (log.durationHours || 0);
      }
    });

    let mostStudied = { name: 'N/A', hours: 0 };
    const studyDistribution = [];
    
    for (const [subject, hours] of Object.entries(subjectHours)) {
      studyDistribution.push({ name: subject, value: hours });
      if (hours > mostStudied.hours) {
        mostStudied = { name: subject, hours };
      }
    }

    // 2. Best Score, Worst Score & Score Trend
    let bestScore = null;
    let worstScore = null;
    let worstScoreDate = null;
    const scoreTrend = [];

    mockTests.forEach(test => {
      const percentage = Math.round((test.score / (test.totalQuestions * 4)) * 100);
      
      if (bestScore === null || percentage > bestScore) bestScore = percentage;
      if (worstScore === null || percentage < worstScore) {
        worstScore = percentage;
        worstScoreDate = test.testDate;
      }

      scoreTrend.push({
        date: new Date(test.testDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        score: percentage
      });
    });

    // 3. Focus Area Detected (Weakest Subject)
    const subjectStats = {};
    mockTests.forEach(test => {
      if (test.questions && test.questions.length > 0) {
        test.questions.forEach(q => {
          if (!q.subject) return;
          if (!subjectStats[q.subject]) subjectStats[q.subject] = { correct: 0, total: 0 };
          
          subjectStats[q.subject].total++;
          if (q.isCorrect) subjectStats[q.subject].correct++;
        });
      }
    });

    let weakestSubject = { name: 'None', percentage: 100, recommended: [] };
    const sectionPerformance = [];
    
    for (const [subject, stats] of Object.entries(subjectStats)) {
      if (stats.total > 0) {
        const perc = Math.round((stats.correct / stats.total) * 100);
        sectionPerformance.push({ subject, score: perc });
        if (perc < weakestSubject.percentage) {
          weakestSubject.name = subject;
          weakestSubject.percentage = perc;
        }
      }
    }

    // Dummy recommendations based on subject
    const recs = {
      'Mathematics': ['Integration', 'Probability'],
      'Computers': ['Operating Systems', 'Data Structures'],
      'Reasoning': ['Number Series', 'Syllogisms']
    };
    if (weakestSubject.name !== 'None') {
      weakestSubject.recommended = recs[weakestSubject.name] || ['Core Basics'];
    }

    // Build the final response
    res.status(200).json({
      quickStats: {
        totalTests: mockTests.length,
        bestScore: bestScore !== null ? `${bestScore}%` : 'N/A',
        worstScore: worstScore !== null ? `${worstScore}%` : 'N/A',
        worstScoreDate: worstScoreDate,
        mostStudied: mostStudied.name,
        mostStudiedHours: mostStudied.hours,
        totalStudyTime: totalStudyTime
      },
      focusArea: weakestSubject,
      scoreTrend,
      studyDistribution,
      sectionPerformance
    });

  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAnalytics };
