const mongoose = require('mongoose');
const { Schema } = mongoose;

const domainSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Domain name is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    icon: {
      type: String,
      default: 'Cpu',
    },
    color: {
      type: String,
      default: 'emerald',
    },
    isSystem: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Domain', domainSchema);
