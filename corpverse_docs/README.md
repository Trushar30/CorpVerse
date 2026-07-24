# CorpVerse — Documentation Set

Complete set of planning/requirements docs for the CorpVerse project, organized by category.

**Tech Stack**: Node.js + Express | MongoDB Atlas + Mongoose | React + Vite + Tailwind CSS | Clerk Auth | Python FastAPI (AI)

---

## 1. Requirements & Scope
- [Problem Statement](01_requirements_scope/problem_statement.md) — Who it's for, why now, competitor gaps
- [Functional Requirements](01_requirements_scope/functional_requirements.md) — MoSCoW prioritized, with acceptance criteria
- [Non-Functional Requirements](01_requirements_scope/non_functional_requirements.md) — Performance, security, scalability benchmarks
- [Scope Document](01_requirements_scope/scope_document.md) — In scope vs. out of scope with rationale

## 2. User-Facing Docs
- [User Personas](02_user_facing/user_personas.md) — Priya (job seeker), Rohan (employee), Ananya (founder), Evaluator
- [User Stories / Use Cases](02_user_facing/user_stories.md) — "As a [role], I want to..."
- [User Journey Maps](02_user_facing/user_journey_maps.md) — Step-by-step flows with emotional arcs

## 3. Architecture & Design
- [System Architecture](03_architecture/system_architecture.md) — Decoupled frontend/backend + AI microservice
- [Database Schema](03_architecture/database_schema.md) — MongoDB document model with 8 collections
- [API Contract](03_architecture/api_contract.md) — REST endpoints with request/response shapes
- [Wireframes](03_architecture/wireframes.md) — Low-fi layout sketches for all dashboards
- [Data Flow Diagrams](03_architecture/data_flow_diagrams.md) — Screening, interview, and promotion flows
- [Sequence Diagrams](03_architecture/sequence_diagrams.md) — Apply→Hire, Task→Promotion, Founder hiring

## 4. Tech & Planning
- [Tech Stack Decision](04_tech_planning/tech_stack_decision.md) — Node.js/MongoDB/Clerk justification with comparison tables
- [Repo/Folder Structure](04_tech_planning/repo_structure.md) — Matches actual implementation
- [Task Breakdown & Sprint Plan](04_tech_planning/task_breakdown_sprint_plan.md) — 6–8 week timeline
- [Git Workflow](04_tech_planning/git_workflow.md) — Branching strategy and PR rules

## 5. Risk & Feasibility
- [Risk Assessment](05_risk_feasibility/risk_assessment.md) — Technical, timeline, and process risks
- [Dependencies List](05_risk_feasibility/dependencies_list.md) — NPM packages, APIs, infrastructure, team checklist

## 6. External APIs
- [Free LLM API Ranking](06_apis_and_its_limits/Free_LLM_API_Ranking.xlsx) — Comparison spreadsheet

---

**Note:** Mermaid diagrams render on GitHub and in VS Code with the Mermaid extension. For static exports, use [mermaid.live](https://mermaid.live).
