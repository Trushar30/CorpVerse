const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const config = require('../config');
const {
  completeProfile,
  updateProfile,
  uploadResume,
  getResumeFile,
  redeemCode,
  getProfile,
} = require('../controllers/profile.controller');
const { requireAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { uploadLimiter } = require('../middleware/rateLimiter');
const {
  completeProfileSchema,
  updateProfileSchema,
} = require('../validations/profile.validation');

// Multer memoryStorage configuration:
// Holds the file in memory buffer (max 5MB) so it can be parsed and written directly
// to MongoDB without requiring persistent local disk storage on cloud platforms.
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: config.maxFileSize },
  fileFilter: (req, file, cb) => {
    if (config.allowedFileTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed'), false);
    }
  },
});

const { getBadges } = require('../controllers/leaderboard.controller');

// All profile routes require authentication
router.use(requireAuth);

router.get('/me', getProfile);
router.post('/complete', validate(completeProfileSchema), completeProfile);
router.put('/', validate(updateProfileSchema), updateProfile);
router.get('/resume', getResumeFile);
router.post('/resume', uploadLimiter, upload.single('resume'), uploadResume);
router.post('/redeem-code', redeemCode);
router.get('/badges', getBadges);

module.exports = router;
