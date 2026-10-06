const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const profileRoutes = require('./profile.routes');
const companyRoutes = require('./company.routes');
const domainRoutes = require('./domain.routes');
const applicationRoutes = require('./application.routes');
const interviewRoutes = require('./interview.routes');
const employeeRoutes = require('./employee.routes');
const founderRoutes = require('./founder.routes');
const adminRoutes = require('./admin.routes');
const aiManagerRoutes = require('./aiManager.routes');
const marketplaceRoutes = require('./marketplace.routes');
const leaderboardRoutes = require('./leaderboard.routes');
const trainingRoutes = require('./training.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/companies', companyRoutes);
router.use('/domains', domainRoutes);
router.use('/applications', applicationRoutes);
router.use('/interviews', interviewRoutes);
router.use('/employee', employeeRoutes);
router.use('/founder', founderRoutes);
router.use('/admin', adminRoutes);
router.use('/ai-manager', aiManagerRoutes);
router.use('/marketplace', marketplaceRoutes);
router.use('/leaderboard', leaderboardRoutes);
router.use('/training', trainingRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'CorpVerse API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

module.exports = router;
