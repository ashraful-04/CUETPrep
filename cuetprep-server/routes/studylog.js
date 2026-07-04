const express = require('express');
const router = express.Router();
const { getStudyLogs, addStudyLog } = require('../controllers/studyLogController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getStudyLogs)
  .post(protect, addStudyLog);

module.exports = router;
