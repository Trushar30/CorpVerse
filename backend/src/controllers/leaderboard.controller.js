const { User, Company } = require('../models');
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

/**
 * @desc    Get top users ranked by CorpCoins
 * @route   GET /api/leaderboard/wealth
 * @access  Public
 */
const getWealthLeaderboard = asyncHandler(async (req, res) => {
  const { limit = 20 } = req.query;
  const users = await User.find({ isVerified: true, role: { $ne: 'admin' } })
    .select('name avatarUrl corpCoins currentStatus domainInterest role')
    .sort({ corpCoins: -1 })
    .limit(parseInt(limit, 10))
    .lean();

  return ApiResponse.ok(users, 'Wealth leaderboard retrieved').send(res);
});

/**
 * @desc    Get top founder companies ranked by valuation
 * @route   GET /api/leaderboard/companies
 * @access  Public
 */
const getCompanyLeaderboard = asyncHandler(async (req, res) => {
  const { limit = 20 } = req.query;
  const companies = await Company.find({ isSuspended: false })
    .populate('founder', 'name avatarUrl')
    .select('name domain valuation treasury employeeCount logoUrl isSeedCompany')
    .sort({ valuation: -1 })
    .limit(parseInt(limit, 10))
    .lean();

  return ApiResponse.ok(companies, 'Company leaderboard retrieved').send(res);
});

module.exports = {
  getLeaderboard,
  getMyRank,
  getBadges,
  getWealthLeaderboard,
  getCompanyLeaderboard,
};

