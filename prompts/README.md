# CorpVerse — Development Prompts Master Index

> **Platform**: Antigravity Coding Platform  
> **Stack**: React 19 + Vite + Tailwind v4 | Node.js + Express | MongoDB (Mongoose) | Python FastAPI (AI Service)  
> **Theme**: Retro Pixel Arcade / Gamified Corporate Simulation  

## How to Use These Prompts

Each `.md` file in this folder is a **self-contained prompt** designed to be fed directly into the Antigravity coding platform. They are sequenced — complete them in order. Each prompt includes:

- **Context** — What exists, what this prompt builds on
- **Objective** — Exactly what to build/fix
- **Detailed Instructions** — Step-by-step implementation spec
- **Acceptance Criteria** — How to verify the work is done
- **Files to Touch** — Exact files to create/modify

---

## Phase 0 — Codebase Stabilization & Cleanup
> Fix bugs, remove dead code, organize the existing codebase before building new features.

| # | Prompt File | Description |
|---|---|---|
| 0.1 | [00-bug-fixes-and-critical-patches.md](./00-bug-fixes-and-critical-patches.md) | Fix Navbar typo, ExpLog schema mismatch, missing constants, dead code removal |
| 0.2 | [01-project-structure-and-conventions.md](./01-project-structure-and-conventions.md) | Reorganize file structure, add path aliases, establish coding conventions |

## Phase 1 — Job Application System
> The core hiring pipeline: apply → ATS screening → status tracking → feedback.

| # | Prompt File | Description |
|---|---|---|
| 1.1 | [02-application-system-backend.md](./02-application-system-backend.md) | Implement application CRUD, ATS resume screening via AI service, status machine |
| 1.2 | [03-application-system-frontend.md](./03-application-system-frontend.md) | Job application UI, application tracking pipeline, rejection feedback display |

## Phase 2 — AI-Powered Interview System
> Multi-turn conversational AI interviews with evaluation and detailed feedback.

| # | Prompt File | Description |
|---|---|---|
| 2.1 | [04-interview-system-backend.md](./04-interview-system-backend.md) | Interview chat engine, AI evaluation, scoring, pass/fail with detailed feedback |
| 2.2 | [05-interview-system-frontend.md](./05-interview-system-frontend.md) | Real-time chat interview UI, turn-by-turn interaction, result screen |

## Phase 3 — Employee Workspace & Daily Tasks
> After getting hired: daily AI-generated tasks, EXP rewards, performance tracking.

| # | Prompt File | Description |
|---|---|---|
| 3.1 | [06-employee-system-backend.md](./06-employee-system-backend.md) | Employee record lifecycle, AI task generation, completion scoring, warnings |
| 3.2 | [07-employee-dashboard-frontend.md](./07-employee-dashboard-frontend.md) | Connect Working Dashboard to real APIs, task cards, EXP history, performance UI |

## Phase 4 — Gamification Engine
> EXP, promotions, demotions, leaderboards, role progression — make it addictive.

| # | Prompt File | Description |
|---|---|---|
| 4.1 | [08-gamification-engine-backend.md](./08-gamification-engine-backend.md) | EXP engine, promotion/demotion rules, streak system, achievement badges |
| 4.2 | [09-gamification-ui-and-leaderboard.md](./09-gamification-ui-and-leaderboard.md) | Leaderboard page, rank badges, EXP animations, promotion celebrations |

## Phase 5 — Founder Advanced Features
> Company scenarios, profit/loss, suspension, drag-and-drop pipeline builder.

| # | Prompt File | Description |
|---|---|---|
| 5.1 | [10-founder-scenarios-and-company-lifecycle.md](./10-founder-scenarios-and-company-lifecycle.md) | Scenario-based decisions, profit/loss, company suspension/revival mechanics |
| 5.2 | [11-founder-pipeline-builder-ui.md](./11-founder-pipeline-builder-ui.md) | Drag-and-drop visual pipeline builder for company AI bot workflows |

## Phase 6 — Platform Polish & Cross-Cutting Features
> Notifications, search, analytics, mobile responsiveness, UX refinements.

| # | Prompt File | Description |
|---|---|---|
| 6.1 | [12-notification-and-activity-feed.md](./12-notification-and-activity-feed.md) | In-app notification system, activity feed, real-time updates |
| 6.2 | [13-search-exploration-and-analytics.md](./13-search-exploration-and-analytics.md) | Global search, company exploration, admin analytics dashboard |
| 6.3 | [14-responsive-design-and-ux-polish.md](./14-responsive-design-and-ux-polish.md) | Mobile responsiveness, loading states, error boundaries, micro-interactions |

## Phase 7 — Testing & Production Readiness
> Tests, security, performance, deployment — ship it.

| # | Prompt File | Description |
|---|---|---|
| 7.1 | [15-testing-suite.md](./15-testing-suite.md) | Unit tests, integration tests, API tests with Jest + Supertest |
| 7.2 | [16-security-audit-and-hardening.md](./16-security-audit-and-hardening.md) | Input validation audit, rate limiting, CORS, helmet, dependency security |
| 7.3 | [17-deployment-and-devops.md](./17-deployment-and-devops.md) | Docker, render.yaml completion, CI/CD, environment management |

---

## Current Codebase State (as of Sep 2026)

### ✅ Complete
- Landing page (retro arcade theme with terminal, parallax hero)
- Authentication (register, login, JWT, OTP email verification)
- Onboarding (5-step wizard with domain selection, skills, resume upload)
- Role-based routing (5 role dashboards with guards)
- Admin dashboard (user management, domains, redeem codes)
- AI Manager dashboard (providers, bots, telemetry, pipeline runs)
- Founder dashboard (ventures, bot marketplace, bot execution)
- AI Python microservice (5 pipelines with fallbacks)

### 🚧 Stub / Phase 2 Placeholder
- Job applications (routes mounted, controllers return "coming in Phase 2")
- Interview system (routes mounted, controllers return "coming in Phase 2")
- Employee tasks (routes mounted, controllers return "coming in Phase 2")

### ❌ Not Started
- Gamification engine (promotions, demotions, streaks, leaderboard)
- Founder scenario decisions (profit/loss, company suspension)
- Drag-and-drop pipeline builder
- Notification system
- Global search and ranking page
- Testing suite
- Production deployment config
