const { Company, Role, Application, User } = require('../models');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const gamificationService = require('../services/gamification.service');

// ─────────────────────────────────────────────────────
// FOUNDER CONTROLLER
// Handles venture formation, role publishing, applicants, and CorpCoin treasury.
// ─────────────────────────────────────────────────────

/**
 * POST /api/founder/company
 * Founder creates their company venture and claims initial 10,000 CorpCoins grant.
 */
const createCompany = asyncHandler(async (req, res) => {
  const { name, domain, description, tagline } = req.body;
  if (!name || !domain) {
    throw ApiError.badRequest('Company name and domain are required');
  }

  const user = await User.findById(req.user._id);
  if (!user) throw ApiError.notFound('User not found');

  // Initial seed grant for first-time founders
  let initialTreasury = 10000;
  if (!user.hasReceivedFounderGrant) {
    user.hasReceivedFounderGrant = true;
    user.corpCoins = (user.corpCoins || 0) + 10000;
    user.role = 'founder';
    user.currentStatus = 'founder';
    await user.save();
  } else {
    initialTreasury = user.corpCoins > 0 ? user.corpCoins : 10000;
  }

  const company = await Company.create({
    name: name.trim(),
    domain: domain.trim(),
    description: description || 'Autonomous startup in CorpVerse.',
    tagline: tagline || '',
    founder: user._id,
    treasury: initialTreasury,
    valuation: 1000000,
  });

  // Award first_company badge
  await gamificationService.checkAndAwardBadges(user._id, 'company_created');

  ApiResponse.created({
    company,
    founderWallet: user.corpCoins,
  }, `🚀 Company "${company.name}" launched! Received 10,000 CorpCoins seed capital.`).send(res);
});

/**
 * POST /api/founder/role
 * Post an open job position for candidates.
 */
const postRole = asyncHandler(async (req, res) => {
  const { title, domain, level, description, requirements, responsibilities, salaryMin, salaryMax } = req.body;
  if (!title) {
    throw ApiError.badRequest('Role title is required');
  }

  let company = await Company.findOne({ founder: req.user._id });
  if (!company) {
    company = await Company.create({
      name: `${req.user.name.split(' ')[0]}'s Startup`,
      domain: domain || 'Technology',
      founder: req.user._id,
      treasury: 10000,
    });
  }

  const role = await Role.create({
    company: company._id,
    title: title.trim(),
    domain: domain || company.domain,
    level: level || 'mid',
    description: description || '',
    requirements: Array.isArray(requirements) ? requirements : [],
    responsibilities: Array.isArray(responsibilities) ? responsibilities : [],
    salaryRange: {
      min: Number(salaryMin) || 100000,
      max: Number(salaryMax) || 140000,
    },
    isOpen: true,
  });

  ApiResponse.created(role, `Role "${role.title}" published to market`).send(res);
});

/**
 * GET /api/founder/company
 * Retrieve founder's company profile, roles, and treasury balance.
 */
const getMyCompany = asyncHandler(async (req, res) => {
  let company = await Company.findOne({ founder: req.user._id });
  if (!company) {
    // If user is founder, ensure they have initial treasury ready
    const user = await User.findById(req.user._id);
    const coins = user?.corpCoins || 10000;

    company = await Company.create({
      name: `${req.user.name.split(' ')[0]} Labs`,
      domain: 'Technology',
      founder: req.user._id,
      treasury: coins,
      valuation: 1000000,
      description: 'Autonomous multi-agent enterprise in CorpVerse.',
    });
  }

  const roles = await Role.find({ company: company._id }).sort({ createdAt: -1 }).lean();

  ApiResponse.ok({
    company,
    roles,
  }, 'Company details retrieved').send(res);
});

/**
 * GET /api/founder/applicants
 * List job applicants for the company's roles.
 */
const getApplicants = asyncHandler(async (req, res) => {
  const company = await Company.findOne({ founder: req.user._id });
  if (!company) {
    return ApiResponse.ok([], 'No company found').send(res);
  }

  const applications = await Application.find({ company: company._id })
    .populate('role', 'title domain level')
    .populate('candidate', 'name email skills expTotal resumeUrl resumeMetadata')
    .sort({ createdAt: -1 })
    .lean();

  ApiResponse.ok(applications, 'Applicants retrieved').send(res);
});

/**
  * POST /api/founder/transition
  * User with 500+ EXP opts to transition to Founder role.
  */
const transitionToFounder = asyncHandler(async (req, res) => {
  const result = await gamificationService.transitionToFounder(req.user._id);
  ApiResponse.ok(result, result.message).send(res);
});

module.exports = {
  createCompany,
  postRole,
  getMyCompany,
  getApplicants,
  transitionToFounder,
};
