const mongoose = require('mongoose');
const { Schema } = mongoose;

// ─────────────────────────────────────────────────────
// PIPELINE RUN MODEL
// Audit trail of every bot pipeline execution.
// ─────────────────────────────────────────────────────

const pipelineRunSchema = new Schema(
  {
    bot: {
      type: Schema.Types.ObjectId,
      ref: 'AIBot',
      required: [true, 'Bot reference is required'],
      index: true,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company reference is required'],
      index: true,
    },
    triggeredBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Triggered by user reference is required'],
    },
    pipelineType: {
      type: String,
      required: true,
    },
    inputPayload: {
      type: Schema.Types.Mixed,
      required: true,
    },
    outputResult: {
      type: Schema.Types.Mixed,
      default: null,
    },
    status: {
      type: String,
      enum: ['completed', 'failed', 'running'],
      default: 'completed',
      index: true,
    },
    tokensUsed: {
      type: Number,
      default: 0,
    },
    costCorpCoins: {
      type: Number,
      required: true,
      default: 0,
    },
    durationMs: {
      type: Number,
      default: 0,
    },
    errorMessage: {
      type: String,
      default: null,
    },
    modelUsed: {
      type: String,
      default: '',
    },
    providerSlug: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

pipelineRunSchema.index({ createdAt: -1 });
pipelineRunSchema.index({ company: 1, createdAt: -1 });

module.exports = mongoose.model('PipelineRun', pipelineRunSchema);
