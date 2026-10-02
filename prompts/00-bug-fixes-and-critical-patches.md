# Prompt 0.1 — Bug Fixes & Critical Patches

## Context
The CorpVerse codebase has been vibe-coded through landing page, authentication, onboarding, and 5 role-based dashboards. Before building new features, we must fix existing bugs that will cause runtime failures and clean up dead code that adds confusion.

## Objective
Fix all known bugs, remove dead/orphaned code, and patch inconsistencies across the codebase.

---

## Task 1: Fix Navbar.jsx Critical Bugs

**File**: `frontend/src/components/layout/Navbar.jsx`

### Bug 1.1 — `fontinally` typo (Line ~74)
The code has `} fontinally: {` which is a labeled statement, NOT a `finally` block. This means if the try block throws, `setIsRedeeming(false)` never runs and the submit button stays permanently in loading state.

**Fix**: Change `} fontinally: {` to `} finally {`

### Bug 1.2 — React Hooks called inside try/catch
Lines ~38-48 call `useAuth()` inside a try-catch block and/or conditionally. React hooks MUST be called unconditionally at the top level of the component.

**Fix**: Move the `useAuth()` call to the top of the component body, outside any try/catch or conditional:
```jsx
const Navbar = () => {
  const { user, logout, refreshUser } = useAuth();
  // ... rest of component
};
```

---

## Task 2: Fix ExpLog Schema Mismatch

**File**: `backend/src/controllers/profile.controller.js` (lines ~209-214)

The redeem code controller creates an ExpLog with wrong field names:
```javascript
// CURRENT (broken - fails silently)
await ExpLog.create({
  user: user._id,        // ❌ Schema has no 'user' field
  amount: redeemDoc.expAmount, // ❌ Schema field is 'expChange', not 'amount'
  reason: `Redeemed code ${cleanCode}`,
});
```

**File**: `backend/src/models/ExpLog.js`

The schema requires `employeeRecord` (ObjectId, required) and `expChange` (Number, required).

**Fix Option A** — Update the ExpLog model to support non-employee EXP events:
```javascript
// Add a 'user' field as an alternative to 'employeeRecord'
user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
employeeRecord: { type: mongoose.Schema.Types.ObjectId, ref: 'EmployeeRecord' },
// Make a custom validator: at least one of user or employeeRecord must be provided
```

Also add a `source` value of `'redeem_code'` to the enum.

**Fix Option B** — Update the controller to match the existing schema by using correct field names. Since a job seeker redeeming a code doesn't have an employeeRecord, Option A is better.

Then fix the controller:
```javascript
await ExpLog.create({
  user: user._id,
  expChange: redeemDoc.expAmount,
  reason: `Redeemed code ${cleanCode}`,
  source: 'redeem_code',
});
```

Also remove the empty `try { ... } catch (_) {}` wrapper — let errors propagate properly.

---

## Task 3: Add Missing `AI_MANAGER` to Constants

**File**: `backend/src/utils/constants.js`

Add the missing role:
```javascript
const USER_ROLE = {
  ADMIN: 'admin',
  AI_MANAGER: 'ai_manager', // ← ADD THIS
  JOB_SEEKER: 'job_seeker',
  WORKING: 'working',
  FOUNDER: 'founder',
};
```

Also add `AI_MANAGER` to any arrays or enums that reference roles. Audit all usages of `USER_ROLE` across the codebase and ensure consistency.

---

## Task 4: Fix Missing CSS Classes

**Files**: `frontend/src/components/ui/Card.jsx`, `frontend/src/components/ui/Button.jsx`, `frontend/src/components/layout/Footer.jsx`

These components reference CSS classes `.glass-panel`, `.glass-card`, `.glow-purple` that don't exist in `src/index.css`.

**Fix**: Either:
- Add the missing CSS classes to `src/index.css` that match the retro arcade theme (recommended), OR
- Replace the class references with the existing equivalent classes (`.arcade-panel`, `.arcade-card`, `.retro-pixel-card`)

Ensure visual consistency with the established retro pixel theme.

---

## Task 5: Remove Dead/Orphaned Code

### 5.1 — Delete unused files:
- `frontend/src/App.css` — Default Vite boilerplate, never imported
- `frontend/src/components/landing/CorpVerseLandingRedesign.jsx` — 857 lines, old landing page, unreferenced
- `frontend/src/components/landing/Companies.jsx` — Old Dark Cosmos theme component, unreferenced
- `frontend/src/components/landing/CTA.jsx` — Old component, unreferenced
- `frontend/src/assets/react.svg` — Vite boilerplate
- `frontend/src/assets/vite.svg` — Vite boilerplate

### 5.2 — Fix document title:
**File**: `frontend/index.html`
Change `<title>frontend</title>` to `<title>CorpVerse — Gamified Corporate Simulation</title>`

---

## Task 6: Fix Client-Side Fallback Masking Backend Failures

**File**: `frontend/src/pages/Dashboard.jsx`

The redeem code handler has hardcoded promo codes (`CORPVERSE2026`, `PIONEER50`, etc.) that trigger fake success toasts even when the backend API fails. This masks real errors.

**Fix**: Remove the client-side fallback codes. If the API call fails, show the actual error message to the user. The redeem codes should ONLY work through the backend.

---

## Task 7: Fix Company Routes Auth Comment Mismatch

**File**: `backend/src/routes/company.routes.js`

Line 12 comments say `// Public routes (browsable without full profile)` but all routes use `requireAuth`. Either:
- Remove `requireAuth` to make company browsing truly public (if that's the intent), OR  
- Update the comment to say `// Authenticated routes (login required to browse)`

**Decision**: Keep `requireAuth` (users should be logged in to browse the platform) but update the comment.

---

## Acceptance Criteria
- [ ] Navbar redeem code flow doesn't get stuck in loading state
- [ ] No React hooks violations in Navbar
- [ ] ExpLog entries are created successfully when redeeming codes (verify in MongoDB)
- [ ] `USER_ROLE` constants include `ai_manager`
- [ ] No CSS class-not-found warnings in browser console
- [ ] All dead files deleted, no broken imports
- [ ] `<title>` shows "CorpVerse" in browser tab
- [ ] Redeem code only works via backend API, no client-side fakes
- [ ] Backend starts without errors: `npm run dev`
- [ ] Frontend starts without errors: `npm run dev`
