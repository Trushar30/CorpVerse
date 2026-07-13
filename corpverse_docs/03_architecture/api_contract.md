# API Contract (Rough Sketch)

Base URL (dev): `http://localhost:5000/api`
Auth: JWT bearer token in `Authorization` header for all routes except signup/login.

## Auth

### POST /auth/signup
Request:
```json
{ "name": "string", "email": "string", "password": "string" }
```
Response `201`:
```json
{ "user_id": 1, "token": "jwt-string" }
```

### POST /auth/login
Request:
```json
{ "email": "string", "password": "string" }
```
Response `200`:
```json
{ "user_id": 1, "token": "jwt-string" }
```

## Profile

### POST /profile
Request (multipart/form-data): `resume` (file), `skills` (string[]), `domain_interest` (string)
Response `200`: `{ "profile_complete": true }`

### GET /profile/me
Response `200`:
```json
{ "id": 1, "name": "string", "skills": [], "domain_interest": "string", "current_status": "job_seeker", "exp_total": 0 }
```

## Jobs & Applications

### GET /companies?domain=xyz
Response `200`: `[{ "id": 1, "name": "string", "domain": "string", "is_seed_company": true }]`

### GET /companies/:id/roles
Response `200`: `[{ "id": 1, "title": "string", "level": "string", "is_open": true }]`

### POST /applications
Request: `{ "role_id": 1 }`
Response `201`: `{ "application_id": 1, "status": "pending_screening" }`

### GET /applications/:id
Response `200`: `{ "id": 1, "status": "screening_rejected", "feedback": "string", "cooldown_until": "iso-datetime" }`

## Interview

### POST /interviews/:application_id/message
Request: `{ "message": "string" }`
Response `200`: `{ "reply": "string", "interview_complete": false }`

### GET /interviews/:application_id/result
Response `200`: `{ "result": "passed", "feedback": "string" }`

## Offers

### POST /offers/:application_id/respond
Request: `{ "decision": "accept" }` or `{ "decision": "decline" }`
Response `200`: `{ "employee_record_id": 1, "status": "hired" }`

## Employee

### GET /employee/me/tasks
Response `200`: `[{ "id": 1, "title": "string", "status": "assigned", "exp_reward": 20 }]`

### POST /employee/tasks/:id/complete
Response `200`: `{ "exp_awarded": 20, "exp_total": 120 }`

### POST /employee/resign
Response `200`: `{ "status": "resigned" }`

## Founder

### POST /companies
Request: `{ "name": "string", "domain": "string" }`
Response `201`: `{ "company_id": 5 }`

### POST /companies/:id/roles
Request: `{ "title": "string", "level": "string" }`
Response `201`: `{ "role_id": 10 }`

### GET /companies/:id/applications
Response `200`: `[{ "application_id": 1, "user_name": "string", "status": "pending_review" }]`

## Notes for the Team

- These shapes are intentionally rough — once frontend and backend devs sit down together, lock the exact field names before writing model code, so nobody's building against a moving target.
- Error responses should follow one consistent shape across all endpoints, e.g. `{ "error": "message" }` with appropriate status codes (400/401/404/500).
