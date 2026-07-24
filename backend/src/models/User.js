const mongoose = require('mongoose');
const { Schema } = mongoose;

// ─────────────────────────────────────────────────────
// USER MODEL
// Represents a platform user. Linked to Clerk via clerkId.
// Status enforces single-active-role: job_seeker | employee | founder
// ─────────────────────────────────────────────────────

const userSchema = new Schema(
  {
    clerkId: {
      type: String,
      required: [true, 'Clerk ID is required'],
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    resumeUrl: {
      type: String,
      default: null,
    },
    skills: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 20,
        message: 'Cannot have more than 20 skills',
      },
    },
    domainInterest: {
      type: String,
      trim: true,
      default: null,
    },
    currentStatus: {
      type: String,
      enum: {
        values: ['job_seeker', 'employee', 'founder'],
        message: '{VALUE} is not a valid status',
      },
      default: 'job_seeker',
    },
    expTotal: {
      type: Number,
      default: 0,
      min: [0, 'EXP cannot be negative'],
    },
    profileComplete: {
      type: Boolean,
      default: false,
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Virtuals ───────────────────────────────────
userSchema.virtual('canBecomeFounder').get(function () {
  return this.expTotal >= 500; // game.founderUnlockExp
});

// ─── Indexes ────────────────────────────────────
userSchema.index({ currentStatus: 1 });
userSchema.index({ expTotal: -1 });

module.exports = mongoose.model('User', userSchema);
