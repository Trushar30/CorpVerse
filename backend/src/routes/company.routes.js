const express = require('express');
const router = express.Router();
const {
  getCompanies,
  getCompanyById,
  getCompanyRoles,
  getDomains,
  getCompanyMetrics,
} = require('../controllers/company.controller');
const { optionalAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { browseCompaniesSchema } = require('../validations/company.validation');

// Public / Guest / Authenticated company browsing routes
router.get('/', optionalAuth, validate(browseCompaniesSchema), getCompanies);
router.get('/domains', optionalAuth, getDomains);
router.get('/:id', optionalAuth, getCompanyById);
router.get('/:id/roles', optionalAuth, getCompanyRoles);
router.get('/:id/metrics', optionalAuth, getCompanyMetrics);

module.exports = router;
