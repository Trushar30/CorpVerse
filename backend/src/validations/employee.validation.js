const { z } = require('zod');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const taskIdParamSchema = {
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid task ID format'),
  }),
};

const completeTaskSchema = {
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid task ID format'),
  }),
  body: z.object({
    submissionData: z.any().optional(),
  }).optional(),
};

const getTasksQuerySchema = {
  query: z.object({
    status: z.enum(['assigned', 'in_progress', 'completed', 'all']).optional(),
    difficulty: z.enum(['easy', 'medium', 'hard', 'all']).optional(),
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
  }).optional(),
};

const getExpHistoryQuerySchema = {
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
  }).optional(),
};

const resignSchema = {
  body: z.object({
    reason: z.string().max(500, 'Reason cannot exceed 500 characters').optional(),
    immediate: z.boolean().optional(),
  }).optional(),
};

const noticeTaskParamSchema = {
  params: z.object({
    taskIndex: z.string().regex(/^\d+$/, 'Task index must be a non-negative integer'),
  }),
};

module.exports = {
  taskIdParamSchema,
  completeTaskSchema,
  getTasksQuerySchema,
  getExpHistoryQuerySchema,
  resignSchema,
  noticeTaskParamSchema,
};
