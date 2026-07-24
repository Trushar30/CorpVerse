const { User } = require('../models');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const path = require('path');
const config = require('../config');

/**
 * POST /api/profile/complete
 * Complete the user's CorpVerse profile after Clerk signup.
 * Sets skills, domain interest, and marks profile as complete.
 */
const completeProfile = asyncHandler(async (req, res) => {
  let user = req.user;

  // Fallback: create user if not yet synced from Clerk webhook
  if (!user && req.clerkId) {
    user = await User.findOne({ clerkId: req.clerkId });
    if (!user) {
      user = await User.create({
        clerkId: req.clerkId,
        name: 'CorpVerse User',
        email: `${req.clerkId}@pending.corpverse.local`,
      });
    }
  }

  if (!user) {
    throw ApiError.notFound('User not found. Please sign up first.');
  }

  const { skills, domainInterest, bio } = req.body;

  user.skills = skills;
  user.domainInterest = domainInterest;
  if (bio) user.bio = bio;
  user.profileComplete = true;

  await user.save();

  ApiResponse.ok(user, 'Profile completed successfully').send(res);
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
  getProfile,
};
