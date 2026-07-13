# Non-Functional Requirements

## Performance

- Page loads under 2 seconds on average broadband/college wifi conditions.
- LLM-backed responses (screening result, interview reply, feedback) should return within 5-8 seconds; show a loading/typing indicator for anything longer so it doesn't feel broken.
- Task/EXP updates should reflect immediately in the Employee Dashboard without requiring a manual refresh (poll every few seconds, or use a lightweight websocket update).

## Scalability

- For the demo, the system should comfortably handle a classroom-sized concurrent load (~30-50 simultaneous users) without degradation — this is realistic for a review/demo day.
- Architecture should not hard-block scaling later: keep the LLM-calling logic in its own service/module so it can be swapped or load-balanced without rewriting the whole backend.

## Security

- Passwords hashed (never stored in plain text) — use a standard library (e.g., Werkzeug's `generate_password_hash` if using Flask).
- JWT-based session tokens with reasonable expiry; refresh flow can be minimal for MVP.
- Resume uploads restricted to PDF/DOCX, size-capped (e.g., 5MB), and scanned for file-type spoofing before storage.
- No real personal financial data is ever collected — this is a simulation platform, so this should be explicitly stated to users.
- Basic input sanitization on all form fields to avoid injection issues, especially since resume text may get passed into LLM prompts.

## Expected User Load

- Target for demo day: 30-50 concurrent users (classmates/evaluators testing simultaneously).
- Target for internal team testing: 5-10 concurrent users throughout development.
- Design decisions (DB choice, hosting tier) should be picked for this scale — no need to over-engineer for thousands of users this semester.

## Reliability

- If an LLM call fails or times out, the user should see a clear retry option rather than a silent failure or broken page.
- Core flows (login, apply, view tasks) should still work even if the AI-dependent features (screening, interview chat) are temporarily degraded — don't let one dependency take down the whole app.

## Usability

- Every rejection or negative outcome (screening fail, interview fail, termination) must be paired with constructive, specific feedback — this is a core product principle, not just a nice-to-have.
- Mobile-responsive layout at minimum (most students will demo/test on laptops, but dashboards should not visibly break on a tablet-sized screen).

## Maintainability

- Since 5 people are contributing, code should follow one agreed style (see Git Workflow doc) and be commented in plain English, consistent with team's existing preference for readable, student-level code.
