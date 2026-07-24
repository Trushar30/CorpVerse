const mongoose = require('mongoose');
const { Schema } = mongoose;

// ─────────────────────────────────────────────────────
// EXP LOG MODEL
// Append-only audit log of all EXP changes.
// Used for transparent EXP history and debugging.
// ─────────────────────────────────────────────────────

const expLogSchema = new Schema(
  {
    employeeRecord: {
      type: Schema.Types.ObjectId,
      ref: 'EmployeeRecord',
      required: [true, 'Employee record reference is required'],
      index: true,
    },
    expChange: {
      type: Number,
      required: [true, 'EXP change value is required'],
    },
    reason: {
      type: String,
      required: [true, 'Reason for EXP change is required'],
      trim: true,
      maxlength: [500, 'Reason cannot exceed 500 characters'],
    },
    source: {
      type: String,
      enum: ['task_completion', 'promotion_bonus', 'performance_review', 'penalty', 'other'],
      default: 'task_completion',
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ────────────────────────────────────
expLogSchema.index({ employeeRecord: 1, createdAt: -1 });

module.exports = mongoose.model('ExpLog', expLogSchema);
