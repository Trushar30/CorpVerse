# Functional Requirements

Organized by MoSCoW priority for a 6-8 week build.

## Must Have (MVP — required for demo)

- User registration/login with profile creation (basic details, resume upload, skills, domain interest)
- Job Seeker Dashboard: browse listed companies/roles, filter by domain
- Resume/profile screening on application (rule-based or single LLM call), with pass/fail + feedback
- Chat-based interview tied to role/resume, with pass/fail + feedback
- Reapplication cooldown after rejection (time-based for MVP)
- Offer stage: accept or decline a role
- Employee Dashboard: view assigned tasks, mark complete, see EXP total
- EXP-threshold based promotion (single tier system is fine for MVP: Junior → Mid → Senior)
- Resignation flow (leave current job voluntarily)
- Basic termination flow (triggered manually/by low performance threshold)
- Founder Dashboard: create a company, name it, set domain, post 1-2 roles
- Founder hiring reuses the same screening + interview pipeline, simplified
- Seed data: 5 pre-built companies with roles, acting as the initial job market
- Shared feedback-generation module reused for rejections, terminations, and exit flow

## Should Have (if time allows after MVP is stable)

- Manager/reporting-line concept shown in the Employee Dashboard (even if just a labeled AI "manager" per team)
- Periodic review cycle (e.g., "weekly review") that gates promotion, instead of pure auto-promotion
- Raises separate from promotion
- Simple training/course module that unlocks a previously-rejected role
- Notice period before switching jobs
- Basic negotiation step at the offer stage (accept a slightly higher offer / decline)

## Nice to Have (explicitly future scope, mention in report)

- Fully autonomous AI-founder companies running continuously without human triggers
- Mini-model employee pool dynamically simulating company operations
- Coding-round or business-simulation interview types
- Employer reputation system affecting applicant flow
- Company growth stages (startup → scaleup) unlocking more roles
- Real funding/revenue simulation for founders
- Moonlighting (employee + founder simultaneously)

## Out of Scope for This Semester

- Real payments or real currency of any kind
- Native mobile apps (web-responsive only)
- Multi-language support beyond English (Gujarati UI is a possible stretch goal, not a requirement)
