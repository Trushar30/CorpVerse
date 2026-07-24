// ─── Placeholder controllers for Phase 2+ ───────
// These files establish the route structure now so the
// frontend team can code against the API contract.

const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const createApplication = asyncHandler(async (req, res) => {
  ApiResponse.ok(null, '🚧 Application creation coming in Phase 2').send(res);
});

const getMyApplications = asyncHandler(async (req, res) => {
  ApiResponse.ok([], '🚧 Applications list coming in Phase 2').send(res);
});

const getApplicationById = asyncHandler(async (req, res) => {
  ApiResponse.ok(null, '🚧 Application details coming in Phase 2').send(res);
});

module.exports = { createApplication, getMyApplications, getApplicationById };
