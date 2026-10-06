const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const {
  getLeaderboard,
  getMyRank,
  getBadges,
  getWealthLeaderboard,
  getCompanyLeaderboard,
} = require('../controllers/leaderboard.controller');

// ─────────────────────────────────────────────────────
// LEADERBOARD ROUTES
// ─────────────────────────────────────────────────────

// Public leaderboard endpoints
router.get('/', getLeaderboard);
router.get('/wealth', getWealthLeaderboard);
router.get('/companies', getCompanyLeaderboard);

// Authenticated user rankings & badges
router.get('/my-rank', requireAuth, getMyRank);
router.get('/badges', requireAuth, getBadges);

module.exports = router;

