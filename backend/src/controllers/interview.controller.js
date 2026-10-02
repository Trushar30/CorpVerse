const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const interviewService = require('../services/interview.service');

// ─────────────────────────────────────────────────────
// INTERVIEW CONTROLLER
// Handles HTTP layer for the AI-powered interview system.
// ─────────────────────────────────────────────────────

// POST /api/interviews/:applicationId/start
const startInterview = asyncHandler(async (req, res) => {
  const interview = await interviewService.startInterview(
    req.params.applicationId,
    req.user._id
  );
  ApiResponse.created(interview, 'Interview started. Good luck!').send(res);
});

// POST /api/interviews/:applicationId/message
const sendMessage = asyncHandler(async (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return ApiResponse.ok(null, 'Message is required and cannot be empty').send(res);
  }

  const response = await interviewService.sendMessage(
    req.params.applicationId,
    req.user._id,
    message.trim()
  );
  ApiResponse.ok(response, 'Message sent').send(res);
});

// GET /api/interviews/:applicationId/result
const getInterviewResult = asyncHandler(async (req, res) => {
  const result = await interviewService.getInterviewResult(
    req.params.applicationId,
    req.user._id
  );
  ApiResponse.ok(result, 'Interview result retrieved').send(res);
});

module.exports = { startInterview, sendMessage, getInterviewResult };
