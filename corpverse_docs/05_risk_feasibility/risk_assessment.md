# Risk & Feasibility Assessment

## Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| LLM API costs/rate limits become a bottleneck during heavy testing or demo day | Medium | High | Cache/mock LLM responses during development; keep a rule-based fallback for screening in case live API access is unstable on demo day. |
| Interview chat feels inconsistent or generates odd/off-topic responses | Medium | Medium | Write and test a tight, constrained prompt early (Week 2-3); test against multiple resume/role combos before building UI around it. |
| Team underestimates how long AI-integration debugging takes | High | Medium | Build AI/ML integration in Week 2-3, not last — leaves buffer if prompts need iteration. |
| Scope creep toward the "future vision" (autonomous AI founders, mini-model pool) eats into MVP time | High | High | Scope Document explicitly marks these out of scope; revisit only after MVP is stable and demoable. |
| Schema changes mid-project break work already built by frontend/backend teammates | Medium | High | Lock schema and API contract by end of Week 1; any later changes go through team sign-off, not solo edits. |

## Timeline Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| 6-8 weeks isn't enough to finish all "Should Have" items | High | Medium | Should Have items are explicitly separable — team can demo with Must Have only if behind schedule. |
| One teammate's part blocks others (e.g., frontend waiting on backend endpoints) | Medium | High | Lock API contract early so frontend can build against mocked responses while backend is still in progress. |
| Coursework/exam overlap reduces available hours mid-sprint | High | Medium | Sprint plan should be treated as a target, not a guarantee — buffer week (Week 8) exists for this reason. |

## Team/Process Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Unclear ownership leads to duplicated or dropped work | Medium | Medium | Task Breakdown doc assigns clear primary owners per area. |
| Git conflicts from long-lived branches | Medium | Low | Git Workflow doc enforces frequent small merges. |
| Demo day surprises (dependency down, LLM API down) | Low-Medium | High | Have a recorded demo video or offline fallback data as backup, just in case. |

## Overall Feasibility

The MVP scope (job seeker → employee → founder loop, with screening, chat interview, and simplified founder hiring) is realistic for a 5-person team over 6-8 weeks **if** the AI integration work starts early rather than being treated as a last step, and **if** the team holds the line on the Scope Document rather than expanding mid-build. The biggest real risk isn't technical difficulty — it's time management against the "wouldn't it be cool if" instinct, given how much future-vision material this idea naturally generates.
