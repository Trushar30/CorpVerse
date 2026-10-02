const gamificationService = require('../services/gamification.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// ─────────────────────────────────────────────────────
// LEADERBOARD CONTROLLER
// Handles global and domain-filtered leaderboards,
// personal rank / percentile lookups, and user badges.
// ─────────────────────────────────────────────────────

/**
 * GET /api/leaderboard
 * Query params: domain, period ('weekly' | 'monthly' | 'all-time'), page, limit
 */
const getLeaderboard = asyncHandler(async (req, res) => {
  const { domain, period, page, limit } = req.query;

  const result = await gamificationService.getLeaderboard({
    domain,
    period,
    page,
    limit,
  });

  ApiResponse.ok(result, 'Leaderboard retrieved successfully').send(res);
});

/**
 * GET /api/leaderboard/my-rank
 * Retrieves user's global EXP rank, total active users, and percentile.
 */
const getMyRank = asyncHandler(async (req, res) => {
  const result = await gamificationService.getMyRank(req.user._id);
  ApiResponse.ok(result, 'Rank and percentile retrieved successfully').send(res);
});

/**
 * GET /api/leaderboard/badges
 * Retrieves all badges unlocked by the user and locked badge milestones.
 */
const getBadges = asyncHandler(async (req, res) => {
  const result = await gamificationService.getUserBadges(req.user._id);
  ApiResponse.ok(result, 'User badges retrieved successfully').send(res);
});

module.exports = {
  getLeaderboard,
  getMyRank,
  getBadges,
};
