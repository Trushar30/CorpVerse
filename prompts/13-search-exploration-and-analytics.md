# Prompt 6.2 — Search, Exploration & Analytics

## Context
CorpVerse needs better discovery features: global search across companies/roles/users, an enhanced company exploration page with rich filtering, and improved admin analytics. Currently, company browsing exists but is basic.

## Objective
Build a global search system, enhance the company/role exploration experience, and add analytics dashboards for admin insights.

---

## Task 1: Global Search API

### 1.1 — Search Endpoint
**Create**: `backend/src/routes/search.routes.js`

```javascript
// GET /api/search?q=frontend&type=roles,companies,users&domain=Technology&page=1
router.get('/', requireAuth, controller.globalSearch);
```

### 1.2 — Search Service
**Create**: `backend/src/services/search.service.js`

```javascript
async globalSearch({ query, types = ['roles', 'companies'], domain, page = 1, limit = 10 }) {
  const results = {};
  const searchRegex = new RegExp(query, 'i');
  
  if (types.includes('roles')) {
    results.roles = await Role.find({
      isOpen: true,
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { requirements: searchRegex },
      ],
      ...(domain && { domain }),
    })
    .populate('company', 'name logoUrl domain')
    .limit(limit)
    .sort('-createdAt');
  }
  
  if (types.includes('companies')) {
    results.companies = await Company.find({
      status: 'active',
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { tagline: searchRegex },
        { industry: searchRegex },
      ],
      ...(domain && { domain }),
    })
    .limit(limit)
    .sort('-valuation');
  }
  
  if (types.includes('users')) {
    results.users = await User.find({
      $or: [
        { name: searchRegex },
        { skills: searchRegex },
      ],
    })
    .select('name role domainInterest expTotal currentStreak')
    .limit(limit)
    .sort('-expTotal');
  }
  
  return results;
}
```

---

## Task 2: Enhanced Company Exploration

### 2.1 — Company Exploration Page
Enhance the Job Seeker's company browsing (Tab 1 in Dashboard) or create a dedicated route:

```
┌─────────────────────────────────────────────────────────────┐
│  🏢 EXPLORE COMPANIES                                       │
│─────────────────────────────────────────────────────────────│
│                                                             │
│  🔍 [Search companies, roles, skills...              ]      │
│                                                             │
│  Filters:                                                   │
│  Domain: [All ▼] [Tech] [Finance] [Healthcare] [Design]    │
│  Level:  [All ▼] [Junior] [Mid] [Senior]                   │
│  Sort:   [Most Roles ▼] [Newest] [Highest Valuation]       │
│                                                             │
│  ┌─ COMPANY CARD ────────────────────────────────────┐     │
│  │  🏢 TechNova Corp              Valuation: $1.2M   │     │
│  │  Technology | Founded by Alex K.                   │     │
│  │  "Building the future of EdTech"                   │     │
│  │                                                    │     │
│  │  👥 12 employees  |  📋 3 open roles  |  ⭐ 4.2    │     │
│  │                                                    │     │
│  │  Open Roles:                                       │     │
│  │  • Frontend Developer (Junior) — React, JS         │     │
│  │  • Backend Engineer (Mid) — Node.js, MongoDB       │     │
│  │  • ML Engineer (Senior) — Python, PyTorch          │     │
│  │                                                    │     │
│  │  [VIEW COMPANY]         [APPLY TO ROLE ▼]          │     │
│  └────────────────────────────────────────────────────┘     │
│                                                             │
│  [← Prev]  Showing 1-10 of 45  [Next →]                   │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 — Company Detail Page
**Create**: `frontend/src/pages/CompanyDetail.jsx`

Route: `/company/:id`

```
┌─────────────────────────────────────────────────────────────┐
│  ◄ BACK TO EXPLORE                                          │
│─────────────────────────────────────────────────────────────│
│                                                             │
│  🏢 TechNova Corp                                          │
│  "Building the future of EdTech"                            │
│                                                             │
│  Domain: Technology    |    Founded: Sep 2026                │
│  Valuation: $1,200,000 |    Employees: 12                   │
│                                                             │
│  ┌─ ABOUT ──────────────────────────────────────────┐      │
│  │  TechNova is a cutting-edge education technology   │     │
│  │  company focused on AI-driven learning platforms.. │     │
│  └──────────────────────────────────────────────────┘      │
│                                                             │
│  ┌─ OPEN POSITIONS ─────────────────────────────────┐      │
│  │                                                    │     │
│  │  Frontend Developer (Junior)                       │     │
│  │  React, JavaScript, CSS, TypeScript                │     │
│  │  Salary: 50K - 75K  |  2 openings                 │     │
│  │  [VIEW DETAILS]  [APPLY NOW]                       │     │
│  │                                                    │     │
│  │  Backend Engineer (Mid)                            │     │
│  │  Node.js, Express, MongoDB, Redis                  │     │
│  │  Salary: 80K - 110K  |  1 opening                 │     │
│  │  [VIEW DETAILS]  [APPLY NOW]                       │     │
│  │                                                    │     │
│  └────────────────────────────────────────────────────┘     │
│                                                             │
│  ┌─ COMPANY STATS ──────────────────────────────────┐      │
│  │  AI Bots Active: 3  |  Pipeline Runs: 47          │     │
│  │  Avg. Hiring Score: 72/100                        │     │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## Task 3: Admin Analytics Dashboard Enhancement

### 3.1 — Analytics Endpoints
**File**: `backend/src/routes/admin.routes.js`

Add analytics endpoints:
```javascript
router.get('/analytics/overview', requireAuth, requireRole('admin'), controller.getAnalyticsOverview);
router.get('/analytics/user-growth', requireAuth, requireRole('admin'), controller.getUserGrowth);
router.get('/analytics/activity', requireAuth, requireRole('admin'), controller.getActivityMetrics);
```

### 3.2 — Analytics Service
**Create**: `backend/src/services/analytics.service.js`

```javascript
async getOverview() {
  const [
    totalUsers, activeUsers, totalCompanies, activeCompanies,
    totalApplications, totalInterviews, totalTasks,
    totalExpAwarded, totalCorpCoinsCirculating,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ lastTaskCompletedDate: { $gte: weekAgo } }),
    Company.countDocuments(),
    Company.countDocuments({ status: 'active' }),
    Application.countDocuments(),
    Interview.countDocuments(),
    Task.countDocuments({ status: 'completed' }),
    User.aggregate([{ $group: { _id: null, total: { $sum: '$expTotal' } } }]),
    User.aggregate([{ $group: { _id: null, total: { $sum: '$corpCoins' } } }]),
  ]);
  
  return { totalUsers, activeUsers, totalCompanies, /* ... */ };
}

async getUserGrowth(period = '30d') {
  // Aggregate user registrations by day/week/month
  return await User.aggregate([
    { $match: { createdAt: { $gte: periodStart } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
}
```

### 3.3 — Admin Dashboard Analytics Tab
Add a new "Analytics" tab to the Admin Dashboard with:
- User growth chart (line chart — registrations over time)
- Role distribution pie chart (job seekers vs employees vs founders)
- Domain popularity bar chart
- Active vs inactive users
- Platform economy stats (total EXP, total CorpCoins, average per user)
- Top companies by valuation
- Interview pass rate

Use simple chart rendering — either SVG-based custom charts to keep dependencies minimal, or consider adding a lightweight chart library like `recharts`.

---

## Task 4: Frontend Global Search Component

**Create**: `frontend/src/components/layout/GlobalSearch.jsx`

Add to Navbar — a search bar that:
- Opens as a command palette style modal (Ctrl/Cmd+K shortcut)
- Debounced search as user types
- Results grouped by type (Roles, Companies, Users)
- Click result → navigate to relevant page
- Keyboard navigation (arrow keys, Enter to select)
- Recent searches stored in localStorage

```
┌──────────────────────────────────────────────────────┐
│  🔍 Search CorpVerse...                    ⌘K       │
│──────────────────────────────────────────────────────│
│                                                      │
│  ROLES                                               │
│  → Frontend Developer @ TechNova Corp (Junior)       │
│  → Frontend Engineer @ DataFlow Inc (Mid)            │
│                                                      │
│  COMPANIES                                           │
│  → TechNova Corp — Technology — 3 open roles         │
│  → FrontEnd Studios — Design — 2 open roles          │
│                                                      │
│  USERS                                               │
│  → Alex K. — Employee — 1,250 EXP                    │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## Task 5: Search API Service

**File**: `frontend/src/api/search.js`

```javascript
import client from './client';

export const globalSearch = (params) => client.get('/search', { params });
```

---

## Acceptance Criteria
- [ ] `GET /api/search` returns results across roles, companies, and users
- [ ] Search supports regex matching across multiple fields
- [ ] Domain and type filters work
- [ ] Enhanced company cards show valuation, employee count, open roles
- [ ] Company detail page shows full info with open positions
- [ ] Admin analytics endpoints return aggregated platform metrics
- [ ] Admin dashboard has analytics tab with growth and distribution data
- [ ] Global search accessible via Cmd+K shortcut
- [ ] Search results grouped by type with keyboard navigation
- [ ] Recent searches persisted in localStorage
- [ ] Pagination on all list views
- [ ] Retro arcade theme on all new pages
