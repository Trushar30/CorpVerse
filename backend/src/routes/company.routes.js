const express = require('express');
const router = express.Router();
const {
  getCompanies,
  getCompanyById,
  getCompanyRoles,
} = require('../controllers/company.controller');
const { requireAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { browseCompaniesSchema } = require('../validations/company.validation');

// Public routes (browsable without full profile)
router.get('/', requireAuth, validate(browseCompaniesSchema), getCompanies);
router.get('/:id', requireAuth, getCompanyById);
router.get('/:id/roles', requireAuth, getCompanyRoles);

module.exports = router;
