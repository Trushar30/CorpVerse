# Prompt 6.3 — Responsive Design & UX Polish

## Context
CorpVerse has been built desktop-first with the retro pixel arcade theme. Before production, we need mobile responsiveness, proper loading/error states, micro-interactions, and UX refinements across the entire platform.

## Objective
Make every page responsive, add loading skeletons, error boundaries, toast notifications, and polished micro-interactions that elevate the user experience.

---

## Task 1: Mobile Responsive Layout

### 1.1 — Navbar Mobile
- Hamburger menu on screens < 768px
- Slide-out drawer with navigation links, role badge, EXP counter, notification bell
- Close on outside click or swipe
- Same retro pixel styling

### 1.2 — Dashboard Pages
All 5 dashboard layouts should work on mobile:
- Tab navigation becomes horizontally scrollable pills
- Cards stack vertically on mobile
- Tables become card-list views on mobile (hide some columns)
- Stat cards become 2-column grid on tablet, 1-column on phone

### 1.3 — Interview Room
- Chat interface should work on mobile (full-width messages, larger touch targets)
- Input area fixed to bottom of screen on mobile
- Turns counter moves to a compact top bar

### 1.4 — Pipeline Builder
- Show "Desktop Required" message on screens < 1024px
- The drag-and-drop canvas requires a desktop experience

### 1.5 — Leaderboard
- Top 3 podium stacks vertically on mobile
- Table becomes card list
- Filters become a collapsible panel

### 1.6 — Breakpoints
```css
/* Mobile first approach */
/* sm: 640px, md: 768px, lg: 1024px, xl: 1280px */
```

---

## Task 2: Loading Skeletons

**Create**: `frontend/src/components/ui/Skeleton.jsx`

A reusable skeleton component:
```jsx
const Skeleton = ({ width, height, className, variant = 'rectangular' }) => (
  <div
    className={`animate-pulse bg-gray-800/50 ${
      variant === 'circular' ? 'rounded-full' : 'rounded-lg'
    } ${className}`}
    style={{ width, height }}
  />
);
```

### 2.1 — Dashboard Skeleton
```jsx
const DashboardSkeleton = () => (
  <div className="space-y-4">
    {/* Stat cards skeleton */}
    <div className="grid grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} height="100px" />
      ))}
    </div>
    {/* Content skeleton */}
    <Skeleton height="400px" />
  </div>
);
```

### 2.2 — Add skeletons to:
- All dashboard pages (while loading initial data)
- Company/role listings (while searching)
- Leaderboard (while loading ranks)
- Notification panel (while loading notifications)
- Application pipeline (while loading applications)

---

## Task 3: Error Boundaries

**Create**: `frontend/src/components/common/ErrorBoundary.jsx`

```jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center">
          <div className="text-6xl mb-4">💥</div>
          <h2 className="text-xl font-pixel text-yellow-400 mb-2">SYSTEM ERROR</h2>
          <p className="text-gray-400 mb-4">Something went wrong. Don't worry, your progress is saved.</p>
          <button onClick={() => this.setState({ hasError: false })} className="retro-btn-yellow">
            TRY AGAIN
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

### 3.1 — Wrap all major sections:
```jsx
<ErrorBoundary>
  <DashboardRouter />
</ErrorBoundary>
```

### 3.2 — API Error Handler Component
**Create**: `frontend/src/components/common/ApiError.jsx`
```jsx
const ApiError = ({ error, onRetry }) => (
  <div className="arcade-panel p-4 text-center">
    <p className="text-red-400">{error.message || 'Failed to load data'}</p>
    {onRetry && (
      <button onClick={onRetry} className="retro-btn-dark mt-2">
        RETRY
      </button>
    )}
  </div>
);
```

---

## Task 4: Toast Notification System

**Create**: `frontend/src/components/ui/Toast.jsx` and `frontend/src/context/ToastContext.jsx`

A global toast system for success/error/info messages:

```jsx
// Usage anywhere:
const { showToast } = useToast();
showToast('Application submitted!', 'success');
showToast('Failed to load tasks', 'error');
showToast('Interview starts in 5 minutes', 'info');
```

### Toast Component:
```
┌─────────────────────────────────────┐
│  ✅ Application submitted!          │  ← Slides in from top-right
│     ATS screening in progress...    │
│                               [✕]  │  ← Auto-dismiss after 5s
└─────────────────────────────────────┘
```

Features:
- Stack multiple toasts vertically
- Auto-dismiss with configurable duration (default 5s)
- Manual dismiss on click or X button
- Variants: success (green), error (red), info (blue), warning (yellow)
- Slide-in animation from top-right
- Pixel/arcade styled borders matching theme
- Maximum 3 visible at once (queue extras)

---

## Task 5: Micro-Interactions & Polish

### 5.1 — Button Hover Effects
All buttons should have subtle feedback:
- Scale up slightly on hover (transform: scale(1.02))
- Press effect on click (scale down: 0.98)
- Focus ring for keyboard navigation (accessibility)

### 5.2 — Page Transitions
Use Framer Motion for page transitions:
```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.2 }}
>
  {children}
</motion.div>
```

### 5.3 — Tab Transitions
Animate tab content changes with horizontal slide:
- Switching to a tab on the right → content slides in from right
- Switching to a tab on the left → content slides in from left

### 5.4 — Number Counters
Animate number changes (EXP, CorpCoins, stats):
- Counting up/down animation when values change
- Use `requestAnimationFrame` for smooth counting

### 5.5 — Empty States
Ensure every list/grid has a themed empty state:
```
┌──────────────────────────────────┐
│         🎮 NO DATA YET          │
│                                  │
│  [Contextual message here]       │
│  [Action button if applicable]   │
└──────────────────────────────────┘
```

### 5.6 — Confirmation Modals
Create a reusable confirmation modal:
**Create**: `frontend/src/components/modals/ConfirmModal.jsx`

Used for: resign, delete, apply, accept offer, etc.
- Consistent styling across all confirmations
- Support for danger variant (red accented)
- Loading state on confirm button

---

## Task 6: Accessibility Basics

### 6.1 — Keyboard Navigation
- All interactive elements focusable
- Tab order logical
- Escape key closes modals
- Enter/Space activates buttons

### 6.2 — ARIA Labels
- Add `aria-label` to icon-only buttons
- `role="alert"` on toast notifications
- `aria-live="polite"` on dynamic content areas (notification count, etc.)

### 6.3 — Color Contrast
- Ensure text passes WCAG AA contrast against dark backgrounds
- Don't rely solely on color for status indicators (add icons/text too)

---

## Acceptance Criteria
- [ ] All pages usable on mobile (320px viewport minimum)
- [ ] Navbar collapses to hamburger on mobile
- [ ] Dashboard cards stack on mobile
- [ ] Loading skeletons display while data loads
- [ ] Error boundaries catch and display component errors
- [ ] API errors show retry option
- [ ] Toast notifications work globally (success, error, info, warning)
- [ ] Toasts auto-dismiss and stack properly
- [ ] Buttons have hover/press feedback
- [ ] Page transitions animate smoothly
- [ ] Number changes animate (EXP, coins)
- [ ] Every list has an empty state
- [ ] Confirmation modals are consistent
- [ ] Basic keyboard navigation works
- [ ] ARIA labels on icon-only buttons
- [ ] Pipeline builder shows "Desktop Required" on mobile
