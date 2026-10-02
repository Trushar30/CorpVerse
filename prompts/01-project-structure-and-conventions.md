# Prompt 0.2 — Project Structure & Conventions

## Context
CorpVerse has been vibe-coded rapidly. The codebase works but lacks consistent organization patterns. Before building Phase 2 features (applications, interviews, employee tasks), we need a clean foundation.

## Objective
Reorganize files, establish naming conventions, add path aliases, and set up shared utilities that all future features will use.

---

## Task 1: Frontend File Organization

### 1.1 — Add Vite Path Aliases
**File**: `frontend/vite.config.js`

Add path aliases so we stop using fragile relative imports like `../../../api/auth`:
```javascript
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@api': path.resolve(__dirname, './src/api'),
      '@context': path.resolve(__dirname, './src/context'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@assets': path.resolve(__dirname, './src/assets'),
    },
  },
  // ... existing config
});
```

### 1.2 — Create Missing Directory Structure
Create these directories (they'll be populated in later prompts):

```
frontend/src/
├── hooks/              # Custom React hooks (useDebounce, useLocalStorage, etc.)
│   └── index.js        # Barrel export
├── utils/              # Frontend utility functions
│   ├── formatters.js   # Date, number, currency formatters
│   ├── validators.js   # Client-side validation helpers
│   └── constants.js    # Frontend constants (role labels, status labels, colors)
├── components/
│   ├── common/         # (existing) Shared interactive components
│   ├── ui/             # (existing) Design system primitives
│   ├── layout/         # (existing) Navbar, Footer
│   ├── landing/        # (existing) Landing page components
│   ├── dashboard/      # NEW — Shared dashboard widgets (StatCard, TabNav, etc.)
│   └── modals/         # NEW — Reusable modal components
└── pages/
    ├── dashboards/     # NEW — Move all dashboard pages here
    │   ├── JobSeekerDashboard.jsx    # renamed from Dashboard.jsx
    │   ├── EmployeeDashboard.jsx     # renamed from WorkingDashboard.jsx
    │   ├── FounderDashboard.jsx
    │   ├── AIManagerDashboard.jsx
    │   └── AdminDashboard.jsx
    └── auth/           # NEW — Group auth-related pages
        ├── AuthPage.jsx
        ├── VerifyEmail.jsx
        └── Onboarding.jsx
```

### 1.3 — Extract Shared Dashboard Components
All 5 dashboards repeat similar UI patterns. Extract into `components/dashboard/`:

```
components/dashboard/
├── StatCard.jsx        # Reusable stat display (icon, label, value, trend)
├── TabNav.jsx          # Reusable tab navigation bar
├── DashboardLayout.jsx # Shared layout wrapper (sidebar area, main content, header)
├── DataTable.jsx       # Reusable data table with sorting, pagination
├── StatusBadge.jsx     # Status pill/badge with color coding
├── ExpGauge.jsx        # EXP progress bar (reused in Job Seeker, Employee dashboards)
└── EmptyState.jsx      # "No data" placeholder with icon and action button
```

Identify repeated patterns across `Dashboard.jsx`, `WorkingDashboard.jsx`, `FounderDashboard.jsx`, `AIManagerDashboard.jsx`, and `AdminDashboard.jsx`. Extract the shared UI patterns into these components. Update all dashboards to use them.

### 1.4 — Create Frontend Constants File
**File**: `frontend/src/utils/constants.js`

```javascript
export const ROLES = {
  ADMIN: 'admin',
  AI_MANAGER: 'ai_manager',
  JOB_SEEKER: 'job_seeker',
  WORKING: 'working',
  FOUNDER: 'founder',
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'System Admin',
  [ROLES.AI_MANAGER]: 'AI Manager',
  [ROLES.JOB_SEEKER]: 'Job Seeker',
  [ROLES.WORKING]: 'Employee',
  [ROLES.FOUNDER]: 'Founder',
};

export const APPLICATION_STATUS = {
  PENDING_SCREENING: 'pending_screening',
  SCREENING_PASSED: 'screening_passed',
  SCREENING_REJECTED: 'screening_rejected',
  INTERVIEW_IN_PROGRESS: 'interview_in_progress',
  INTERVIEW_PASSED: 'interview_passed',
  INTERVIEW_REJECTED: 'interview_rejected',
  OFFER_PENDING: 'offer_pending',
  OFFER_ACCEPTED: 'offer_accepted',
  OFFER_DECLINED: 'offer_declined',
};

export const APPLICATION_STATUS_LABELS = {
  pending_screening: 'ATS Screening',
  screening_passed: 'Screening Passed',
  screening_rejected: 'Screening Rejected',
  interview_in_progress: 'Interview In Progress',
  interview_passed: 'Interview Passed',
  interview_rejected: 'Interview Rejected',
  offer_pending: 'Offer Pending',
  offer_accepted: 'Hired!',
  offer_declined: 'Offer Declined',
};

export const EXP_THRESHOLDS = {
  FOUNDER_UNLOCK: 500,
  PROMOTION_JUNIOR_TO_MID: 150,
  PROMOTION_MID_TO_SENIOR: 350,
};
```

### 1.5 — Create Custom Hooks
**File**: `frontend/src/hooks/useDebounce.js`
```javascript
// Debounce hook for search inputs (used in company search, user search, etc.)
```

**File**: `frontend/src/hooks/useLocalStorage.js`
```javascript
// Persist UI state (selected tabs, sidebar collapsed, etc.)
```

**File**: `frontend/src/hooks/useApi.js`
```javascript
// Generic API call hook with loading, error, data states
// Wraps axios calls with consistent error handling
```

---

## Task 2: Backend File Organization

### 2.1 — Add Service Layer
Currently controllers contain business logic directly. Add a `services/` layer between controllers and models for complex operations that will come in Phase 2:

```
backend/src/
├── services/           # NEW — Business logic layer
│   ├── application.service.js    # Application creation, screening orchestration
│   ├── interview.service.js      # Interview flow, AI chat orchestration  
│   ├── employee.service.js       # Task assignment, completion, performance
│   ├── gamification.service.js   # EXP calculation, promotion/demotion logic
│   ├── ai.service.js             # AI microservice communication layer
│   └── company.service.js        # Company lifecycle, profit/loss calculations
```

For now, create these files with exported empty async functions matching the stub controllers. The actual implementation comes in later prompts. This establishes the pattern.

### 2.2 — Create AI Service Communication Layer
**File**: `backend/src/services/ai.service.js`

This wraps all communication with the Python FastAPI microservice:
```javascript
const axios = require('axios');
const config = require('../config');

class AIService {
  constructor() {
    this.baseUrl = config.aiServiceUrl || 'http://localhost:8000';
    this.timeout = 45000;
  }

  async screenResume({ resumeText, jobRequirements, roleTitle }) { /* ... */ }
  async conductInterview({ transcript, roleContext, systemPrompt }) { /* ... */ }
  async evaluateInterview({ transcript, rubric }) { /* ... */ }
  async generateTask({ roleTitle, level, domain }) { /* ... */ }
  async reviewCode({ code, language, context }) { /* ... */ }
  
  // Health check
  async ping() { /* ... */ }
}

module.exports = new AIService();
```

### 2.3 — Standardize Error Responses
Review all controllers. Ensure every endpoint uses the existing `ApiResponse` and `ApiError` utilities consistently:
- Success: `res.status(200).json(new ApiResponse(200, data, 'message'))`
- Error: `throw ApiError.badRequest('message')` / `ApiError.notFound()` / `ApiError.forbidden()`

---

## Task 3: Shared Configuration

### 3.1 — Update render.yaml for AI Service
**File**: `render.yaml`

Add the Python FastAPI service:
```yaml
services:
  - type: web
    name: corpverse-backend
    env: node
    plan: free
    buildCommand: cd backend && npm ci
    startCommand: cd backend && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: AI_SERVICE_URL
        fromService:
          name: corpverse-ai
          type: web
          property: host

  - type: web
    name: corpverse-ai
    env: python
    plan: free
    buildCommand: cd ai_service && pip install -r requirements.txt
    startCommand: cd ai_service && uvicorn main:app --host 0.0.0.0 --port 8000
```

---

## Acceptance Criteria
- [ ] Path aliases work: `import { useAuth } from '@context/AuthContext'` compiles
- [ ] Dashboard pages moved to `pages/dashboards/` and routes updated in App.jsx
- [ ] Auth pages moved to `pages/auth/` and routes updated
- [ ] At least 3 shared dashboard components extracted and used
- [ ] Frontend constants file created with all role/status mappings
- [ ] Backend services directory created with empty function stubs
- [ ] AI Service communication layer created
- [ ] render.yaml includes both backend and ai_service
- [ ] Both frontend and backend start without errors
- [ ] All existing routes still work correctly after reorganization
