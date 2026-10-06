# CorpVerse — Remaining Features Implementation Guide

This guide details the complete specifications, data models, API endpoints, business logic, and UI components required to implement the remaining backlog features (FR-16 through FR-21) defined in the CorpVerse Functional Requirements specification ([functional_requirements.md](file:///Users/trushargpatel/Downloads/IT/SEM%20-%207/SGP/CorpVerse/corpverse_docs/01_requirements_scope/functional_requirements.md)).

---

## 🗺️ Feature Roadmap

| Feature ID | Feature Name | Core Functionality | Impact Area |
|:---:|---|---|---|
| **FR-19** | **Training Modules to Bypass Cooldown** | Mini-quizzes & training courses that remove role cooldowns upon completion | Job Seeker Flow |
| **FR-21** | **Job Offer Salary Negotiation** | Interactive salary counter-offer mechanic with AI/rule evaluation | Offer Stage |
| **FR-16** | **AI Team Manager in Employee Dashboard** | Dedicated AI manager profile, daily advice, and performance check-ins | Employee Dashboard |
| **FR-17 & FR-18** | **Performance Review Cycle & Merit Raises** | Weekly/milestone review gating promotions and awarding salary raises | Career Progression |
| **FR-20** | **Resignation Notice Period** | Enforces a 3-task notice period before transitioning back to Job Seeker | Employee Lifecycle |

---

## 🚀 1. Feature FR-19: Training Modules to Bypass Cooldown

### Description
When a candidate is rejected during ATS screening or the interview, a 48-hour cooldown is applied to that role. Completing a targeted domain training module clears the cooldown early and awards a small bonus of 25 EXP.

### Data Model
Create `backend/src/models/TrainingModule.js`:
```javascript
const mongoose = require('mongoose');
const { Schema } = mongoose;

const trainingModuleSchema = new Schema(
  {
    title: { type: String, required: true },
    domain: { type: String, required: true, index: true },
    level: { type: String, enum: ['junior', 'mid', 'senior'], default: 'junior' },
    description: { type: String, required: true },
    content: { type: String, required: true }, // Markdown / text lesson
    questions: [
      {
        question: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctAnswerIndex: { type: Number, required: true },
        explanation: { type: String },
      },
    ],
    expReward: { type: Number, default: 25 },
    cooldownReductionHours: { type: Number, default: 48 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TrainingModule', trainingModuleSchema);
```

### Backend Endpoints
Create `backend/src/routes/training.routes.js` and `backend/src/controllers/training.controller.js`:
1. `GET /api/training/modules?domain=Technology` — List available training modules filtered by domain.
2. `GET /api/training/modules/:id` — Retrieve course content and quiz questions.
3. `POST /api/training/modules/:id/complete` — Submit answers:
   - Validates user score (requires ≥80% passing grade).
   - Removes or reduces `cooldownUntil` on the user's rejected applications in that domain.
   - Calls `gamificationService.awardExp(userId, module.expReward, 'achievement')`.
   - Returns updated cooldown status and awarded EXP.

### Frontend Integration
1. In [JobSeekerDashboard.jsx](file:///Users/trushargpatel/Downloads/IT/SEM%20-%207/SGP/CorpVerse/frontend/src/pages/dashboards/JobSeekerDashboard.jsx), on cards under "Applications on Cooldown", display a **"Take Training to Unlock"** button with a graduation cap icon.
2. Clicking the button opens a `TrainingModal.jsx` displaying the lesson notes and a 3-question multiple-choice quiz.
3. Upon passing, the cooldown timer refreshes immediately, enabling the candidate to reapply right away.

---

## 💼 2. Feature FR-21: Job Offer Salary Negotiation

### Description
At the offer stage (`offer_pending`), candidates currently only have Accept and Decline options. This feature adds an interactive negotiation option allowing the user to counter-offer for higher starting compensation or an onboarding CorpCoins bonus.

### Business Logic & Evaluation Rules
1. A candidate can negotiate **once per offer**.
2. Propose a counter-offer salary up to +20% higher than the initial offer.
3. Evaluation formula:
   - Base acceptance probability = `50%`.
   - Boosted by high interview score: `+20%` if interview score ≥ 85.
   - Boosted by high EXP: `+15%` if user EXP ≥ 300.
   - Reduced by asking percentage: `-2%` per each `1%` increase requested above the original offer.
4. Outcomes:
   - **Accepted**: Offer salary is updated to the counter-offer amount.
   - **Counter-compromise**: Offer is bumped by half the requested amount.
   - **Declined (Firm)**: Original offer remains intact, but negotiation is locked.

### Backend Endpoints
Update [backend/src/controllers/application.controller.js](file:///Users/trushargpatel/Downloads/IT/SEM%20-%207/SGP/CorpVerse/backend/src/controllers/application.controller.js):
```javascript
// POST /api/applications/:id/negotiate
const negotiateOffer = asyncHandler(async (req, res) => {
  const { counterSalary, argument } = req.body;
  const result = await applicationService.negotiateOffer(
    req.params.id,
    req.user._id,
    { counterSalary, argument }
  );
  return ApiResponse.ok(result, result.message).send(res);
});
```
Add route to `backend/src/routes/application.routes.js`:
```javascript
router.post('/:id/negotiate', requireAuth, negotiateOffer);
```

### Frontend Integration
1. In the Offer modal on [JobSeekerDashboard.jsx](file:///Users/trushargpatel/Downloads/IT/SEM%20-%207/SGP/CorpVerse/frontend/src/pages/dashboards/JobSeekerDashboard.jsx), add a **"Negotiate Terms"** button beside "Accept Offer".
2. Opens a slider allowing the candidate to adjust proposed salary between `[baseSalary, baseSalary * 1.20]`, with an optional justification text area.
3. Submitting displays an interactive response animation showing the hiring manager's decision and the updated offer letter.

---

## 👔 3. Feature FR-16: AI Team Manager in Employee Dashboard

### Description
Give employees a designated AI Manager avatar on their workspace dashboard. The manager provides daily encouragement, critiques task submissions, and acts as a touchpoint for career development.

### Data Model Enhancements
Update [EmployeeRecord.js](file:///Users/trushargpatel/Downloads/IT/SEM%20-%207/SGP/CorpVerse/backend/src/models/EmployeeRecord.js) with manager metadata:
```javascript
manager: {
  name: { type: String, default: 'Sarah Chen' },
  avatarUrl: { type: String, default: '/avatars/manager-1.png' },
  title: { type: String, default: 'Engineering Director' },
  style: { type: String, enum: ['supportive', 'demanding', 'analytical'], default: 'supportive' },
  feedbackHistory: [
    {
      date: { type: Date, default: Date.now },
      note: { type: String, required: true },
      sentiment: { type: String, enum: ['praise', 'warning', 'neutral'], default: 'neutral' },
    },
  ],
}
```

### Dynamic Feedback Generation
In [employee.service.js](file:///Users/trushargpatel/Downloads/IT/SEM%20-%207/SGP/CorpVerse/backend/src/services/employee.service.js), whenever a task is completed or streak milestone is reached:
- If current streak ≥ 5: Sarah praises consistency: *"Outstanding momentum this week! You're operating well above peer baseline."*
- If no task completed for 3 days: Sarah sends a check-in: *"Notice you haven't checked in on your sprint tasks. Let me know if you need unblocking."*

### Frontend Component
Create `frontend/src/components/dashboard/ManagerCard.jsx`:
- Shows manager portrait with online pulse badge.
- Displays latest managerial feedback quote in a sleek speech bubble.
- Includes a **"Request 1-on-1 Feedback"** action button that triggers an AI evaluation of the employee's recent task history.

---

## 📈 4. Features FR-17 & FR-18: Performance Reviews & Merit Raises

### Description
Rather than immediate, silent auto-promotions, employees can trigger or receive formal performance review cycles. Additionally, employees who consistently perform without meeting the full EXP threshold for level promotion can receive a **Merit Salary Raise**.

### Backend Implementation
In [backend/src/services/employee.service.js](file:///Users/trushargpatel/Downloads/IT/SEM%20-%207/SGP/CorpVerse/backend/src/services/employee.service.js):
1. Add `requestPerformanceReview(userId)`:
   - Evaluates:
     - Completed tasks count (minimum 5 required).
     - Average difficulty of completed tasks.
     - Streak consistency.
   - Calculates Performance Score (0-100):
     - **Score ≥ 85**: Grants Merit Raise (+10% monthly salary / +5 CorpCoins bonus per task).
     - **Score ≥ 70**: Satisfactory performance, awards 50 EXP bonus.
     - **Score < 50**: Places employee on light PIP watch with constructive recommendations.
2. Store salary progression in `EmployeeRecord.salary`:
   ```javascript
   currentSalary: { type: Number, default: 85000 },
   salaryHistory: [
     {
       effectiveDate: { type: Date, default: Date.now },
       amount: { type: Number },
       reason: { type: String },
     },
   ],
   ```

### Frontend UI
In [EmployeeDashboard.jsx](file:///Users/trushargpatel/Downloads/IT/SEM%20-%207/SGP/CorpVerse/frontend/src/pages/dashboards/EmployeeDashboard.jsx):
- Add a **"Performance Review"** tab or card next to the EXP progress bar.
- Provide a summary scorecard showing tasks completed, reliability rating, current salary, and date of next review eligibility.

---

## 🚪 5. Feature FR-20: Resignation Notice Period Flow

### Description
Instead of an instant status change upon resignation, employees enter a realistic **Notice Period** where they complete 2–3 final transition tasks (e.g., "Handover Documentation", "Knowledge Transfer") before their departure is finalized.

### State Transitions
1. `User.currentStatus` stays `'employee'`.
2. `EmployeeRecord.employmentStatus` transitions to `'notice_period'`.
3. `EmployeeRecord.noticeTasksRemaining` is set to `2`.
4. When `noticeTasksRemaining === 0` (or after 48 hours elapsed):
   - Status transitions to `'resigned'`.
   - Exit feedback and reference letter are generated.
   - `User.currentStatus` reverts to `'job_seeker'`.

### Backend Endpoints
Update `resign` endpoint in [backend/src/controllers/employee.controller.js](file:///Users/trushargpatel/Downloads/IT/SEM%20-%207/SGP/CorpVerse/backend/src/controllers/employee.controller.js):
```javascript
const initiateResignation = asyncHandler(async (req, res) => {
  const result = await employeeService.initiateNoticePeriod(req.user._id, req.body.reason);
  ApiResponse.ok(result, 'Notice period initiated. Please complete 2 transition tasks.').send(res);
});
```

### Frontend UI
- Display a prominent amber **Notice Period Active** banner on [EmployeeDashboard.jsx](file:///Users/trushargpatel/Downloads/IT/SEM%20-%207/SGP/CorpVerse/frontend/src/pages/dashboards/EmployeeDashboard.jsx).
- Show handover checklist tasks.
- Once completed, open the Exit Feedback and Alumni Certificate modal.

---

## 🧪 Testing & Verification Strategy

For every feature implemented:
1. **Unit & Integration Tests**: Add test suites under [backend/tests/](file:///Users/trushargpatel/Downloads/IT/SEM%20-%207/SGP/CorpVerse/backend/tests) (`training.test.js`, `negotiation.test.js`, `manager.test.js`).
2. **Postman / Curl Validation**: Verify that unauthorized requests or premature actions (e.g. negotiating twice) receive appropriate HTTP 400/403 status codes.
3. **Role & State Machine Invariant**: Ensure `User.currentStatus` stays in sync with `EmployeeRecord.employmentStatus` at all times.
