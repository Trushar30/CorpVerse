# Tech Stack Decision

## Recommended Stack (for 6–8 Week Team Build)

| Layer | Choice | Why |
|---|---|---|
| **Frontend** | React 19 (Vite) + Tailwind CSS v3 | Component-based architecture splits cleanly across teammates; Vite provides fast HMR for rapid iteration; Tailwind eliminates custom CSS from scratch under time pressure. |
| **Backend (Primary)** | Node.js + Express 4 | Team preference for JavaScript full-stack; excellent ecosystem for REST APIs; seamless JSON handling between frontend and backend; Express is mature with massive community support. |
| **AI Microservice** | Python (FastAPI) | Python has the best LLM ecosystem — `openai`, `anthropic`, `langchain` SDKs are Python-first. FastAPI provides auto-generated docs and async support. Kept as a separate service so the AI provider can be swapped without touching business logic. |
| **Database** | MongoDB Atlas (Mongoose ODM) | Document-oriented model maps naturally to our JSON API responses; flexible schema handles evolving requirements during development; MongoDB Atlas free tier (M0, 512MB) is more than sufficient for demo scale; Mongoose provides schema validation and relationship management. |
| **Auth** | Clerk | Fully managed authentication — handles signup, login, email verification, password reset, social login, MFA, brute force protection, and session management with zero custom auth code. Free tier supports 10K MAU. React + Express SDKs available. |
| **Validation** | Zod | TypeScript-first schema validation used on both request bodies and environment config. Lightweight, composable, excellent error messages. |
| **Real-time (Future)** | Socket.IO | Needed for the interview chat experience to feel responsive. Built-in reconnection, room support, and Express integration. |
| **File Storage** | Local filesystem (multer) | No cloud storage complexity at MVP scale; resumes stored in `/uploads/` with multer handling multipart form data. Can migrate to Cloudinary or S3 later. |
| **Version Control** | GitHub | Team already familiar; supports the branching workflow in the Git Workflow doc. |
| **Deployment** | Vercel (frontend), Render or Railway (backend) | Free tiers sufficient for classroom-scale demo load; zero-config deployment for Vite + Express apps. |

---

## Why Node.js + Express (Not Flask)

The original doc proposed Flask. We switched to Node.js + Express for these reasons:

| Factor | Flask (Python) | Express (Node.js) | Winner |
|---|---|---|---|
| **Language consistency** | Python backend, JS frontend — two language contexts | JavaScript everywhere — same language for frontend + backend | Express |
| **JSON handling** | Requires `jsonify()`, manual serialization | Native JSON — `req.body`, `res.json()` work out of the box | Express |
| **Real-time support** | Flask-SocketIO works but is less maintained | Socket.IO is natively designed for Node.js | Express |
| **Clerk SDK maturity** | `@clerk/python` exists but is newer | `@clerk/express` is mature, well-documented, first-class support | Express |
| **NPM ecosystem** | pip has excellent ML/AI packages | npm has 2M+ packages for web development use cases | Tie |
| **AI/ML integration** | Python is the clear winner for LLM work | Node.js is weaker for ML | Flask |

**Resolution**: Use Express for the primary API where Clerk integration, JSON handling, and real-time chat matter most. Keep Python as a **separate FastAPI microservice** for AI-specific work (screening, interview, feedback generation) — best of both worlds.

---

## Why MongoDB (Not PostgreSQL/SQLite)

| Factor | SQLite/PostgreSQL | MongoDB Atlas |
|---|---|---|
| **Schema flexibility** | Requires migrations for every change | Schema changes are just code changes — no migration step |
| **JSON data** | JSONB in Postgres works but requires cast/extract | Native BSON — arrays, nested objects, sub-documents are first-class |
| **Setup complexity** | SQLite: zero setup. Postgres: requires server installation | Atlas: zero setup — free cloud cluster, connect via URI |
| **Node.js integration** | Sequelize/Prisma ORMs | Mongoose ODM — mature, well-documented, schema validation |
| **Scalability** | Postgres scales very well | Atlas handles auto-scaling with paid tiers |
| **Team familiarity** | Moderate | Team preference — decided by team |

**Key win**: MongoDB's document model maps directly to our API response shapes. A Company document with nested Role references mirrors exactly what the frontend needs, reducing serialization/transformation code.

---

## How to Justify This to a Mentor

1. **Express + Clerk** eliminates 1-2 weeks of auth boilerplate, letting the team focus on the career simulation that differentiates the project.
2. **MongoDB Atlas** provides a zero-setup, free-tier cloud database with connection strings that work identically for all 5 teammates — no "works on my machine" issues.
3. **Decoupled AI microservice** is a deliberate architectural choice to reduce vendor lock-in — the LLM provider can be changed by modifying one service, not the entire backend.
4. **Mongoose schema validation** provides the data integrity guarantees typically associated with SQL databases, while retaining document flexibility.
5. **Full JavaScript stack** (frontend + primary backend) means any teammate can contribute to either side without a language context switch.
