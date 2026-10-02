# Prompt 3.1 — Employee System Backend

## Context
After a user passes the interview (`interview_passed`), the application advances to `offer_pending`. When the offer is accepted, the user transitions from `job_seeker` to `employee` (role: `working`, status: `employee`). They join a company, get an `EmployeeRecord`, and start receiving daily AI-generated tasks.

### Existing Assets
- **Model**: `backend/src/models/EmployeeRecord.js` — user, company, role, employmentStatus, currentLevel, exitRecord
- **Model**: `backend/src/models/Task.js` — employeeRecord, title, description, status, expReward, difficulty
- **Model**: `backend/src/models/ExpLog.js` — expChange, reason, source, taskId
- **Routes**: `backend/src/routes/employee.routes.js` — Stub endpoints
- **Controller**: `backend/src/controllers/employee.controller.js` — Stub methods

## Objective
Build the complete employee lifecycle: offer acceptance → hiring → daily task generation → task completion → EXP rewards → performance tracking → warnings → demotion/firing.

---

## Task 1: Offer Acceptance Flow

### 1.1 — Add Offer Endpoints
**File**: `backend/src/routes/application.routes.js`

Add two new endpoints:
```javascript
// Accept offer (transitions user to employee)
router.post('/:id/accept-offer', requireAuth, requireProfile, controller.acceptOffer);
// Decline offer  
router.post('/:id/decline-offer', requireAuth, requireProfile, controller.declineOffer);
```

### 1.2 — Implement `acceptOffer` in Application Service
**File**: `backend/src/services/application.service.js`

```javascript
async acceptOffer(applicationId, userId) {
  // 1. Verify application exists, belongs to user, status is 'offer_pending'
  //    (After interview_passed, auto-transition to offer_pending)
  // 2. Update application status to 'offer_accepted'
  // 3. Create EmployeeRecord:
  //    { user, company, role, employmentStatus: 'active', currentLevel: role.level }
  // 4. Update User:
  //    - role: 'working'
  //    - currentStatus: 'employee'
  // 5. Update Role: increment filledCount
  // 6. Update Company: increment employeeCount
  // 7. Generate first task for the new employee
  // 8. Return the EmployeeRecord
}
```

### 1.3 — Auto-Advance to Offer After Interview Pass
When interview evaluation results in `passed`, automatically update application to `offer_pending`. Add this to the interview evaluation flow in `interview.service.js`.

---

## Task 2: Employee Task Service

**File**: `backend/src/services/employee.service.js`

### 2.1 — `generateDailyTask(employeeRecordId)`
Generate a role-specific scenario task using AI:
1. Fetch employee record with populated role and company
2. Call AI service to generate a contextual task:
   ```javascript
   const taskInput = {
     roleTitle: role.title,
     roleLevel: employee.currentLevel,
     domain: role.domain,
     companyName: company.name,
     previousTasks: await Task.find({ employeeRecord: employee._id })
       .sort('-createdAt').limit(5).select('title difficulty'),
   };
   ```
3. AI returns:
   ```javascript
   {
     title: "Debug the Checkout Flow",
     description: "A customer reported that the payment form loses focus after selecting a shipping address. Investigate the state management in the checkout component and fix the issue.",
     difficulty: 'medium',  // easy/medium/hard based on level
     expReward: 25,         // Calculated from difficulty
     category: 'debugging', // debugging, feature, optimization, review, design
   }
   ```
4. Create Task document with `status: 'assigned'`
5. Difficulty progression:
   - Junior employees: 60% easy, 30% medium, 10% hard
   - Mid employees: 30% easy, 50% medium, 20% hard
   - Senior employees: 10% easy, 40% medium, 50% hard

### 2.2 — `completeTask(taskId, userId, submissionData)`
1. Verify task exists and belongs to user's employee record
2. Verify task status is `assigned` or `in_progress`
3. Optionally: run AI evaluation on the submission (for code tasks)
4. Calculate EXP reward:
   - Easy: 10-15 EXP
   - Medium: 20-30 EXP
   - Hard: 35-50 EXP
   - Bonus: +5 EXP for streak (3+ consecutive days)
   - Bonus: +10 EXP for completing within first 2 hours
5. Update Task: `status: 'completed'`, `completedAt: new Date()`
6. Create ExpLog entry
7. Update User: increment `expTotal`
8. Check for promotion eligibility (handled by gamification service)
9. Return completion result with EXP gained

### 2.3 — `getMyTasks(userId, filters)`
1. Find user's active EmployeeRecord
2. Query Tasks for that record
3. Support filters: `status` (assigned, in_progress, completed), `difficulty`, date range
4. Return with pagination
5. Include today's task highlighted

### 2.4 — `getExpHistory(userId)`
1. Find user's employee record
2. Query ExpLog entries sorted by createdAt descending
3. Include task details for task_completion entries
4. Support pagination

### 2.5 — `resign(userId)`
Voluntary resignation:
1. Find active employee record
2. Update `employmentStatus: 'resigned'`
3. Set `exitRecord: { exitType: 'voluntary', reason: 'Player resigned', exitedAt: new Date() }`
4. Update User: `role: 'job_seeker'`, `currentStatus: 'job_seeker'`
5. Decrement company employeeCount
6. Return confirmation

---

## Task 3: Daily Task Generation Trigger

### 3.1 — On-Demand Generation
When employee loads their dashboard and has no uncompleted task for today:
```javascript
// GET /api/employee/tasks/today
exports.getTodayTask = asyncHandler(async (req, res) => {
  let todayTask = await employeeService.getTodayTask(req.user._id);
  if (!todayTask) {
    todayTask = await employeeService.generateDailyTask(req.user._id);
  }
  res.json(new ApiResponse(200, todayTask, 'Today\'s task'));
});
```

### 3.2 — Task Freshness Check
"Today" is defined as since midnight in the user's timezone (or UTC midnight for simplicity):
```javascript
const todayStart = new Date();
todayStart.setHours(0, 0, 0, 0);

const todayTask = await Task.findOne({
  employeeRecord: record._id,
  createdAt: { $gte: todayStart },
});
```

---

## Task 4: Performance Warning System

### 4.1 — Warning Triggers
Track missed days and failed tasks:
```javascript
// In employee.service.js
async checkPerformance(employeeRecordId) {
  const record = await EmployeeRecord.findById(employeeRecordId);
  
  // Count missed days (no task completed) in last 7 days
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const completedThisWeek = await Task.countDocuments({
    employeeRecord: record._id,
    status: 'completed',
    completedAt: { $gte: weekAgo },
  });
  
  if (completedThisWeek < 3) return 'warning';     // Warning: less than 3/7 days
  if (completedThisWeek < 1) return 'critical';     // Critical: 0 completed
  return 'good';
}
```

### 4.2 — Warning Consequences (configured in constants.js)
- `warning`: Show warning banner in dashboard, -5 EXP
- `critical`: Show critical warning, -20 EXP, demotion countdown starts
- 2 consecutive weeks of `critical`: automatic demotion (senior→mid, mid→junior)
- 3 consecutive weeks of `critical` at junior level: fired (terminated)

---

## Task 5: Update Employee Routes

**File**: `backend/src/routes/employee.routes.js`

```javascript
router.get('/tasks', requireAuth, requireProfile, requireStatus('employee'), controller.getMyTasks);
router.get('/tasks/today', requireAuth, requireProfile, requireStatus('employee'), controller.getTodayTask);
router.post('/tasks/:id/complete', requireAuth, requireProfile, requireStatus('employee'), controller.completeTask);
router.post('/resign', requireAuth, requireProfile, requireStatus('employee'), controller.resign);
router.get('/exp-history', requireAuth, requireProfile, requireStatus('employee'), controller.getExpHistory);
router.get('/performance', requireAuth, requireProfile, requireStatus('employee'), controller.getPerformance);
router.get('/record', requireAuth, requireProfile, requireStatus('employee'), controller.getMyRecord);
```

---

## Task 6: Add Task Generation Pipeline to AI Service

**File**: `ai_service/pipelines/task_generator.py`

```python
class TaskGeneratorPipeline(BasePipeline):
    """Generates role-specific daily scenario tasks for employees."""
    
    def build_prompt(self, input_data):
        role = input_data.get('role_title', 'Developer')
        level = input_data.get('level', 'junior')
        domain = input_data.get('domain', 'Technology')
        difficulty = input_data.get('difficulty', 'medium')
        
        return f"""Generate a realistic, concise daily work task for a {level} {role} in the {domain} industry.

Difficulty: {difficulty}
        
The task should be:
- Completable in 15-30 minutes of focused work
- Based on a realistic workplace scenario
- Specific enough to evaluate completion
- Educational and skill-building

Return JSON:
{{
  "title": "Brief task title (max 60 chars)",
  "description": "Detailed task description with context and requirements (2-3 paragraphs)",
  "category": "one of: debugging, feature, optimization, review, design, analysis",
  "skills_tested": ["skill1", "skill2"],
  "expected_output": "What a completed submission should include"
}}"""
```

Register in `ai_service/main.py`.

---

## Acceptance Criteria
- [ ] Accepting offer creates EmployeeRecord and transitions user to 'working' role
- [ ] Declining offer sets application to 'offer_declined'
- [ ] Daily task generation creates role-appropriate tasks via AI
- [ ] Task difficulty scales with employee level
- [ ] Task completion awards correct EXP amount
- [ ] Streak bonuses calculated correctly
- [ ] EXP history tracks all gains and losses with reasons
- [ ] Performance warnings trigger after missed days
- [ ] Demotion occurs after sustained poor performance
- [ ] Firing occurs at junior level after 3 critical weeks
- [ ] Resignation resets user to job_seeker role
- [ ] Today's task endpoint generates task if none exists
- [ ] All endpoints protected with correct auth middleware
- [ ] Task generation AI pipeline registered and functional
