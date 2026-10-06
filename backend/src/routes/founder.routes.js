const express = require('express');
const router = express.Router();
const {
  createCompany,
  postRole,
  getMyCompany,
  getApplicants,
  transitionToFounder,
  getPipeline,
  deployPipeline,
  testSimulatePipeline,
} = require('../controllers/founder.controller');
const { requireAuth } = require('../middleware/auth');
const ApiError = require('../utils/ApiError');

// All founder routes require authentication
router.use(requireAuth);

// Opt to transition to founder mode once user reaches 500 EXP
router.post('/transition', transitionToFounder);

const requireFounderOrAdmin = (req, res, next) => {
  if (
    req.user &&
    (req.user.role === 'founder' ||
      req.user.currentStatus === 'founder' ||
      req.user.role === 'admin' ||
      (req.user.expTotal || 0) >= 500)
  ) {
    return next();
  }
  return next(ApiError.forbidden('Founder access required'));
};

router.use(requireFounderOrAdmin);

router.post('/company', createCompany);
router.get('/company', getMyCompany);
router.post('/company/roles', postRole);
router.get('/company/applicants', getApplicants);
router.get('/applicants', getApplicants);

// Company AI Pipeline Blueprint routes
router.get('/pipeline', requireAuth, getPipeline);
router.put('/pipeline/deploy', requireAuth, deployPipeline);
router.post('/pipeline/test', requireAuth, testSimulatePipeline);

// Corporate Scenarios & Dilemmas routes
const { getActiveScenario, resolveDecision } = require('../controllers/scenario.controller');
router.get('/scenarios', requireAuth, getActiveScenario);
router.post('/scenarios/:id/decide', requireAuth, resolveDecision);

module.exports = router;
