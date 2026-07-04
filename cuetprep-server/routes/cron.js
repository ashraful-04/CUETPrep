const express = require('express');
const router = express.Router();
const { verifyCronSecret } = require('../middleware/cronAuth');
const { triggerReminders } = require('../controllers/cronController');

// External schedulers (e.g. cron-job.org) hit this instead of relying on
// the in-process node-cron, which pauses when free hosting sleeps.
router.post('/notify', verifyCronSecret, triggerReminders);

module.exports = router;
