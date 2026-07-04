const express = require('express');
const router = express.Router();
const { register, login, deleteData } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.delete('/data', protect, deleteData);

module.exports = router;
