const mongoose = require('mongoose');
const { Schema } = mongoose;

// ─────────────────────────────────────────────────────
// TASK MODEL
// Assigned to employees. Completing a task awards EXP.
// Tasks can be pre-written (seed) or LLM-generated (future).
// ─────────────────────────────────────────────────────

const taskSchema = new Schema(
  {
    employeeRecord: {
      type: Schema.Types.ObjectId,
      ref: 'EmployeeRecord',
      required: [true, 'Employee record reference is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: ['assigned', 'in_progress', 'completed'],
        message: '{VALUE} is not a valid task status',
      },
      default: 'assigned',
    },
    expReward: {
      type: Number,
      default: 10,
      min: [1, 'EXP reward must be at least 1'],
      max: [100, 'EXP reward cannot exceed 100'],
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    category: {
      type: String,
      trim: true,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ────────────────────────────────────
taskSchema.index({ employeeRecord: 1, status: 1 });

module.exports = mongoose.model('Task', taskSchema);
