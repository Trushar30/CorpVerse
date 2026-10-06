const { z } = require('zod');

const createApplicationSchema = {
  body: z.object({
    roleId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid role ID'),
  }),
};

const applicationIdSchema = {
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid application ID'),
  }),
};

const negotiateOfferSchema = {
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid application ID'),
  }),
  body: z.object({
    counterSalary: z.number({ required_error: 'Counter salary is required' }).positive('Counter salary must be positive'),
    argument: z.string().max(1000, 'Argument cannot exceed 1000 characters').optional(),
  }),
};

module.exports = {
  createApplicationSchema,
  applicationIdSchema,
  negotiateOfferSchema,
};
