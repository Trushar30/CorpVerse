const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getMyTasks = asyncHandler(async (req, res) => {
  ApiResponse.ok([], '🚧 Employee tasks coming in Phase 2').send(res);
});

const completeTask = asyncHandler(async (req, res) => {
  ApiResponse.ok(null, '🚧 Task completion coming in Phase 2').send(res);
});

const resign = asyncHandler(async (req, res) => {
  ApiResponse.ok(null, '🚧 Resignation coming in Phase 2').send(res);
});

const getExpHistory = asyncHandler(async (req, res) => {
  ApiResponse.ok([], '🚧 EXP history coming in Phase 2').send(res);
});

module.exports = { getMyTasks, completeTask, resign, getExpHistory };
