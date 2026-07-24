const { Webhook } = require('svix');
const { User } = require('../models');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const config = require('../config');

/**
 * Handle Clerk webhook events.
 * Syncs user data from Clerk to our MongoDB User collection.
 * Events: user.created, user.updated, user.deleted
 */
const handleClerkWebhook = asyncHandler(async (req, res) => {
  const svixHeaders = {
    'svix-id': req.headers['svix-id'],
    'svix-timestamp': req.headers['svix-timestamp'],
    'svix-signature': req.headers['svix-signature'],
  };

  // Verify webhook signature
  if (!config.clerkWebhookSecret) {
    throw ApiError.internal('Clerk webhook secret not configured');
  }

  const wh = new Webhook(config.clerkWebhookSecret);
  let event;

  try {
    event = wh.verify(JSON.stringify(req.body), svixHeaders);
  } catch (err) {
    console.error('❌ Webhook verification failed:', err.message);
    throw ApiError.badRequest('Invalid webhook signature');
  }

  const { type, data } = event;

  switch (type) {
    case 'user.created': {
      const existingUser = await User.findOne({ clerkId: data.id });
      if (!existingUser) {
        await User.create({
          clerkId: data.id,
          name:
            `${data.first_name || ''} ${data.last_name || ''}`.trim() ||
            'CorpVerse User',
          email:
            data.email_addresses?.[0]?.email_address || `${data.id}@corpverse.local`,
          avatarUrl: data.image_url || null,
        });
        console.log(`✅ User synced from Clerk: ${data.id}`);
      }
      break;
    }

    case 'user.updated': {
      const updateData = {};
      if (data.first_name || data.last_name) {
        updateData.name =
          `${data.first_name || ''} ${data.last_name || ''}`.trim();
      }
      if (data.email_addresses?.[0]?.email_address) {
        updateData.email = data.email_addresses[0].email_address;
      }
      if (data.image_url) {
        updateData.avatarUrl = data.image_url;
      }

      if (Object.keys(updateData).length > 0) {
        await User.findOneAndUpdate({ clerkId: data.id }, updateData);
        console.log(`🔄 User updated from Clerk: ${data.id}`);
      }
      break;
    }

    case 'user.deleted': {
      await User.findOneAndDelete({ clerkId: data.id });
      console.log(`🗑️  User deleted from Clerk: ${data.id}`);
      break;
    }

    default:
      console.log(`ℹ️  Unhandled Clerk event: ${type}`);
  }

  res.status(200).json({ received: true });
});

/**
 * GET /api/auth/me
 * Returns the current authenticated user's profile.
 * Creates the user in our DB if they don't exist yet (fallback for webhook delay).
 */
const getMe = asyncHandler(async (req, res) => {
  let user = req.user;

  // If user doesn't exist in our DB yet (webhook hasn't fired),
  // create them now with minimal data from Clerk
  if (!user && req.clerkId) {
    user = await User.findOne({ clerkId: req.clerkId });

    if (!user) {
      // Create a minimal user record — profile completion will fill the rest
      user = await User.create({
        clerkId: req.clerkId,
        name: 'CorpVerse User',
        email: `${req.clerkId}@pending.corpverse.local`,
      });
    }
  }

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  ApiResponse.ok(user, 'User profile retrieved').send(res);
});

module.exports = {
  handleClerkWebhook,
  getMe,
};
