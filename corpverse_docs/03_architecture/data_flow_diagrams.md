# Data Flow Diagrams

## Flow 1: Resume Screening

```mermaid
flowchart LR
    A[User submits application] --> B[Application Service]
    B --> C[Fetch user resume + role requirements]
    C --> D[Screening Logic]
    D -->|Rule-based checks| E[Score calculation]
    D -->|Or single LLM call| F[LLM API]
    F --> E
    E --> G{Pass threshold?}
    G -->|Yes| H[Status: Passed - move to interview]
    G -->|No| I[Feedback Generation Module]
    I --> J[Store feedback + set cooldown]
    J --> K[Return result to user]
    H --> K
```

## Flow 2: Interview Chat Pipeline

```mermaid
flowchart LR
    A[User sends message] --> B[Interview Chat Service]
    B --> C[Build prompt: resume + role + conversation history]
    C --> D[LLM API]
    D --> E[AI response returned]
    E --> F{Interview complete?}
    F -->|No| G[Store turn, wait for next user message]
    F -->|Yes| H[Evaluate transcript for pass/fail]
    H --> I[Feedback Generation Module]
    I --> J[Store result + feedback]
    J --> K[Return final result to user]
```

## Flow 3: EXP → Promotion

```mermaid
flowchart LR
    A[Task marked complete] --> B[Employee Service]
    B --> C[Log EXP gain in EXP_LOG]
    C --> D[Update exp_total on Employee Record]
    D --> E{exp_total >= promotion threshold?}
    E -->|Yes| F[Trigger promotion: update role/level]
    E -->|No| G[No change, continue]
    F --> H[Notify user of promotion]
```

## Notes

- The screening and interview flows both route through the same LLM API and the same Feedback Generation Module — this reuse is intentional to keep prompt logic and feedback tone consistent, and to avoid three separate teams building three separate feedback systems.
- Promotion flow is deliberately simple (threshold-based) for MVP; the "Should Have" review-cycle gate would insert a review step between D and F above.
