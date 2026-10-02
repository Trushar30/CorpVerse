const express = require('express');
const router = express.Router();
const { startInterview, sendMessage, getInterviewResult } = require('../controllers/interview.controller');
const { requireAuth, requireProfile } = require('../middleware/auth');

router.use(requireAuth, requireProfile);

router.post('/:applicationId/start', startInterview);
router.post('/:applicationId/message', sendMessage);
router.get('/:applicationId/result', getInterviewResult);

module.exports = router;
