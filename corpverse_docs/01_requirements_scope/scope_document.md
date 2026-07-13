# Scope Document

## In Scope for This Semester (MVP)

- Single-role user journey: job seeker → employee → founder (one active role at a time, no moonlighting)
- 5 seeded companies with roles, used as the initial job market
- Resume screening (rule-based or single LLM call) and chat-based interview, each with feedback on rejection
- Offer stage with simple accept/decline
- Employee dashboard with tasks, EXP, and threshold-based promotion
- Resignation and basic termination
- Founder mode: create a company, post roles, hire via a simplified pipeline
- Web-responsive UI (desktop-first, usable on tablet)
- English-language interface

## Explicitly Out of Scope

- **Autonomous AI-founder companies** that run themselves continuously without any trigger — our 5 seed companies are seeded/static data with a scripted hiring pipeline, not live independent agents making ongoing decisions.
- **Mini-model employee pool actively simulating company operations** — mentioned as a future vision, not built this semester.
- **Real currency, payments, or financial transactions of any kind.**
- **Native mobile apps** — web only.
- **Multiple simultaneous roles per user** (e.g., being an employee and a founder at once).
- **Coding-round or business-simulation interview formats** — MVP is chat-based interview only.
- **Company growth stages, employer reputation system, or real funding/revenue simulation** for founders.
- **Manager hierarchy with independent AI decision-making** beyond a labeled "manager" role for flavor/context.
- **Multi-language UI** (Gujarati or otherwise) — English only for MVP; may be a stretch goal if time allows near the end.
- **Data science / analytics dashboards** for admins beyond what's needed to demo the product.

## Why This Matters

With a 4-6 week runway on top of coursework, and 5 people splitting frontend, backend, ML/prompting, and documentation, the biggest risk to this project isn't lack of ideas — it's the opposite. This scope document exists so that mid-project "wouldn't it be cool if..." conversations get redirected to the Future Scope section of the proposal, not the sprint board.
