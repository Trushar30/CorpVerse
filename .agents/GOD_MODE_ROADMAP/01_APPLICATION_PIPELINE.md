# Module 1 — Real Application Pipeline

> **Priority:** 🔴 CRITICAL (everything else depends on this)
> **Difficulty:** Medium
> **Estimated Time:** 3-4 hours
> **Cost:** $0

---

## Current State (Broken)

The `application.controller.js` has 3 placeholder functions that all return `🚧 Phase 2` messages:

```javascript
// CURRENT — Does nothing
const createApplication = asyncHandler(async (req, res) => {
  ApiResponse.ok(null, '🚧 Application creation coming in Phase 2').send(res);
});
```

The frontend `Dashboard.jsx` catches this failure and appends a fake local object that vanishes on page reload.

---

## Target State (God Mode)

A fully functional application pipeline backed by the **already-designed** `Application` model:

```
Job Seeker clicks "Apply" on a company role
        │
        ▼
Application created in MongoDB (status: pending_screening)
        │
        ▼
Module 2 (AI Screening) runs automatically
        │
        ├── Pass → status: screening_passed → Interview unlocked
        └── Fail → status: screening_rejected + 48hr cooldown + feedback
```

---

## Backend Implementation

### File: `backend/src/controllers/application.controller.js`

Replace the entire file with real logic:

```javascript
const { Application, Role, Company, User } = require('../models');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const config = require('../config');

/**
 * POST /api/applications
 * Job seeker applies to an open role.
 * Validates: role exists, role is open, no duplicate active application, no active cooldown.
 */
const createApplication = asyncHandler(async (req, res) => {
  const { roleId } = req.body;
  if (!roleId) {
    throw ApiError.badRequest('roleId is required');
  }

  // 1. Validate role exists and is open
  const role = await Role.findById(roleId).populate('company', 'name domain');
  if (!role) throw ApiError.notFound('Role not found');
  if (!role.isOpen) throw ApiError.badRequest('This role is no longer accepting applications');
  if (role.filledCount >= role.maxOpenings) {
    throw ApiError.badRequest('All openings for this role have been filled');
  }

  // 2. Check for existing active application to same role
  const existingActive = await Application.findOne({
    user: req.user._id,
    role: roleId,
    status: { $nin: ['screening_rejected', 'interview_rejected', 'offer_declined'] },
  });
  if (existingActive) {
    throw ApiError.conflict('You already have an active application for this role');
  }

  // 3. Check cooldown from previous rejection on same role
  const lastRejected = await Application.findOne({
    user: req.user._id,
    role: roleId,
    status: { $in: ['screening_rejected', 'interview_rejected'] },
    cooldownUntil: { $gt: new Date() },
  });
  if (lastRejected) {
    const hoursLeft = Math.ceil((lastRejected.cooldownUntil - new Date()) / (1000 * 60 * 60));
    throw ApiError.badRequest(
      `You're on a ${config.game.cooldownHours}-hour cooldown. ${hoursLeft} hours remaining before you can reapply.`
    );
  }

  // 4. Create the application
  const application = await Application.create({
    user: req.user._id,
    role: roleId,
    status: 'pending_screening',
  });

  // 5. Award EXP for applying (+15 EXP)
  await User.findByIdAndUpdate(req.user._id, {
    $inc: { expTotal: 15 },
  });

  const populated = await Application.findById(application._id)
    .populate('role', 'title domain level company salaryRange requirements')
    .populate({
      path: 'role',
      populate: { path: 'company', select: 'name domain' },
    });

  ApiResponse.created(populated, `Application submitted! +15 EXP. Screening will begin shortly.`).send(res);
});

/**
 * GET /api/applications/me
 * Get all of the current user's applications with role and company details.
 */
const getMyApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ user: req.user._id })
    .populate({
      path: 'role',
      select: 'title domain level company salaryRange',
      populate: { path: 'company', select: 'name domain' },
    })
    .sort({ createdAt: -1 })
    .lean();

  ApiResponse.ok(applications, 'Applications retrieved').send(res);
});

/**
 * GET /api/applications/:id
 * Get a single application with full details including feedbacks.
 */
const getApplicationById = asyncHandler(async (req, res) => {
  const application = await Application.findOne({
    _id: req.params.id,
    user: req.user._id,
  })
    .populate({
      path: 'role',
      select: 'title domain level description requirements responsibilities salaryRange company',
      populate: { path: 'company', select: 'name domain description' },
    })
    .lean();

  if (!application) throw ApiError.notFound('Application not found');

  ApiResponse.ok(application, 'Application retrieved').send(res);
});

/**
 * POST /api/applications/:id/accept-offer
 * Accept a job offer — transitions user from job_seeker to working employee.
 */
const acceptOffer = asyncHandler(async (req, res) => {
  const application = await Application.findOne({
    _id: req.params.id,
    user: req.user._id,
    status: 'offer_pending',
  }).populate('role');

  if (!application) {
    throw ApiError.notFound('No pending offer found for this application');
  }

  // Update application status
  application.status = 'offer_accepted';
  await application.save();

  // This will be handled by Module 4 (Offer/Hire flow)
  // For now, mark the transition point
  ApiResponse.ok(application, 'Offer accepted! Welcome aboard.').send(res);
});

/**
 * POST /api/applications/:id/decline-offer
 * Decline a job offer.
 */
const declineOffer = asyncHandler(async (req, res) => {
  const application = await Application.findOne({
    _id: req.params.id,
    user: req.user._id,
    status: 'offer_pending',
  });

  if (!application) {
    throw ApiError.notFound('No pending offer found for this application');
  }

  application.status = 'offer_declined';
  await application.save();

  ApiResponse.ok(application, 'Offer declined.').send(res);
});

module.exports = {
  createApplication,
  getMyApplications,
  getApplicationById,
  acceptOffer,
  declineOffer,
};
```

### File: `backend/src/routes/application.routes.js`

Update routes to include offer endpoints:

```javascript
const express = require('express');
const router = express.Router();
const {
  createApplication,
  getMyApplications,
  getApplicationById,
  acceptOffer,
  declineOffer,
} = require('../controllers/application.controller');
const { requireAuth, requireProfile } = require('../middleware/auth');

router.use(requireAuth);

router.post('/', requireProfile, createApplication);
router.get('/me', getMyApplications);
router.get('/:id', getApplicationById);
router.post('/:id/accept-offer', requireProfile, acceptOffer);
router.post('/:id/decline-offer', requireProfile, declineOffer);

module.exports = router;
```

---

## Frontend Changes

### File: `frontend/src/api/applications.js`

Update the API helper to send `roleId` correctly:

```javascript
import api from './client';

export const createApplication = (roleId) =>
  api.post('/applications', { roleId }).then((r) => r.data);

export const getMyApplications = () =>
  api.get('/applications/me').then((r) => r.data);

export const getApplicationById = (id) =>
  api.get(`/applications/${id}`).then((r) => r.data);

export const acceptOffer = (id) =>
  api.post(`/applications/${id}/accept-offer`).then((r) => r.data);

export const declineOffer = (id) =>
  api.post(`/applications/${id}/decline-offer`).then((r) => r.data);
```

### File: `frontend/src/pages/Dashboard.jsx`

**Key changes:**

1. **Remove** the hardcoded `defaultApplications` array (lines 82-105)
2. **Remove** the fallback to `setApplications(defaultApplications)` — show empty state UI instead
3. **Update** `handleApplyToCompany` to:
   - First look up the company's roles via `GET /api/companies/:id/roles`
   - Let user pick a specific role
   - Call `createApplication(roleId)` with the real role ObjectId
   - On success, re-fetch applications from DB
4. **Remove** the fake local `newApp` object creation

```javascript
// REPLACE the handleApplyToCompany function:
const handleApplyToCompany = async (comp, selectedRoleId) => {
  try {
    const res = await createApplication(selectedRoleId);
    showToast(res.message || `🎉 Application submitted! +15 EXP`);
    // Re-fetch real applications from database
    const appsRes = await getMyApplications();
    setApplications(appsRes.data || []);
    if (refreshUser) refreshUser();
  } catch (err) {
    showToast(`❌ ${err.response?.data?.message || err.message}`);
  }
};
```

---

## Verification Checklist

- [ ] `POST /api/applications` creates a real `Application` document in MongoDB
- [ ] Duplicate application to same role is blocked
- [ ] 48-hour cooldown is enforced after rejection
- [ ] `GET /api/applications/me` returns real applications with populated role + company
- [ ] Frontend no longer shows hardcoded mock applications
- [ ] Apply button creates persistent application that survives page reload
- [ ] EXP is awarded (+15) on application creation
- [ ] Application status correctly shows `pending_screening`

---

## What This Unlocks

Once Module 1 is complete, Module 2 (AI Screening) can be triggered **automatically** after application creation to process `pending_screening` applications.
