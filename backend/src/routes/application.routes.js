const express = require('express');
const router = express.Router();
const {
  createApplication,
  getMyApplications,
  getApplicationById,
  acceptOffer,
  declineOffer,
  negotiateOffer,
} = require('../controllers/application.controller');
const { requireAuth, requireProfile } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createApplicationSchema,
  applicationIdSchema,
  negotiateOfferSchema,
} = require('../validations/application.validation');

router.post('/', requireAuth, requireProfile, validate(createApplicationSchema), createApplication);
router.get('/me', requireAuth, getMyApplications);
router.get('/:id', requireAuth, validate(applicationIdSchema), getApplicationById);
router.post('/:id/accept-offer', requireAuth, requireProfile, validate(applicationIdSchema), acceptOffer);
router.post('/:id/decline-offer', requireAuth, requireProfile, validate(applicationIdSchema), declineOffer);
router.post('/:id/negotiate', requireAuth, requireProfile, validate(negotiateOfferSchema), negotiateOffer);

module.exports = router;
