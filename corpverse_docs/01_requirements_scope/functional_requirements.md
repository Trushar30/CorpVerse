# Functional Requirements

Organized by **MoSCoW priority** for a 6–8 week build with a 5-person team. Each requirement includes acceptance criteria for testability.

---

## Must Have (MVP — Required for Demo)

### FR-01: User Registration & Authentication
- Users can sign up and log in via **Clerk** (email/password, optional Google OAuth).
- On first login, Clerk webhook syncs user data to MongoDB.
- Users must complete a CorpVerse profile (skills, domain interest) before accessing platform features.
- **Acceptance Criteria**: User signs up → Clerk handles auth → webhook creates DB record → profile completion gate prevents access to dashboards until profile is filled.

### FR-02: Profile & Resume Management
- Users can upload a resume (PDF/DOCX, max 5MB).
- Users can list up to 20 skills and select a domain of interest.
- Profile data is editable at any time.
- **Acceptance Criteria**: Resume upload validates file type and size → profile displays current skills/domain → edits persist across sessions.

### FR-03: Job Seeker Dashboard — Browse & Filter
- Display all companies and open roles, with filtering by domain.
- Show company name, domain, description, and number of open roles.
- Paginated results (10 per page).
- **Acceptance Criteria**: Dashboard loads companies from API → domain filter reduces results → clicking a company shows its roles → pagination works.

### FR-04: Application Submission
- Job seekers can apply to any open role (one active application per role enforced).
- Application creates a `pending_screening` record.
- **Acceptance Criteria**: Apply button creates application → duplicate active applications to same role are rejected → application appears in "My Applications" list.

### FR-05: Resume Screening (Rule-Based or LLM)
- On application, the system screens the user's profile/resume against the role's requirements.
- Screening produces a pass/fail result with a score.
- Rejected applicants receive specific, constructive feedback.
- A **48-hour cooldown** is set on rejection before the user can reapply.
- **Acceptance Criteria**: Application triggers screening → pass moves to interview → reject shows feedback + cooldown timer → reapply blocked during cooldown.

### FR-06: Chat-Based Interview
- Users who pass screening enter a multi-turn chat interview with an AI interviewer.
- Interview questions are contextual (based on role requirements and user's resume/skills).
- Interview has a maximum of 10 turns, after which it auto-evaluates.
- Pass/fail result with detailed feedback.
- **Acceptance Criteria**: Chat UI shows interviewer messages → user responds → conversation progresses → final verdict with feedback displayed.

### FR-07: Offer Stage
- Users who pass the interview receive a job offer.
- Users can accept or decline the offer.
- Accepting changes user status from `job_seeker` to `employee` and creates an `EmployeeRecord`.
- **Acceptance Criteria**: Offer screen shows role/company details → accept creates employee record + updates status → decline returns user to job seeker dashboard.

### FR-08: Employee Dashboard — Tasks & EXP
- Employees see their assigned tasks with EXP rewards.
- Completing a task awards EXP, logged in the EXP history.
- EXP progress bar shows distance to next promotion threshold.
- **Acceptance Criteria**: Tasks list displays with status/EXP → marking complete awards EXP → total EXP updates in real-time → progress bar reflects current EXP vs threshold.

### FR-09: EXP-Based Promotion
- When an employee's `expTotal` reaches the promotion threshold (Junior→Mid: 200 EXP, Mid→Senior: 500 EXP), they are automatically promoted.
- Promotion updates the employee's level and may assign new task types.
- **Acceptance Criteria**: EXP reaches threshold → level updates → notification shown → dashboard reflects new level.

### FR-10: Resignation Flow
- Employees can resign voluntarily from their current role.
- Resignation changes employment status and generates exit feedback.
- User status reverts to `job_seeker`.
- **Acceptance Criteria**: Resign button → confirmation dialog → exit feedback generated → status changes → user returned to job seeker dashboard.

### FR-11: Basic Termination Flow
- Low-performance threshold (no completed tasks in X days) or manual trigger can terminate employment.
- Termination generates feedback, changes status.
- **Acceptance Criteria**: Termination trigger → exit record created with feedback → user status updated.

### FR-12: Founder Dashboard — Company Creation
- When a user's total EXP reaches the founder threshold (500 EXP), they can transition to founder mode.
- Founders resign from their current role and create a company (name, domain, description).
- Founders can post 1-3 roles for their company.
- **Acceptance Criteria**: EXP threshold met → "Become Founder" option visible → resignation + company creation → roles postable → company visible in job listings.

### FR-13: Founder Hiring Pipeline
- Applications to founder companies use the same screening + interview pipeline.
- Founder can view applicant statuses on their dashboard.
- **Acceptance Criteria**: Player applies to founder company → screening/interview runs → founder sees results → accepted applicant becomes employee of founder's company.

### FR-14: Seed Data — 5 Pre-Built Companies
- Platform launches with 5 AI-run seed companies across diverse domains.
- Each company has 3 roles with descriptions and requirements.
- Seed companies are clearly labeled and always available.
- **Acceptance Criteria**: First-time user sees 5 companies on dashboard → each has open roles → companies marked as "seed" visually.

### FR-15: Shared Feedback Module
- A single feedback generation service is reused for screening rejections, interview rejections, and exit flows.
- Feedback is constructive, specific, and consistent in tone.
- **Acceptance Criteria**: Feedback appears at screening rejection, interview rejection, and exit → tone/structure is consistent across all three.

---

## Should Have (If Time Allows After MVP is Stable)

### FR-16: Manager Concept in Employee Dashboard
- Employee Dashboard shows a labeled AI "manager" for the team.
- Manager provides periodic feedback or task assignments.

### FR-17: Review-Based Promotion (Instead of Auto)
- Periodic review cycle (e.g., weekly) gates promotion, replacing pure EXP threshold.

### FR-18: Salary Raises Separate from Promotion
- Raises can be awarded independently of level changes based on performance.

### FR-19: Training Module
- A simple course/training that unlocks a previously-rejected role.
- Completing training removes the cooldown for a specific role.

### FR-20: Notice Period
- Employees must serve a brief notice period before their resignation takes effect.

### FR-21: Offer Negotiation
- At the offer stage, users can counter-offer for a slightly higher salary.

---

## Nice to Have (Future Scope — Mention in Report)

- Fully autonomous AI-founder companies running without human triggers
- Mini-model employee pool dynamically simulating company operations
- Coding-round or business-simulation interview types
- Employer reputation system affecting applicant flow
- Company growth stages (startup → scaleup) unlocking more roles
- Real funding/revenue simulation for founders
- Moonlighting (employee + founder simultaneously)

---

## Out of Scope for This Semester

- Real payments or real currency of any kind
- Native mobile apps (web-responsive only)
- Multi-language support beyond English
