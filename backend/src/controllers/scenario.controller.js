const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const scenarioService = require('../services/scenario.service');

const getActiveScenario = asyncHandler(async (req, res) => {
  const result = await scenarioService.getActiveScenario(req.user._id);
  return ApiResponse.ok(result, 'Active scenario retrieved').send(res);
});

const resolveDecision = asyncHandler(async (req, res) => {
  const { optionIndex } = req.body;
  const result = await scenarioService.resolveDecision(
    req.user._id,
    req.params.id,
    optionIndex
  );
  return ApiResponse.ok(result, result.message).send(res);
});

module.exports = {
  getActiveScenario,
  resolveDecision,
};
