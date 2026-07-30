const express = require('express');
const router = express.Router();
const { getDomains } = require('../controllers/admin.controller');
const { requireAuth } = require('../middleware/auth');

// Public/Authenticated route for browsing available domain sectors
router.get('/', requireAuth, getDomains);

module.exports = router;
