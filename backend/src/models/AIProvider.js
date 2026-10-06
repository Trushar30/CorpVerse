const mongoose = require('mongoose');
const { Schema } = mongoose;

// ─────────────────────────────────────────────────────
// AI PROVIDER MODEL
// Manages LLM providers (Groq, Cerebras, Google AI Studio, Mistral, OpenRouter, Pollinations, etc.)
// Maintained by the AI Manager role.
// ─────────────────────────────────────────────────────

const aiProviderSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Provider name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Provider slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    baseUrl: {
      type: String,
      required: [true, 'Base URL is required'],
      trim: true,
    },
    apiKeyEncrypted: {
      type: String,
      default: null,
      select: false, // hidden unless explicitly selected
    },
    keyHint: {
      type: String,
      default: 'Not Configured',
    },
    models: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        family: { type: String, default: 'General' },
        contextWindow: { type: Number, default: 128000 },
        speedTPS: { type: Number, default: 150 },
        capabilityScore: { type: Number, default: 75, min: 0, max: 100 },
        isFree: { type: Boolean, default: true },
        maxTokens: { type: Number, default: 4096 },
        description: { type: String, default: '' },
      },
    ],
    rateLimits: {
      rpm: { type: Number, default: 30 },
      rpd: { type: Number, default: 14400 },
      tpm: { type: Number, default: 500000 },
    },
    spendLimitUSD: {
      type: Number,
      default: 100,
      min: [0, 'Spend limit cannot be negative'],
    },
    currentSpendUSD: {
      type: Number,
      default: 0,
      min: [0, 'Current spend cannot be negative'],
    },
    totalTokensConsumed: {
      type: Number,
      default: 0,
      min: [0, 'Tokens consumed cannot be negative'],
    },
    isOpenAICompatible: {
      type: Boolean,
      default: true,
    },

    isAnonymousAllowed: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['operational', 'degraded', 'offline'],
      default: 'operational',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    notes: {
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

aiProviderSchema.index({ isActive: 1 });

module.exports = mongoose.model('AIProvider', aiProviderSchema);
