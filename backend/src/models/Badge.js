const mongoose = require('mongoose');
const { Schema } = mongoose;

// ─────────────────────────────────────────────────────
// BADGE MODEL
// Achievement badges earned by users for reaching milestones,
// streaks, promotions, career events, and venture creations.
// Unique per user per badgeType.
// ─────────────────────────────────────────────────────

const badgeSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    badgeType: {
      type: String,
      enum: [
        'first_application',
        'first_interview',
        'first_job',
        'streak_7',
        'streak_14',
        'streak_30',
        'streak_100',
        'tasks_10',
        'tasks_50',
        'tasks_100',
        'promoted_mid',
        'promoted_senior',
        'founder_unlocked',
        'first_company',
        'first_hire',
        'profitable_quarter',
        'exp_100',
        'exp_500',
        'exp_1000',
      ],
      required: [true, 'Badge type is required'],
    },
    unlockedAt: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    bufferCommands: false,
  }
);

// Unique compound index: only 1 badge of each type per user
badgeSchema.index({ userId: 1, badgeType: 1 }, { unique: true });

module.exports = mongoose.model('Badge', badgeSchema);
