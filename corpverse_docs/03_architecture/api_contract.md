# API Contract

Base URL (dev): `http://localhost:5000/api`
Auth: All routes (except health and Clerk webhook) require a valid Clerk session token in the `Authorization` header (automatically attached by `@clerk/clerk-react`).

All responses follow a consistent shape:
```json
// Success
{ "success": true, "message": "string", "data": { ... } }

// Error
{ "success": false, "message": "string", "errors": [{ "field": "string", "message": "string" }] }
```

---

## Health

### GET /api/health
No auth required.
```json
Response 200:
{ "success": true, "message": "CorpVerse API is running", "timestamp": "ISO-8601", "environment": "development" }
```

---

## Auth

### POST /api/auth/webhook/clerk
Receives Clerk webhook events for user sync. Verified via Svix signature.
```json
Events handled: user.created, user.updated, user.deleted
Response 200: { "received": true }
```

### GET /api/auth/me
Returns the current authenticated user's profile. Creates user in DB if webhook hasn't synced yet.
```json
Response 200:
{
  "success": true,
  "data": {
    "_id": "ObjectId",
    "clerkId": "string",
    "name": "string",
    "email": "string",
    "avatarUrl": "string | null",
    "resumeUrl": "string | null",
    "skills": ["string"],
    "domainInterest": "string | null",
    "currentStatus": "job_seeker | employee | founder",
    "expTotal": 0,
    "profileComplete": false,
    "bio": "string | null",
    "canBecomeFounder": false
  }
}
```

---

## Profile

### POST /api/profile/complete
Complete the CorpVerse profile after initial Clerk signup.
```json
Request:
{ "skills": ["JavaScript", "React", "Node.js"], "domainInterest": "Technology", "bio": "Final year CS student" }

Response 200:
{ "success": true, "message": "Profile completed successfully", "data": { ...user } }

Errors:
400 — Validation failed (missing skills or domainInterest)
```

### PUT /api/profile
Update profile fields.
```json
Request:
{ "name": "string (optional)", "skills": ["string"] (optional), "domainInterest": "string (optional)", "bio": "string (optional)" }

Response 200:
{ "success": true, "data": { ...updatedUser } }
```

### GET /api/profile/me
Get current user's full profile.
```json
Response 200: { "success": true, "data": { ...user } }
Errors: 404 — User not found
```

### POST /api/profile/resume
Upload a resume file (multipart/form-data).
```
Field: "resume" (file, PDF or DOCX, max 5MB)

Response 200:
{ "success": true, "data": { "resumeUrl": "/uploads/resume-1234567890.pdf" } }

Errors:
400 — No file uploaded / Invalid file type
429 — Too many uploads (rate limited: 10/hour)
```

---

## Companies & Roles (Job Seeker - Browse)

### GET /api/companies?domain=Technology&page=1&limit=10
Browse companies with optional domain filter and pagination.
```json
Response 200:
{
  "success": true,
  "data": {
    "companies": [
      {
        "_id": "ObjectId",
        "name": "NovaTech Solutions",
        "domain": "Technology",
        "description": "string",
        "logoUrl": "string | null",
        "isSeedCompany": true,
        "tagline": "string",
        "employeeCount": 5,
        "openRoleCount": 3,
        "founder": { "name": "string", "avatarUrl": "string" } | null
      }
    ],
    "pagination": { "page": 1, "limit": 10, "total": 5, "totalPages": 1 }
  }
}
```

### GET /api/companies/:id
Get a single company with its roles.
```json
Response 200:
{
  "success": true,
  "data": {
    "_id": "ObjectId",
    "name": "NovaTech Solutions",
    "domain": "Technology",
    "description": "string",
    "roles": [
      { "_id": "ObjectId", "title": "Backend Developer", "level": "junior", "isOpen": true, "description": "string", "requirements": ["string"] }
    ]
  }
}

Errors: 404 — Company not found
```

### GET /api/companies/:id/roles
Get open roles for a specific company.
```json
Response 200:
{ "success": true, "data": [{ ...role }] }
```

---

## Applications (Job Seeker)

### POST /api/applications
Apply to a role. Requires completed profile.
```json
Request: { "roleId": "ObjectId" }
Response 201: { "success": true, "data": { "_id": "ObjectId", "status": "pending_screening" } }

Errors:
400 — Already have an active application for this role
400 — Currently on cooldown for this role
403 — Profile not complete
404 — Role not found or not open
```

### GET /api/applications/me
Get the current user's applications.
```json
Response 200:
{ "success": true, "data": [{ "_id": "ObjectId", "role": { "title": "string", "company": { "name": "string" } }, "status": "string", "feedbacks": [...], "cooldownUntil": "ISO-8601 | null" }] }
```

### GET /api/applications/:id
Get a specific application with feedback.
```json
Response 200: { "success": true, "data": { ...application } }
Errors: 404 — Application not found
```

---

## Interview

### POST /api/interviews/:applicationId/message
Send a message in the interview chat. Requires interview to be `in_progress`.
```json
Request: { "message": "string" }
Response 200:
{ "success": true, "data": { "reply": "string", "interviewComplete": false, "turnsRemaining": 7 } }

When interview completes:
{ "success": true, "data": { "reply": "Final evaluation...", "interviewComplete": true, "result": "passed | failed", "feedback": "string" } }
```

### GET /api/interviews/:applicationId/result
Get the interview result and feedback.
```json
Response 200:
{ "success": true, "data": { "result": "passed", "feedback": "string", "transcript": [...] } }
```

---

## Offers

### POST /api/applications/:id/respond
Accept or decline a job offer.
```json
Request: { "decision": "accept | decline" }
Response 200 (accept):
{ "success": true, "data": { "employeeRecordId": "ObjectId", "status": "hired" } }

Response 200 (decline):
{ "success": true, "data": { "status": "offer_declined" } }
```

---

## Employee

All employee endpoints require `currentStatus === 'employee'`.

### GET /api/employee/tasks
Get current tasks for the authenticated employee.
```json
Response 200:
{ "success": true, "data": [{ "_id": "ObjectId", "title": "string", "description": "string", "status": "assigned | in_progress | completed", "expReward": 20, "difficulty": "medium" }] }
```

### POST /api/employee/tasks/:id/complete
Mark a task as completed. Awards EXP and checks for promotion.
```json
Response 200:
{ "success": true, "data": { "expAwarded": 20, "expTotal": 220, "promoted": true, "newLevel": "mid" } }
```

### POST /api/employee/resign
Resign from current employment.
```json
Response 200:
{ "success": true, "data": { "status": "resigned", "exitFeedback": "string" } }
```

### GET /api/employee/exp-history
Get EXP change history.
```json
Response 200:
{ "success": true, "data": [{ "expChange": 20, "reason": "Completed: Fix login bug", "source": "task_completion", "createdAt": "ISO-8601" }] }
```

---

## Founder

All founder endpoints require `currentStatus === 'founder'`.

### POST /api/founder/company
Create a company (one per founder).
```json
Request: { "name": "string", "domain": "string", "description": "string (optional)", "tagline": "string (optional)" }
Response 201: { "success": true, "data": { "_id": "ObjectId", "name": "string" } }
```

### GET /api/founder/company
Get the founder's company details.
```json
Response 200: { "success": true, "data": { ...company, roles: [...], employees: [...] } }
```

### POST /api/founder/company/roles
Post a new role.
```json
Request: { "title": "string", "domain": "string", "level": "junior | mid | senior", "description": "string", "requirements": ["string"] }
Response 201: { "success": true, "data": { "_id": "ObjectId", "title": "string" } }
```

### GET /api/founder/company/applicants
View applications to the founder's company.
```json
Response 200: { "success": true, "data": [{ ...application, user: { name: "string" } }] }
```

---

## Error Codes Reference

| Status | Meaning | When |
|---|---|---|
| 400 | Bad Request | Validation failed, invalid input |
| 401 | Unauthorized | Missing or invalid Clerk session |
| 403 | Forbidden | Action not allowed for current status/role |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate (e.g., active application to same role) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected server error |

---

## Notes for the Team

- These shapes are **locked after Week 1** — any changes require team sign-off so nobody builds against a moving target.
- Frontend can build against these shapes using mocked responses while backend is still in progress.
- All ObjectIds should be treated as opaque strings on the frontend.
