const { z } = require('zod');

const createCompanySchema = {
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, 'Company name must be at least 2 characters')
      .max(100, 'Company name cannot exceed 100 characters'),
    domain: z
      .string()
      .trim()
      .min(1, 'Domain is required'),
    description: z
      .string()
      .trim()
      .max(1000, 'Description cannot exceed 1000 characters')
      .optional(),
    tagline: z
      .string()
      .trim()
      .max(200, 'Tagline cannot exceed 200 characters')
      .optional(),
  }),
};

const createRoleSchema = {
  body: z.object({
    title: z
      .string()
      .trim()
      .min(2, 'Role title must be at least 2 characters')
      .max(100, 'Title cannot exceed 100 characters'),
    domain: z
      .string()
      .trim()
      .min(1, 'Domain is required'),
    level: z
      .enum(['junior', 'mid', 'senior'])
      .optional()
      .default('junior'),
    description: z
      .string()
      .trim()
      .max(2000, 'Description cannot exceed 2000 characters')
      .optional(),
    requirements: z
      .array(z.string().trim().min(1))
      .optional()
      .default([]),
    responsibilities: z
      .array(z.string().trim().min(1))
      .optional()
      .default([]),
  }),
};

const browseCompaniesSchema = {
  query: z.object({
    domain: z.string().trim().optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().min(1).max(50).optional().default(10),
  }),
};

module.exports = {
  createCompanySchema,
  createRoleSchema,
  browseCompaniesSchema,
};
