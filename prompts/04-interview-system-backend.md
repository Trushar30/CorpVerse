# Prompt 2.1 — Interview System Backend

## Context
Applications that pass ATS screening (score >= 60) advance to the interview stage. CorpVerse needs an AI-powered multi-turn conversational interview that simulates real technical/behavioral interviews. The `Interview` model already exists with transcript, result, turns, and evaluation fields. The AI service has an `interview_evaluation` pipeline.

### Existing Assets
- **Model**: `backend/src/models/Interview.js` — transcript array, result, totalTurns, maxTurns, evaluationNotes
- **Model**: `backend/src/models/Application.js` — status transitions include `interview_in_progress`, `interview_passed`, `interview_rejected`
- **Routes**: `backend/src/routes/interview.routes.js` — Stub endpoints
- **AI Pipeline**: `ai_service/pipelines/interview_evaluation.py` — HirePulse evaluation pipeline

## Objective
Build the complete interview backend: start interviews for passed applicants, conduct multi-turn AI conversations, evaluate responses, decide pass/fail, and provide detailed feedback.

---

## Task 1: Create Interview Service

**File**: `backend/src/services/interview.service.js`

### 1.1 — `startInterview(applicationId, userId)`
1. Verify the application exists and belongs to the user
2. Verify application status is `screening_passed` (only screened candidates can interview)
3. Check if an interview already exists for this application
4. Fetch the role details (title, requirements, domain, level)
5. Fetch the company details and any assigned interview bot
6. Create the `Interview` document:
   ```javascript
   {
     application: applicationId,
     transcript: [{
       role: 'ai',
       message: generateOpeningMessage(role), // "Welcome to your interview for Frontend Developer at TechNova..."
       sentAt: new Date()
     }],
     result: 'in_progress',
     totalTurns: 1,
     maxTurns: 10,  // Configurable per role level
   }
   ```
7. Update application status to `interview_in_progress`
8. Return the interview with the AI's opening message

### 1.2 — `sendMessage(interviewId, userId, userMessage)`
This is the core conversation loop:
1. Verify the interview exists and the user owns the associated application
2. Verify `result === 'in_progress'` (interview not already concluded)
3. Verify `totalTurns < maxTurns` (turns remaining)
4. Add user message to transcript
5. **Call AI service for response**:
   - Send full transcript history + role context + system prompt
   - The AI should ask progressively harder questions based on role level:
     - Junior: fundamentals, basic problem-solving
     - Mid: system design basics, real-world scenarios
     - Senior: architecture decisions, leadership, complex trade-offs
6. Add AI response to transcript
7. Increment totalTurns
8. **Check if interview should conclude**:
   - If `totalTurns >= maxTurns`: trigger evaluation
   - If AI response contains `[INTERVIEW_COMPLETE]` marker: trigger evaluation
9. Return the AI's response message and turns remaining

### 1.3 — `evaluateInterview(interviewId)`
Called when interview reaches max turns or AI signals completion:
1. Fetch full interview transcript
2. Call AI evaluation pipeline with:
   - Complete transcript
   - Role requirements
   - Evaluation rubric (technical depth, communication, problem-solving, cultural fit)
3. Parse evaluation result:
   ```javascript
   {
     overallScore: 72,        // 0-100
     verdict: 'PASS',         // PASS or FAIL
     categories: {
       technicalDepth: 75,
       communication: 80,
       problemSolving: 65,
       culturalFit: 70,
     },
     evaluationNotes: "Strong understanding of React...",
     strengths: ["Clear communication", "Good React knowledge"],
     improvements: ["Needs more system design practice"],
   }
   ```
4. If score >= 65 (configurable):
   - Set interview `result: 'passed'`
   - Update application status to `interview_passed`
   - Add feedback to application feedbacks array
5. If score < 65:
   - Set interview `result: 'failed'`
   - Update application status to `interview_rejected`
   - Set cooldown on application (14 days for interview rejection)
   - Add detailed feedback with improvement suggestions
6. Set `completedAt` timestamp

### 1.4 — `getInterviewResult(applicationId, userId)`
1. Fetch interview by application ID
2. Verify ownership
3. Return full result with:
   - Transcript (so user can review their answers)
   - Evaluation scores by category
   - Strengths and improvements
   - Overall verdict

---

## Task 2: Add AI Interview Pipeline to Python Service

**File**: `ai_service/pipelines/interview_evaluation.py`

The existing `HirePulse` pipeline grades individual answers. Extend it or create a new pipeline for:

### 2.1 — Conversational Interview Pipeline
New file: `ai_service/pipelines/interview_conductor.py`

```python
class InterviewConductorPipeline(BasePipeline):
    """Conducts multi-turn interviews, generating contextual follow-up questions."""
    
    def build_prompt(self, input_data):
        transcript = input_data.get('transcript', [])
        role_context = input_data.get('role_context', {})
        turn_number = input_data.get('turn_number', 1)
        max_turns = input_data.get('max_turns', 10)
        
        system_prompt = f"""You are an experienced technical interviewer conducting an interview for the role of {role_context['title']} ({role_context['level']} level) in the {role_context['domain']} domain.

Interview Guidelines:
- Ask one question at a time
- Start with fundamentals, progress to harder questions
- Follow up on the candidate's answers with probing questions
- Be professional but friendly
- Evaluate both technical knowledge and communication skills
- For turn {turn_number}/{max_turns}

Role Requirements: {', '.join(role_context.get('requirements', []))}

If this is the final turn or you've gathered enough information, end your response with [INTERVIEW_COMPLETE].

Previous conversation:
{self.format_transcript(transcript)}

Generate your next interviewer question or response."""
        
        return system_prompt
```

### 2.2 — Register New Pipeline
**File**: `ai_service/main.py`

Add the new pipeline to the pipeline registry so it can be invoked via `/pipelines/run`.

---

## Task 3: Update Interview Controller

**File**: `backend/src/controllers/interview.controller.js`

Replace stubs:
```javascript
const interviewService = require('../services/interview.service');

// POST /api/interviews/:applicationId/start
exports.startInterview = asyncHandler(async (req, res) => {
  const interview = await interviewService.startInterview(req.params.applicationId, req.user._id);
  res.status(201).json(new ApiResponse(201, interview, 'Interview started. Good luck!'));
});

// POST /api/interviews/:applicationId/message
exports.sendMessage = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const response = await interviewService.sendMessage(req.params.applicationId, req.user._id, message);
  res.json(new ApiResponse(200, response, 'Message sent'));
});

// GET /api/interviews/:applicationId/result
exports.getInterviewResult = asyncHandler(async (req, res) => {
  const result = await interviewService.getInterviewResult(req.params.applicationId, req.user._id);
  res.json(new ApiResponse(200, result, 'Interview result retrieved'));
});
```

---

## Task 4: Update Interview Routes

**File**: `backend/src/routes/interview.routes.js`

```javascript
const { requireAuth, requireProfile } = require('../middleware/auth');
const controller = require('../controllers/interview.controller');

router.post('/:applicationId/start', requireAuth, requireProfile, controller.startInterview);
router.post('/:applicationId/message', requireAuth, requireProfile, controller.sendMessage);
router.get('/:applicationId/result', requireAuth, requireProfile, controller.getInterviewResult);
```

---

## Task 5: Interview Configuration Constants

**File**: `backend/src/utils/constants.js`

```javascript
const INTERVIEW = {
  MAX_TURNS_JUNIOR: 8,
  MAX_TURNS_MID: 10,
  MAX_TURNS_SENIOR: 12,
  PASS_THRESHOLD: 65,
  COOLDOWN_DAYS: 14,
  AI_RESPONSE_TIMEOUT: 30000,  // 30 seconds
  COMPLETION_MARKER: '[INTERVIEW_COMPLETE]',
};
```

---

## Acceptance Criteria
- [ ] `POST /api/interviews/:applicationId/start` creates interview and returns AI opening message
- [ ] Only `screening_passed` applications can start interviews
- [ ] `POST /api/interviews/:applicationId/message` sends user message and returns AI response
- [ ] AI asks progressively harder questions based on role level
- [ ] AI maintains conversation context across turns
- [ ] Interview auto-concludes at max turns
- [ ] Interview evaluation scores across 4 categories
- [ ] Pass/fail decision based on configurable threshold
- [ ] Failed interviews set cooldown and provide detailed feedback
- [ ] `GET /api/interviews/:applicationId/result` returns full transcript and evaluation
- [ ] AI service failure handled gracefully (fallback evaluation)
- [ ] Cannot send messages after interview is concluded
- [ ] Cannot start duplicate interviews for the same application
