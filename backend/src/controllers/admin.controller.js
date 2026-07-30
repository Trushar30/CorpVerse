const { User, Domain, Company, RedeemCode } = require('../models');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const DEFAULT_DOMAINS = [
  { name: 'Technology', description: 'Software engineering, AI, and cloud systems', icon: 'Cpu', color: 'emerald', isSystem: true },
  { name: 'Clean Energy', description: 'Renewable energy, smart grid, and green tech', icon: 'Leaf', color: 'cyan', isSystem: true },
  { name: 'Healthcare', description: 'Healthtech, medtech, and biotech analytics', icon: 'Activity', color: 'rose', isSystem: true },
  { name: 'Finance', description: 'Fintech, quantitative trading, and risk', icon: 'DollarSign', color: 'amber', isSystem: true },
  { name: 'Design & Media', description: 'UI/UX design, brand identity, and media', icon: 'Palette', color: 'violet', isSystem: true },
];

/**
 * GET /api/admin/stats
 * Platform overview stats for admin dashboard.
 */
const getStats = asyncHandler(async (req, res) => {
  const [totalUsers, byRole, recentUsers, totalDomains, totalCompanies, totalRedeemCodes] = await Promise.all([
    User.countDocuments(),
    User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]),
    User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role createdAt profileComplete')
      .lean(),
    Domain.countDocuments(),
    Company.countDocuments(),
    RedeemCode.countDocuments(),
  ]);

  const roleMap = {};
  byRole.forEach((r) => { roleMap[r._id] = r.count; });

  ApiResponse.ok({
    totalUsers,
    byRole: roleMap,
    recentUsers,
    totalDomains,
    totalCompanies,
    totalRedeemCodes,
  }, 'Platform stats retrieved').send(res);
});

/**
 * GET /api/admin/users
 * List all users with pagination.
 */
const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, search } = req.query;
  const skip = (page - 1) * limit;

  const filter = {};
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .select('-password')
      .lean(),
    User.countDocuments(filter),
  ]);

  ApiResponse.ok({
    users,
    pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10), total, totalPages: Math.ceil(total / limit) },
  }, 'Users retrieved').send(res);
});

/**
 * PATCH /api/admin/users/:id
 * Update a user's role or status.
 */
const updateUser = asyncHandler(async (req, res) => {
  const { role, currentStatus } = req.body;
  const updates = {};
  if (role) updates.role = role;
  if (currentStatus) updates.currentStatus = currentStatus;

  if (Object.keys(updates).length === 0) {
    throw ApiError.badRequest('No valid fields to update');
  }

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  }).select('-password');

  if (!user) throw ApiError.notFound('User not found');

  ApiResponse.ok(user, 'User updated').send(res);
});

/**
 * DELETE /api/admin/users/:id
 * Remove a user from the platform.
 */
const deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    throw ApiError.badRequest('Cannot delete your own account');
  }

  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw ApiError.notFound('User not found');

  ApiResponse.ok(null, 'User deleted').send(res);
});

/**
 * GET /api/admin/domains
 */
const getDomains = asyncHandler(async (req, res) => {
  let domains = await Domain.find().sort({ createdAt: 1 }).lean();

  if (domains.length === 0) {
    domains = await Domain.insertMany(DEFAULT_DOMAINS);
  }

  const companyCounts = await Company.aggregate([
    { $group: { _id: '$domain', count: { $sum: 1 } } },
  ]);

  const countMap = {};
  companyCounts.forEach((c) => {
    if (c._id) countMap[c._id.toLowerCase()] = c.count;
  });

  const enriched = domains.map((d) => ({
    ...d,
    companyCount: countMap[d.name.toLowerCase()] || 0,
  }));

  ApiResponse.ok(enriched, 'Domains retrieved').send(res);
});

/**
 * POST /api/admin/domains
 */
const createDomain = asyncHandler(async (req, res) => {
  const { name, description, icon, color } = req.body;

  if (!name || !name.trim()) {
    throw ApiError.badRequest('Domain name is required');
  }

  const existing = await Domain.findOne({ name: { $regex: `^${name.trim()}$`, $options: 'i' } });
  if (existing) {
    throw ApiError.conflict(`Domain sector "${name.trim()}" already exists`);
  }

  const domain = await Domain.create({
    name: name.trim(),
    description: description ? description.trim() : '',
    icon: icon || 'Cpu',
    color: color || 'emerald',
  });

  ApiResponse.created(domain, 'Domain created successfully').send(res);
});

/**
 * DELETE /api/admin/domains/:id
 */
const deleteDomain = asyncHandler(async (req, res) => {
  const domain = await Domain.findById(req.params.id);
  if (!domain) {
    throw ApiError.notFound('Domain not found');
  }

  await Domain.findByIdAndDelete(req.params.id);
  ApiResponse.ok(null, `Domain "${domain.name}" deleted`).send(res);
});

/**
 * GET /api/admin/redeem-codes
 * List all EXP redeem codes.
 */
const getRedeemCodes = asyncHandler(async (req, res) => {
  const codes = await RedeemCode.find().sort({ createdAt: -1 }).lean();
  ApiResponse.ok(codes, 'Redeem codes retrieved').send(res);
});

/**
 * POST /api/admin/redeem-codes
 * Create a new EXP redeem code.
 */
const createRedeemCode = asyncHandler(async (req, res) => {
  const { code, expAmount, maxUses } = req.body;

  if (!code || !code.trim()) {
    throw ApiError.badRequest('Code name is required');
  }
  if (!expAmount || expAmount < 1) {
    throw ApiError.badRequest('EXP amount must be at least 1');
  }

  const cleanCode = code.trim().toUpperCase();
  const existing = await RedeemCode.findOne({ code: cleanCode });
  if (existing) {
    throw ApiError.conflict(`Redeem code "${cleanCode}" already exists`);
  }

  const redeemCodeDoc = await RedeemCode.create({
    code: cleanCode,
    expAmount: parseInt(expAmount, 10),
    maxUses: parseInt(maxUses || '100', 10),
  });

  ApiResponse.created(redeemCodeDoc, `Redeem code ${cleanCode} created successfully`).send(res);
});

/**
 * DELETE /api/admin/redeem-codes/:id
 * Delete/revoke a redeem code.
 */
const deleteRedeemCode = asyncHandler(async (req, res) => {
  const codeDoc = await RedeemCode.findByIdAndDelete(req.params.id);
  if (!codeDoc) {
    throw ApiError.notFound('Redeem code not found');
  }
  ApiResponse.ok(null, `Redeem code "${codeDoc.code}" deleted`).send(res);
});

module.exports = {
  getStats,
  getUsers,
  updateUser,
  deleteUser,
  getDomains,
  createDomain,
  deleteDomain,
  getRedeemCodes,
  createRedeemCode,
  deleteRedeemCode,
};
