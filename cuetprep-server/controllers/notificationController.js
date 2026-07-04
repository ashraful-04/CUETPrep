const User = require('../models/User');
const webpush = require('web-push');

// Configuration for web-push
// In a real app, use a real email address
webpush.setVapidDetails(
  'mailto:contact@cuetprep.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// @desc    Save user's push subscription
// @route   POST /api/notifications/subscribe
// @access  Private
const subscribeUser = async (req, res) => {
  try {
    const { subscription } = req.body;
    
    // Save to user document
    await User.findByIdAndUpdate(req.user._id, {
      pushSubscription: subscription
    });

    res.status(200).json({ message: 'Subscription saved successfully.' });
  } catch (error) {
    console.error('Error saving subscription:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Send a test push notification
// @route   POST /api/notifications/test
// @access  Private
const testPushNotification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user || !user.pushSubscription) {
      return res.status(400).json({ message: 'User is not subscribed to push notifications.' });
    }

    const payload = JSON.stringify({
      title: 'CUETPrep Push Test',
      body: 'It works! You will now receive study reminders here.',
      icon: '/vite.svg', // Assuming vite.svg is available in public folder
      badge: '/vite.svg'
    });

    await webpush.sendNotification(user.pushSubscription, payload);
    
    res.status(200).json({ message: 'Test notification sent.' });
  } catch (error) {
    console.error('Error sending push notification:', error);
    // If the subscription is invalid/expired, we might want to remove it
    if (error.statusCode === 410) {
      await User.findByIdAndUpdate(req.user._id, { pushSubscription: null });
      return res.status(410).json({ message: 'Subscription expired and removed.' });
    }
    res.status(500).json({ message: 'Failed to send notification.' });
  }
};

module.exports = {
  subscribeUser,
  testPushNotification
};
