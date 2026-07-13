# Database Schema / ER Diagram

## Entities & Relationships

```mermaid
erDiagram
    USER ||--o{ APPLICATION : submits
    USER ||--o| EMPLOYEE_RECORD : "has (if hired)"
    USER ||--o{ COMPANY : founds
    COMPANY ||--o{ ROLE : posts
    ROLE ||--o{ APPLICATION : receives
    APPLICATION ||--o| INTERVIEW : proceeds_to
    APPLICATION ||--o| FEEDBACK : generates
    EMPLOYEE_RECORD ||--o{ TASK : assigned
    EMPLOYEE_RECORD ||--o{ EXP_LOG : accumulates
    EMPLOYEE_RECORD ||--o| EXIT_RECORD : "may end in"
    COMPANY ||--o{ EMPLOYEE_RECORD : employs

    USER {
        int id PK
        string name
        string email
        string password_hash
        string resume_url
        string skills
        string domain_interest
        string current_status
        int exp_total
        datetime created_at
    }

    COMPANY {
        int id PK
        string name
        string domain
        int founder_user_id FK
        boolean is_seed_company
        datetime created_at
    }

    ROLE {
        int id PK
        int company_id FK
        string title
        string domain
        string level
        boolean is_open
    }

    APPLICATION {
        int id PK
        int user_id FK
        int role_id FK
        string status
        datetime applied_at
        datetime cooldown_until
    }

    INTERVIEW {
        int id PK
        int application_id FK
        string transcript
        string result
        datetime completed_at
    }

    FEEDBACK {
        int id PK
        int application_id FK
        string stage
        string feedback_text
        datetime created_at
    }

    EMPLOYEE_RECORD {
        int id PK
        int user_id FK
        int company_id FK
        int role_id FK
        string employment_status
        datetime hired_at
    }

    TASK {
        int id PK
        int employee_record_id FK
        string title
        string description
        string status
        int exp_reward
        datetime assigned_at
        datetime completed_at
    }

    EXP_LOG {
        int id PK
        int employee_record_id FK
        int exp_change
        string reason
        datetime created_at
    }

    EXIT_RECORD {
        int id PK
        int employee_record_id FK
        string exit_type
        string feedback_text
        datetime exited_at
    }
```

## Notes on Key Decisions

- **`current_status` on USER** tracks the state-machine value discussed in the structure doc: `job_seeker`, `employee`, or `founder` — enforced at the application layer so a user can't be in two states at once (MVP scope: one active role).
- **`is_seed_company` on COMPANY** distinguishes the 5 pre-built AI companies from real user-founded ones, so the differentiated hiring-strictness logic (from the structure doc) can branch on this flag.
- **`cooldown_until` on APPLICATION** enforces the reapplication cooldown directly at the data layer rather than trusting the frontend to block resubmission.
- **`FEEDBACK` is a separate table**, not embedded in APPLICATION or EXIT_RECORD, since the same shared feedback-generation module writes to it from multiple flows (screening rejection, interview rejection, exit).
- Kept intentionally flat/simple for MVP — no separate `TRAINING`, `PROMOTION_REVIEW`, or `REPUTATION` tables yet, since those are Should-Have/Nice-to-Have features. Adding them later just means new tables, not restructuring existing ones.
