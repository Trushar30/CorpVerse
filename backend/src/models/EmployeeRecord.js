const mongoose = require('mongoose');
const { Schema } = mongoose;

// ─────────────────────────────────────────────────────
// EXIT RECORD SUB-DOCUMENT SCHEMA
// Embedded inside EmployeeRecord (1:1 relationship).
// Created when an employee resigns or is terminated.
// ─────────────────────────────────────────────────────

const exitRecordSchema = new Schema(
  {
    exitType: {
      type: String,
      enum: {
        values: ['resignation', 'termination'],
        message: '{VALUE} is not a valid exit type',
      },
      required: true,
    },
    feedbackText: {
      type: String,
      default: null,
    },
    reason: {
      type: String,
      default: null,
    },
    exitedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

// ─────────────────────────────────────────────────────
// EMPLOYEE RECORD MODEL
// Created when a user accepts a job offer.
// Tracks employment status, current level, and embeds
// the exit record if the employee leaves.
// ─────────────────────────────────────────────────────

const employeeRecordSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company reference is required'],
      index: true,
    },
    role: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      required: [true, 'Role reference is required'],
    },
    employmentStatus: {
      type: String,
      enum: {
        values: ['active', 'resigned', 'terminated'],
        message: '{VALUE} is not a valid employment status',
      },
      default: 'active',
    },
    currentLevel: {
      type: String,
      enum: {
        values: ['junior', 'mid', 'senior'],
        message: '{VALUE} is not a valid level',
      },
      default: 'junior',
    },
    hiredAt: {
      type: Date,
      default: Date.now,
    },
    exitRecord: {
      type: exitRecordSchema,
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
employeeRecordSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'employeeRecord',
});

employeeRecordSchema.virtual('expLogs', {
  ref: 'ExpLog',
  localField: '_id',
  foreignField: 'employeeRecord',
});

employeeRecordSchema.virtual('isActive').get(function () {
  return this.employmentStatus === 'active';
});

// ─── Indexes ────────────────────────────────────
employeeRecordSchema.index({ user: 1, employmentStatus: 1 });
employeeRecordSchema.index({ company: 1, employmentStatus: 1 });

module.exports = mongoose.model('EmployeeRecord', employeeRecordSchema);
