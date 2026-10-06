const { Company, Role, Application, EmployeeRecord } = require('../models');
const ApiError = require('../utils/ApiError');

// ─────────────────────────────────────────────────────
// COMPANY SERVICE
// Business logic for company lifecycle, roles, metrics,
// and financial management.
// ─────────────────────────────────────────────────────

class CompanyService {
  /**
   * Create a new company record.
   */
  async createCompany(data) {
    return await Company.create(data);
  }

  /**
   * Get paginated list of companies with open role counts
   */
  async getCompanies(query = {}) {
    const { domain, search, page = 1, limit = 10 } = query || {};

    const filter = {};
    if (domain && domain !== 'All') {
      filter.domain = domain;
    }
    if (search && search.trim()) {
      filter.name = { $regex: search.trim(), $options: 'i' };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const take = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * take;

    const [companies, total] = await Promise.all([
      Company.find(filter)
        .populate('founder', 'name email avatarUrl')
        .sort({ isSeedCompany: -1, createdAt: -1 })
        .skip(skip)
        .limit(take)
        .lean(),
      Company.countDocuments(filter),
    ]);

    // Attach real-time open roles count to each company
    const companyIds = companies.map((c) => c._id);
    const roleCounts = await Role.aggregate([
      {
        $match: {
          company: { $in: companyIds },
          $or: [{ status: 'open' }, { isOpen: true }],
        },
      },
      { $group: { _id: '$company', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    roleCounts.forEach((rc) => {
      countMap[rc._id.toString()] = rc.count;
    });

    const enrichedCompanies = companies.map((comp) => ({
      ...comp,
      openRoleCount: countMap[comp._id.toString()] || 0,
      openRolesCount: countMap[comp._id.toString()] || 0,
    }));

    const pages = Math.ceil(total / take) || 1;

    return {
      companies: enrichedCompanies,
      pagination: {
        page: pageNum,
        limit: take,
        total,
        pages,
        totalPages: pages,
      },
    };
  }

  /**
   * Get company details by ID
   */
  async getCompanyById(id) {
    const company = await Company.findById(id)
      .populate('founder', 'name email avatarUrl expTotal')
      .lean();
    if (!company) return null;

    const roles = await Role.find({
      company: id,
      $or: [{ status: 'open' }, { isOpen: true }],
    }).lean();

    return { ...company, roles };
  }

  /**
   * Get all active roles for a specific company
   */
  async getCompanyRoles(companyId) {
    return await Role.find({
      company: companyId,
      $or: [{ status: 'open' }, { isOpen: true }],
    })
      .sort({ createdAt: -1 })
      .lean();
  }

  /**
   * Get operational metrics for a company
   */
  async getCompanyMetrics(companyId) {
    const companyRoles = await Role.find({ company: companyId }).select('_id');
    const roleIds = companyRoles.map((r) => r._id);

    const [company, rolesCount, employeesCount, applicantsCount] = await Promise.all([
      Company.findById(companyId).select('treasury valuation employeeCount').lean(),
      Role.countDocuments({
        company: companyId,
        $or: [{ status: 'open' }, { isOpen: true }],
      }),
      EmployeeRecord.countDocuments({ company: companyId, employmentStatus: 'active' }),
      Application.countDocuments({ role: { $in: roleIds } }),
    ]);

    const treasuryVal = company?.treasury ?? 10000;
    const valuationVal = company?.valuation ?? 1000000;

    return {
      treasury: treasuryVal,
      valuation: valuationVal,
      openRolesCount: rolesCount,
      activeEmployeesCount: employeesCount,
      totalApplicantsCount: applicantsCount,
      // Backwards-compatible aliases
      totalHires: employeesCount,
      activeRoles: rolesCount,
      treasuryBalance: treasuryVal,
    };
  }

  /**
   * Update treasury and/or valuation for a company.
   */
  async updateFinances(companyId, { treasury, valuation } = {}) {
    const company = await Company.findById(companyId);
    if (!company) {
      throw ApiError.notFound('Company not found');
    }
    if (treasury !== undefined) company.treasury = treasury;
    if (valuation !== undefined) company.valuation = valuation;
    await company.save();
    return company;
  }
}

module.exports = new CompanyService();
