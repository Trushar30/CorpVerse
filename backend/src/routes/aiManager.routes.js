const express = require('express');
const router = express.Router();
const aiManagerController = require('../controllers/aiManager.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

// All AI Manager routes require ai_manager or admin role
router.use(requireAuth);
router.use(requireRole('ai_manager', 'admin'));

// Telemetry & Stats
router.get('/telemetry', aiManagerController.getTelemetry);
router.get('/pipeline-runs', aiManagerController.getPipelineRuns);

// AI Provider Management
router.get('/providers', aiManagerController.getProviders);
router.post('/providers', aiManagerController.createProvider);
router.put('/providers/:id', aiManagerController.updateProvider);
router.delete('/providers/:id', aiManagerController.deleteProvider);
router.post('/providers/:id/test', aiManagerController.testProvider);

// Pricing Calculation Preview
router.post('/pricing/calculate', aiManagerController.previewPricing);

// Bot Workshop Management
router.get('/bots', aiManagerController.getBots);
router.post('/bots', aiManagerController.createBot);
router.put('/bots/:id', aiManagerController.updateBot);
router.patch('/bots/:id/status', aiManagerController.toggleBotStatus);
router.post('/bots/:id/test-run', aiManagerController.testRunBot);

module.exports = router;
