# User Journey Maps

## Journey 1: New User → First Job

1. **Sign up** — creates account, fills basic details.
2. **Profile setup** — uploads resume, lists skills/domain interest.
3. **Browse jobs** — lands on Job Seeker Dashboard, filters by domain.
4. **Applies to a role** — picks a company + role that matches interest.
5. **Screening result** —
   - *Rejected:* sees specific feedback, waits out cooldown, improves profile, reapplies.
   - *Passed:* moves to interview.
6. **Interview** — chat-based conversation referencing resume/role.
   - *Rejected:* feedback shown, same reapply logic.
   - *Passed:* moves to offer.
7. **Offer stage** — accepts (MVP: simple accept/decline, negotiation optional).
8. **Onboarding** — brief "day one" screen introducing manager/tools.
9. **Now an employee** — lands on Employee Dashboard for the first time.

**Emotional arc:** curiosity → mild anxiety at screening → relief/frustration depending on outcome → sense of achievement on first offer.

## Journey 2: Employee → Promotion

1. Lands on Employee Dashboard, sees assigned tasks.
2. Completes tasks, EXP increases visibly.
3. Reaches EXP threshold (or review cycle, if Should-Have is built).
4. Sees promotion notification with new role/level.
5. Dashboard updates to reflect new role, possibly new task types.

**Emotional arc:** routine → building anticipation as EXP climbs → payoff at promotion.

## Journey 3: Employee → Founder Transition

1. Employee accumulates enough EXP to unlock Founder Mode (visible progress indicator).
2. Chooses to resign from current job (per single-active-role rule).
3. Switches to Founder Dashboard, creates company (name, domain).
4. Posts first role.
5. If no applicants yet, system auto-fills with a mini-model "employee" so the company isn't empty.
6. As real players apply, founder reviews applications through the same screening/interview pipeline.

**Emotional arc:** ambition → slight uncertainty during the empty-company gap → confidence once the fallback keeps things running → ownership as real hires start coming in.

## Journey 4: Rejection → Reapplication (a loop worth mapping on its own)

1. User applies, gets rejected (screening or interview).
2. Sees structured feedback: what was weak, what to improve.
3. Cooldown period begins (visible countdown or condition, e.g., "reapply after updating your resume").
4. User updates profile/resume.
5. User reapplies once cooldown clears.
6. Cycle repeats until passed or user chooses a different role/company.

**Why this matters:** this loop is the core "educational" mechanic of the whole platform — it should feel encouraging, not punishing.
