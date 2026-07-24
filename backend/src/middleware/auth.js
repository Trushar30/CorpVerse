const { clerkMiddleware, requireAuth: clerkRequireAuth, getAuth } = require('@clerk/express');
const ApiError = require('../utils/ApiError');
const { User } = require('../models');

/**
 * Initialize Clerk middleware for all routes.
 * This makes auth info available on req.auth for every request.
 */
const initClerk = clerkMiddleware();

/**
 * Require authenticated user.
 * Validates the Clerk session and attaches the CorpVerse
 * user document to req.user for downstream handlers.
 */
const requireAuth = [
  clerkRequireAuth(),
  async (req, res, next) => {
    try {
      const { userId: clerkId } = getAuth(req);

      if (!clerkId) {
        throw ApiError.unauthorized('Authentication required');
      }

      // Find the CorpVerse user linked to this Clerk ID
      const user = await User.findOne({ clerkId });

      if (!user) {
        // User authenticated with Clerk but not yet synced to our DB
        // This can happen if the webhook hasn't fired yet
        // Attach minimal info so the profile completion flow can work
        req.user = null;
        req.clerkId = clerkId;
      } else {
        req.user = user;
        req.clerkId = clerkId;
      }

      next();
    } catch (error) {
      if (error instanceof ApiError) {
        return next(error);
      }
      next(ApiError.unauthorized('Invalid or expired token'));
    }
  },
];

/**
 * Require that the user has completed their CorpVerse profile.
 * Use AFTER requireAuth middleware.
 */
const requireProfile = (req, res, next) => {
  if (!req.user) {
    return next(ApiError.forbidden('Please complete your profile first'));
  }
  if (!req.user.profileComplete) {
    return next(ApiError.forbidden('Please complete your profile to continue'));
  }
  next();
};

/**
 * Require a specific user status (job_seeker, employee, founder).
 * Use AFTER requireAuth + requireProfile middleware.
 */
const requireStatus = (...statuses) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.forbidden('Profile required'));
    }
    if (!statuses.includes(req.user.currentStatus)) {
      return next(
        ApiError.forbidden(
          `This action requires ${statuses.join(' or ')} status. You are currently: ${req.user.currentStatus}`
        )
      );
    }
    next();
  };
};

module.exports = {
  initClerk,
  requireAuth,
  requireProfile,
  requireStatus,
};
