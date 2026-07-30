const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const User = require('../src/models/User');

const cleanIndexes = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/corpverse';
  console.log('Connecting to MongoDB...');
  await mongoose.connect(mongoUri);
  console.log('✅ Connected');

  console.log('Synchronizing User indexes...');
  const result = await User.syncIndexes();
  console.log('✅ Indexes synchronized:', result);

  await mongoose.disconnect();
  console.log('✅ Disconnected');
};

cleanIndexes().catch((err) => {
  console.error('❌ Index cleanup failed:', err);
  process.exit(1);
});
