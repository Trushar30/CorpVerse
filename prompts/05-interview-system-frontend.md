# Prompt 2.2 — Interview System Frontend

## Context
The interview backend is live (Prompt 04). Users with `screening_passed` applications can now start AI-powered interviews. We need a real-time chat interface that feels like a genuine interview experience, fitting the retro arcade theme.

## Objective
Build the interview chat UI, integrate with the backend conversation API, and display results with detailed evaluation feedback.

---

## Task 1: Interview Chat Page

**Create**: `frontend/src/pages/InterviewRoom.jsx`

This is a dedicated full-screen page (not inside the dashboard tabs) for the interview experience.

### 1.1 — Route Setup
**File**: `frontend/src/App.jsx`

Add route:
```jsx
<Route path="/interview/:applicationId" element={
  <ProtectedRoute roles={['job_seeker']}>
    <InterviewRoom />
  </ProtectedRoute>
} />
```

### 1.2 — Interview Room Layout
```
┌─────────────────────────────────────────────────────────────┐
│  ◄ BACK TO DASHBOARD          INTERVIEW ROOM          ⏱ 8/10│
│─────────────────────────────────────────────────────────────│
│                                                             │
│  ┌─ ROLE CONTEXT ──────────────────────────────────────┐   │
│  │ Frontend Developer @ TechNova Corp | Junior Level    │   │
│  │ Domain: Technology | Requirements: React, JS, CSS    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─ CHAT TRANSCRIPT ──────────────────────────────────┐    │
│  │                                                      │   │
│  │  🤖 AI Interviewer                     2:30 PM       │   │
│  │  Welcome to your interview for Frontend Developer    │   │
│  │  at TechNova Corp. I'll be asking you some           │   │
│  │  technical and behavioral questions. Let's start:    │   │
│  │                                                      │   │
│  │  Can you explain the difference between              │   │
│  │  controlled and uncontrolled components in React?    │   │
│  │                                                      │   │
│  │  👤 You                                 2:31 PM      │   │
│  │  Controlled components have their state managed      │   │
│  │  by React through props and onChange handlers...     │   │
│  │                                                      │   │
│  │  🤖 AI Interviewer                     2:31 PM       │   │
│  │  Great explanation! Follow-up: when would you        │   │
│  │  prefer uncontrolled components? Give an example.    │   │
│  │                                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─ YOUR RESPONSE ────────────────────────────────────┐    │
│  │                                                      │   │
│  │  Type your answer here...                            │   │
│  │                                                      │   │
│  │                                      [SEND ▶]       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Turns remaining: 6 of 10    ⚡ Take your time, be clear   │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 — Chat Behavior
- On mount, call `GET /api/interviews/:applicationId/result` to check if interview exists
- If no interview, call `POST /api/interviews/:applicationId/start` to begin
- Show AI's opening message with typing animation (simulated 1-2s delay)
- User types response in textarea (supports Enter to send, Shift+Enter for new line)
- On send:
  1. Add user message to local transcript immediately (optimistic UI)
  2. Show "AI is typing..." indicator with pulsing dots animation
  3. Call `POST /api/interviews/:applicationId/message` with the message
  4. On response, add AI message with typing effect (character by character, ~30ms per char)
  5. Auto-scroll to latest message
- Disable input while AI is responding
- Show turns remaining counter prominently
- When interview completes (turnsRemaining === 0 or `result !== 'in_progress'`):
  1. Show "Interview Complete" banner
  2. Disable input
  3. Show "View Results" button that navigates to results

### 1.4 — Chat Message Components

**Create**: `frontend/src/components/interview/ChatMessage.jsx`
```jsx
// AI messages: dark card with robot icon, monospace font for the retro feel
// User messages: right-aligned with user avatar/initials
// Typing indicator: pulsing dots animation
// Timestamp on each message
```

**Create**: `frontend/src/components/interview/ChatInput.jsx`
```jsx
// Textarea with character count
// Send button (disabled when empty or AI is responding)
// Keyboard shortcuts hint
// Retro arcade styling
```

---

## Task 2: Interview Results Screen

**Create**: `frontend/src/pages/InterviewResult.jsx` OR integrate into the interview room as a results overlay.

### 2.1 — Results Layout (Pass)
```
┌─────────────────────────────────────────────────────────────┐
│                    🎉 INTERVIEW PASSED!                     │
│                                                             │
│  Overall Score: 78/100                                      │
│                                                             │
│  ┌─ CATEGORY SCORES ─────────────────────────────────┐     │
│  │                                                     │    │
│  │  Technical Depth    ████████████░░░  75/100         │    │
│  │  Communication      █████████████░░  85/100         │    │
│  │  Problem Solving    ███████████░░░░  70/100         │    │
│  │  Cultural Fit       ████████████░░░  80/100         │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─ EVALUATION NOTES ────────────────────────────────┐     │
│  │ "Strong React fundamentals with clear articulation  │    │
│  │  of component patterns. Good practical examples..." │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ✅ Your application has advanced to the Offer stage!       │
│                                                             │
│  [REVIEW TRANSCRIPT]     [BACK TO DASHBOARD]               │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 — Results Layout (Fail)
```
┌─────────────────────────────────────────────────────────────┐
│                    📊 INTERVIEW RESULTS                     │
│                                                             │
│  Overall Score: 52/100                                      │
│  Status: Not Passed                                         │
│                                                             │
│  [Same category score bars]                                 │
│                                                             │
│  ┌─ STRENGTHS ──────────────────────────────────────┐      │
│  │ • Clear communication style                       │      │
│  │ • Good understanding of basic React concepts      │      │
│  └──────────────────────────────────────────────────┘      │
│                                                             │
│  ┌─ AREAS TO IMPROVE ──────────────────────────────┐       │
│  │ • Deepen system design knowledge                  │      │
│  │ • Practice explaining technical trade-offs        │      │
│  │ • Work on state management patterns               │      │
│  └──────────────────────────────────────────────────┘       │
│                                                             │
│  ⏰ You can re-apply in 14 days (Sep 19, 2026)             │
│                                                             │
│  [REVIEW TRANSCRIPT]     [BROWSE OTHER ROLES]              │
└─────────────────────────────────────────────────────────────┘
```

---

## Task 3: Integration with Application Pipeline

### 3.1 — Start Interview Button
In the Application Tracking pipeline (from Prompt 03), when an application has status `screening_passed`:
- Show a prominent "START INTERVIEW" button
- Clicking it navigates to `/interview/:applicationId`

### 3.2 — Resume Interview
If user navigates away and comes back:
- Check if interview exists and is `in_progress`
- Load the existing transcript and resume from the last message
- Show "Resuming interview..." message

### 3.3 — View Results from Pipeline
When application status is `interview_passed` or `interview_rejected`:
- Show "VIEW RESULTS" button in the pipeline tracker
- Clicking opens the results screen

---

## Task 4: Interview API Service

**File**: `frontend/src/api/interviews.js`

```javascript
import client from './client';

export const startInterview = (applicationId) =>
  client.post(`/interviews/${applicationId}/start`);

export const sendInterviewMessage = (applicationId, message) =>
  client.post(`/interviews/${applicationId}/message`, { message });

export const getInterviewResult = (applicationId) =>
  client.get(`/interviews/${applicationId}/result`);
```

---

## Task 5: Interview UX Polish

### 5.1 — Pre-Interview Prep Screen
Before starting, show a brief prep screen:
```
┌─────────────────────────────────────────┐
│         🎯 INTERVIEW PREP               │
│                                          │
│  Role: Frontend Developer                │
│  Duration: ~10 questions                 │
│  Format: Technical + Behavioral          │
│                                          │
│  TIPS:                                   │
│  • Take your time with each answer       │
│  • Use specific examples from your       │
│    experience                            │
│  • Ask for clarification if needed       │
│  • Be honest about what you don't know   │
│                                          │
│  Ready?  [START INTERVIEW →]             │
└─────────────────────────────────────────┘
```

### 5.2 — Sound Effects (Optional)
- Subtle "send" sound on message dispatch
- "Notification" sound when AI responds
- Victory jingle on pass, somber tone on fail
- Use Web Audio API, respect user's sound preference

---

## Acceptance Criteria
- [ ] Interview chat page renders with retro arcade theme
- [ ] AI opening message displays with typing animation
- [ ] User can type and send messages
- [ ] AI responses appear with typing effect
- [ ] Turns remaining counter updates correctly
- [ ] Interview auto-completes when turns run out
- [ ] Results screen shows score bars for each category
- [ ] Pass: shows celebration + "advanced to offer stage"
- [ ] Fail: shows detailed feedback + cooldown timer
- [ ] "Start Interview" button appears for screening_passed applications
- [ ] Resume interview works (navigating away and back)
- [ ] Transcript reviewable after completion
- [ ] Loading and error states handled
- [ ] Responsive on mobile (chat works on smaller screens)
