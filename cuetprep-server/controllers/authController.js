const User = require('../models/User');
const StudyLog = require('../models/StudyLog');
const MockTest = require('../models/MockTest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Delete all user data (logs & tests)
// @route   DELETE /api/auth/data
// @access  Private
const deleteData = async (req, res) => {
  try {
    const userId = req.user._id;

    // Delete all study logs and mock tests
    await StudyLog.deleteMany({ userId });
    await MockTest.deleteMany({ userId });

    // Reset user stats
    await User.findByIdAndUpdate(userId, {
      totalStudyHours: 0,
      streakDays: 0,
      lastLogDate: null
    });

    res.status(200).json({ message: 'All study data has been successfully deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while deleting data' });
  }
};

module.exports = {
  register,
  login,
  deleteData
};
