# Task Breakdown & Sprint Plan (Template — 6-8 Weeks)

Fill in teammate names once roles are assigned. Suggested ownership areas based on typical 5-person split:

| Area | Owner (fill in) | Covers |
|---|---|---|
| Frontend | _____________ | React dashboards, wireframe-to-code, API integration on the client side |
| Backend | _____________ | Flask routes, auth, database models, business logic services |
| AI/ML & Prompts | _____________ | LLM integration, screening logic, interview prompt design, feedback generation |
| Database & Deployment | _____________ | Schema implementation, migrations, seed data scripts, hosting setup |
| Docs & QA | _____________ | This documentation set, testing, bug tracking, demo-day prep |

Note: on a 5-person team, some overlap is normal (e.g., the backend owner may also help with DB, the AI owner may pair with backend on integration). Assign a primary owner per area so there's always a clear point of accountability, even if work is shared.

## Sprint Plan (6-8 Week Version)

### Week 1 — Foundations
- Finalize all requirements/scope docs (this set)
- Set up repo structure, environments, and CI basics
- Lock API contract and DB schema (no more changes without team sign-off after this)
- Build seed data script for the 5 companies

### Week 2 — Core Auth & Profile
- Backend: auth endpoints, profile endpoints
- Frontend: signup/login screens, profile creation flow
- AI: draft the screening prompt/logic and test it against sample resumes

### Week 3 — Job Seeker Flow
- Backend: application endpoints, screening service wired to AI layer
- Frontend: Job Seeker Dashboard, application flow, feedback display
- AI: refine screening consistency, build feedback generation module

### Week 4 — Interview & Offer
- Backend: interview chat endpoints, offer endpoints
- Frontend: interview chat UI, offer accept/decline screen
- AI: interview prompt design + pass/fail evaluation logic

### Week 5 — Employee Dashboard
- Backend: task/EXP endpoints, promotion logic, resignation/termination
- Frontend: Employee Dashboard, task list, EXP progress bar
- QA: start testing full flow from signup through to first promotion

### Week 6 — Founder Dashboard
- Backend: company/role creation endpoints, founder-side hiring pipeline, mini-model fallback logic
- Frontend: Founder Dashboard, company creation, applicant review screen
- QA: test founder flow end-to-end including fallback hiring

### Week 7 — Integration & Polish
- Full end-to-end testing across all three dashboards
- Bug fixes, UI polish, responsive check
- Deploy to hosting (if demoing live) or finalize local demo setup

### Week 8 — Demo Prep & Buffer
- Rehearse demo flow
- Prepare presentation/report referencing this documentation set
- Buffer time for last-minute fixes (always reserve this — something will break the night before)

## Notes

- If your actual timeline is closer to 6 weeks, compress Weeks 7 and 8 into one, and treat Week 6's founder flow as a "should have" that can be trimmed if the team is behind — the job-seeker-to-employee loop is the non-negotiable demoable core.
