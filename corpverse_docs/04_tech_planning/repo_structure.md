# Repo / Folder Structure Plan

Matches the actual implemented project structure.

```
corpverse/
├── backend/
│   ├── src/
│   │   ├── index.js                   # Server entry point (connect DB + start Express)
│   │   ├── app.js                     # Express app factory (middleware, routes, error handler)
│   │   ├── config/
│   │   │   ├── index.js               # Environment config (dotenv loader)
│   │   │   └── db.js                  # MongoDB Atlas connection (mongoose.connect)
│   │   ├── models/
│   │   │   ├── index.js               # Barrel export for all models
│   │   │   ├── User.js                # User model (linked to Clerk via clerkId)
│   │   │   ├── Company.js             # Company model (seed + user-founded)
│   │   │   ├── Role.js                # Role model (job listings)
│   │   │   ├── Application.js         # Application model (embeds Feedback sub-docs)
│   │   │   ├── Interview.js           # Interview model (chat transcript)
│   │   │   ├── EmployeeRecord.js      # Employee record (embeds ExitRecord)
│   │   │   ├── Task.js                # Task model (assigned to employees)
│   │   │   └── ExpLog.js              # EXP audit log
│   │   ├── middleware/
│   │   │   ├── auth.js                # Clerk middleware (initClerk, requireAuth, requireStatus)
│   │   │   ├── errorHandler.js        # Global error handler (Mongoose, Clerk, generic)
│   │   │   ├── validate.js            # Zod validation middleware
│   │   │   └── rateLimiter.js         # Rate limiting (general, auth, uploads)
│   │   ├── routes/
│   │   │   ├── index.js               # Route aggregator + /api/health
│   │   │   ├── auth.routes.js         # Clerk webhook + /auth/me
│   │   │   ├── profile.routes.js      # Profile CRUD + resume upload
│   │   │   ├── company.routes.js      # Browse companies/roles
│   │   │   ├── application.routes.js  # Job applications
│   │   │   ├── interview.routes.js    # Interview chat
│   │   │   ├── employee.routes.js     # Tasks, EXP, promotion, resign
│   │   │   └── founder.routes.js      # Company creation, role posting
│   │   ├── controllers/
│   │   │   ├── auth.controller.js     # Clerk webhook handler + getMe
│   │   │   ├── profile.controller.js  # Profile completion, update, resume upload
│   │   │   ├── company.controller.js  # Browse/filter companies, get roles
│   │   │   ├── application.controller.js
│   │   │   ├── interview.controller.js
│   │   │   ├── employee.controller.js
│   │   │   └── founder.controller.js
│   │   ├── services/                  # Business logic (added as features mature)
│   │   ├── utils/
│   │   │   ├── ApiError.js            # Custom error class with factory methods
│   │   │   ├── ApiResponse.js         # Standardized response wrapper
│   │   │   ├── asyncHandler.js        # Async route handler wrapper
│   │   │   └── constants.js           # All enums, thresholds, magic numbers
│   │   └── validations/
│   │       ├── profile.validation.js  # Zod schemas for profile endpoints
│   │       ├── company.validation.js  # Zod schemas for company endpoints
│   │       └── application.validation.js
│   ├── seed/
│   │   └── seed.js                    # Seeds 5 companies + 15 roles
│   ├── uploads/                       # Resume file storage (gitignored except .gitkeep)
│   ├── tests/
│   ├── .env.example                   # Environment variable template
│   ├── .gitignore
│   ├── nodemon.json
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/                # Navbar, Footer, DashboardLayout
│   │   │   ├── ui/                    # Button, Card, GradientText, ParticleBackground
│   │   │   └── landing/              # Hero, Features, Journey, Companies, CTA
│   │   ├── pages/                     # Landing, AuthPage, Onboarding, Dashboard
│   │   ├── api/                       # Axios client with Clerk token injection
│   │   ├── hooks/                     # Custom React hooks
│   │   ├── context/                   # Auth context (if needed beyond Clerk)
│   │   ├── App.jsx                    # Routes + ClerkProvider
│   │   ├── index.css                  # Design system tokens + Dark Cosmos theme
│   │   └── main.jsx                   # React entry point
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── ai-service/                        # Python FastAPI (future phase)
│   ├── main.py
│   ├── routes/
│   └── requirements.txt
│
├── corpverse_docs/                    # This documentation set
│   ├── 01_requirements_scope/
│   ├── 02_user_facing/
│   ├── 03_architecture/
│   ├── 04_tech_planning/
│   ├── 05_risk_feasibility/
│   ├── 06_apis_and_its_limits/
│   └── README.md
│
├── .gitignore
└── README.md
```

## Ground Rules

1. **Agree on this structure before committing code** — restructuring folders mid-project after 3 people have already built on top of a different layout wastes real time.
2. **`backend/src/models/`** — all Mongoose schemas live here. No model code anywhere else.
3. **`backend/src/middleware/auth.js`** — the *only* place that talks to Clerk SDK. Controllers never call Clerk directly.
4. **`backend/src/utils/constants.js`** — single source of truth for all enum values and game config. No magic strings or numbers elsewhere.
5. **`seed/seed.js`** — must be idempotent (can be re-run without duplicating data), so every teammate's local setup and the final demo environment start from the same state.
6. **`ai-service/`** — kept as a separate directory (not inside `backend/`) to reinforce that it's an independent service with its own dependencies and deployment.
