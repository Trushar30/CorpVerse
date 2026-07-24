const express = require('express');
const router = express.Router();
const {
  createCompany,
  postRole,
  getMyCompany,
  getApplicants,
} = require('../controllers/founder.controller');
const { requireAuth, requireProfile, requireStatus } = require('../middleware/auth');

router.use(requireAuth, requireProfile, requireStatus('founder'));

router.post('/company', createCompany);
router.get('/company', getMyCompany);
router.post('/company/roles', postRole);
router.get('/company/applicants', getApplicants);

module.exports = router;
