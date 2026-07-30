const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Schema } = mongoose;

// ─────────────────────────────────────────────────────
// USER MODEL
// Custom auth — email + hashed password.
// Role: admin | job_seeker | working | founder
// Status tracks in-game progression: job_seeker | employee | founder
// ─────────────────────────────────────────────────────

const userSchema = new Schema(
  {
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
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // never returned in queries by default
    },
    role: {
      type: String,
      enum: {
        values: ['admin', 'job_seeker', 'working', 'founder'],
        message: '{VALUE} is not a valid role',
      },
      default: 'job_seeker',
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
    isVerified: {
      type: Boolean,
      default: false,
    },
    otpCode: {
      type: String,
      select: false,
      default: null,
    },
    otpExpiresAt: {
      type: Date,
      select: false,
      default: null,
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

// ─── Password Hashing ───────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// ─── Virtuals ───────────────────────────────────
userSchema.virtual('canBecomeFounder').get(function () {
  return this.expTotal >= 500; // game.founderUnlockExp
});

// ─── Indexes ────────────────────────────────────
userSchema.index({ role: 1 });
userSchema.index({ currentStatus: 1 });
userSchema.index({ expTotal: -1 });

module.exports = mongoose.model('User', userSchema);
