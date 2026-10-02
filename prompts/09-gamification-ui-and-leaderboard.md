# Prompt 4.2 — Gamification UI & Leaderboard

## Context
The gamification engine backend is ready (Prompt 08) with EXP, streaks, badges, promotions, and leaderboard APIs. Now we need the frontend to make all of this visible, exciting, and addictive.

## Objective
Build the global leaderboard page, badge showcase, promotion celebration animations, streak display, and rank visualization across the platform.

---

## Task 1: Global Leaderboard Page

**Create**: `frontend/src/pages/Leaderboard.jsx`

This is a new top-level page accessible from the Navbar for all authenticated users.

### 1.1 — Route
**File**: `frontend/src/App.jsx`
```jsx
<Route path="/leaderboard" element={
  <ProtectedRoute>
    <Leaderboard />
  </ProtectedRoute>
} />
```

### 1.2 — Leaderboard Layout
```
┌─────────────────────────────────────────────────────────────┐
│  🏆 GLOBAL RANKINGS                                        │
│─────────────────────────────────────────────────────────────│
│                                                             │
│  Filter: [All Domains ▼]  Period: [Weekly|Monthly|All-Time] │
│                                                             │
│  ┌─ TOP 3 PODIUM ────────────────────────────────────┐     │
│  │              🥇                                     │    │
│  │           ┌──────┐                                  │    │
│  │     🥈    │ Alex │    🥉                            │    │
│  │  ┌──────┐│ 2.5K │┌──────┐                          │    │
│  │  │ Sara ││ EXP  ││ Mike │                          │    │
│  │  │ 2.1K ││      ││ 1.8K │                          │    │
│  │  │ EXP  ││      ││ EXP  │                          │    │
│  │  └──────┘└──────┘└──────┘                          │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─ YOUR RANK ──────────────────────────────────────┐      │
│  │  #42 out of 1,234 players  |  Top 3%  |  287 EXP │      │
│  └──────────────────────────────────────────────────┘      │
│                                                             │
│  ┌─ RANKINGS ────────────────────────────────────────┐     │
│  │  #  Player        Role       Domain     EXP  🔥   │     │
│  │  4  Jordan K.    Employee   Tech       1,650  12  │     │
│  │  5  Priya M.     Founder    Finance    1,420   8  │     │
│  │  6  Rohan S.     Employee   Design     1,380  15  │     │
│  │  7  Ananya T.    Founder    Tech       1,200   6  │     │
│  │  ...                                              │     │
│  │  42 ▶ You        Employee   Tech         287   5  │     │ ← Highlighted
│  │  ...                                              │     │
│  │                                                   │     │
│  │  [← Prev]  Page 1 of 62  [Next →]               │     │
│  └───────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 — Features
- Top 3 podium with 3D-ish retro pixel art podium blocks
- Current user's rank highlighted with a glowing border
- Domain filter dropdown (Technology, Finance, Healthcare, etc.)
- Period tabs (Weekly, Monthly, All-Time)
- Streak fire emoji with count
- Role badges next to names (colored pills: Job Seeker, Employee, Founder)
- Pagination for the full list
- "Jump to my rank" button if user is beyond page 1

---

## Task 2: Badge Showcase

### 2.1 — Badge Display Component
**Create**: `frontend/src/components/dashboard/BadgeShowcase.jsx`

```
┌─ MY BADGES (7/18) ──────────────────────────────────────┐
│                                                           │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐     │
│  │ 🎯 │ │ 🎤 │ │ 💼 │ │ 🔥 │ │ 🔥 │ │ ⭐ │ │ 📊 │     │
│  │First│ │Int.│ │Hire│ │ 7d │ │14d │ │ 10 │ │ 50 │     │
│  │ App │ │View│ │  d │ │Strk│ │Strk│ │Task│ │Task│     │
│  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘     │
│                                                           │
│  ┌────┐ ┌────┐ ┌────┐ ... (locked badges grayed out)    │
│  │ 🔒 │ │ 🔒 │ │ 🔒 │                                   │
│  │ 30d│ │100d│ │Fnd │                                    │
│  │Strk│ │Strk│ │Mode│                                    │
│  └────┘ └────┘ └────┘                                    │
└───────────────────────────────────────────────────────────┘
```

Features:
- Earned badges: full color with subtle glow animation
- Locked badges: grayscale with lock icon overlay
- Click on badge to see details (name, description, unlock date, rarity)
- Rarity colors: Common (gray), Uncommon (green), Rare (blue), Epic (purple), Legendary (gold)
- New badge has a pulsing "NEW" indicator for 24 hours

### 2.2 — Badge Unlock Animation
**Create**: `frontend/src/components/dashboard/BadgeUnlockAnimation.jsx`

When a new badge is earned (detected via API response):
- Full-screen overlay with dimmed background
- Badge icon zooms in from center with particle burst
- Rarity-colored border animation
- Name and description fade in below
- "ACHIEVEMENT UNLOCKED!" header in pixel font
- Auto-dismiss after 4 seconds or on click

---

## Task 3: Promotion Celebration

### 3.1 — Promotion Modal
**Create**: `frontend/src/components/modals/PromotionModal.jsx`

When user gets promoted (detected from API response or polled):
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    ⚡ PROMOTION! ⚡                          │
│                                                             │
│            ┌─────────────────────────┐                      │
│            │                         │                      │
│            │    JUNIOR → MID LEVEL   │                      │
│            │                         │                      │
│            │    Frontend Developer   │                      │
│            │    @ TechNova Corp      │                      │
│            │                         │                      │
│            └─────────────────────────┘                      │
│                                                             │
│           +50 EXP Promotion Bonus Awarded!                  │
│           +50 CorpCoins Bonus!                              │
│                                                             │
│    New challenges await. Tasks will now be harder           │
│    but more rewarding. Keep pushing!                        │
│                                                             │
│              [ACCEPT PROMOTION →]                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

- Confetti particle animation in background (use canvas or CSS)
- Golden glow border effect
- Level-up sound effect (optional)
- Pixel art style consistent with theme

### 3.2 — Founder Unlock Modal
When user reaches 500 EXP, show special modal:
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│               🚀 FOUNDER MODE UNLOCKED! 🚀                  │
│                                                             │
│      You've proven yourself in the corporate world.         │
│      Now it's time to build your own empire.                │
│                                                             │
│      As a Founder, you can:                                 │
│      • Create and manage your own company                   │
│      • Hire AI bots for your pipeline                       │
│      • Post job roles and hire other players                │
│      • Make strategic decisions for growth                   │
│                                                             │
│      ⚠️ Warning: Founding is risky!                         │
│      Bad decisions can lead to losses and                   │
│      company suspension.                                    │
│                                                             │
│   [STAY AS EMPLOYEE]     [BECOME A FOUNDER →]               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Task 4: Streak Display in Navbar

**File**: `frontend/src/components/layout/Navbar.jsx`

Add streak indicator next to the EXP counter:
```jsx
<div className="flex items-center gap-2">
  <span className="text-yellow-400 font-pixel">⚡ {user.expTotal} EXP</span>
  {user.currentStreak > 0 && (
    <span className="text-orange-400 font-pixel">
      🔥 {user.currentStreak}d
    </span>
  )}
</div>
```

---

## Task 5: EXP Progress Bars Enhancement

### 5.1 — Animated EXP Bar Component
**Create**: `frontend/src/components/dashboard/AnimatedExpBar.jsx`

- Smooth animation when EXP changes (use framer-motion)
- Color gradient that shifts as progress increases (green → yellow → gold)
- Milestone markers on the bar (150 EXP for Mid, 350 for Senior, 500 for Founder)
- Shimmer effect on the filled portion
- Number counter that ticks up when EXP is gained

---

## Task 6: Leaderboard API Service

**File**: `frontend/src/api/leaderboard.js`

```javascript
import client from './client';

export const getLeaderboard = (params) => client.get('/leaderboard', { params });
export const getMyRank = () => client.get('/leaderboard/my-rank');
export const getMyBadges = () => client.get('/profile/badges');
```

---

## Task 7: Add Leaderboard Link to Navbar

Add "Rankings" link to Navbar for all authenticated users:
```jsx
<NavLink to="/leaderboard" className="...">
  🏆 Rankings
</NavLink>
```

---

## Acceptance Criteria
- [ ] Leaderboard page renders with top 3 podium
- [ ] Domain and period filters work correctly
- [ ] User's own rank highlighted in the list
- [ ] "Jump to my rank" button works
- [ ] Pagination works correctly
- [ ] Badge showcase shows earned and locked badges
- [ ] Badge click shows details modal
- [ ] Badge unlock animation plays for new badges
- [ ] Promotion celebration modal appears with confetti
- [ ] Founder unlock modal presents the choice to transition
- [ ] Streak indicator shows in Navbar with fire emoji
- [ ] Animated EXP bar with smooth transitions
- [ ] All leaderboard data comes from real API
- [ ] Retro arcade theme throughout all new components
- [ ] Mobile responsive layout for leaderboard
