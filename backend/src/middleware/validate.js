const { z } = require('zod');
const ApiError = require('../utils/ApiError');

/**
 * Creates validation middleware from a Zod schema.
 * Validates req.body, req.query, or req.params based on the schema keys.
 *
 * Usage:
 *   const schema = { body: z.object({ name: z.string() }) };
 *   router.post('/users', validate(schema), controller);
 */
const validate = (schema) => (req, res, next) => {
  const errors = [];

  // Validate each part of the request that has a schema defined
  for (const key of ['body', 'query', 'params']) {
    if (schema[key]) {
      const result = schema[key].safeParse(req[key]);
      if (!result.success) {
        const formatted = result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));
        errors.push(...formatted);
      } else {
        // Replace with parsed/transformed values
        req[key] = result.data;
      }
    }
  }

  if (errors.length > 0) {
    return next(ApiError.badRequest('Validation failed', errors));
  }

  next();
};

module.exports = validate;
