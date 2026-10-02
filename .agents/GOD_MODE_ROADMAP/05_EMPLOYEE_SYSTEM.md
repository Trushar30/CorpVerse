# Module 5 — Real Employee Work & Promotion System

> **Priority:** 🟠 HIGH (replaces the biggest hardcoded mock section)
> **Difficulty:** Medium
> **Estimated Time:** 4-5 hours
> **Cost:** $0

---

## Current Problem

`WorkingDashboard.jsx` has **3 hardcoded tasks in React `useState`** (lines 30-63):
- "Implement Dark Glass Design Tokens"
- "Optimize API Endpoint Latency (<100ms)"
- "Conduct AI Screener Integration QA"

These don't make API calls. "Completing" them updates local state only. The `employee.controller.js` returns `🚧 Phase 2` stubs.

---

## Target Architecture

```
Employee logs into /dashboard/working
        │
        ▼
Fetches EmployeeRecord (company, role, level, employment status)
Fetches assigned Tasks from MongoDB
Fetches EXP history from ExpLog
        │
        ▼
┌─────────────────────────────────────────────────────────┐
│ WORKING DASHBOARD (Real Data)                           │
│                                                         │
│  ┌─── Active Tasks ───────────────────────────────┐     │
│  │ [●] Fix Starter Bug (35 EXP)       [Complete]  │     │
│  │ [●] Review Architecture (20 EXP)   [Complete]  │     │
│  │ [✓] Setup Dev Env (15 EXP)         DONE        │     │
│  └────────────────────────────────────────────────┘     │
│                                                         │
│  ┌─── EXP & Level ───────────────────────────────┐     │
│  │ Level: Junior → Mid (at 200 EXP)              │     │
│  │ EXP: 135/200  [==========>----------]  67%    │     │
│  └────────────────────────────────────────────────┘     │
│                                                         │
│  ┌─── Activity Feed ─────────────────────────────┐     │
│  │ +35 EXP  Completed: Fix Starter Bug            │     │
│  │ +100 EXP Hired at Apex AI Dynamics              │     │
│  │ +50 EXP  Interview Passed                       │     │
│  └────────────────────────────────────────────────┘     │
│                                                         │
│  [RESIGN]  — returns to job_seeker                      │
└─────────────────────────────────────────────────────────┘

Auto-Promotion Trigger:
  EXP >= 200 → Level: Mid
  EXP >= 500 → Level: Senior (+ Founder mode unlocked!)
```

---

## Backend Implementation

### File: `backend/src/controllers/employee.controller.js` (FULL REWRITE)

```javascript
const { EmployeeRecord, Task, User, ExpLog, Company, Role } = require('../models');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const config = require('../config');

/**
 * GET /api/employee/status
 * Get current employment record, company, role, level, and task summary.
 */
const getEmploymentStatus = asyncHandler(async (req, res) => {
  const record = await EmployeeRecord.findOne({
    user: req.user._id,
    employmentStatus: 'active',
  })
    .populate('company', 'name domain description treasury valuation')
    .populate('role', 'title domain level salaryRange')
    .lean();

  if (!record) {
    throw ApiError.notFound('No active employment found. You may need to accept a job offer first.');
  }

  // Get task stats
  const [totalTasks, completedTasks, pendingTasks] = await Promise.all([
    Task.countDocuments({ employeeRecord: record._id }),
    Task.countDocuments({ employeeRecord: record._id, status: 'completed' }),
    Task.countDocuments({ employeeRecord: record._id, status: { $in: ['assigned', 'in_progress'] } }),
  ]);

  // Get promotion thresholds
  const { promotionThresholds } = config.game;
  const currentExp = req.user.expTotal || 0;
  let nextThreshold, nextLevel;

  if (record.currentLevel === 'junior') {
    nextThreshold = promotionThresholds.junior_to_mid;
    nextLevel = 'Mid';
  } else if (record.currentLevel === 'mid') {
    nextThreshold = promotionThresholds.mid_to_senior;
    nextLevel = 'Senior';
  } else {
    nextThreshold = null;
    nextLevel = null;
  }

  ApiResponse.ok({
    employment: record,
    taskStats: { total: totalTasks, completed: completedTasks, pending: pendingTasks },
    progression: {
      currentLevel: record.currentLevel,
      currentExp,
      nextThreshold,
      nextLevel,
      progressPercent: nextThreshold ? Math.min(100, Math.round((currentExp / nextThreshold) * 100)) : 100,
      founderEligible: currentExp >= config.game.founderUnlockExp,
    },
  }, 'Employment status retrieved').send(res);
});

/**
 * GET /api/employee/tasks
 * Get all tasks for the current employee.
 */
const getMyTasks = asyncHandler(async (req, res) => {
  const record = await EmployeeRecord.findOne({
    user: req.user._id,
    employmentStatus: 'active',
  });

  if (!record) throw ApiError.notFound('No active employment found');

  const tasks = await Task.find({ employeeRecord: record._id })
    .sort({ status: 1, createdAt: -1 }) // assigned first, then completed
    .lean();

  ApiResponse.ok(tasks, 'Tasks retrieved').send(res);
});

/**
 * POST /api/employee/tasks/:taskId/complete
 * Mark a task as completed, award EXP, and check for auto-promotion.
 */
const completeTask = asyncHandler(async (req, res) => {
  const record = await EmployeeRecord.findOne({
    user: req.user._id,
    employmentStatus: 'active',
  });

  if (!record) throw ApiError.notFound('No active employment found');

  const task = await Task.findOne({
    _id: req.params.taskId,
    employeeRecord: record._id,
  });

  if (!task) throw ApiError.notFound('Task not found');
  if (task.status === 'completed') {
    throw ApiError.badRequest('Task is already completed');
  }

  // 1. Complete the task
  task.status = 'completed';
  task.completedAt = new Date();
  await task.save();

  // 2. Award EXP
  const expReward = task.expReward || config.game.defaultTaskExpReward;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $inc: { expTotal: expReward } },
    { new: true }
  );

  // 3. Log EXP gain
  try {
    await ExpLog.create({
      user: req.user._id,
      amount: expReward,
      reason: `Completed task: ${task.title}`,
    });
  } catch {}

  // 4. Check for auto-promotion
  let promoted = false;
  let newLevel = record.currentLevel;
  const { promotionThresholds } = config.game;

  if (record.currentLevel === 'junior' && user.expTotal >= promotionThresholds.junior_to_mid) {
    newLevel = 'mid';
    promoted = true;
  } else if (record.currentLevel === 'mid' && user.expTotal >= promotionThresholds.mid_to_senior) {
    newLevel = 'senior';
    promoted = true;
  }

  if (promoted) {
    record.currentLevel = newLevel;
    await record.save();

    // Log promotion EXP event
    try {
      await ExpLog.create({
        user: req.user._id,
        amount: 0,
        reason: `🎉 Promoted to ${newLevel.toUpperCase()} level!`,
      });
    } catch {}
  }

  // 5. Check founder eligibility
  const founderEligible = user.expTotal >= config.game.founderUnlockExp;

  ApiResponse.ok({
    task,
    expAwarded: expReward,
    totalExp: user.expTotal,
    promoted,
    newLevel: promoted ? newLevel : null,
    founderEligible,
  }, promoted
    ? `🎉 Task completed! +${expReward} EXP. PROMOTED TO ${newLevel.toUpperCase()}!`
    : `✅ Task completed! +${expReward} EXP awarded.`
  ).send(res);
});

/**
 * GET /api/employee/exp-history
 * Get EXP gain history log.
 */
const getExpHistory = asyncHandler(async (req, res) => {
  const logs = await ExpLog.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(30)
    .lean();

  ApiResponse.ok(logs, 'EXP history retrieved').send(res);
});

/**
 * POST /api/employee/resign
 * Resign from current position. Returns user to job_seeker status.
 */
const resign = asyncHandler(async (req, res) => {
  const { feedback } = req.body;

  const record = await EmployeeRecord.findOne({
    user: req.user._id,
    employmentStatus: 'active',
  }).populate('company', 'name').populate('role', 'title');

  if (!record) throw ApiError.notFound('No active employment found');

  // 1. Update employment record
  record.employmentStatus = 'resigned';
  record.exitRecord = {
    exitType: 'resignation',
    feedbackText: feedback || 'No feedback provided',
    reason: 'Voluntary resignation',
    exitedAt: new Date(),
  };
  await record.save();

  // 2. Revert user role
  await User.findByIdAndUpdate(req.user._id, {
    role: 'job_seeker',
    currentStatus: 'job_seeker',
  });

  // 3. Reopen the role slot
  const role = await Role.findById(record.role);
  if (role) {
    role.filledCount = Math.max(0, (role.filledCount || 1) - 1);
    role.isOpen = true;
    await role.save();
  }

  ApiResponse.ok({
    formerCompany: record.company?.name,
    formerRole: record.role?.title,
    finalLevel: record.currentLevel,
  }, `You've resigned from ${record.company?.name || 'your company'}. You're now back in the job market.`).send(res);
});

module.exports = {
  getEmploymentStatus,
  getMyTasks,
  completeTask,
  getExpHistory,
  resign,
};
```

### Route Update: `backend/src/routes/employee.routes.js`

```javascript
const express = require('express');
const router = express.Router();
const {
  getEmploymentStatus,
  getMyTasks,
  completeTask,
  getExpHistory,
  resign,
} = require('../controllers/employee.controller');
const { requireAuth, requireProfile } = require('../middleware/auth');

router.use(requireAuth, requireProfile);

router.get('/status', getEmploymentStatus);
router.get('/tasks', getMyTasks);
router.post('/tasks/:taskId/complete', completeTask);
router.get('/exp-history', getExpHistory);
router.post('/resign', resign);

module.exports = router;
```

---

## Frontend: WorkingDashboard.jsx Rewrite

### Key Changes

1. **Delete** all hardcoded `useState` tasks and logs
2. **Fetch** real data on mount:
   - `GET /api/employee/status` → employment record, task stats, progression
   - `GET /api/employee/tasks` → real tasks list
   - `GET /api/employee/exp-history` → real activity log
3. **Complete task** calls `POST /api/employee/tasks/:id/complete` and re-fetches
4. **Resign** calls `POST /api/employee/resign` with exit feedback

### Frontend API Helper: `frontend/src/api/employee.js`

```javascript
import api from './client';

export const getEmploymentStatus = () =>
  api.get('/employee/status').then(r => r.data);

export const getMyTasks = () =>
  api.get('/employee/tasks').then(r => r.data);

export const completeTask = (taskId) =>
  api.post(`/employee/tasks/${taskId}/complete`).then(r => r.data);

export const getExpHistory = () =>
  api.get('/employee/exp-history').then(r => r.data);

export const resign = (feedback) =>
  api.post('/employee/resign', { feedback }).then(r => r.data);
```

---

## Promotion Thresholds (from `config/index.js`)

| Current Level | EXP Threshold | Promotes To |
|--------------|---------------|-------------|
| Junior | 200 EXP | Mid |
| Mid | 500 EXP | Senior |
| Senior (500+ EXP) | — | **Founder mode unlocked** |

When a user reaches 500 EXP as Senior, they should see a **"Launch Your Own Venture"** CTA that:
1. Changes their role to `founder`
2. Redirects them to `/dashboard/founder`
3. Awards the 10,000 CorpCoin seed grant

---

## God Mode Polish for Working Dashboard

### Promotion Animation
When a user is promoted, show a **full-screen celebration overlay**:
- Level-up text with glow effect
- New rank badge with scale-in animation
- EXP bar filling up animation
- Confetti particles (CSS-only, no library needed)

### Task Completion Micro-Animation
- Task card slides left and fades with a ✓ checkmark animation
- EXP counter increments with a counting animation
- Progress bar smoothly fills

### Resignation Confirmation
- Dark modal with warning styling
- Optional exit feedback textarea
- "Are you sure?" confirmation with two-step button

---

## Verification Checklist

- [ ] `GET /api/employee/status` returns real EmployeeRecord from MongoDB
- [ ] `GET /api/employee/tasks` returns tasks assigned to current employee
- [ ] `POST /api/employee/tasks/:id/complete` marks task done + awards real EXP
- [ ] Auto-promotion triggers at 200 EXP (→ Mid) and 500 EXP (→ Senior)
- [ ] `GET /api/employee/exp-history` returns real ExpLog entries
- [ ] `POST /api/employee/resign` ends employment and reverts user to job_seeker
- [ ] WorkingDashboard.jsx shows ZERO hardcoded mock data
- [ ] All data persists across page reloads
- [ ] Promotion animation plays when level-up occurs
- [ ] Founder mode CTA appears at 500+ EXP
