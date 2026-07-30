const express = require('express');
const router = express.Router();
const { register, login, verifyEmail, resendOTP, getMe } = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema, verifyEmailSchema } = require('../validations/auth.validation');

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

// Protected verification routes
router.post('/verify-email', requireAuth, validate(verifyEmailSchema), verifyEmail);
router.post('/resend-otp', requireAuth, resendOTP);
router.get('/me', requireAuth, getMe);

module.exports = router;
