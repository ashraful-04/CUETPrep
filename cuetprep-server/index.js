const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const dns = require('dns');

// Fix for Node.js 18+ fetch ConnectTimeoutError on Render (forces IPv4 first)
dns.setDefaultResultOrder('ipv4first');

const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const studyLogRoutes = require('./routes/studylog');
const mockTestRoutes = require('./routes/mocktest');
const syllabusRoutes = require('./routes/syllabus');
const analyticsRoutes = require('./routes/analytics');
const notificationRoutes = require('./routes/notification');
const cronRoutes = require('./routes/cron');

// Connect to Database
connectDB();

const app = express();

// Middleware
// Restrict CORS to the frontend origin(s) in CLIENT_URL (comma-separated).
// If CLIENT_URL is unset (local dev), allow all origins.
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((o) => o.trim())
  : true;
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/studylog', studyLogRoutes);
app.use('/api/mocktest', mockTestRoutes);
app.use('/api/syllabus', syllabusRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/cron', cronRoutes);

// Basic Route
app.get('/', (req, res) => {
  res.send('CUETPrep API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
