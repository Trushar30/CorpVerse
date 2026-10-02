const express = require('express');
const router = express.Router();
const {
  getMyTasks,
  getTodayTask,
  completeTask,
  resign,
  getExpHistory,
  getPerformance,
  getMyRecord,
} = require('../controllers/employee.controller');
const { requireAuth, requireProfile, requireStatus } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  completeTaskSchema,
  getTasksQuerySchema,
  getExpHistoryQuerySchema,
  resignSchema,
} = require('../validations/employee.validation');

// All employee routes require active authentication, completed profile, and employee status
router.use(requireAuth, requireProfile, requireStatus('employee'));

router.get('/tasks', validate(getTasksQuerySchema), getMyTasks);
router.get('/tasks/today', getTodayTask);
router.post('/tasks/:id/complete', validate(completeTaskSchema), completeTask);
router.post('/resign', validate(resignSchema), resign);
router.get('/exp-history', validate(getExpHistoryQuerySchema), getExpHistory);
router.get('/performance', getPerformance);
router.get('/record', getMyRecord);

module.exports = router;
