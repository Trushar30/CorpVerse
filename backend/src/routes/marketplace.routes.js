const express = require('express');
const router = express.Router();
const marketplaceController = require('../controllers/marketplace.controller');
const { requireAuth } = require('../middleware/auth');

// Publicly browseable catalog
router.get('/bots', marketplaceController.getMarketplaceBots);
router.get('/bots/:id', marketplaceController.getBotDetails);

// Founder protected operations
router.use(requireAuth);
router.post('/bots/:id/purchase', marketplaceController.purchaseBot);
router.get('/my-bots', marketplaceController.getMyPurchasedBots);
router.post('/bots/:id/run', marketplaceController.executeBotRun);
router.get('/runs', marketplaceController.getMyRuns);

module.exports = router;
