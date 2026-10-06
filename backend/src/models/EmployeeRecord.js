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
        values: ['active', 'notice_period', 'resigned', 'terminated'],
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
    salary: {
      currentSalary: {
        type: Number,
        default: 85000,
      },
      salaryHistory: [
        {
          effectiveDate: { type: Date, default: Date.now },
          amount: { type: Number, required: true },
          reason: { type: String, default: 'Base compensation' },
        },
      ],
    },
    manager: {
      name: { type: String, default: 'Sarah Chen' },
      avatarUrl: { type: String, default: '/avatars/manager-1.png' },
      title: { type: String, default: 'Engineering Director' },
      style: {
        type: String,
        enum: ['supportive', 'demanding', 'analytical'],
        default: 'supportive',
      },
      feedbackHistory: [
        {
          date: { type: Date, default: Date.now },
          note: { type: String, required: true },
          sentiment: {
            type: String,
            enum: ['praise', 'warning', 'neutral'],
            default: 'neutral',
          },
        },
      ],
    },
    lastReviewDate: {
      type: Date,
      default: null,
    },
    nextReviewEligibleDate: {
      type: Date,
      default: null,
    },
    reviewHistory: [
      {
        reviewDate: { type: Date, default: Date.now },
        score: { type: Number, required: true },
        verdict: {
          type: String,
          enum: ['merit_raise', 'satisfactory', 'needs_improvement'],
          required: true,
        },
        salaryChange: { type: Number, default: 0 },
        expAwarded: { type: Number, default: 0 },
        summary: { type: String, default: '' },
        metrics: {
          completedTasksCount: { type: Number, default: 0 },
          averageDifficulty: { type: String, default: 'medium' },
          streak: { type: Number, default: 0 },
        },
      },
    ],
    noticePeriod: {
      initiatedAt: { type: Date, default: null },
      targetCompletionDate: { type: Date, default: null },
      reason: { type: String, default: null },
      noticeTasksRemaining: { type: Number, default: 2 },
      handoverTasks: [
        {
          title: { type: String, required: true },
          description: { type: String, default: '' },
          isCompleted: { type: Boolean, default: false },
          completedAt: { type: Date, default: null },
        },
      ],
      referenceLetter: {
        companyName: { type: String, default: null },
        roleTitle: { type: String, default: null },
        employeeName: { type: String, default: null },
        tenure: { type: String, default: null },
        rating: { type: String, default: null },
        text: { type: String, default: null },
        issuedAt: { type: Date, default: null },
      },
    },
    exitRecord: {
      type: exitRecordSchema,
      default: null,
    },
    performanceStatus: {
      type: String,
      enum: {
        values: ['good', 'warning', 'critical'],
        message: '{VALUE} is not a valid performance status',
      },
      default: 'good',
    },
    consecutiveCriticalWeeks: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastPerformanceCheckAt: {
      type: Date,
      default: null,
    },
    strikesCount: {
      type: Number,
      default: 0,
      min: 0,
      max: 3,
    },
    disciplinaryStatus: {
      type: String,
      enum: ['good_standing', 'warning', 'pip_demotion', 'terminated'],
      default: 'good_standing',
    },
    warnings: [
      {
        issuedAt: { type: Date, default: Date.now },
        reason: { type: String, required: true },
        strikeNumber: { type: Number, required: true },
      },
    ],
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
  return this.employmentStatus === 'active' || this.employmentStatus === 'notice_period';
});

// ─── Indexes ────────────────────────────────────
employeeRecordSchema.index({ user: 1, employmentStatus: 1 });
employeeRecordSchema.index({ company: 1, employmentStatus: 1 });

module.exports = mongoose.model('EmployeeRecord', employeeRecordSchema);
