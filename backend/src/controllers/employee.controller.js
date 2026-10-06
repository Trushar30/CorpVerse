const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const employeeService = require('../services/employee.service');

const getMyTasks = asyncHandler(async (req, res) => {
  const result = await employeeService.getMyTasks(req.user._id, req.query);
  return ApiResponse.ok(result, 'Tasks retrieved successfully').send(res);
});

const getTodayTask = asyncHandler(async (req, res) => {
  let todayTask = await employeeService.getTodayTask(req.user._id);
  if (!todayTask) {
    todayTask = await employeeService.generateDailyTask(req.user._id);
  }
  return ApiResponse.ok(todayTask, "Today's task retrieved").send(res);
});

const completeTask = asyncHandler(async (req, res) => {
  const result = await employeeService.completeTask(
    req.params.id,
    req.user._id,
    req.body?.submissionData
  );
  return ApiResponse.ok(result, 'Task completed successfully!').send(res);
});

// FR-20: Notice period initiation / resignation
const initiateResignation = asyncHandler(async (req, res) => {
  const result = await employeeService.initiateNoticePeriod(req.user._id, req.body?.reason);
  return ApiResponse.ok(result, 'Notice period initiated. Please complete 2 transition tasks.').send(res);
});

const completeNoticeTask = asyncHandler(async (req, res) => {
  const result = await employeeService.completeNoticeTask(req.user._id, req.params.taskIndex);
  return ApiResponse.ok(result, result.message).send(res);
});

const getExitCertificate = asyncHandler(async (req, res) => {
  const result = await employeeService.getExitCertificate(req.user._id);
  return ApiResponse.ok(result, 'Alumni reference letter retrieved').send(res);
});

const resign = asyncHandler(async (req, res) => {
  const result = await employeeService.resign(req.user._id, req.body?.reason);
  return ApiResponse.ok(result, 'Resignation processed successfully').send(res);
});

const getExpHistory = asyncHandler(async (req, res) => {
  const result = await employeeService.getExpHistory(req.user._id, req.query);
  return ApiResponse.ok(result, 'EXP history retrieved successfully').send(res);
});

const getPerformance = asyncHandler(async (req, res) => {
  const result = await employeeService.getPerformance(req.user._id);
  return ApiResponse.ok(result, 'Performance metrics retrieved').send(res);
});

const getMyRecord = asyncHandler(async (req, res) => {
  const record = await employeeService.getMyRecord(req.user._id);
  return ApiResponse.ok(record, 'Employee record retrieved').send(res);
});

// FR-16: AI Team Manager
const getManagerProfile = asyncHandler(async (req, res) => {
  const manager = await employeeService.getManagerProfile(req.user._id);
  return ApiResponse.ok(manager, 'AI Team Manager profile retrieved').send(res);
});

const requestManagerFeedback = asyncHandler(async (req, res) => {
  const result = await employeeService.request1On1Feedback(req.user._id);
  return ApiResponse.ok(result, result.message).send(res);
});

// FR-17 & FR-18: Performance Review & Merit Raises
const requestPerformanceReview = asyncHandler(async (req, res) => {
  const result = await employeeService.requestPerformanceReview(req.user._id);
  return ApiResponse.ok(result, result.summary).send(res);
});

// SPRINT 4: Disciplinary fail task
const failTask = asyncHandler(async (req, res) => {
  const { taskId, reason } = req.body;
  const result = await employeeService.recordTaskFailure(req.user._id, taskId, reason);
  return ApiResponse.ok(result, result.message).send(res);
});

module.exports = {
  getMyTasks,
  getTodayTask,
  completeTask,
  failTask,
  resign,
  initiateResignation,
  completeNoticeTask,
  getExitCertificate,
  getExpHistory,
  getPerformance,
  getMyRecord,
  getManagerProfile,
  requestManagerFeedback,
  requestPerformanceReview,
};

