# Scope Document

## In Scope for This Semester (MVP)

### Core User Journey
- **Single-role user journey**: job seeker → employee → founder (one active role at a time, enforced at the database level via `currentStatus` field)
- **5 seeded companies** with diverse domains (Technology, Clean Energy, Healthcare, Finance, Design & Media), each with 3 roles containing full descriptions and requirements
- **Resume screening** (rule-based scoring or single LLM call) with pass/fail result, score breakdown, and constructive feedback on rejection
- **Chat-based interview** (AI-powered, multi-turn, contextual to role and resume) with pass/fail and feedback
- **48-hour reapplication cooldown** after rejection, enforced at the data layer
- **Offer stage** with accept/decline decision
- **Employee dashboard** with assigned tasks, EXP tracking, progress bar, and threshold-based promotion (Junior → Mid → Senior)
- **Resignation flow** with exit feedback
- **Basic termination flow** triggered by low performance threshold
- **Founder mode** (unlocked at 500 EXP): create a company, post 1-3 roles, hire via the same screening/interview pipeline

### Technical Scope
- **Node.js + Express** REST API backend
- **MongoDB Atlas** document database with Mongoose ODM
- **Clerk** managed authentication (email/password, optional OAuth)
- **React + Vite + Tailwind CSS** frontend with premium "Dark Cosmos" theme
- **Python FastAPI** microservice stub for AI/LLM integration (future)
- **Web-responsive UI** (desktop-first, usable on tablet ≥768px)
- **English-language interface**

---

## Explicitly Out of Scope

| Feature | Why It's Out | Where It Goes |
|---|---|---|
| **Autonomous AI-founder companies** that run continuously without triggers | Requires persistent background agents, complex state management — too ambitious for 6-8 weeks | Future Scope in report |
| **Mini-model employee pool** simulating company operations | Depends on autonomous AI companies existing first | Future Scope |
| **Real currency, payments, or financial transactions** | Simulation platform only — no payment processing needed | N/A |
| **Native mobile apps** | Web-responsive covers demo needs; native adds 4+ weeks | Future Scope |
| **Multiple simultaneous roles** (e.g., employee + founder at once) | Violates single-active-role state machine; adds complex edge cases | Future Scope |
| **Coding-round or business-simulation interviews** | MVP is chat-based only; other formats need custom evaluation engines | Future Scope |
| **Company growth stages / employer reputation** | Requires balancing mechanics not yet designed | Future Scope |
| **Manager hierarchy with independent AI decisions** | Beyond a labeled "manager" role for flavor; true AI management is complex | Future Scope |
| **Multi-language UI** | English only for MVP; i18n infrastructure can be added later | Stretch goal |
| **Admin analytics dashboards** | Beyond what's needed to demo the product | Future Scope |

---

## Boundary Decisions (Resolved)

These were listed as "open questions" in the original docs and have been resolved:

| Question | Decision | Rationale |
|---|---|---|
| Task definition method | **Pre-written seed tasks** for MVP | LLM-generated tasks add AI dependency to core employee flow; pre-written is reliable for demo |
| Reapplication cooldown logic | **48-hour time-based** | Simple, predictable, enforced at DB layer via `cooldownUntil` |
| Promotion gating | **Automatic at EXP threshold** | Simplest to build and demo; review-gated is a Should Have |
| Founder starting capital | **No capital mechanic — EXP threshold only** (500 EXP) | Capital simulation is a full feature; EXP threshold is clean and understandable |
| Moonlighting | **Not in scope** | Single-role state machine is the core architectural constraint |

---

## Why This Scope Matters

With a **6-8 week runway** on top of coursework, and **5 people** splitting frontend, backend, AI/prompting, database, and documentation — the biggest risk isn't lack of ideas. It's the opposite.

This scope document exists so that mid-project **"wouldn't it be cool if..."** conversations get redirected to the **Future Scope section of the report**, not the sprint board. Every feature listed as "out of scope" has a clear reason and a clear landing place. This isn't about saying no — it's about saying "not yet."
