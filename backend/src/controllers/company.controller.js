const { Company, Role } = require('../models');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/companies
 * Browse all companies with optional domain filter and pagination.
 */
const getCompanies = asyncHandler(async (req, res) => {
  const { domain, page = 1, limit = 10 } = req.query;

  const filter = {};
  if (domain) {
    filter.domain = { $regex: domain, $options: 'i' };
  }

  const skip = (page - 1) * limit;

  const [companies, total] = await Promise.all([
    Company.find(filter)
      .populate('founder', 'name avatarUrl')
      .sort({ isSeedCompany: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Company.countDocuments(filter),
  ]);

  // Attach open role count to each company
  const companyIds = companies.map((c) => c._id);
  const roleCounts = await Role.aggregate([
    { $match: { company: { $in: companyIds }, isOpen: true } },
    { $group: { _id: '$company', count: { $sum: 1 } } },
  ]);

  const roleCountMap = {};
  roleCounts.forEach((r) => {
    roleCountMap[r._id.toString()] = r.count;
  });

  const enriched = companies.map((c) => ({
    ...c,
    openRoleCount: roleCountMap[c._id.toString()] || 0,
  }));

  ApiResponse.ok(
    {
      companies: enriched,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
    'Companies retrieved'
  ).send(res);
});

/**
 * GET /api/companies/:id
 * Get a single company by ID with its roles.
 */
const getCompanyById = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id)
    .populate('founder', 'name avatarUrl')
    .lean();

  if (!company) {
    throw ApiError.notFound('Company not found');
  }

  const roles = await Role.find({ company: company._id }).lean();

  ApiResponse.ok({ ...company, roles }, 'Company retrieved').send(res);
});

/**
 * GET /api/companies/:id/roles
 * Get open roles for a specific company.
 */
const getCompanyRoles = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);
  if (!company) {
    throw ApiError.notFound('Company not found');
  }

  const roles = await Role.find({
    company: req.params.id,
    isOpen: true,
  })
    .sort({ level: 1, createdAt: -1 })
    .lean();

  ApiResponse.ok(roles, 'Roles retrieved').send(res);
});

module.exports = {
  getCompanies,
  getCompanyById,
  getCompanyRoles,
};
