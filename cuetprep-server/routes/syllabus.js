const express = require('express');
const router = express.Router();
const { getSyllabusProgress, updateTopicStatus } = require('../controllers/syllabusController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getSyllabusProgress);
router.put('/topic', protect, updateTopicStatus);

module.exports = router;
