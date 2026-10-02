# Prompt 1.1 — Application System Backend

## Context
The CorpVerse platform lets job seekers browse companies and roles. Currently, clicking "Apply" triggers a stub endpoint that returns `"🚧 Application creation coming in Phase 2"`. The `Application` model already exists in MongoDB with a full status state machine. The AI microservice has a `resume_screening` pipeline ready. We need to wire everything together.

### Existing Assets
- **Model**: `backend/src/models/Application.js` — Full schema with status enum, feedbacks array, cooldown, screening score
- **Model**: `backend/src/models/Resume.js` — Resume binary + extracted text stored in MongoDB
- **Routes**: `backend/src/routes/application.routes.js` — Routes mounted at `/api/applications`
- **Controller**: `backend/src/controllers/application.controller.js` — Stub methods
- **Validation**: `backend/src/validations/application.validation.js` — Zod schemas exist
- **AI Pipeline**: `ai_service/pipelines/resume_screening.py` — ScoutATS bot ready
- **Frontend API**: `frontend/src/api/applications.js` — API functions defined

## Objective
Implement the complete job application backend: create applications, run AI-powered ATS resume screening, track application status, provide detailed rejection feedback, and enforce cooldown periods.

---

## Task 1: Implement `application.service.js`

**File**: `backend/src/services/application.service.js`

### 1.1 — `createApplication(userId, roleId)`
Business logic:
1. Verify the user has `profileComplete === true`
2. Verify the user has uploaded a resume (`Resume` document exists for this user)
3. Verify the `Role` exists, is open (`isOpen === true`), and has openings (`filledCount < maxOpenings`)
4. Check the user doesn't already have an active application for this role (check compound unique index — `Application` has `{ user: 1, role: 1 }` unique index with partial filter excluding rejected/declined)
5. Check the user isn't on cooldown for this role (`cooldownUntil` check)
6. Create the `Application` with status `pending_screening`
7. **Trigger async ATS screening** (don't await — let it run in background):
   - Fetch user's `Resume.extractedText`
   - Fetch the `Role` details (title, requirements, responsibilities, domain)
   - Call the AI service `resume_screening` pipeline
   - Update the application with screening result
8. Return the created application

### 1.2 — `processScreening(applicationId)`
Called asynchronously after application creation:
1. Fetch application with populated role and user resume
2. Call `AIService.screenResume()` with resume text and role requirements
3. Parse the AI response (match score, fit verdict, strengths, gaps, interview questions)
4. If score >= 60 (configurable threshold in `constants.js`):
   - Update application status to `screening_passed`
   - Add feedback entry: `{ stage: 'screening', score, feedbackText, strengths, improvements }`
5. If score < 60:
   - Update application status to `screening_rejected`
   - Set `cooldownUntil` to 7 days from now (configurable)
   - Add detailed feedback entry with specific improvement tips
6. Handle AI service failures gracefully:
   - If AI service is down, set status to `screening_passed` with score of 70 (benefit of doubt)
   - Log the failure for monitoring

### 1.3 — `getMyApplications(userId, filters)`
1. Query applications for `user === userId`
2. Support filtering by `status` (active, rejected, all)
3. Populate `role` (with title, company name, domain, level)
4. Sort by `createdAt` descending
5. Include pagination (page, limit)

### 1.4 — `getApplicationById(applicationId, userId)`
1. Fetch application by ID
2. Verify the application belongs to the requesting user (or user is admin/founder of the company)
3. Populate role details, company details, and feedbacks
4. If `screening_rejected`: include full feedback with improvement suggestions

---

## Task 2: Implement `application.controller.js`

**File**: `backend/src/controllers/application.controller.js`

Replace all stub methods with real implementations that call the service layer:

```javascript
const applicationService = require('../services/application.service');

// POST /api/applications
exports.createApplication = asyncHandler(async (req, res) => {
  const { roleId } = req.body;
  const application = await applicationService.createApplication(req.user._id, roleId);
  res.status(201).json(new ApiResponse(201, application, 'Application submitted. ATS screening in progress...'));
});

// GET /api/applications/me
exports.getMyApplications = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const result = await applicationService.getMyApplications(req.user._id, { status, page, limit });
  res.json(new ApiResponse(200, result, 'Applications retrieved'));
});

// GET /api/applications/:id
exports.getApplicationById = asyncHandler(async (req, res) => {
  const application = await applicationService.getApplicationById(req.params.id, req.user._id);
  res.json(new ApiResponse(200, application, 'Application details retrieved'));
});
```

---

## Task 3: Update Application Routes & Validation

**File**: `backend/src/routes/application.routes.js`

Ensure proper middleware chain:
```javascript
router.post('/', requireAuth, requireProfile, validate(createApplicationSchema), controller.createApplication);
router.get('/me', requireAuth, controller.getMyApplications);
router.get('/:id', requireAuth, validate(applicationIdSchema, 'params'), controller.getApplicationById);
```

**File**: `backend/src/validations/application.validation.js`

Ensure the create schema validates:
```javascript
const createApplicationSchema = z.object({
  roleId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid role ID'),
});
```

---

## Task 4: Wire AI Service Communication

**File**: `backend/src/services/ai.service.js`

Implement the `screenResume` method:
```javascript
async screenResume({ resumeText, jobRequirements, roleTitle, roleDomain }) {
  try {
    // Find the resume_screening bot and its provider
    const bot = await AIBot.findOne({ pipelineType: 'resume_screening', status: 'active' });
    if (!bot) {
      return this.fallbackScreening(resumeText, jobRequirements);
    }
    
    const provider = await AIProvider.findById(bot.provider);
    const decryptedKey = decrypt(provider.apiKeyEncrypted);
    
    const response = await axios.post(`${this.baseUrl}/pipelines/run`, {
      pipeline_type: 'resume_screening',
      provider_url: provider.baseUrl,
      api_key: decryptedKey,
      model_id: bot.modelId,
      system_prompt: bot.systemPrompt,
      input: {
        resume_text: resumeText,
        job_requirements: jobRequirements,
        role_title: roleTitle,
      }
    }, { timeout: this.timeout });
    
    return response.data;
  } catch (error) {
    console.error('AI screening failed, using fallback:', error.message);
    return this.fallbackScreening(resumeText, jobRequirements);
  }
}
```

---

## Task 5: Add Screening Threshold Constants

**File**: `backend/src/utils/constants.js`

Add:
```javascript
const SCREENING = {
  PASS_THRESHOLD: 60,          // Minimum ATS score to pass screening
  COOLDOWN_DAYS: 7,             // Days before user can re-apply to same role
  FALLBACK_SCORE: 70,           // Score given when AI service is unavailable
  MAX_ACTIVE_APPLICATIONS: 5,   // Max concurrent active applications per user
};
```

---

## Acceptance Criteria
- [ ] `POST /api/applications` creates an application and triggers AI screening
- [ ] ATS screening runs asynchronously — response returns immediately with `pending_screening` status
- [ ] Application status transitions: `pending_screening` → `screening_passed` OR `screening_rejected`
- [ ] Rejected applications include detailed feedback (strengths, weaknesses, improvement tips)
- [ ] Rejected applications set a cooldown period preventing re-application
- [ ] `GET /api/applications/me` returns user's applications with populated role/company info
- [ ] `GET /api/applications/:id` returns full application details with all feedbacks
- [ ] Duplicate applications to the same role are blocked (while active)
- [ ] Missing resume blocks application creation with helpful error message
- [ ] AI service failure gracefully falls back without blocking the user
- [ ] All new endpoints return proper `ApiResponse` format
- [ ] Validation rejects invalid role IDs
