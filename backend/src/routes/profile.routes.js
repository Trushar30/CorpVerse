const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const config = require('../config');
const {
  completeProfile,
  updateProfile,
  uploadResume,
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

const fs = require('fs');

// Multer config for resume uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(config.uploadDir)) {
      fs.mkdirSync(config.uploadDir, { recursive: true });
    }
    cb(null, config.uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `resume-${uniqueSuffix}${ext}`);
  },
});

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

// All profile routes require authentication
router.use(requireAuth);

router.get('/me', getProfile);
router.post('/complete', validate(completeProfileSchema), completeProfile);
router.put('/', validate(updateProfileSchema), updateProfile);
router.post('/resume', uploadLimiter, upload.single('resume'), uploadResume);
router.post('/redeem-code', redeemCode);

module.exports = router;
