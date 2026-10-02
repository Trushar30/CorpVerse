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

module.exports = {
  getMyTasks,
  getTodayTask,
  completeTask,
  resign,
  getExpHistory,
  getPerformance,
  getMyRecord,
};
