const { z } = require('zod');

const createApplicationSchema = {
  body: z.object({
    roleId: z
      .string()
      .min(1, 'Role ID is required'),
  }),
};

const applicationIdSchema = {
  params: z.object({
    id: z.string().min(1, 'Application ID is required'),
  }),
};

module.exports = {
  createApplicationSchema,
  applicationIdSchema,
};
