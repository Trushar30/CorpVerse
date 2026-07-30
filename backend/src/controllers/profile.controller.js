const { User, RedeemCode, ExpLog } = require('../models');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const config = require('../config');

/**
 * POST /api/profile/complete
 * Complete the user's CorpVerse profile after signup.
 * Sets skills, domain interest, and marks profile as complete.
 */
const completeProfile = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw ApiError.notFound('User not found. Please sign up first.');
  }

  const { skills, domainInterest, bio } = req.body;

  req.user.skills = skills;
  req.user.domainInterest = domainInterest;
  if (bio) req.user.bio = bio;
  req.user.profileComplete = true;

  await req.user.save();

  ApiResponse.ok(req.user, 'Profile completed successfully').send(res);
});

/**
 * PUT /api/profile
 * Update profile fields (name, skills, domain interest, bio).
 */
const updateProfile = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw ApiError.notFound('User not found');
  }

  const allowedUpdates = ['name', 'skills', 'domainInterest', 'bio'];
  const updates = {};

  for (const field of allowedUpdates) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    throw ApiError.badRequest('No valid fields to update');
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  ApiResponse.ok(user, 'Profile updated successfully').send(res);
});

/**
 * POST /api/profile/resume
 * Upload a resume file (PDF or DOCX, max 5MB).
 */
const uploadResume = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw ApiError.notFound('User not found');
  }

  if (!req.file) {
    throw ApiError.badRequest('No file uploaded');
  }

  // Validate file type
  if (!config.allowedFileTypes.includes(req.file.mimetype)) {
    throw ApiError.badRequest('Only PDF and DOCX files are allowed');
  }

  // Store the relative path
  const resumeUrl = `/uploads/${req.file.filename}`;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { resumeUrl },
    { new: true }
  );

  ApiResponse.ok(
    { resumeUrl: user.resumeUrl },
    'Resume uploaded successfully'
  ).send(res);
});

/**
 * POST /api/profile/redeem-code
 * Redeem an EXP code created by admin to boost user's EXP.
 */
const redeemCode = asyncHandler(async (req, res) => {
  const { code } = req.body;
  if (!code || !code.trim()) {
    throw ApiError.badRequest('Redeem code is required');
  }

  const cleanCode = code.trim().toUpperCase();
  const redeemDoc = await RedeemCode.findOne({ code: cleanCode, isActive: true });

  if (!redeemDoc) {
    throw ApiError.notFound('Invalid or inactive redeem code');
  }

  if (redeemDoc.expiresAt && redeemDoc.expiresAt < new Date()) {
    throw ApiError.badRequest('This redeem code has expired');
  }

  if (redeemDoc.usedCount >= redeemDoc.maxUses) {
    throw ApiError.badRequest('This redeem code has reached its maximum usage limit');
  }

  const alreadyRedeemed = redeemDoc.redeemedBy.some(
    (id) => id.toString() === req.user._id.toString()
  );
  if (alreadyRedeemed) {
    throw ApiError.badRequest('You have already redeemed this code');
  }

  // Record redemption
  redeemDoc.redeemedBy.push(req.user._id);
  redeemDoc.usedCount += 1;
  await redeemDoc.save();

  // Credit EXP to user
  const user = await User.findById(req.user._id);
  user.expTotal = (user.expTotal || 0) + redeemDoc.expAmount;
  await user.save();

  // Log EXP gain
  try {
    await ExpLog.create({
      user: user._id,
      amount: redeemDoc.expAmount,
      reason: `Redeemed code ${cleanCode}`,
    });
  } catch (_) {}

  ApiResponse.ok(
    { expAdded: redeemDoc.expAmount, totalExp: user.expTotal, user },
    `Successfully redeemed ${cleanCode}! +${redeemDoc.expAmount} EXP added.`
  ).send(res);
});

/**
 * GET /api/profile/me
 * Get the current user's full profile.
 */
const getProfile = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw ApiError.notFound('User not found');
  }

  ApiResponse.ok(req.user, 'Profile retrieved').send(res);
});

module.exports = {
  completeProfile,
  updateProfile,
  uploadResume,
  redeemCode,
  getProfile,
};
