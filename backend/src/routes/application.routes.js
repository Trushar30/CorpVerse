const express = require('express');
const router = express.Router();
const {
  createApplication,
  getMyApplications,
  getApplicationById,
} = require('../controllers/application.controller');
const { requireAuth, requireProfile } = require('../middleware/auth');

router.use(requireAuth);

router.post('/', requireProfile, createApplication);
router.get('/me', getMyApplications);
router.get('/:id', getApplicationById);

module.exports = router;
