const mongoose = require('mongoose');
const config = require('./index');

/**
 * Connect to MongoDB Atlas (with local MongoDB fallback in development).
 * Also synchronizes schema indexes to purge stale legacy indexes (e.g. username_1, clerkId_1).
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri, {
      autoIndex: config.isDev,
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);

    // Sync User indexes to drop legacy indexes from previous schemas (username_1, clerkId_1, etc.)
    try {
      const User = require('../models/User');
      await User.syncIndexes();
      console.log('🔄 User indexes synchronized');
    } catch (syncErr) {
      console.warn('⚠️ Index sync notice:', syncErr.message);
    }

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });

    return conn;
  } catch (error) {
    console.error('❌ Primary MongoDB connection failed:', error.message);

    // Fallback to local MongoDB in development if Atlas connection fails
    if (config.isDev && config.mongoUri.includes('mongodb+srv://')) {
      const localUri = 'mongodb://localhost:27017/corpverse';
      console.log(`⚠️ Attempting fallback to local MongoDB: ${localUri}`);
      try {
        const conn = await mongoose.connect(localUri, { autoIndex: true });
        console.log(`✅ Connected to local MongoDB: ${conn.connection.host}`);

        try {
          const User = require('../models/User');
          await User.syncIndexes();
        } catch (_) {}

        return conn;
      } catch (localError) {
        console.error('❌ Local MongoDB fallback also failed:', localError.message);
        console.error('👉 TIP: Ensure your local MongoDB service is running OR add your current IP address to your MongoDB Atlas IP whitelist (https://cloud.mongodb.com).');
      }
    }

    process.exit(1);
  }
};

module.exports = connectDB;
