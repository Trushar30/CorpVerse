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

module.exports = {
  createApplicationSchema,
  applicationIdSchema,
};
