const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Resume Schema
 * Stores original document binary (free in MongoDB) along with extracted plain text
 * for downstream AI processing (screening, skill extraction, interview generation).
 */
const resumeSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
      index: true,
    },
    filename: {
      type: String,
      required: [true, 'Filename is required'],
      trim: true,
    },
    mimetype: {
      type: String,
      required: [true, 'MIME type is required'],
      enum: [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
      ],
    },
    size: {
      type: Number,
      required: [true, 'File size is required'],
      max: [5 * 1024 * 1024, 'Resume file size cannot exceed 5MB'],
    },
    // Raw binary buffer stored directly in MongoDB (select: false to avoid heavy memory queries)
    fileBuffer: {
      type: Buffer,
      required: [true, 'Resume binary data is required'],
      select: false,
    },
    // Plain text version parsed from document for AI pipeline consumption
    extractedText: {
      type: String,
      default: '',
    },
    wordCount: {
      type: Number,
      default: 0,
    },
    pageCount: {
      type: Number,
      default: null,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Resume', resumeSchema);
