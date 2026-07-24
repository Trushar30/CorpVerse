const mongoose = require('mongoose');
const { Schema } = mongoose;

// ─────────────────────────────────────────────────────
// COMPANY MODEL
// Represents a company in the CorpVerse universe.
// Can be a seed company (AI-run) or user-founded.
// ─────────────────────────────────────────────────────

const companySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      minlength: [2, 'Company name must be at least 2 characters'],
      maxlength: [100, 'Company name cannot exceed 100 characters'],
    },
    domain: {
      type: String,
      required: [true, 'Domain is required'],
      trim: true,
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: null,
    },
    logoUrl: {
      type: String,
      default: null,
    },
    founder: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    isSeedCompany: {
      type: Boolean,
      default: false,
      index: true,
    },
    employeeCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    industry: {
      type: String,
      trim: true,
      default: null,
    },
    tagline: {
      type: String,
      maxlength: [200, 'Tagline cannot exceed 200 characters'],
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
companySchema.virtual('roles', {
  ref: 'Role',
  localField: '_id',
  foreignField: 'company',
});

companySchema.virtual('employees', {
  ref: 'EmployeeRecord',
  localField: '_id',
  foreignField: 'company',
});

// ─── Indexes ────────────────────────────────────
companySchema.index({ domain: 1 });
companySchema.index({ founder: 1 });

module.exports = mongoose.model('Company', companySchema);
