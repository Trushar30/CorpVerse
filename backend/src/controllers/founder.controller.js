const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const createCompany = asyncHandler(async (req, res) => {
  ApiResponse.ok(null, '🚧 Company creation coming in Phase 2').send(res);
});

const postRole = asyncHandler(async (req, res) => {
  ApiResponse.ok(null, '🚧 Role posting coming in Phase 2').send(res);
});

const getMyCompany = asyncHandler(async (req, res) => {
  ApiResponse.ok(null, '🚧 Company details coming in Phase 2').send(res);
});

const getApplicants = asyncHandler(async (req, res) => {
  ApiResponse.ok([], '🚧 Applicant list coming in Phase 2').send(res);
});

module.exports = { createCompany, postRole, getMyCompany, getApplicants };
