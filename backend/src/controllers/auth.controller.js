const { User } = require('../models');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { generateToken } = require('../utils/jwt');
const { sendOTP } = require('../utils/mailer');

/**
 * Helper to generate 6-digit OTP string.
 */
const generateOTPCode = (email) => {
  if (email.endsWith('@cv.com') || email.endsWith('@corpverse.com') || email === 'admin@corpverse.com') return '000000';
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * POST /api/auth/register
 * Create a new user account, generate verification OTP, and return JWT.
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if email already registered
  const existing = await User.findOne({ email });
  if (existing) {
    throw ApiError.conflict('Email already registered');
  }

  const otpCode = generateOTPCode(email);
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // All self-registered users start as job_seeker with isVerified: false
  const user = await User.create({
    name,
    email,
    password,
    role: 'job_seeker',
    isVerified: false,
    otpCode,
    otpExpiresAt,
  });

  // Dispatch OTP email (non-blocking)
  sendOTP(email, otpCode).catch(console.error);

  const token = generateToken(user._id);
  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.otpCode;
  delete userObj.otpExpiresAt;

  ApiResponse.created(
    { user: userObj, token },
    'Registration successful. Please verify your email.'
  ).send(res);
});

/**
 * POST /api/auth/login
 * Authenticate with email + password, return JWT.
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const token = generateToken(user._id);
  const userObj = user.toObject();
  delete userObj.password;

  ApiResponse.ok({ user: userObj, token }, 'Login successful').send(res);
});

/**
 * POST /api/auth/verify-email
 * Verify user email via 6-digit OTP code.
 * Dev & Admin shortcut: admin@corpverse.com, @corpverse.com, and @cv.com verify with '000000'.
 */
const verifyEmail = asyncHandler(async (req, res) => {
  const { otpCode } = req.body;
  if (!otpCode) {
    throw ApiError.badRequest('Verification code is required');
  }

  const user = await User.findById(req.user._id).select('+otpCode +otpExpiresAt');
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (user.isVerified) {
    return ApiResponse.ok(user, 'Account is already verified').send(res);
  }

  const isDevOrAdminEmail =
    user.email.endsWith('@cv.com') ||
    user.email.endsWith('@corpverse.com') ||
    user.email === 'admin@corpverse.com' ||
    user.role === 'admin';

  // Validate OTP code
  if (isDevOrAdminEmail && otpCode === '000000') {
    // Verified via dev/admin code
  } else {
    if (!user.otpCode || user.otpCode !== otpCode) {
      throw ApiError.badRequest('Invalid verification code');
    }
    if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
      throw ApiError.badRequest('Verification code has expired. Please request a new one.');
    }
  }

  user.isVerified = true;
  user.otpCode = undefined;
  user.otpExpiresAt = undefined;
  await user.save();

  const userObj = user.toObject();
  ApiResponse.ok(userObj, 'Email verified successfully').send(res);
});

/**
 * POST /api/auth/resend-otp
 * Resend email verification OTP code.
 */
const resendOTP = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (user.isVerified) {
    throw ApiError.badRequest('Email is already verified');
  }

  const otpCode = generateOTPCode(user.email);
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  user.otpCode = otpCode;
  user.otpExpiresAt = otpExpiresAt;
  await user.save();

  sendOTP(user.email, otpCode).catch(console.error);

  ApiResponse.ok(null, 'Verification code sent to your email').send(res);
});

/**
 * GET /api/auth/me
 * Returns the current authenticated user's profile.
 */
const getMe = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw ApiError.notFound('User not found');
  }

  ApiResponse.ok(req.user, 'User profile retrieved').send(res);
});

module.exports = { register, login, verifyEmail, resendOTP, getMe };
