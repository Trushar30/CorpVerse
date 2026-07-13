# Dependencies List

## External APIs / Services

| Dependency | Purpose | Needs Early Access? | Notes |
|---|---|---|---|
| Anthropic API or OpenAI API | Resume screening, interview chat, feedback generation | Yes — get API keys in Week 1 | Budget for API costs during testing; consider a free-tier or lower-cost model for iteration, reserve better models for final demo quality. |
| Hugging Face Inference API (alternative/backup) | Fallback if primary LLM provider is cost-prohibitive or rate-limited | Optional, but worth testing in Week 2 | Open-source models may need more prompt tuning to get consistent screening/interview behavior. |

## Libraries / Frameworks

| Dependency | Layer | Notes |
|---|---|---|
| Flask, Flask-JWT-Extended, Flask-SocketIO, SQLAlchemy | Backend | Standard Flask ecosystem, team already has Flask experience. |
| React, Vite, Tailwind CSS | Frontend | Needs Node.js installed on all dev machines. |
| SQLite (dev), PostgreSQL driver (psycopg2, if moving to Postgres) | Database | SQLite requires zero setup; Postgres only needed if deploying beyond demo scale. |

## Datasets / Seed Content

| Dependency | Purpose | Notes |
|---|---|---|
| Seed data for 5 companies + roles | Populate initial job market | Needs to be written/agreed by the team in Week 1 — can't be an afterthought since the whole Job Seeker flow depends on it existing. |
| Sample resumes for testing | Testing screening/interview logic | Can use team members' own resumes (anonymized) or generate synthetic samples for a range of skill levels. |

## Infrastructure

| Dependency | Purpose | Notes |
|---|---|---|
| GitHub repo | Version control | Set up with branch protection on `main` in Week 1. |
| Render/Railway account (backend), Vercel/Netlify account (frontend) | Deployment for live demo | Only needed if demoing a hosted version rather than running locally; confirm with mentor which is expected. |

## Team Access Checklist (Week 1 To-Do)

- [ ] LLM API key obtained and shared securely (not committed to git)
- [ ] GitHub repo created, all 5 members added as collaborators
- [ ] Local dev environment steps documented in README (Python version, Node version, how to run both frontend/backend)
- [ ] Seed data script drafted and agreed upon
