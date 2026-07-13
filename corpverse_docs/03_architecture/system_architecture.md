# System Architecture

## Overview

CorpVerse follows a decoupled frontend/backend architecture so the 5-person team can work in parallel without blocking each other.

```mermaid
flowchart TB
    subgraph Client["Frontend (React + Vite + Tailwind)"]
        A1[Job Seeker Dashboard]
        A2[Employee Dashboard]
        A3[Founder Dashboard]
    end

    subgraph Backend["Backend (Flask REST API)"]
        B1[Auth Service]
        B2[Application/Screening Service]
        B3[Interview Chat Service]
        B4[Employment/EXP Service]
        B5[Founder/Company Service]
        B6[Feedback Generation Module]
    end

    subgraph AI["AI Layer"]
        C1[LLM API - screening & interview]
        C2[Seed Company Logic - 5 pre-built companies]
    end

    subgraph Data["Data Layer"]
        D1[(SQLite / PostgreSQL)]
        D2[Resume File Storage]
    end

    Client -->|REST calls / JWT auth| Backend
    B2 --> C1
    B3 --> C1
    B6 --> C1
    B5 --> C2
    Backend --> D1
    B2 --> D2
```

## Component Notes

- **Auth Service** — handles signup/login, JWT issuing, and session validation.
- **Application/Screening Service** — receives job applications, triggers screening logic (rule-based check or single LLM call), stores result.
- **Interview Chat Service** — manages the back-and-forth chat interview, likely via Flask-SocketIO or simple polling for the MVP.
- **Employment/EXP Service** — tracks tasks, EXP totals, promotion thresholds, resignation/termination state.
- **Founder/Company Service** — handles company creation, role posting, and the simplified founder-side hiring pipeline.
- **Feedback Generation Module** — single shared service called by screening, interview, and exit flows so feedback tone/structure stays consistent (avoids duplicating prompt logic three times).
- **AI Layer** — isolated behind an internal API so the actual LLM provider (Anthropic, OpenAI, or open-source via Hugging Face) can be swapped without touching business logic elsewhere.

## Why This Split

Keeping the AI layer behind its own internal boundary means if API costs or rate limits become an issue mid-project, the team can swap providers or fall back to rule-based logic for the demo without rewriting the screening/interview services themselves.
