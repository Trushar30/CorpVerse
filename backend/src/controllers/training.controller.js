const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const trainingService = require('../services/training.service');

const listModules = asyncHandler(async (req, res) => {
  const { domain } = req.query;
  const modules = await trainingService.listModules(domain);
  return res.status(200).json(new ApiResponse(200, modules, 'Training modules retrieved'));
});

const getModuleById = asyncHandler(async (req, res) => {
  const module = await trainingService.getModuleById(req.params.id);
  return res.status(200).json(new ApiResponse(200, module, 'Training module details retrieved'));
});

const completeModule = asyncHandler(async (req, res) => {
  const { answers } = req.body;
  const result = await trainingService.completeModule(req.params.id, req.user._id, answers);
  return res.status(200).json(new ApiResponse(200, result, result.message));
});

module.exports = {
  listModules,
  getModuleById,
  completeModule,
};
