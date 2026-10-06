const express = require('express');
const router = express.Router();
const {
  listModules,
  getModuleById,
  completeModule,
} = require('../controllers/training.controller');
const { requireAuth, requireProfile } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { z } = require('zod');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const getModuleSchema = {
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid module ID format'),
  }),
};

const completeModuleSchema = {
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid module ID format'),
  }),
  body: z.object({
    answers: z.array(z.any()).min(1, 'Answers must be provided'),
  }),
};

router.get('/modules', requireAuth, listModules);
router.get('/modules/:id', requireAuth, validate(getModuleSchema), getModuleById);
router.post(
  '/modules/:id/complete',
  requireAuth,
  requireProfile,
  validate(completeModuleSchema),
  completeModule
);

module.exports = router;
