# Prompt 3.2 — Employee Dashboard Frontend

## Context
The Employee (Working) dashboard exists at `frontend/src/pages/WorkingDashboard.jsx` with 373 lines of client-side simulated tasks and a Design Studio component. The backend now has real employee endpoints. We need to connect everything and build a proper employee workspace.

## Objective
Rebuild the Employee Dashboard to connect to real APIs, show daily tasks, track EXP progression, display performance metrics, and provide a complete employee workspace experience.

---

## Task 1: Restructure Employee Dashboard

**File**: `frontend/src/pages/dashboards/EmployeeDashboard.jsx`

Replace the simulated task data with real API-driven content. Organize into these tabs:

### Tab 1: Today's Mission
The primary daily task view:
```
┌─────────────────────────────────────────────────────────────┐
│  📋 TODAY'S MISSION                     🔥 Streak: 5 days   │
│─────────────────────────────────────────────────────────────│
│                                                             │
│  ┌─ DAILY TASK ────────────────────────────────────────┐   │
│  │                                                      │   │
│  │  🎯 Debug the Checkout Flow              ⚡ MEDIUM   │   │
│  │                                                      │   │
│  │  A customer reported that the payment form loses     │   │
│  │  focus after selecting a shipping address.           │   │
│  │  Investigate the state management in the checkout    │   │
│  │  component and fix the issue.                        │   │
│  │                                                      │   │
│  │  Category: Debugging                                 │   │
│  │  Skills: React, State Management                     │   │
│  │  EXP Reward: +25 EXP                                │   │
│  │                                                      │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │  Your Submission:                             │   │   │
│  │  │                                               │   │   │
│  │  │  [Describe your approach and solution...]      │   │   │
│  │  │                                               │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  │                                                      │   │
│  │  [SUBMIT TASK ✓]                                    │   │
│  │                                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─ COMPLETED TODAY ───────────────────────────────────┐   │
│  │  ✅ Debug the Checkout Flow — +25 EXP earned        │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Tab 2: Task History
```
┌─────────────────────────────────────────────────────────────┐
│  📊 TASK HISTORY                           Filter: [All ▼]  │
│─────────────────────────────────────────────────────────────│
│                                                             │
│  Sep 5  ✅ Debug the Checkout Flow      Medium  +25 EXP    │
│  Sep 4  ✅ Optimize Image Loading       Easy    +12 EXP    │
│  Sep 3  ✅ Design Error States          Medium  +22 EXP    │
│  Sep 2  ❌ Implement Pagination         Hard    +0 EXP     │
│  Sep 1  ✅ Review PR #142               Easy    +10 EXP    │
│                                                             │
│  This Week: 4/5 completed  |  Total EXP: +69               │
│                                                             │
│  [LOAD MORE]                                                │
└─────────────────────────────────────────────────────────────┘
```

### Tab 3: My Profile & Performance
```
┌─────────────────────────────────────────────────────────────┐
│  👤 EMPLOYEE PROFILE                                        │
│─────────────────────────────────────────────────────────────│
│                                                             │
│  ┌─ EMPLOYMENT INFO ──────────────────────────────────┐    │
│  │  Company: TechNova Corp                             │    │
│  │  Role: Frontend Developer                           │    │
│  │  Level: Junior  →  ████████░░ Mid (150 EXP needed)  │    │
│  │  Hired: Sep 3, 2026                                 │    │
│  │  Status: Active ✅                                  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─ PERFORMANCE METRICS ─────────────────────────────┐     │
│  │                                                     │    │
│  │  Weekly Completion Rate: ████████░░ 80%             │    │
│  │  Current Streak: 5 days 🔥                          │    │
│  │  Longest Streak: 12 days                            │    │
│  │  Total Tasks Completed: 23                          │    │
│  │  Average Difficulty: Medium                         │    │
│  │                                                     │    │
│  │  Performance Status: GOOD ✅                        │    │
│  │  (or WARNING ⚠️ or CRITICAL 🔴)                    │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─ EXP PROGRESSION ────────────────────────────────┐      │
│  │                                                    │     │
│  │  Total EXP: 287 / 500 (Founder Unlock)            │     │
│  │  ██████████████░░░░░░░░░░░░░  57%                 │     │
│  │                                                    │     │
│  │  Level Progress: 87 / 150 (Mid Promotion)          │     │
│  │  ███████████░░░░░░  58%                            │     │
│  │                                                    │     │
│  └────────────────────────────────────────────────────┘     │
│                                                             │
│  [RESIGN FROM POSITION]                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Task 2: Employee API Service

**File**: `frontend/src/api/employee.js`

```javascript
import client from './client';

export const getTodayTask = () => client.get('/employee/tasks/today');
export const getMyTasks = (params) => client.get('/employee/tasks', { params });
export const completeTask = (taskId, data) => client.post(`/employee/tasks/${taskId}/complete`, data);
export const getExpHistory = (params) => client.get('/employee/exp-history', { params });
export const getPerformance = () => client.get('/employee/performance');
export const getMyRecord = () => client.get('/employee/record');
export const resign = () => client.post('/employee/resign');
```

---

## Task 3: Task Completion Flow

### 3.1 — Submit Task
When user clicks "Submit Task":
1. Show confirmation modal: "Are you sure you want to submit? This action cannot be undone."
2. Call `completeTask(taskId, { submission: userText })`
3. On success:
   - Play EXP gain animation (number floating up with glow)
   - Update EXP counter in Navbar
   - Show completion banner: "✅ Task completed! +25 EXP earned"
   - Mark task as completed in local state
   - Refresh user data via `refreshUser()`
4. On error: Show error message

### 3.2 — EXP Gain Animation
**Create**: `frontend/src/components/dashboard/ExpGainAnimation.jsx`
- Floating "+25 EXP" text that rises and fades out
- Golden particle burst effect
- Streak bonus shows separately: "+5 Streak Bonus!"
- Use Framer Motion for smooth animations

---

## Task 4: Performance Warning UI

### 4.1 — Warning Banner
When performance status is `warning` or `critical`:
```
┌─────────────────────────────────────────────────────────────┐
│  ⚠️ PERFORMANCE WARNING                                     │
│                                                              │
│  You've completed only 2/7 tasks this week.                  │
│  Complete at least 3 tasks per week to maintain your         │
│  position. Continued low performance may result in           │
│  demotion or termination.                                    │
│                                                              │
│  [DISMISS]                                [VIEW TODAY'S TASK]│
└─────────────────────────────────────────────────────────────┘
```

Critical version (red themed):
```
┌─────────────────────────────────────────────────────────────┐
│  🔴 CRITICAL: PERFORMANCE REVIEW                            │
│                                                              │
│  You have 0 completed tasks this week.                       │
│  This is your 2nd consecutive week with critical             │
│  performance. One more week will result in demotion.         │
│                                                              │
│  -20 EXP penalty applied.                                    │
│                                                              │
│  [VIEW TODAY'S TASK →]                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Task 5: Resign Confirmation

When user clicks "Resign from Position":
```
┌─────────────────────────────────────────────────────────────┐
│  ⚠️ RESIGN FROM POSITION?                                   │
│                                                              │
│  Are you sure you want to resign from:                       │
│  Frontend Developer @ TechNova Corp                          │
│                                                              │
│  • Your employee record will be closed                       │
│  • You'll return to Job Seeker status                        │
│  • Your EXP will be retained                                 │
│  • You can apply to new positions immediately                │
│                                                              │
│  [CANCEL]                       [CONFIRM RESIGNATION]        │
└─────────────────────────────────────────────────────────────┘
```

After resignation: redirect to Job Seeker dashboard, refresh user context.

---

## Task 6: Remove Simulated Data

- Remove ALL hardcoded task arrays from the current WorkingDashboard.jsx
- Remove the DesignTeamStudio integration (move it to a separate dev tools page if needed)
- Ensure every piece of data comes from the API

---

## Acceptance Criteria
- [ ] Today's Mission tab shows real task from API
- [ ] Task submission sends data to backend and awards EXP
- [ ] EXP gain animation plays on task completion
- [ ] Task History shows paginated list of past tasks
- [ ] Employee Profile shows real company, role, level data
- [ ] Performance metrics display weekly completion rate
- [ ] Warning/Critical banners show when performance is poor
- [ ] Streak counter updates correctly
- [ ] EXP progression bars show distance to next level and Founder unlock
- [ ] Resignation flow works and redirects to Job Seeker dashboard
- [ ] Navbar EXP counter updates after task completion
- [ ] No simulated/hardcoded data remains
- [ ] Loading states for all API calls
- [ ] Error handling for API failures
- [ ] Retro arcade theme maintained throughout
