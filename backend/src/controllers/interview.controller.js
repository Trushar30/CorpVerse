const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const sendMessage = asyncHandler(async (req, res) => {
  ApiResponse.ok(null, '🚧 Interview chat coming in Phase 2').send(res);
});

const getInterviewResult = asyncHandler(async (req, res) => {
  ApiResponse.ok(null, '🚧 Interview result coming in Phase 2').send(res);
});

module.exports = { sendMessage, getInterviewResult };
