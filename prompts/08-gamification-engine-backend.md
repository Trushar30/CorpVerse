# Prompt 4.1 — Gamification Engine Backend

## Context
CorpVerse is a gamified platform. EXP exists but is loosely tracked. We need a proper gamification engine that handles promotions, demotions, streak tracking, achievement badges, rank calculation, and the complete progression system from Job Seeker → Employee → Founder.

## Objective
Build a comprehensive gamification service that makes the platform addictive and mirrors real corporate progression with game mechanics.

---

## Task 1: Gamification Service

**Create**: `backend/src/services/gamification.service.js`

### 1.1 — EXP Award System
```javascript
class GamificationService {
  /**
   * Award EXP to a user with source tracking
   * Handles all EXP-related side effects (promotion checks, milestone notifications)
   */
  async awardExp(userId, amount, source, metadata = {}) {
    // 1. Update user's expTotal
    // 2. Create ExpLog entry
    // 3. Check for promotion eligibility
    // 4. Check for achievement unlocks
    // 5. Check for Founder mode unlock (500 EXP)
    // 6. Return { newTotal, awarded, promotionTriggered, achievementsUnlocked }
  }

  /**
   * Deduct EXP (penalties)
   */
  async deductExp(userId, amount, reason) {
    // 1. Deduct from user's expTotal (floor at 0)
    // 2. Create ExpLog with negative expChange
    // 3. Check for demotion triggers
    // 4. Return { newTotal, deducted, demotionTriggered }
  }
}
```

### 1.2 — Promotion Rules
```javascript
const PROMOTION_RULES = {
  // Employee level promotions
  employee: {
    junior_to_mid: {
      expRequired: 150,        // Cumulative EXP as employee
      tasksCompleted: 30,      // Minimum tasks completed
      minStreak: 5,            // Had at least a 5-day streak
      weeklyAvg: 4,            // Average 4+ tasks/week over last month
    },
    mid_to_senior: {
      expRequired: 350,
      tasksCompleted: 80,
      minStreak: 10,
      weeklyAvg: 5,
    },
  },
  // Role transitions
  transitions: {
    job_seeker_to_employee: 'automatic',  // Via offer acceptance
    employee_to_founder: {
      expRequired: 500,        // Total lifetime EXP
      // User gets the OPTION to become founder, not forced
    },
  },
};
```

### 1.3 — `checkPromotion(userId)`
```javascript
async checkPromotion(userId) {
  const user = await User.findById(userId);
  const record = await EmployeeRecord.findOne({ user: userId, employmentStatus: 'active' });
  
  if (!record) return { eligible: false };
  
  const stats = await this.getEmployeeStats(record._id);
  const currentLevel = record.currentLevel;
  
  const rules = PROMOTION_RULES.employee[`${currentLevel}_to_${nextLevel(currentLevel)}`];
  if (!rules) return { eligible: false, reason: 'Already at max level' };
  
  const eligible = (
    stats.totalExp >= rules.expRequired &&
    stats.totalTasksCompleted >= rules.tasksCompleted &&
    stats.longestStreak >= rules.minStreak &&
    stats.weeklyAverage >= rules.weeklyAvg
  );
  
  return {
    eligible,
    currentLevel,
    nextLevel: nextLevel(currentLevel),
    progress: {
      exp: { current: stats.totalExp, required: rules.expRequired },
      tasks: { current: stats.totalTasksCompleted, required: rules.tasksCompleted },
      streak: { current: stats.longestStreak, required: rules.minStreak },
      weeklyAvg: { current: stats.weeklyAverage, required: rules.weeklyAvg },
    },
  };
}
```

### 1.4 — `executePromotion(userId)`
```javascript
async executePromotion(userId) {
  const record = await EmployeeRecord.findOne({ user: userId, employmentStatus: 'active' });
  const newLevel = nextLevel(record.currentLevel);
  
  record.currentLevel = newLevel;
  await record.save();
  
  // Award promotion bonus EXP
  const bonusExp = { junior_to_mid: 50, mid_to_senior: 100 };
  await this.awardExp(userId, bonusExp[`${record.currentLevel}_to_${newLevel}`] || 50, 'promotion_bonus');
  
  return { newLevel, bonusExp: bonusExp[...] };
}
```

---

## Task 2: Streak System

### 2.1 — Streak Model Addition
**File**: `backend/src/models/User.js`

Add streak fields to User schema:
```javascript
currentStreak: { type: Number, default: 0 },
longestStreak: { type: Number, default: 0 },
lastTaskCompletedDate: { type: Date },
```

### 2.2 — Streak Calculation
```javascript
async updateStreak(userId) {
  const user = await User.findById(userId);
  const today = new Date().toDateString();
  const lastDate = user.lastTaskCompletedDate?.toDateString();
  
  if (lastDate === today) {
    // Already completed a task today, no streak change
    return user.currentStreak;
  }
  
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  
  if (lastDate === yesterday) {
    // Consecutive day — increment streak
    user.currentStreak += 1;
  } else {
    // Streak broken — reset to 1
    user.currentStreak = 1;
  }
  
  user.longestStreak = Math.max(user.longestStreak, user.currentStreak);
  user.lastTaskCompletedDate = new Date();
  await user.save();
  
  return user.currentStreak;
}
```

### 2.3 — Streak Rewards
| Streak Length | Bonus |
|---|---|
| 3 days | +5 EXP bonus |
| 7 days | +15 EXP bonus + "Week Warrior" badge |
| 14 days | +30 EXP bonus + "Fortnight Force" badge |
| 30 days | +75 EXP bonus + "Monthly Master" badge |
| 100 days | +200 EXP bonus + "Century Centurion" badge |

---

## Task 3: Achievement Badge System

### 3.1 — Badge Model
**Create**: `backend/src/models/Badge.js`
```javascript
const badgeSchema = new mongoose.Schema({
  userId: { type: ObjectId, ref: 'User', required: true },
  badgeType: {
    type: String,
    enum: [
      'first_application', 'first_interview', 'first_job',
      'streak_7', 'streak_14', 'streak_30', 'streak_100',
      'tasks_10', 'tasks_50', 'tasks_100',
      'promoted_mid', 'promoted_senior',
      'founder_unlocked', 'first_company',
      'first_hire', 'profitable_quarter',
      'exp_100', 'exp_500', 'exp_1000',
    ],
    required: true,
  },
  unlockedAt: { type: Date, default: Date.now },
  metadata: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

// Unique per user per badge type
badgeSchema.index({ userId: 1, badgeType: 1 }, { unique: true });
```

### 3.2 — Badge Definitions
```javascript
// In constants.js
const BADGE_DEFINITIONS = {
  first_application: { name: 'First Step', description: 'Submitted your first application', icon: '🎯', rarity: 'common' },
  first_interview: { name: 'Interview Ready', description: 'Completed your first interview', icon: '🎤', rarity: 'common' },
  first_job: { name: 'Hired!', description: 'Got your first job offer accepted', icon: '💼', rarity: 'uncommon' },
  streak_7: { name: 'Week Warrior', description: '7-day task streak', icon: '🔥', rarity: 'uncommon' },
  streak_30: { name: 'Monthly Master', description: '30-day task streak', icon: '⚡', rarity: 'rare' },
  streak_100: { name: 'Century Centurion', description: '100-day task streak', icon: '🏆', rarity: 'legendary' },
  promoted_senior: { name: 'Senior Status', description: 'Promoted to Senior level', icon: '⭐', rarity: 'rare' },
  founder_unlocked: { name: 'Founder Mode', description: 'Unlocked Founder capabilities', icon: '🚀', rarity: 'epic' },
  // ... etc
};
```

### 3.3 — Badge Award Logic
```javascript
async checkAndAwardBadges(userId, event, metadata = {}) {
  const badgesToCheck = BADGE_TRIGGERS[event] || [];
  const awarded = [];
  
  for (const badgeType of badgesToCheck) {
    const exists = await Badge.findOne({ userId, badgeType });
    if (exists) continue;
    
    const eligible = await this.checkBadgeEligibility(userId, badgeType);
    if (eligible) {
      await Badge.create({ userId, badgeType, metadata });
      awarded.push(BADGE_DEFINITIONS[badgeType]);
    }
  }
  
  return awarded;
}
```

---

## Task 4: Leaderboard & Ranking

### 4.1 — Leaderboard Endpoint
**File**: `backend/src/routes/leaderboard.routes.js`

```javascript
// GET /api/leaderboard?domain=Technology&period=weekly&page=1&limit=20
router.get('/', requireAuth, controller.getLeaderboard);

// GET /api/leaderboard/my-rank
router.get('/my-rank', requireAuth, controller.getMyRank);
```

### 4.2 — Leaderboard Service
```javascript
async getLeaderboard({ domain, period, page, limit }) {
  const dateFilter = this.getDateFilter(period); // weekly, monthly, all-time
  
  const pipeline = [
    // Match users with activity in the period
    { $match: { expTotal: { $gt: 0 } } },
    // If domain filter, match by domainInterest
    ...(domain ? [{ $match: { domainInterest: domain } }] : []),
    // Sort by expTotal descending
    { $sort: { expTotal: -1 } },
    // Pagination
    { $skip: (page - 1) * limit },
    { $limit: limit },
    // Project only needed fields
    { $project: { name: 1, expTotal: 1, role: 1, currentStreak: 1, domainInterest: 1 } },
  ];
  
  const users = await User.aggregate(pipeline);
  // Add rank numbers
  return users.map((u, i) => ({ ...u, rank: (page - 1) * limit + i + 1 }));
}

async getMyRank(userId) {
  const user = await User.findById(userId);
  const rank = await User.countDocuments({ expTotal: { $gt: user.expTotal } }) + 1;
  const total = await User.countDocuments({ expTotal: { $gt: 0 } });
  return { rank, total, percentile: Math.round((1 - rank / total) * 100) };
}
```

---

## Task 5: CorpCoin Economy

### 5.1 — CorpCoin Award Events
Define when CorpCoins are awarded/deducted:
```javascript
const CORPCOIN_EVENTS = {
  // Earnings
  FOUNDER_SEED_GRANT: 10000,    // Already exists: on company creation
  DAILY_TASK_BONUS: 5,          // Small coin bonus per completed task
  STREAK_BONUS_7: 25,           // Weekly streak coin bonus
  STREAK_BONUS_30: 100,         // Monthly streak coin bonus
  PROMOTION_BONUS: 50,          // On level promotion
  
  // Founder costs (already handled in marketplace)
  BOT_PURCHASE: 'dynamic',      // Varies per bot
  BOT_RUN: 'dynamic',           // Varies per bot
};
```

### 5.2 — Admin CorpCoin Management
Admin can already create redeem codes for EXP. Extend to support CorpCoin redeem codes too:
- Add `coinAmount` field to RedeemCode model (optional, alongside `expAmount`)
- Update the redeem flow to award both if specified

---

## Task 6: Mount Leaderboard Routes

**File**: `backend/src/routes/index.js`

Add: `router.use('/leaderboard', require('./leaderboard.routes'));`

Register the Badge model in `backend/src/models/index.js`.

---

## Acceptance Criteria
- [ ] EXP awards tracked with source and metadata
- [ ] Promotion eligibility checked automatically after EXP changes
- [ ] Promotion executes with level change and bonus EXP
- [ ] Demotion triggers after sustained poor performance
- [ ] Streak system tracks consecutive task-completion days
- [ ] Streak bonuses awarded at 3, 7, 14, 30, 100 day milestones
- [ ] Badge system creates unique badges per user
- [ ] Badges trigger on relevant events (first application, first job, etc.)
- [ ] Leaderboard returns ranked users with pagination and domain filter
- [ ] `/api/leaderboard/my-rank` returns user's global rank and percentile
- [ ] CorpCoin bonuses awarded for task completion and streaks
- [ ] All gamification events logged for auditability
- [ ] Founder mode unlock at 500 EXP with option to transition
