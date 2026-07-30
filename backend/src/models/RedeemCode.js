const mongoose = require('mongoose');
const { Schema } = mongoose;

const redeemCodeSchema = new Schema(
  {
    code: {
      type: String,
      required: [true, 'Code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    expAmount: {
      type: Number,
      required: [true, 'EXP amount is required'],
      min: [1, 'EXP amount must be at least 1'],
    },
    maxUses: {
      type: Number,
      default: 100,
      min: [1, 'Max uses must be at least 1'],
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    redeemedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    expiresAt: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('RedeemCode', redeemCodeSchema);
