const mongoose = require('mongoose');
const { Schema } = mongoose;

// ─────────────────────────────────────────────────────
// AI BOT MODEL
// Configured by AI Manager and published to Marketplace
// Founders hire/purchase and deploy these into company pipelines.
// ─────────────────────────────────────────────────────

const aiBotSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Bot name is required'],
      trim: true,
      maxlength: [120, 'Name cannot exceed 120 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Bot slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['hiring', 'interview', 'code_review', 'growth', 'support', 'custom'],
      default: 'hiring',
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    tagline: {
      type: String,
      maxlength: [250, 'Tagline cannot exceed 250 characters'],
      default: '',
    },
    provider: {
      type: Schema.Types.ObjectId,
      ref: 'AIProvider',
      required: [true, 'AI Provider reference is required'],
    },
    modelId: {
      type: String,
      required: [true, 'Model ID is required'],
      trim: true,
    },
    pipelineType: {
      type: String,
      required: [true, 'Pipeline type is required'],
      enum: [
        'resume_screening',
        'interview_evaluation',
        'code_review',
        'growth_campaign',
        'support_ops',
        'custom_agent',
      ],
      default: 'resume_screening',
    },
    systemPrompt: {
      type: String,
      required: [true, 'System prompt is required'],
    },
    capabilities: {
      type: [String],
      default: [],
    },
    pricing: {
      basePrice: {
        type: Number,
        required: true,
        default: 1000,
        min: 0,
      },
      pricePerRun: {
        type: Number,
        required: true,
        default: 25,
        min: 0,
      },
      tier: {
        type: String,
        enum: ['utility', 'pro', 'frontier'],
        default: 'pro',
      },
      capabilityScore: {
        type: Number,
        default: 80,
        min: 0,
        max: 100,
      },
    },
    icon: {
      type: String,
      default: 'Bot',
    },
    color: {
      type: String,
      default: 'cyan',
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'deprecated'],
      default: 'active',
      index: true,
    },
    totalRuns: {
      type: Number,
      default: 0,
      min: 0,
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 1,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    sampleInput: {
      type: Schema.Types.Mixed,
      default: {},
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

aiBotSchema.index({ category: 1, status: 1 });
aiBotSchema.index({ provider: 1 });

module.exports = mongoose.model('AIBot', aiBotSchema);
