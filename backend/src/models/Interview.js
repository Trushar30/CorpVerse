const mongoose = require('mongoose');
const { Schema } = mongoose;

// ─────────────────────────────────────────────────────
// INTERVIEW MODEL
// Stores the chat-based interview transcript between
// the user and the AI interviewer.
// Kept separate from Application because transcripts
// can be large (many messages).
// ─────────────────────────────────────────────────────

const messageSchema = new Schema(
  {
    role: {
      type: String,
      enum: ['ai', 'user'],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const interviewSchema = new Schema(
  {
    application: {
      type: Schema.Types.ObjectId,
      ref: 'Application',
      required: [true, 'Application reference is required'],
      unique: true,
      index: true,
    },
    transcript: {
      type: [messageSchema],
      default: [],
    },
    result: {
      type: String,
      enum: {
        values: ['passed', 'failed', 'in_progress'],
        message: '{VALUE} is not a valid interview result',
      },
      default: 'in_progress',
    },
    totalTurns: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxTurns: {
      type: Number,
      default: 10,
      min: 1,
    },
    evaluationNotes: {
      type: String,
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

// ─── Virtuals ───────────────────────────────────
interviewSchema.virtual('isComplete').get(function () {
  return this.result !== 'in_progress';
});

interviewSchema.virtual('turnsRemaining').get(function () {
  return Math.max(0, this.maxTurns - this.totalTurns);
});

module.exports = mongoose.model('Interview', interviewSchema);
