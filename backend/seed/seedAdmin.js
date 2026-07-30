/**
 * Seed a default admin user.
 * Run: node seed/seedAdmin.js
 */
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const User = require('../src/models/User');

const ADMIN = {
  name: 'CorpVerse Admin',
  email: 'admin@corpverse.com',
  password: 'Admin@123',
  role: 'admin',
  profileComplete: true,
  isVerified: true,
  bio: 'Platform administrator',
};

const seedAdmin = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/corpverse';
  let isStandalone = false;
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    isStandalone = true;
  }

  const existing = await User.findOne({ email: ADMIN.email });
  if (existing) {
    console.log('ℹ️  Admin user already exists (admin@corpverse.com) — skipping.');
  } else {
    await User.create(ADMIN);
    console.log('✅ Admin user created: admin@corpverse.com / Admin@123');
  }

  if (isStandalone) {
    await mongoose.disconnect();
    console.log('✅ Done');
  }
};

if (require.main === module) {
  seedAdmin()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Seed failed:', err.message);
      process.exit(1);
    });
}

module.exports = seedAdmin;
