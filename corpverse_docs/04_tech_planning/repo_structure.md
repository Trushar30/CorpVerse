# Repo / Folder Structure Plan

```
corpverse/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── models/              # SQLAlchemy models (user, company, role, application, etc.)
│   │   ├── routes/              # Flask blueprints per feature (auth, jobs, employee, founder)
│   │   ├── services/            # Business logic (screening, interview, exp, feedback)
│   │   ├── ai/                  # LLM API wrapper - isolated so provider can be swapped
│   │   └── utils/
│   ├── migrations/
│   ├── tests/
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   ├── src/
│   │   ├── components/          # Shared UI components
│   │   ├── pages/               # JobSeekerDashboard, EmployeeDashboard, FounderDashboard, etc.
│   │   ├── api/                 # API call wrappers (one file per backend resource)
│   │   ├── hooks/
│   │   └── App.jsx
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── docs/                        # This documentation set lives here
│   ├── 01_requirements_scope/
│   ├── 02_user_facing/
│   ├── 03_architecture/
│   ├── 04_tech_planning/
│   └── 05_risk_feasibility/
├── seed_data/                   # Scripts/JSON for the 5 seed companies + roles
├── .gitignore
└── README.md
```

## Ground Rules

- Agree on this structure **before** anyone commits code — restructuring folders mid-project after 3 people have already built on top of a different layout wastes real time.
- `backend/app/ai/` should be the *only* place that talks directly to the LLM API — services call into it, never call the LLM API directly. This keeps the "swap providers later" option realistic.
- `seed_data/` should be scriptable (a Python script or JSON file that seeds the 5 companies), not manually inserted via a GUI, so it can be re-run cleanly for every teammate's local setup and for the final demo environment.
