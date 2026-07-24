const { z } = require('zod');

const updateProfileSchema = {
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters')
      .optional(),
    skills: z
      .array(z.string().trim().min(1))
      .max(20, 'Cannot have more than 20 skills')
      .optional(),
    domainInterest: z
      .string()
      .trim()
      .min(1, 'Domain interest cannot be empty')
      .optional(),
    bio: z
      .string()
      .trim()
      .max(500, 'Bio cannot exceed 500 characters')
      .optional(),
  }),
};

const completeProfileSchema = {
  body: z.object({
    skills: z
      .array(z.string().trim().min(1))
      .min(1, 'At least one skill is required')
      .max(20, 'Cannot have more than 20 skills'),
    domainInterest: z
      .string()
      .trim()
      .min(1, 'Domain interest is required'),
    bio: z
      .string()
      .trim()
      .max(500, 'Bio cannot exceed 500 characters')
      .optional(),
  }),
};

module.exports = {
  updateProfileSchema,
  completeProfileSchema,
};
