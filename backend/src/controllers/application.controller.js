const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const applicationService = require('../services/application.service');

const createApplication = asyncHandler(async (req, res) => {
  const { roleId } = req.body;
  const application = await applicationService.createApplication(req.user._id, roleId);
  return res.status(201).json(new ApiResponse(201, application, 'Application submitted. ATS screening in progress...'));
});

const getMyApplications = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const result = await applicationService.getMyApplications(req.user._id, { status, page, limit });
  return res.json(new ApiResponse(200, result, 'Applications retrieved'));
});

const getApplicationById = asyncHandler(async (req, res) => {
  const application = await applicationService.getApplicationById(req.params.id, req.user._id);
  return res.json(new ApiResponse(200, application, 'Application details retrieved'));
});

const acceptOffer = asyncHandler(async (req, res) => {
  const employeeRecord = await applicationService.acceptOffer(req.params.id, req.user._id);
  return res.status(200).json(new ApiResponse(200, employeeRecord, 'Offer accepted! Welcome to the team.'));
});

const declineOffer = asyncHandler(async (req, res) => {
  const application = await applicationService.declineOffer(req.params.id, req.user._id);
  return res.status(200).json(new ApiResponse(200, application, 'Offer declined successfully.'));
});

module.exports = {
  createApplication,
  getMyApplications,
  getApplicationById,
  acceptOffer,
  declineOffer,
};
