const dotenv = require('dotenv');
const path = require('path');

// Load environment variables before anything else
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
  // Server
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: (process.env.NODE_ENV || 'development') === 'development',
  isProd: process.env.NODE_ENV === 'production',

  // MongoDB
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/corpverse',

  // Clerk
  clerkSecretKey: process.env.CLERK_SECRET_KEY,
  clerkPublishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  clerkWebhookSecret: process.env.CLERK_WEBHOOK_SECRET,

  // CORS
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  // AI Microservice
  aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',

  // File Uploads
  uploadDir: path.resolve(__dirname, '../../uploads'),
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedFileTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],

  // Game Config (tunable constants)
  game: {
    cooldownHours: 48,
    promotionThresholds: {
      junior_to_mid: 200,
      mid_to_senior: 500,
    },
    founderUnlockExp: 500,
    defaultTaskExpReward: 10,
  },
};
