const express = require('express');
const router = express.Router();
const {
  getMyTasks,
  completeTask,
  resign,
  getExpHistory,
} = require('../controllers/employee.controller');
const { requireAuth, requireProfile, requireStatus } = require('../middleware/auth');

router.use(requireAuth, requireProfile, requireStatus('employee'));

router.get('/tasks', getMyTasks);
router.post('/tasks/:id/complete', completeTask);
router.post('/resign', resign);
router.get('/exp-history', getExpHistory);

module.exports = router;
