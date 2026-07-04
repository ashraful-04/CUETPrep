const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { subscribeUser, testPushNotification } = require('../controllers/notificationController');

router.post('/subscribe', protect, subscribeUser);
router.post('/test', protect, testPushNotification);

module.exports = router;
