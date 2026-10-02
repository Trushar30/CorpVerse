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
      default: 0,
      min: [0, 'EXP amount cannot be negative'],
    },
    coinAmount: {
      type: Number,
      default: 0,
      min: [0, 'Coin amount cannot be negative'],
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

redeemCodeSchema.pre('validate', function (next) {
  if ((!this.expAmount || this.expAmount <= 0) && (!this.coinAmount || this.coinAmount <= 0)) {
    return next(new Error('At least one of expAmount or coinAmount must be greater than 0'));
  }
  next();
});

module.exports = mongoose.model('RedeemCode', redeemCodeSchema);
