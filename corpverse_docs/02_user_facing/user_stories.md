# User Stories / Use Cases

Format: As a [role], I want to [action], so that [benefit].

---

## 1. Job Seeker Stories

### US-01: Profile & Resume Setup
- **Story:** As a job seeker, I want to create an account via Clerk and upload my resume + skills, so that companies can evaluate me for relevant open roles.
- **Acceptance Criteria:** Account creation handles email/OAuth → Clerk webhook syncs user → resume upload accepts PDF/DOCX (max 5MB) → profile complete status saved.

### US-02: Browse Job Listings & Companies
- **Story:** As a job seeker, I want to browse companies and open roles filtered by domain, so that I can find opportunities aligned with my career goals.
- **Acceptance Criteria:** Company list displays seed & founder companies → domain filter isolates specific industries → open role count shown per company.

### US-03: Automated Resume Screening
- **Story:** As a job seeker, I want my application to be automatically screened against role requirements, so that I know quickly if my skills match.
- **Acceptance Criteria:** Applying creates an application → screening calculates match score → pass status unlocks interview phase.

### US-04: Actionable Rejection Feedback
- **Story:** As a job seeker, I want to receive specific feedback when rejected at screening, so that I understand what skills/resume sections to improve.
- **Acceptance Criteria:** Rejection status displays specific strengths & weaknesses → 48-hour cooldown timer initiated → reapplication blocked until cooldown clears.

### US-05: AI Chat Interview
- **Story:** As a job seeker, I want to participate in a multi-turn chat interview relevant to the role, so that I can practice interview communication.
- **Acceptance Criteria:** Pass screening → chat UI opens → AI asks contextual questions → up to 10 turns evaluated → pass/fail decision generated with feedback.

### US-06: Offer Acceptance & Employment Status
- **Story:** As a job seeker, I want to accept or decline a job offer, so that I can officially transition to employee status.
- **Acceptance Criteria:** Offer modal appears → accepting updates `currentStatus` to `employee` → creates `EmployeeRecord` → redirects to Employee Dashboard.

---

## 2. Employee Stories

### US-07: Workplace Task Execution
- **Story:** As an employee, I want to view assigned tasks and mark them complete, so that I can perform my job and earn EXP.
- **Acceptance Criteria:** Employee dashboard displays task items with EXP rewards → marking complete updates task status → EXP added to user total.

### US-08: Transparent EXP Promotion Path
- **Story:** As an employee, I want to see my EXP progress toward promotion, so that I know exactly when I will move from Junior to Mid/Senior.
- **Acceptance Criteria:** EXP progress bar reflects total EXP vs threshold (200 for Mid, 500 for Senior) → reaching threshold automatically triggers promotion.

### US-09: Voluntary Resignation
- **Story:** As an employee, I want to resign from my current position, so that I can pursue other job listings or become a founder.
- **Acceptance Criteria:** Resign action creates ExitRecord with feedback → status reverts to `job_seeker` → user can re-enter job market.

---

## 3. Founder Stories

### US-10: Company Creation (Founder Mode)
- **Story:** As a player with 500+ EXP, I want to found my own company, so that I can build a team and post jobs.
- **Acceptance Criteria:** Reaching 500 EXP unlocks Founder Mode → user resigns current role → creates Company record with domain/description → status updates to `founder`.

### US-11: Job Posting & Candidate Review
- **Story:** As a founder, I want to post open job roles and review applicant statuses, so that I can staff my company.
- **Acceptance Criteria:** Role creation form validates title/domain/requirements → role appears in public job market → founder dashboard lists candidate applications.

---

## 4. System & Admin Stories

### US-12: Seed Data Market Initializer
- **Story:** As the platform, I want 5 seed companies populated at launch, so that new users immediately have active job listings on day one.
- **Acceptance Criteria:** Seed script creates 5 companies across Tech, Energy, Healthcare, Finance, and Design → 15 roles created → marked as `isSeedCompany: true`.

### US-13: Clerk Webhook Synchronization
- **Story:** As the platform, I want Clerk authentication events synced to MongoDB, so that user identity remains consistent across services.
- **Acceptance Criteria:** `user.created`, `user.updated`, `user.deleted` events handled with Svix signature verification → MongoDB `User` collection updated.
