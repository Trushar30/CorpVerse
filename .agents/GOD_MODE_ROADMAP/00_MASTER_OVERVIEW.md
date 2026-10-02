# CorpVerse — God Mode Development Roadmap

> **Mission:** Complete every remaining feature at an extraordinary level of polish, using **100% free** tools, APIs, and infrastructure. Zero paid subscriptions. Zero compromise on quality.

---

## What's Already Battle-Tested & Live

| Module | Status | Backing |
|--------|--------|---------|
| Custom JWT Auth (register/login/OTP) | ✅ Production | MongoDB Atlas + bcrypt + nodemailer |
| Email Verification (OTP) | ✅ Production | Real OTP + dev bypass for `@cv.com` |
| 5-Step Onboarding Wizard | ✅ Production | MongoDB `User` model, profile persistence |
| Resume Upload & Text Extraction | ✅ Production | `multer` → `pdf-parse`/`mammoth` → MongoDB binary storage |
| Founder Venture Launch | ✅ Production | `Company` + `Role` + 10K CorpCoin seed grant |
| AI Bot Marketplace & Hiring | ✅ Production | `AIBot`, `BotPurchase`, CorpCoin deduction economy |
| AI Manager Command Deck | ✅ Production | Provider CRUD, AES-256 keys, Bot Workshop, pricing engine |
| Pipeline Execution & Audit Log | ✅ Production | `PipelineRun` records, company valuation growth |
| Admin Console (Users/Domains/Codes) | ✅ Production | Full CRUD, pagination, redeem code generator |
| Company & Role Market Browser | ✅ Production | Aggregation queries, domain filtering |
| Landing Page (God Mode Terminal) | ✅ Production | Interactive CLI animation, CursorGrid canvas |

---

## What Remains — 6 God-Tier Modules

These are the **exact** features that currently return Phase 2 stubs, use hardcoded `useState` mock arrays, or have no UI at all:

### Module 1 → [Real Application Pipeline](./01_APPLICATION_PIPELINE.md)
> Replace the placeholder `application.controller.js` stubs with real MongoDB-backed job application flow.
- **Current:** Backend returns `🚧 Application creation coming in Phase 2`
- **Target:** Full `pending_screening → screening_passed → interview → offer → accepted/declined` state machine

### Module 2 → [AI Resume Screening Engine](./02_AI_SCREENING.md)
> Build the rule-based + free LLM resume screener that scores candidates against role requirements.
- **Current:** No screening logic exists
- **Target:** Skill-match algorithm + free Groq/HuggingFace LLM call for intelligent feedback generation

### Module 3 → [AI Interview Chat System](./03_AI_INTERVIEW.md)
> Build the multi-turn chat-based AI interviewer that the Interview model is designed for.
- **Current:** `interview.controller.js` returns `🚧 Interview chat coming in Phase 2`
- **Target:** Real-time chat UI, 10-turn limit, contextual to resume + role, pass/fail verdict with feedback

### Module 4 → [Offer → Hire → Employee Transition](./04_OFFER_HIRE_FLOW.md)
> Connect the offer acceptance flow to the `EmployeeRecord` creation and role transition.
- **Current:** No offer acceptance UI or backend logic
- **Target:** Accept/decline offer → `User.role` transitions to `working` → `EmployeeRecord` created → tasks assigned

### Module 5 → [Real Employee Work & Promotion System](./05_EMPLOYEE_SYSTEM.md)
> Replace the hardcoded `WorkingDashboard.jsx` `useState` tasks with real database-backed task system.
- **Current:** 3 hardcoded tasks in React state, no API calls for task completion
- **Target:** Pre-seeded tasks from `Task` model, real EXP awards, automatic level promotions, resignation flow

### Module 6 → [Frontend Polish & God Mode UI](./06_FRONTEND_POLISH.md)
> Micro-animation refinements, real-time state sync, and premium UX polish across all dashboards.
- **Current:** Some dashboards have stale/mock data
- **Target:** All dashboards reflect live MongoDB state, seamless transitions, zero dead-end screens

---

## Free-Tier Strategy (The $0 Stack)

| Need | Free Solution | Limits |
|------|--------------|--------|
| **LLM API for Screening/Interview** | Groq Cloud Free Tier (Llama 3.1 70B) | 30 RPM, 14.4K RPD, 500K TPM |
| **Fallback LLM** | HuggingFace Inference API (free) | Rate-limited but functional |
| **Database** | MongoDB Atlas M0 (free forever) | 512MB storage, shared cluster |
| **Email** | Gmail SMTP via nodemailer (already set up) | 500/day free |
| **Hosting** | Render free tier (already configured in `render.yaml`) | Spins down after 15min idle |
| **AI Microservice** | Python FastAPI on Render (already in `ai_service/`) | Same Render free tier |
| **Frontend** | Vite static deploy on Render/Vercel | Unlimited |

---

## Build Order (Critical Path)

```
Module 1 (Applications) ─── MUST come first
       │
       ├── Module 2 (Screening) ─── depends on Application existing
       │         │
       │         └── Module 3 (Interview) ─── depends on screening_passed status
       │                    │
       │                    └── Module 4 (Offer/Hire) ─── depends on interview_passed
       │                               │
       │                               └── Module 5 (Employee Tasks) ─── depends on EmployeeRecord
       │
       └── Module 6 (Polish) ─── can run in parallel with any module
```

---

## Team Assignment Suggestion

| Person | Modules | Estimated Time |
|--------|---------|---------------|
| **Backend Dev 1** | Module 1 + Module 2 | ~8-10 hours |
| **Backend Dev 2** | Module 3 + Module 4 | ~10-12 hours |
| **Frontend Dev 1** | Module 5 (Working Dashboard rewrite) | ~6-8 hours |
| **Frontend Dev 2** | Module 6 (Polish + transitions) | ~6-8 hours |
| **AI/Integration** | Python microservice startup + Groq integration | ~4-6 hours |

---

## File Reference Quick Links

### Backend Stubs That Need Real Logic
- `backend/src/controllers/application.controller.js` — 3 placeholder functions
- `backend/src/controllers/interview.controller.js` — 2 placeholder functions
- `backend/src/controllers/employee.controller.js` — 4 placeholder functions

### MongoDB Models Already Designed & Ready
- `backend/src/models/Application.js` — Full schema with feedback sub-docs, cooldown, status enum
- `backend/src/models/Interview.js` — Chat transcript, turn limits, result tracking
- `backend/src/models/EmployeeRecord.js` — Employment status, levels, exit record
- `backend/src/models/Task.js` — Task assignment, EXP reward, difficulty, completion

### Frontend Pages That Need Backend Integration
- `frontend/src/pages/Dashboard.jsx` — Lines 82-105 (mock applications), Lines 154-179 (fake apply)
- `frontend/src/pages/WorkingDashboard.jsx` — Lines 30-63 (hardcoded tasks/logs)

### Config Constants
- `backend/src/config/index.js` — `game.cooldownHours: 48`, `promotionThresholds`, `founderUnlockExp: 500`
