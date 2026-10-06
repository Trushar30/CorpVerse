# CorpVerse — In-Progress & Polish Work Guide

This guide contains complete, step-by-step instructions to resolve all in-progress tasks, bug fixes, architecture alignments, and integration wiring in the CorpVerse codebase. Once these items are implemented, all existing modules will be 100% production-ready.

---

## 📋 Task Overview

| # | Task | Area | Severity / Priority | Primary Target Files |
|---|---|---|:---:|---|
| 1 | Fix Founder Applicant Tracking Query & Candidate Mapping | Backend + Frontend | **High (Bug)** | [founder.controller.js](file:///Users/trushargpatel/Downloads/IT/SEM%20-%207/SGP/CorpVerse/backend/src/controllers/founder.controller.js), [FounderDashboard.jsx](file:///Users/trushargpatel/Downloads/IT/SEM%20-%207/SGP/CorpVerse/frontend/src/pages/dashboards/FounderDashboard.jsx) |
| 2 | Refactor & Consolidate Company Service Layer | Backend | **Medium (Architecture)** | [company.service.js](file:///Users/trushargpatel/Downloads/IT/SEM%20-%207/SGP/CorpVerse/backend/src/services/company.service.js), [company.controller.js](file:///Users/trushargpatel/Downloads/IT/SEM%20-%207/SGP/CorpVerse/backend/src/controllers/company.controller.js) |
| 3 | Configure Local AI Microservice & Environment Wiring | AI Service + Backend | **Medium (Integration)** | [ai_service/](file:///Users/trushargpatel/Downloads/IT/SEM%20-%207/SGP/CorpVerse/ai_service), [ai.service.js](file:///Users/trushargpatel/Downloads/IT/SEM%20-%207/SGP/CorpVerse/backend/src/services/ai.service.js) |
| 4 | Frontend Bundle Optimization & Manual Chunk Splitting | Frontend Build | **Low (Performance)** | [vite.config.js](file:///Users/trushargpatel/Downloads/IT/SEM%20-%207/SGP/CorpVerse/frontend/vite.config.js) |
| 5 | Mobile & Tablet Responsive Viewport Polish | Frontend UI | **Low (UX/Design)** | [AIManagerDashboard.jsx](file:///Users/trushargpatel/Downloads/IT/SEM%20-%207/SGP/CorpVerse/frontend/src/pages/dashboards/AIManagerDashboard.jsx), [FounderDashboard.jsx](file:///Users/trushargpatel/Downloads/IT/SEM%20-%207/SGP/CorpVerse/frontend/src/pages/dashboards/FounderDashboard.jsx) |

---

## 🛠️ Step-by-Step Instructions

### Task 1: Fix Founder Applicant Tracking Query & Candidate Mapping

#### Root Cause:
In [founder.controller.js:L127-L140](file:///Users/trushargpatel/Downloads/IT/SEM%20-%207/SGP/CorpVerse/backend/src/controllers/founder.controller.js#L127-L140), `getApplicants` attempts:
```javascript
const applications = await Application.find({ company: company._id })
  .populate('role', 'title domain level')
  .populate('candidate', 'name email skills expTotal resumeUrl resumeMetadata');
```
1. `Application` schema ([Application.js](file:///Users/trushargpatel/Downloads/IT/SEM%20-%207/SGP/CorpVerse/backend/src/models/Application.js)) has **no `company` field** directly; `company` is a property on `Role`.
2. The user reference is named **`user`**, not `candidate`.
3. In [FounderDashboard.jsx](file:///Users/trushargpatel/Downloads/IT/SEM%20-%207/SGP/CorpVerse/frontend/src/pages/dashboards/FounderDashboard.jsx), applicant rendering relies on either `app.candidate` or `app.user`.

#### Instructions:
1. Update `getApplicants` in [backend/src/controllers/founder.controller.js](file:///Users/trushargpatel/Downloads/IT/SEM%20-%207/SGP/CorpVerse/backend/src/controllers/founder.controller.js):
   ```javascript
   const getApplicants = asyncHandler(async (req, res) => {
     const company = await Company.findOne({ founder: req.user._id });
     if (!company) {
       return ApiResponse.ok([], 'No company found').send(res);
     }

     // 1. Fetch all roles belonging to this company
     const companyRoles = await Role.find({ company: company._id }).select('_id');
     const roleIds = companyRoles.map((r) => r._id);

     // 2. Query applications matching those roles
     const applications = await Application.find({ role: { $in: roleIds } })
       .populate('role', 'title domain level requirements salaryRange')
       .populate('user', 'name email skills expTotal resumeUrl resumeMetadata currentStatus')
       .sort({ createdAt: -1 })
       .lean();

     // 3. Normalize shape so frontend can access candidate properties smoothly
     const formattedApplications = applications.map((app) => ({
       ...app,
       candidate: app.user, // backwards-compatible alias
     }));

     ApiResponse.ok(formattedApplications, 'Applicants retrieved').send(res);
   });
   ```
2. Verify in [frontend/src/pages/dashboards/FounderDashboard.jsx](file:///Users/trushargpatel/Downloads/IT/SEM%20-%207/SGP/CorpVerse/frontend/src/pages/dashboards/FounderDashboard.jsx) where `applicants` are mapped that both `app.user` and `app.candidate` are safely handled (`app.user?.name || app.candidate?.name`).

---

### Task 2: Refactor & Consolidate Company Service Layer

#### Current State:
[company.service.js](file:///Users/trushargpatel/Downloads/IT/SEM%20-%207/SGP/CorpVerse/backend/src/services/company.service.js) has empty stub methods (`createCompany`, `getCompanyMetrics`, `updateFinances`), while [company.controller.js](file:///Users/trushargpatel/Downloads/IT/SEM%20-%207/SGP/CorpVerse/backend/src/controllers/company.controller.js) performs database queries directly.

#### Instructions:
1. Implement full service methods in [backend/src/services/company.service.js](file:///Users/trushargpatel/Downloads/IT/SEM%20-%207/SGP/CorpVerse/backend/src/services/company.service.js):
   - `getCompanies({ domain, page, limit })`: fetches paginated companies and calculates open roles counts.
   - `getCompanyById(id)`: fetches single company with populated founder and open roles.
   - `getCompanyRoles(companyId)`: fetches all active open roles for a company.
   - `getCompanyMetrics(companyId)`: calculates total hires, active roles, treasury balance, and average applicant score.
2. Delegate the controller logic in [backend/src/controllers/company.controller.js](file:///Users/trushargpatel/Downloads/IT/SEM%20-%207/SGP/CorpVerse/backend/src/controllers/company.controller.js) to call `companyService`:
   ```javascript
   const companyService = require('../services/company.service');

   const getCompanies = asyncHandler(async (req, res) => {
     const data = await companyService.getCompanies(req.query);
     ApiResponse.ok(data, 'Companies retrieved').send(res);
   });

   const getCompanyById = asyncHandler(async (req, res) => {
     const company = await companyService.getCompanyById(req.params.id);
     ApiResponse.ok(company, 'Company retrieved').send(res);
   });

   const getCompanyRoles = asyncHandler(async (req, res) => {
     const roles = await companyService.getCompanyRoles(req.params.id);
     ApiResponse.ok(roles, 'Roles retrieved').send(res);
   });
   ```

---

### Task 3: Configure Local AI Microservice & Environment Wiring

#### Current State:
The Node.js backend has built-in graceful fallbacks in [ai.service.js](file:///Users/trushargpatel/Downloads/IT/SEM%20-%207/SGP/CorpVerse/backend/src/services/ai.service.js). To run real AI generations for ATS screening, chat interviews, and task generation, the Python FastAPI service needs to be initialized.

#### Instructions:
1. Navigate to the `ai_service` directory:
   ```bash
   cd ai_service
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```
2. Verify dependencies in [ai_service/requirements.txt](file:///Users/trushargpatel/Downloads/IT/SEM%20-%207/SGP/CorpVerse/ai_service/requirements.txt):
   - `fastapi`
   - `uvicorn`
   - `pydantic`
   - `httpx`
   - `python-dotenv`
3. Configure `backend/.env` to point to the AI service:
   ```env
   AI_SERVICE_URL=http://localhost:8000
   ```
4. Start the FastAPI microservice:
   ```bash
   uvicorn main:app --port 8000 --reload
   ```
5. Test the health endpoint:
   ```bash
   curl http://localhost:8000/health
   ```
   Expected response: `{"status":"healthy","service":"corpverse-ai-microservice",...}`

---

### Task 4: Frontend Bundle Optimization & Manual Chunk Splitting

#### Current State:
`npm run build` issues a warning: `Some chunks are larger than 500 kB after minification (dist/assets/index-*.js: ~891 kB)`.

#### Instructions:
1. Open [frontend/vite.config.js](file:///Users/trushargpatel/Downloads/IT/SEM%20-%207/SGP/CorpVerse/frontend/vite.config.js).
2. Configure `rollupOptions.output.manualChunks` to split large third-party libraries:
   ```javascript
   export default defineConfig({
     plugins: [react(), tailwindcss()],
     resolve: {
       alias: {
         // ...existing aliases
       },
     },
     build: {
       chunkSizeWarningLimit: 600,
       rollupOptions: {
         output: {
           manualChunks: {
             'vendor-react': ['react', 'react-dom', 'react-router-dom'],
             'vendor-motion': ['framer-motion', 'gsap', '@gsap/react'],
             'vendor-icons': ['lucide-react'],
           },
         },
       },
     },
   });
   ```
3. Run `npm run build` in `frontend/` and confirm that vendor chunks are split cleanly into smaller sizes under the threshold.

---

### Task 5: Mobile & Tablet Responsive Viewport Polish

#### Current State:
[AIManagerDashboard.jsx](file:///Users/trushargpatel/Downloads/IT/SEM%20-%207/SGP/CorpVerse/frontend/src/pages/dashboards/AIManagerDashboard.jsx) and [FounderDashboard.jsx](file:///Users/trushargpatel/Downloads/IT/SEM%20-%207/SGP/CorpVerse/frontend/src/pages/dashboards/FounderDashboard.jsx) have multi-column grid layouts with fixed column assumptions.

#### Instructions:
1. Search for fixed `grid-cols-3` or `grid-cols-4` in:
   - [AIManagerDashboard.jsx](file:///Users/trushargpatel/Downloads/IT/SEM%20-%207/SGP/CorpVerse/frontend/src/pages/dashboards/AIManagerDashboard.jsx)
   - [FounderDashboard.jsx](file:///Users/trushargpatel/Downloads/IT/SEM%20-%207/SGP/CorpVerse/frontend/src/pages/dashboards/FounderDashboard.jsx)
2. Replace with responsive prefixes:
   - `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
3. Wrap tables and telemetry charts in `overflow-x-auto` wrappers so that on screens <768px, tables scroll smoothly rather than clipping or stretching parent containers.

---

## ✅ Verification Checklist

- [ ] Run backend tests: `cd backend && npm test` (all 69+ tests must pass).
- [ ] Log in as a Founder user, open Founder Dashboard, post a role, and confirm applicant cards load without Mongoose query errors.
- [ ] Test `GET /api/companies` to verify that `companyService` returns formatted companies and roles.
- [ ] Run `cd frontend && npm run build` and ensure build passes with zero oversized chunk warnings.
