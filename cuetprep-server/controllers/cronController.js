const { sendStudyReminders } = require('../cron/notificationCron');

// @desc    Trigger the daily study-reminder push job
// @route   POST /api/cron/notify
// @access  Cron secret (x-cron-secret header)
const triggerReminders = async (req, res) => {
  try {
    const result = await sendStudyReminders();
    res.status(200).json({ message: 'Study reminders processed.', ...result });
  } catch (error) {
    console.error('[CRON] Error triggering reminders:', error);
    res.status(500).json({ message: 'Failed to process reminders.' });
  }
};

module.exports = { triggerReminders };
