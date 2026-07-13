# Tech Stack Decision

## Recommended Stack (for 6-8 week team build)

| Layer | Choice | Why |
|---|---|---|
| Frontend | React (Vite) + Tailwind CSS | Component-based, splits cleanly for a dedicated frontend teammate; Tailwind avoids writing custom CSS from scratch under time pressure. |
| Backend | Python Flask (REST API) | Team already has hands-on Flask experience from the healthcare recommendation project; lightweight enough to build fast without heavy boilerplate. |
| Database | SQLite for development/demo, PostgreSQL-ready | SQLite needs zero setup for local dev and demo day; schema is written to be portable to Postgres later without redesign. |
| Auth | JWT (Flask-JWT-Extended) | Simple, stateless, works cleanly with a decoupled frontend. |
| AI/LLM Layer | Anthropic or OpenAI API (or Hugging Face Inference API if budget-constrained) | Handles resume screening, interview chat, and feedback generation; kept behind an internal service boundary so the provider can be swapped. |
| Real-time chat | Flask-SocketIO (or simple polling if time-constrained) | Needed for the interview chat experience to feel responsive. |
| File storage | Local filesystem for MVP (resume uploads) | No need for cloud storage complexity at this scale; can move to S3-equivalent later if scope grows. |
| Version control | GitHub | Team already familiar with it; supports the branching workflow in the Git Workflow doc. |
| Deployment (if needed for demo) | Render or Railway (backend), Vercel or Netlify (frontend) | Free tiers sufficient for classroom-scale demo load. |

## Alternatives Considered

- **Django + React** — more built-in features (admin panel, ORM) but heavier learning curve and slower to get moving in 6-8 weeks compared to Flask, which the team already knows well from prior projects.
- **Full JS stack (Next.js + Node/Express + MongoDB)** — single language across the stack is appealing for team coordination, but the team's existing Python/ML comfort (from healthcare project work) makes a Python backend a better fit, especially since the AI/LLM integration work benefits from Python's ecosystem.

## How to Justify This to a Mentor

- Flask backend reuses proven experience from the team's ongoing internship project, reducing ramp-up time.
- Decoupled React frontend + Flask API backend allows true parallel work across the 5-person team without one person blocking another.
- SQLite-to-Postgres path means the schema doesn't need to be redesigned if the project needs to scale post-submission.
- Keeping the LLM calls behind one internal service boundary is a deliberate architectural choice to reduce vendor lock-in risk — worth mentioning explicitly if asked about technical decisions.
