const mongoose = require('mongoose');
const { Schema } = mongoose;

// ─────────────────────────────────────────────────────
// BOT PURCHASE MODEL
// Records bot licenses purchased by Founders for their companies.
// ─────────────────────────────────────────────────────

const botPurchaseSchema = new Schema(
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
    founder: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Founder reference is required'],
      index: true,
    },
    pricePaid: {
      type: Number,
      required: true,
      min: 0,
    },
    runsUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalSpentOnRuns: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    customLabel: {
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

botPurchaseSchema.index({ company: 1, bot: 1 });

module.exports = mongoose.model('BotPurchase', botPurchaseSchema);
