const mongoose = require('mongoose');
const { Schema } = mongoose;

const companyScenarioSchema = new Schema(
  {
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['finance', 'tech', 'hr', 'marketing', 'crisis'],
      default: 'finance',
    },
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    options: [
      {
        text: { type: String, required: true },
        description: { type: String, required: true },
        treasuryImpact: { type: Number, required: true }, // e.g., +2500 or -4000
        valuationImpact: { type: Number, required: true }, // e.g., +150000 or -50000
        riskRating: { type: String, enum: ['conservative', 'moderate', 'aggressive'], default: 'moderate' },
        outcomeMessage: { type: String, required: true },
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'resolved'],
      default: 'pending',
    },
    chosenOptionIndex: {
      type: Number,
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CompanyScenario', companyScenarioSchema);
