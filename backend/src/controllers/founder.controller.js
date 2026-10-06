const { Company, Role, Application, User, AIBot, BotPurchase } = require('../models');
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
 * @desc    Get all job applicants for the founder's company
 * @route   GET /api/founder/company/applicants
 * @access  Private (Founder)
 */
const getApplicants = asyncHandler(async (req, res) => {
  // 1. Locate company owned by the authenticated founder
  const company = await Company.findOne({ founder: req.user._id });
  if (!company) {
    return ApiResponse.ok([], 'No company registered for this founder').send(res);
  }

  // 2. Fetch all role IDs posted by this company
  const companyRoles = await Role.find({ company: company._id }).select('_id title domain level');
  const roleIds = companyRoles.map((r) => r._id);

  if (roleIds.length === 0) {
    return ApiResponse.ok([], 'No active roles posted yet').send(res);
  }

  // 3. Query applications matching those role IDs with populated applicant profile
  const applications = await Application.find({ role: { $in: roleIds } })
    .populate('role', 'title domain level requirements salaryRange')
    .populate('user', 'name email avatarUrl skills expTotal resumeUrl resumeMetadata currentStatus')
    .sort({ createdAt: -1 })
    .lean();

  // 4. Normalize response: attach backwards-compatible 'candidate' alias
  const normalizedApplications = applications.map((app) => ({
    ...app,
    candidate: app.user, // Alias so both app.candidate and app.user work
  }));

  return ApiResponse.ok(
    normalizedApplications,
    `Retrieved ${normalizedApplications.length} applicants successfully`
  ).send(res);
});

/**
  * POST /api/founder/transition
  * User with 500+ EXP opts to transition to Founder role.
  */
const transitionToFounder = asyncHandler(async (req, res) => {
  const result = await gamificationService.transitionToFounder(req.user._id);
  ApiResponse.ok(result, result.message).send(res);
});

/**
 * @desc    Get current company blueprint pipeline & purchased bots
 * @route   GET /api/founder/pipeline
 * @access  Private (Founder)
 */
const getPipeline = asyncHandler(async (req, res) => {
  const company = await Company.findOne({ founder: req.user._id })
    .populate('pipeline.atsBot')
    .populate('pipeline.interviewBot')
    .populate('pipeline.dailyTaskBot')
    .populate('pipeline.auditBot');

  if (!company) {
    return ApiResponse.notFound('No company registered for this founder').send(res);
  }

  // Fetch all bots purchased by this founder
  const purchases = await BotPurchase.find({ user: req.user._id, status: 'active' })
    .populate('bot')
    .lean();

  const purchasedBots = purchases.map((p) => p.bot).filter(Boolean);

  return ApiResponse.ok(
    {
      pipeline: company.pipeline || {},
      purchasedBots,
    },
    'Company pipeline blueprint retrieved successfully'
  ).send(res);
});

/**
 * @desc    Deploy company blueprint pipeline to live production
 * @route   PUT /api/founder/pipeline/deploy
 * @access  Private (Founder)
 */
const deployPipeline = asyncHandler(async (req, res) => {
  const { atsBotId, interviewBotId, dailyTaskBotId, auditBotId } = req.body;

  const company = await Company.findOne({ founder: req.user._id });
  if (!company) {
    return ApiResponse.notFound('Company not found').send(res);
  }

  // Calculate combined cost per run
  const botIds = [atsBotId, interviewBotId, dailyTaskBotId, auditBotId].filter(Boolean);
  const bots = await AIBot.find({ _id: { $in: botIds } });
  const totalCost = bots.reduce((sum, b) => sum + (b.pricing?.pricePerRun || 25), 0);

  company.pipeline = {
    atsBot: atsBotId || null,
    interviewBot: interviewBotId || null,
    dailyTaskBot: dailyTaskBotId || null,
    auditBot: auditBotId || null,
    isDeployed: true,
    deployedAt: new Date(),
    totalCostPerRun: totalCost,
  };

  await company.save();

  const populatedCompany = await Company.findById(company._id)
    .populate('pipeline.atsBot')
    .populate('pipeline.interviewBot')
    .populate('pipeline.dailyTaskBot')
    .populate('pipeline.auditBot');

  return ApiResponse.ok(
    populatedCompany.pipeline,
    'Company AI Pipeline successfully deployed to production!'
  ).send(res);
});

/**
 * @desc    Simulate/test company blueprint pipeline
 * @route   POST /api/founder/pipeline/test
 * @access  Private (Founder)
 */
const testSimulatePipeline = asyncHandler(async (req, res) => {
  const company = await Company.findOne({ founder: req.user._id })
    .populate('pipeline.atsBot')
    .populate('pipeline.interviewBot')
    .populate('pipeline.dailyTaskBot')
    .populate('pipeline.auditBot');

  if (!company) {
    return ApiResponse.notFound('No company registered for this founder').send(res);
  }

  const { pipeline } = company;
  const stages = [
    { stage: 'ats', bot: pipeline?.atsBot || null, status: pipeline?.atsBot ? 'ready' : 'unassigned' },
    { stage: 'interview', bot: pipeline?.interviewBot || null, status: pipeline?.interviewBot ? 'ready' : 'unassigned' },
    { stage: 'dailyTask', bot: pipeline?.dailyTaskBot || null, status: pipeline?.dailyTaskBot ? 'ready' : 'unassigned' },
    { stage: 'audit', bot: pipeline?.auditBot || null, status: pipeline?.auditBot ? 'ready' : 'unassigned' },
  ];

  return ApiResponse.ok(
    {
      simulated: true,
      totalCostPerRun: pipeline?.totalCostPerRun || 0,
      stages,
      isDeployed: !!pipeline?.isDeployed,
    },
    'Pipeline dry-run simulation completed successfully'
  ).send(res);
});

module.exports = {
  createCompany,
  postRole,
  getMyCompany,
  getApplicants,
  transitionToFounder,
  getPipeline,
  deployPipeline,
  testSimulatePipeline,
};
