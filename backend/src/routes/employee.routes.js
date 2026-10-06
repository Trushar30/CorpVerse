const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/employee.controller');
const { requireAuth, requireProfile, requireStatus } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  completeTaskSchema,
  getTasksQuerySchema,
  getExpHistoryQuerySchema,
  resignSchema,
  noticeTaskParamSchema,
} = require('../validations/employee.validation');

// All employee routes require active authentication, completed profile, and employee status
router.use(requireAuth, requireProfile, requireStatus('employee'));

// Tasks & Daily Mission
router.get('/tasks', validate(getTasksQuerySchema), getMyTasks);
router.get('/tasks/today', getTodayTask);
router.post('/tasks/fail', failTask);
router.post('/tasks/:id/complete', validate(completeTaskSchema), completeTask);


// Profile & EXP History
router.get('/exp-history', validate(getExpHistoryQuerySchema), getExpHistory);
router.get('/performance', getPerformance);
router.get('/record', getMyRecord);

// FR-16: AI Team Manager
router.get('/manager', getManagerProfile);
router.post('/manager/feedback', requestManagerFeedback);

// FR-17 & FR-18: Performance Review & Merit Raises
router.post('/performance/review', requestPerformanceReview);

// FR-20: Resignation & Notice Period Flow
router.post('/resign', validate(resignSchema), resign);
router.post('/notice/initiate', validate(resignSchema), initiateResignation);
router.post('/notice/complete-task/:taskIndex', validate(noticeTaskParamSchema), completeNoticeTask);
router.get('/notice/exit-certificate', getExitCertificate);

module.exports = router;
