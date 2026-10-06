const { User, RedeemCode, ExpLog, Resume } = require('../models');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const config = require('../config');
const { extractResumeText } = require('../utils/resumeParser');
const gamificationService = require('../services/gamification.service');

/**
 * POST /api/profile/complete
 * Complete the user's CorpVerse profile after signup.
 * Sets skills, domain interest, and marks profile as complete.
 */
const completeProfile = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw ApiError.notFound('User not found. Please sign up first.');
  }

  const { name, skills, domainInterest, bio } = req.body;

  if (name) req.user.name = name.trim();
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
 * Stores binary file in MongoDB (free, zero external cost) and extracts text for AI processing.
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

  const { buffer, originalname, mimetype, size } = req.file;

  // 1. Extract plain text content from the uploaded document buffer
  const parseResult = await extractResumeText(buffer, mimetype);

  // 2. Upsert document in MongoDB Resume collection with binary buffer & extracted text
  await Resume.findOneAndUpdate(
    { user: req.user._id },
    {
      user: req.user._id,
      filename: originalname,
      mimetype,
      size,
      fileBuffer: buffer,
      extractedText: parseResult.text,
      wordCount: parseResult.wordCount,
      pageCount: parseResult.pageCount,
      uploadedAt: new Date(),
    },
    { upsert: true, new: true, runValidators: true }
  );

  // 3. Update User document with text version and metadata for downstream AI services
  const resumeUrl = `/api/profile/resume`;
  const resumeMetadata = {
    filename: originalname,
    size,
    mimetype,
    wordCount: parseResult.wordCount,
    pageCount: parseResult.pageCount,
    uploadedAt: new Date(),
  };

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      resumeUrl,
      resumeText: parseResult.text,
      resumeMetadata,
    },
    { new: true }
  );

  ApiResponse.ok(
    {
      resumeUrl: updatedUser.resumeUrl,
      extractedText: parseResult.text,
      wordCount: parseResult.wordCount,
      pageCount: parseResult.pageCount,
      metadata: resumeMetadata,
      user: updatedUser,
    },
    'Resume uploaded, stored in database, and parsed successfully'
  ).send(res);
});

/**
 * GET /api/profile/resume
 * Stream/download the stored resume file directly from MongoDB.
 * Supports optional ?userId query for admins/founders reviewing candidate resumes.
 */
const getResumeFile = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw ApiError.notFound('User not found');
  }

  const targetUserId =
    req.query.userId && ['admin', 'founder'].includes(req.user.role)
      ? req.query.userId
      : req.user._id;

  const resume = await Resume.findOne({ user: targetUserId }).select('+fileBuffer');
  if (!resume || !resume.fileBuffer) {
    throw ApiError.notFound('No resume document found');
  }

  res.setHeader('Content-Type', resume.mimetype);
  res.setHeader('Content-Length', resume.size);
  res.setHeader(
    'Content-Disposition',
    `inline; filename="${encodeURIComponent(resume.filename)}"`
  );
  res.send(resume.fileBuffer);
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

  // Atomic redemption to prevent double-spending and race conditions
  const claimedDoc = await RedeemCode.findOneAndUpdate(
    {
      _id: redeemDoc._id,
      isActive: true,
      usedCount: { $lt: redeemDoc.maxUses },
      redeemedBy: { $ne: req.user._id },
    },
    {
      $push: { redeemedBy: req.user._id },
      $inc: { usedCount: 1 },
    },
    { new: true }
  );

  if (!claimedDoc) {
    throw ApiError.badRequest('Unable to redeem code: already claimed or usage limit reached');
  }


  const expAdded = redeemDoc.expAmount || 0;
  const coinsAdded = redeemDoc.coinAmount || 0;

  // Award EXP if present
  if (expAdded > 0) {
    await gamificationService.awardExp(req.user._id, expAdded, 'redeem_code', {
      reason: `Redeemed code ${cleanCode}`,
    });
  }

  // Award CorpCoins if present
  if (coinsAdded > 0) {
    await gamificationService.awardCoins(req.user._id, coinsAdded, `Redeemed code ${cleanCode}`);
  }

  const updatedUser = await User.findById(req.user._id);

  const rewards = [];
  if (expAdded > 0) rewards.push(`+${expAdded} EXP`);
  if (coinsAdded > 0) rewards.push(`+${coinsAdded} CorpCoins`);

  ApiResponse.ok(
    {
      expAdded,
      coinsAdded,
      totalExp: updatedUser.expTotal,
      corpCoins: updatedUser.corpCoins,
      user: updatedUser,
    },
    `Successfully redeemed ${cleanCode}! ${rewards.join(' and ')} added.`
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
  getResumeFile,
  redeemCode,
  getProfile,
};
