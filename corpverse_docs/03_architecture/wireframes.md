# Wireframes (Low-Fidelity Notes)

These are text-based low-fi sketches to agree on layout before anyone opens Figma or writes UI code. Treat this as the "what goes where" reference — actual visual design (colors, spacing, components) belongs in Figma or directly in code using the frontend-design conventions the team picks.

## Screen 1: Job Seeker Dashboard

```
--------------------------------------------------
| Logo   [Job Seeker | Employee | Founder]  [User]|
--------------------------------------------------
| Filter: [Domain dropdown]  [Search box]         |
--------------------------------------------------
| Company Card       | Company Card    | Card     |
| - Name, domain     | - Name, domain  |          |
| - Open roles (3)   | - Open roles(1) |          |
| - [View Roles]     | - [View Roles]  |          |
--------------------------------------------------
| My Applications                                  |
| Role @ Company     | Status         | Feedback   |
--------------------------------------------------
```

## Screen 2: Application / Screening Result

```
--------------------------------------------------
| < Back to listings                              |
--------------------------------------------------
| Role: Backend Developer @ SeedCo                |
| Status: REJECTED at Screening                    |
--------------------------------------------------
| Feedback:                                        |
| "Your resume lacks measurable project outcomes.  |
|  Consider adding specific metrics to your past   |
|  project descriptions."                          |
--------------------------------------------------
| Reapply available in: 2 days                     |
| [Update Profile]                                 |
--------------------------------------------------
```

## Screen 3: Interview Chat

```
--------------------------------------------------
| Interview: Backend Developer @ SeedCo            |
--------------------------------------------------
| [AI]: Tell me about a project where you handled  |
|       a tight deadline.                          |
|                                                    |
| [You]: ...                                        |
--------------------------------------------------
| [Type your response...............]   [Send]     |
--------------------------------------------------
```

## Screen 4: Employee Dashboard

```
--------------------------------------------------
| Logo   [Job Seeker | Employee | Founder]  [User]|
--------------------------------------------------
| Role: Backend Developer (Junior)  |  EXP: 120/200|
--------------------------------------------------
| Tasks                                            |
| [ ] Fix login bug          +20 EXP               |
| [ ] Write API docs         +15 EXP               |
| [x] Setup dev environment  +10 EXP  (done)       |
--------------------------------------------------
| [Resign from this role]                          |
--------------------------------------------------
```

## Screen 5: Founder Dashboard

```
--------------------------------------------------
| Logo   [Job Seeker | Employee | Founder]  [User]|
--------------------------------------------------
| My Company: Ananya Tech Labs   [Edit]            |
--------------------------------------------------
| Open Roles                    | Applicants        |
| Frontend Dev (1 applicant)     | [Review]          |
| [+ Post New Role]              |                   |
--------------------------------------------------
| My Employees                                     |
| Name          | Role          | EXP  | [Manage]   |
--------------------------------------------------
```

## Notes for the Team

- Keep the top nav (Job Seeker / Employee / Founder) visible and switchable at all times — it reflects the state-machine concept directly in the UI so evaluators immediately understand the three-dashboard structure during a demo.
- Once someone's ready to build real mockups, run this through Figma or directly prototype in code — this doc is just to agree on structure first.
