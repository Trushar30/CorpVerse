const express = require('express');
const router = express.Router();
const { handleClerkWebhook, getMe } = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth');

// Clerk webhook — must receive raw body for signature verification
// Note: raw body parsing is configured in app.js specifically for this route
router.post('/webhook/clerk', handleClerkWebhook);

// Get current authenticated user
router.get('/me', requireAuth, getMe);

module.exports = router;
