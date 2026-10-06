const mongoose = require('mongoose');
const { Schema } = mongoose;

const questionSchema = new Schema(
  {
    question: {
      type: String,
      required: [true, 'Question text is required'],
    },
    options: {
      type: [String],
      required: [true, 'Options are required'],
      validate: {
        validator: (arr) => arr.length >= 2,
        message: 'Must provide at least 2 options',
      },
    },
    correctAnswerIndex: {
      type: Number,
      required: [true, 'Correct answer index is required'],
      min: 0,
    },
    explanation: {
      type: String,
      default: '',
    },
  },
  { _id: true }
);

const trainingModuleSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    domain: {
      type: String,
      required: [true, 'Domain is required'],
      index: true,
      trim: true,
    },
    level: {
      type: String,
      enum: {
        values: ['junior', 'mid', 'senior'],
        message: '{VALUE} is not a valid level',
      },
      default: 'junior',
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    questions: [questionSchema],
    expReward: {
      type: Number,
      default: 25,
      min: 0,
    },
    cooldownReductionHours: {
      type: Number,
      default: 48,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model('TrainingModule', trainingModuleSchema);
