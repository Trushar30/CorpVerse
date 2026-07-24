# Non-Functional Requirements

Specific, measurable benchmarks for each quality attribute. These should be testable during development and verifiable on demo day.

---

## NFR-01: Performance

| Metric | Target | How to Verify |
|---|---|---|
| **Page load time** | < 2 seconds on 10 Mbps connection | Chrome DevTools Lighthouse audit, target score ≥ 90 |
| **API response time** (non-AI endpoints) | < 300ms p95 | Express response time logging via morgan |
| **LLM-backed responses** (screening, interview, feedback) | < 8 seconds | Show a typing/loading indicator for anything > 1 second |
| **Dashboard data refresh** | < 500ms for EXP/task updates | Client-side state update + API confirmation |
| **Time to Interactive (TTI)** | < 3 seconds on first visit | Lighthouse TTI metric |

### Implementation Notes
- Use React lazy loading for dashboard views that aren't immediately needed.
- Memoize expensive component renders (company lists, task tables).
- Enable Vite's code splitting and tree-shaking in production build.
- Use MongoDB indexes on frequently queried fields (`clerkId`, `email`, `domain`, `status`).

---

## NFR-02: Scalability

| Metric | Target |
|---|---|
| **Concurrent users (demo day)** | 30-50 simultaneous users without degradation |
| **Concurrent users (internal testing)** | 5-10 simultaneous users throughout development |
| **Database documents** | Handles up to 1,000 users, 5,000 applications, 10,000 tasks without query slowdown |

### Architecture Decisions for Scalability
- **AI Layer isolation**: LLM calls are behind a separate microservice (Python FastAPI), so the main Express server isn't blocked during AI processing. This also allows the AI service to be independently scaled or rate-limited.
- **MongoDB Atlas**: Free M0 cluster supports the demo scale. Schema is designed so upgrading to a paid cluster requires zero code changes.
- **Stateless auth (Clerk)**: No session storage on the backend — Clerk handles sessions externally, so the Express server can be horizontally scaled trivially.

---

## NFR-03: Security

| Requirement | Implementation | Standard/Reference |
|---|---|---|
| **Password handling** | Fully managed by Clerk — bcrypt hashing, configurable complexity | OWASP Password Storage Cheat Sheet |
| **Authentication tokens** | Clerk-issued JWTs, httpOnly cookies, auto-rotation | OWASP Session Management Cheat Sheet |
| **Token expiry** | Short-lived access tokens (~60s), auto-refreshed by Clerk SDK | — |
| **Brute force protection** | Clerk auto rate-limits + CAPTCHA after failed attempts | — |
| **Input validation** | All request bodies validated via Zod schemas before processing | OWASP Input Validation Cheat Sheet |
| **File upload security** | PDF/DOCX only, 5MB max, MIME type verification via multer | — |
| **XSS prevention** | Helmet.js security headers, React's built-in JSX escaping | — |
| **CORS** | Restricted to `CLIENT_URL` origin only | — |
| **API keys** | Stored in `.env`, never committed to git, `.env.example` with placeholders | — |
| **No real financial data** | Explicitly stated to users — this is a simulation platform | — |
| **Rate limiting** | General (100/15min), Auth (20/15min), Uploads (10/hr) | — |

---

## NFR-04: Reliability

| Scenario | Expected Behavior |
|---|---|
| **LLM API fails or times out** | User sees a clear "AI service temporarily unavailable — please retry" message. Core flows (login, browse companies, view tasks) continue to work. |
| **MongoDB Atlas connection drops** | Mongoose auto-reconnects. Server logs a warning. Active requests receive a 503 with "Service temporarily unavailable." |
| **Clerk service is down** | Auth-dependent routes return 503. Landing page and public routes remain accessible. |
| **Invalid webhook payload** | Webhook returns 400 with error logged. No database corruption. |
| **File upload fails mid-transfer** | Multer cleans up partial uploads. User receives clear error to retry. |

### Graceful Degradation Strategy
1. **AI-dependent features** (screening, interview, feedback) degrade independently from **core features** (auth, profile, dashboard, task completion).
2. The frontend checks API health and shows appropriate status banners when services are degraded.

---

## NFR-05: Usability

| Requirement | Rationale |
|---|---|
| **Every negative outcome has constructive feedback** | This is a *core product principle*, not a nice-to-have. Screening rejections, interview failures, and terminations all include specific, actionable suggestions. |
| **No dead ends in the UI** | Every screen has a clear next action — even after a rejection (view feedback → update profile → reapply). |
| **Loading states for all async operations** | Skeleton loaders for data fetching, typing indicators for AI responses, disabled buttons during submission. |
| **Responsive layout** | Desktop-first, but dashboards must not break on tablet-sized screens (≥768px). Tested on Chrome and Firefox. |
| **Consistent design language** | All pages use the same color palette, typography, and component styles (Dark Cosmos theme). |
| **Accessible navigation** | Keyboard-navigable main flows, proper semantic HTML, ARIA labels on interactive elements. |

---

## NFR-06: Maintainability

| Requirement | Implementation |
|---|---|
| **Code style** | Consistent across 5 contributors — ESLint + Prettier with shared config |
| **Folder structure** | MVC pattern (models / routes / controllers / services) agreed in repo structure doc |
| **Comments** | Plain English, focused on *why* rather than *what* — consistent with team's preference for readable student-level code |
| **API consistency** | All endpoints return `{ success, message, data }` shape. Errors return `{ success: false, message, errors[] }` |
| **Environment config** | All tunable values in `.env` or `config/index.js` — no hardcoded secrets or magic numbers |

---

## NFR-07: Testability

| Layer | Strategy |
|---|---|
| **Backend API** | Jest + Supertest for endpoint testing |
| **Database** | Seed script is idempotent — can be re-run without duplicating data |
| **Frontend** | Manual testing for MVP; component tests with React Testing Library as a stretch goal |
| **Auth** | Test with Clerk's development instance — separate from production |
