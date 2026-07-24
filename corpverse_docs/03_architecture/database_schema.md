# Database Schema — MongoDB Document Model

## Architecture Decision: Why Document-Oriented

CorpVerse uses **MongoDB Atlas** with **Mongoose ODM** instead of a relational database. Key reasons:

1. **API-shape alignment** — MongoDB documents map directly to JSON API responses, eliminating ORM transformation overhead
2. **Flexible schema** — new fields can be added during development without migration scripts
3. **Strategic embedding** — related data accessed together (feedback inside applications, exit records inside employee records) is co-located for single-query retrieval
4. **Cloud-native** — MongoDB Atlas provides a zero-setup, free-tier cloud database with identical connection strings for all teammates

## Embedding vs. Referencing Strategy

| Data | Strategy | Rationale |
|---|---|---|
| Feedback → Application | **Embedded** (sub-document array) | Always read with the application; max 2-3 per app; bounded growth |
| ExitRecord → EmployeeRecord | **Embedded** (sub-document) | 1:1 relationship; always accessed together |
| Interview transcript messages | **Embedded** in Interview document | Always read as a complete conversation |
| Tasks → EmployeeRecord | **Referenced** (separate collection) | Unbounded growth; queried independently for dashboard |
| ExpLogs → EmployeeRecord | **Referenced** (separate collection) | Append-only audit log; unbounded; queried with pagination |
| Roles → Company | **Referenced** (separate collection) | Queried independently by job seekers browsing roles |

## Collections & Schema

### 8 Collections

```mermaid
erDiagram
    USER ||--o{ APPLICATION : submits
    USER ||--o| EMPLOYEE_RECORD : "has (if hired)"
    USER ||--o{ COMPANY : founds
    COMPANY ||--o{ ROLE : posts
    ROLE ||--o{ APPLICATION : receives
    APPLICATION ||--o| INTERVIEW : proceeds_to
    APPLICATION ||--|{ FEEDBACK : "embeds"
    EMPLOYEE_RECORD ||--o{ TASK : assigned
    EMPLOYEE_RECORD ||--o{ EXP_LOG : accumulates
    EMPLOYEE_RECORD ||--o| EXIT_RECORD : "embeds"
    COMPANY ||--o{ EMPLOYEE_RECORD : employs

    USER {
        ObjectId _id PK
        string clerkId UK
        string name
        string email UK
        string avatarUrl
        string resumeUrl
        array skills
        string domainInterest
        enum currentStatus
        int expTotal
        boolean profileComplete
        string bio
        date createdAt
        date updatedAt
    }

    COMPANY {
        ObjectId _id PK
        string name
        string domain
        string description
        string logoUrl
        ObjectId founder FK
        boolean isSeedCompany
        int employeeCount
        string industry
        string tagline
        date createdAt
    }

    ROLE {
        ObjectId _id PK
        ObjectId company FK
        string title
        string domain
        enum level
        string description
        array requirements
        array responsibilities
        object salaryRange
        boolean isOpen
        int maxOpenings
        int filledCount
        date createdAt
    }

    APPLICATION {
        ObjectId _id PK
        ObjectId user FK
        ObjectId role FK
        enum status
        date cooldownUntil
        array feedbacks
        int screeningScore
        date createdAt
    }

    FEEDBACK {
        enum stage
        string feedbackText
        array strengths
        array improvements
        int score
        date createdAt
    }

    INTERVIEW {
        ObjectId _id PK
        ObjectId application FK
        array transcript
        enum result
        int totalTurns
        int maxTurns
        string evaluationNotes
        date completedAt
    }

    EMPLOYEE_RECORD {
        ObjectId _id PK
        ObjectId user FK
        ObjectId company FK
        ObjectId role FK
        enum employmentStatus
        enum currentLevel
        date hiredAt
        object exitRecord
    }

    EXIT_RECORD {
        enum exitType
        string feedbackText
        string reason
        date exitedAt
    }

    TASK {
        ObjectId _id PK
        ObjectId employeeRecord FK
        string title
        string description
        enum status
        int expReward
        enum difficulty
        string category
        date completedAt
    }

    EXP_LOG {
        ObjectId _id PK
        ObjectId employeeRecord FK
        int expChange
        string reason
        enum source
        ObjectId taskId FK
        date createdAt
    }
```

## Enum Values Reference

| Field | Valid Values |
|---|---|
| `User.currentStatus` | `job_seeker`, `employee`, `founder` |
| `Role.level` / `EmployeeRecord.currentLevel` | `junior`, `mid`, `senior` |
| `Application.status` | `pending_screening`, `screening_passed`, `screening_rejected`, `interview_in_progress`, `interview_passed`, `interview_rejected`, `offer_pending`, `offer_accepted`, `offer_declined` |
| `Interview.result` | `passed`, `failed`, `in_progress` |
| `Feedback.stage` | `screening`, `interview`, `exit` |
| `EmployeeRecord.employmentStatus` | `active`, `resigned`, `terminated` |
| `Task.status` | `assigned`, `in_progress`, `completed` |
| `Task.difficulty` | `easy`, `medium`, `hard` |
| `ExitRecord.exitType` | `resignation`, `termination` |
| `ExpLog.source` | `task_completion`, `promotion_bonus`, `performance_review`, `penalty`, `other` |

## Indexes

| Collection | Index | Purpose |
|---|---|---|
| User | `{ clerkId: 1 }` unique | Fast lookup from Clerk webhook/auth |
| User | `{ email: 1 }` unique | Prevent duplicate accounts |
| Company | `{ domain: 1 }` | Domain filter on browse |
| Company | `{ isSeedCompany: 1 }` | Separate seed from user-founded |
| Role | `{ company: 1, isOpen: 1 }` compound | Browse open roles by company |
| Role | `{ domain: 1, isOpen: 1 }` compound | Domain filter on job search |
| Application | `{ user: 1, role: 1 }` partial unique | Prevent duplicate active applications |
| Application | `{ user: 1, status: 1 }` compound | User's application history |
| EmployeeRecord | `{ user: 1, employmentStatus: 1 }` | Find active employment |
| Task | `{ employeeRecord: 1, status: 1 }` | Dashboard task list |
| ExpLog | `{ employeeRecord: 1, createdAt: -1 }` | EXP history (newest first) |

## Notes on Key Decisions

- **`currentStatus` on User** enforces the single-active-role state machine at the application layer — a user cannot be `employee` and `founder` simultaneously.
- **`isSeedCompany` on Company** distinguishes the 5 pre-built AI companies from user-founded ones, allowing differentiated behavior (e.g., seed companies always have open roles).
- **`cooldownUntil` on Application** enforces reapplication cooldown at the data layer rather than trusting the frontend.
- **`feedbacks` embedded in Application** — the same Feedback Generation Module writes to this array from screening, interview, and exit flows, keeping feedback co-located with the application it belongs to.
- **`exitRecord` embedded in EmployeeRecord** — 1:1 relationship, always accessed together, and never needs independent querying.
- Schema is intentionally **extensible** — adding Should-Have features (training, periodic reviews, reputation) means new collections or new fields, not restructuring existing data.
