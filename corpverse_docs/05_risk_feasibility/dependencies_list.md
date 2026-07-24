# Dependencies List

## External APIs / Services

| Dependency | Purpose | Free Tier | Needs Early Access? |
|---|---|---|---|
| **Clerk** | Authentication — signup, login, email verification, password reset, social login, session management | 10,000 MAU | Yes — create Clerk app in Week 1 |
| **MongoDB Atlas** | Cloud database — all application data | M0 cluster, 512MB storage | Yes — create cluster in Week 1 |
| **OpenAI / Anthropic API** | Resume screening, interview chat, feedback generation | OpenAI: $5 free credit; Anthropic: limited free tier | Yes — get API keys in Week 1 |
| **Hugging Face Inference API** (backup) | Fallback if primary LLM is cost-prohibitive | Free tier available | Optional, test in Week 2 |

## NPM Packages — Backend

| Package | Purpose | Version |
|---|---|---|
| `express` | HTTP server framework | ^4.21 |
| `mongoose` | MongoDB ODM with schema validation | ^8.x |
| `@clerk/express` | Clerk auth middleware for Express | ^1.x |
| `cors` | Cross-Origin Resource Sharing | ^2.8 |
| `helmet` | Security headers (XSS, HSTS, etc.) | ^8.x |
| `morgan` | HTTP request logging | ^1.10 |
| `express-rate-limit` | Rate limiting middleware | ^7.x |
| `multer` | Multipart file upload handling | ^1.4 |
| `zod` | Schema validation for request data | ^3.x |
| `svix` | Clerk webhook signature verification | ^1.x |
| `dotenv` | Environment variable loading | ^16.x |
| `nodemon` (dev) | Auto-restart server on file changes | ^3.x |
| `jest` (dev) | Test runner | ^29.x |
| `supertest` (dev) | HTTP endpoint testing | ^7.x |

## NPM Packages — Frontend

| Package | Purpose | Version |
|---|---|---|
| `react` | UI framework | ^19 |
| `react-dom` | React DOM renderer | ^19 |
| `react-router-dom` | Client-side routing | ^7 |
| `@clerk/clerk-react` | Clerk auth components for React | ^5 |
| `axios` | HTTP client for API calls | ^1.7 |
| `framer-motion` | Animation library | ^12 |
| `lucide-react` | Icon library | ^0.460 |
| `tailwindcss` | Utility-first CSS framework | ^3 |
| `autoprefixer` | CSS vendor prefixing | ^10 |
| `postcss` | CSS processing | ^8 |
| `@vitejs/plugin-react` (dev) | Vite React plugin | ^4 |

## Infrastructure

| Dependency | Purpose | Notes |
|---|---|---|
| **GitHub** | Version control | Set up with branch protection on `main` in Week 1 |
| **Vercel** (frontend) | Frontend deployment | Free tier — auto-deploys from GitHub |
| **Render or Railway** (backend) | Backend deployment | Free tier — supports Node.js + env vars |

## Team Access Checklist (Week 1 To-Do)

- [ ] Clerk application created at [clerk.com](https://clerk.com)
  - [ ] `CLERK_PUBLISHABLE_KEY` added to frontend `.env`
  - [ ] `CLERK_SECRET_KEY` added to backend `.env`
  - [ ] Webhook endpoint configured for user sync
- [ ] MongoDB Atlas cluster created at [cloud.mongodb.com](https://cloud.mongodb.com)
  - [ ] `MONGODB_URI` shared securely (not committed to git)
  - [ ] All 5 teammates' IP addresses added to Atlas whitelist (or `0.0.0.0/0` for dev)
- [ ] LLM API key obtained
  - [ ] Key stored in `.env`, never committed
  - [ ] `.env.example` with placeholder values committed
- [ ] GitHub repo set up
  - [ ] All 5 members added as collaborators
  - [ ] Branch protection on `main`
  - [ ] `.gitignore` committed (node_modules, .env, uploads, __pycache__)
- [ ] Local dev environment documented in README
  - [ ] Node.js version (v20+ recommended)
  - [ ] How to run backend: `cd backend && npm install && npm run dev`
  - [ ] How to run frontend: `cd frontend && npm install && npm run dev`
  - [ ] How to seed data: `cd backend && npm run seed`
