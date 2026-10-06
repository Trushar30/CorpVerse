const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const companyService = require('../services/company.service');
const { Domain } = require('../models');

const getCompanies = asyncHandler(async (req, res) => {
  const result = await companyService.getCompanies(req.query);
  return ApiResponse.ok(result, 'Companies retrieved successfully').send(res);
});

const getCompanyById = asyncHandler(async (req, res) => {
  const company = await companyService.getCompanyById(req.params.id);
  if (!company) {
    return ApiResponse.notFound('Company not found').send(res);
  }
  return ApiResponse.ok(company, 'Company retrieved successfully').send(res);
});

const getCompanyRoles = asyncHandler(async (req, res) => {
  const roles = await companyService.getCompanyRoles(req.params.id);
  return ApiResponse.ok(roles, 'Company roles retrieved successfully').send(res);
});

const getDomains = asyncHandler(async (req, res) => {
  const domains = await Domain.find({ isActive: true }).sort({ sortOrder: 1 }).lean();
  return ApiResponse.ok(domains, 'Domains retrieved successfully').send(res);
});

const getCompanyMetrics = asyncHandler(async (req, res) => {
  const metrics = await companyService.getCompanyMetrics(req.params.id);
  return ApiResponse.ok(metrics, 'Company metrics retrieved successfully').send(res);
});

module.exports = {
  getCompanies,
  getCompanyById,
  getCompanyRoles,
  getDomains,
  getCompanyMetrics,
};
