const ApiError = require('../utils/ApiError');
const { verifyToken } = require('../utils/jwt');
const { User } = require('../models');

/**
 * Require authenticated user via JWT Bearer token.
 * Attaches the full user document to req.user.
 */
const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Authentication required');
    }

    const token = header.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await User.findById(decoded.id);
    if (!user) {
      throw ApiError.unauthorized('User no longer exists');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) return next(error);
    next(ApiError.unauthorized('Invalid or expired token'));
  }
};

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
 * Require a specific user role (admin, job_seeker, working, founder).
 * Use AFTER requireAuth middleware.
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.forbidden('Authentication required'));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `This action requires ${roles.join(' or ')} role. You are: ${req.user.role}`
        )
      );
    }
    next();
  };
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
  requireAuth,
  requireProfile,
  requireRole,
  requireStatus,
};
