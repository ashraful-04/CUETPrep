const express = require('express');
const router = express.Router();
const { generateMockTest, submitMockTest, getMockTestById, getMockTestHistory, deleteMockTest } = require('../controllers/mockTestController');
const { protect } = require('../middleware/auth');

router.post('/generate', protect, generateMockTest);
router.post('/submit', protect, submitMockTest);
router.get('/history', protect, getMockTestHistory);
router.get('/:id', protect, getMockTestById);
router.delete('/:id', protect, deleteMockTest);

module.exports = router;
