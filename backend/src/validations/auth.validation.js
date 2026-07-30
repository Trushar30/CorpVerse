const { z } = require('zod');

const registerSchema = {
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters'),
    email: z
      .string()
      .trim()
      .email('Please provide a valid email')
      .toLowerCase(),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(128, 'Password cannot exceed 128 characters'),
  }),
};

const loginSchema = {
  body: z.object({
    email: z
      .string()
      .trim()
      .email('Please provide a valid email')
      .toLowerCase(),
    password: z
      .string()
      .min(1, 'Password is required'),
  }),
};

const verifyEmailSchema = {
  body: z.object({
    otpCode: z
      .string()
      .trim()
      .length(6, 'Verification code must be exactly 6 digits'),
  }),
};

module.exports = { registerSchema, loginSchema, verifyEmailSchema };
