# Git Workflow Agreement

## Branching Strategy

- `main` — always demo-ready/stable. No direct commits.
- `develop` — integration branch where feature branches merge before going to `main`.
- `feature/<area>-<short-description>` — one branch per task, e.g. `feature/backend-auth-endpoints`, `feature/frontend-employee-dashboard`.
- Merge to `develop` via Pull Request only, even on a small team — this creates a natural review checkpoint and avoids silent breakage.

## Commit Conventions

Use a simple prefix convention so history stays readable across 5 contributors:

- `feat: add resume upload endpoint`
- `fix: correct EXP calculation on task complete`
- `docs: update API contract for offers endpoint`
- `refactor: move LLM calls into ai/ module`
- `test: add screening service unit tests`

Keep commits small and scoped — one logical change per commit, not "end of day dump."

## Pull Request Rules

- At least one other teammate reviews before merging to `develop`, even if it's just a quick skim — catches integration issues early (e.g., frontend expecting a field the backend renamed).
- PR description should state what changed and which doc (if any) it relates to (e.g., "implements screening endpoint per API Contract doc").

## Merge Cadence

- Merge to `develop` at least every 2-3 days per person — long-lived feature branches are where merge conflicts go to multiply.
- Merge `develop` → `main` at the end of each sprint week (see Sprint Plan), so there's always a working demo-able snapshot even mid-project.

## Handling Conflicts

- Whoever owns the API contract changes (see API Contract doc) should flag changes to the team channel immediately — most conflicts on a team like this come from silent backend field renames breaking frontend calls, not actual code-line conflicts.

## .gitignore Essentials

- `node_modules/`, `venv/` or `.venv/`, `__pycache__/`, `.env`, `*.db` (local SQLite files), uploaded resume files in dev.
- Never commit `.env` files or API keys — use `.env.example` with placeholder values instead.
