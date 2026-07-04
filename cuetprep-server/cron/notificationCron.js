const webpush = require('web-push');
const User = require('../models/User');
const StudyLog = require('../models/StudyLog');

// Ensure web-push is configured with VAPID keys (safe to call more than once).
webpush.setVapidDetails(
  'mailto:contact@cuetprep.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Core logic: remind users who haven't logged study hours today.
// Reused by both the in-process cron and the external HTTP trigger.
const sendStudyReminders = async () => {
  // Start of today (local time) to match how study logs are stored.
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const users = await User.find({ pushSubscription: { $ne: null } });

  let sent = 0;
  let skipped = 0;

  for (const user of users) {
    // Skip users who already logged study time today.
    const hasStudiedToday = await StudyLog.findOne({
      userId: user._id,
      date: { $gte: today }
    });

    if (hasStudiedToday) {
      skipped++;
      continue;
    }

    const payload = JSON.stringify({
      title: 'Don\'t break your streak!',
      body: 'You haven\'t logged any study hours today. Hit the books!',
      icon: '/vite.svg',
      badge: '/vite.svg'
    });

    try {
      await webpush.sendNotification(user.pushSubscription, payload);
      sent++;
      console.log(`[CRON] Sent reminder to user: ${user.email}`);
    } catch (pushErr) {
      console.error(`[CRON] Failed to send push to ${user.email}:`, pushErr.message);
      // If subscription is expired/invalid, remove it.
      if (pushErr.statusCode === 410) {
        await User.findByIdAndUpdate(user._id, { pushSubscription: null });
      }
    }
  }

  return { total: users.length, sent, skipped };
};

module.exports = { sendStudyReminders };
