const mongoose = require('mongoose');
const { Schema } = mongoose;

// ─────────────────────────────────────────────────────
// ROLE MODEL
// Represents a job role posted by a company.
// Job seekers browse and apply to open roles.
// ─────────────────────────────────────────────────────

const roleSchema = new Schema(
  {
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company reference is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Role title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    domain: {
      type: String,
      required: [true, 'Domain is required'],
      trim: true,
    },
    level: {
      type: String,
      enum: {
        values: ['junior', 'mid', 'senior'],
        message: '{VALUE} is not a valid level',
      },
      default: 'junior',
    },
    description: {
      type: String,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: null,
    },
    requirements: {
      type: [String],
      default: [],
    },
    responsibilities: {
      type: [String],
      default: [],
    },
    salaryRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
    },
    isOpen: {
      type: Boolean,
      default: true,
      index: true,
    },
    maxOpenings: {
      type: Number,
      default: 1,
      min: 1,
    },
    filledCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Virtuals ───────────────────────────────────
roleSchema.virtual('applications', {
  ref: 'Application',
  localField: '_id',
  foreignField: 'role',
});

roleSchema.virtual('hasOpenings').get(function () {
  return this.isOpen && this.filledCount < this.maxOpenings;
});

// ─── Indexes ────────────────────────────────────
roleSchema.index({ domain: 1, isOpen: 1 });
roleSchema.index({ company: 1, isOpen: 1 });

module.exports = mongoose.model('Role', roleSchema);
