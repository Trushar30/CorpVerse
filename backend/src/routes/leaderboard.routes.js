const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const {
  getLeaderboard,
  getMyRank,
  getBadges,
} = require('../controllers/leaderboard.controller');

// ─────────────────────────────────────────────────────
// LEADERBOARD ROUTES
// All routes require authentication
// ─────────────────────────────────────────────────────

router.use(requireAuth);

// GET /api/leaderboard?domain=Technology&period=weekly&page=1&limit=20
router.get('/', getLeaderboard);

// GET /api/leaderboard/my-rank
router.get('/my-rank', getMyRank);

// GET /api/leaderboard/badges
router.get('/badges', getBadges);

module.exports = router;
