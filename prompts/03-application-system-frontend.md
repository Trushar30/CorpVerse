# Prompt 1.2 — Application System Frontend

## Context
The backend now handles job applications with AI-powered ATS screening (Prompt 02). The frontend already has:
- `Dashboard.jsx` (Job Seeker) with company browsing and an "Apply Now" button
- `frontend/src/api/applications.js` with API functions defined
- A 4-stage pipeline visualization that currently shows dummy data

## Objective
Connect the Job Seeker dashboard to the real application backend. Build the complete apply → screen → track → feedback flow.

---

## Task 1: Update Job Application Flow in Job Seeker Dashboard

**File**: `frontend/src/pages/dashboards/JobSeekerDashboard.jsx` (moved from `Dashboard.jsx`)

### 1.1 — Apply Button Integration
When user clicks "Apply Now" on a role listing:
1. Check if user has uploaded a resume. If not, show a modal prompting them to upload first (link to profile/onboarding)
2. Show a confirmation modal with role details:
   ```
   ┌─────────────────────────────────────────┐
   │  ⚡ APPLY FOR ROLE                       │
   │                                          │
   │  Role: Frontend Developer                │
   │  Company: TechNova Corp                  │
   │  Level: Junior                           │
   │  Domain: Technology                      │
   │                                          │
   │  Your resume will be screened by our     │
   │  AI-powered ATS system. You'll receive   │
   │  detailed feedback regardless of result. │
   │                                          │
   │  [CANCEL]          [SUBMIT APPLICATION]  │
   └─────────────────────────────────────────┘
   ```
3. On submit, call `createApplication({ roleId })` 
4. Show a loading state: "⚙ Submitting application... ATS screening in progress"
5. On success, navigate to the Application Progress tab with the new application highlighted
6. On error (cooldown, duplicate, no resume), show the specific error message

### 1.2 — Resume Check Before Apply
Before allowing application:
```javascript
const canApply = user.resumeUrl || user.resumeMetadata;
if (!canApply) {
  showModal({
    title: 'Resume Required',
    message: 'Upload your resume to apply for roles. Your resume will be screened by our AI ATS system.',
    action: () => navigate('/onboarding'), // or open resume upload modal
  });
  return;
}
```

---

## Task 2: Application Tracking Pipeline

### 2.1 — Real Application Data
Replace the dummy pipeline visualization with real data from `GET /api/applications/me`:

```javascript
useEffect(() => {
  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data } = await getMyApplications();
      setApplications(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };
  fetchApplications();
}, []);
```

### 2.2 — Application Pipeline Visualization
Design a visual pipeline that shows each application's journey:

```
┌──────────────────────────────────────────────────────────────┐
│  APPLICATION TRACKER                                         │
│                                                              │
│  Frontend Developer @ TechNova Corp                          │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐            │
│  │  ATS   │──│SCREEN  │──│INTERV. │──│ OFFER  │            │
│  │SUBMIT  │  │RESULT  │  │ ROUND  │  │ STAGE  │            │
│  │  ✅    │  │  ✅    │  │  🔵    │  │  ⬜    │            │
│  └────────┘  └────────┘  └────────┘  └────────┘            │
│  Applied: Sep 3   Score: 78/100   Status: Interview Phase    │
│                                                              │
│  [VIEW FEEDBACK]  [START INTERVIEW]                          │
└──────────────────────────────────────────────────────────────┘
```

Status mapping for pipeline stages:
- `pending_screening` → Stage 1 active (pulsing animation)
- `screening_passed` → Stage 1 ✅, Stage 2 ✅, Stage 3 ready
- `screening_rejected` → Stage 1 ✅, Stage 2 ❌ with feedback button
- `interview_in_progress` → Stages 1-2 ✅, Stage 3 active
- `interview_passed` → Stages 1-3 ✅, Stage 4 ready
- `interview_rejected` → Stages 1-2 ✅, Stage 3 ❌ with feedback
- `offer_pending` → Stages 1-3 ✅, Stage 4 active
- `offer_accepted` → All ✅ with celebration animation

### 2.3 — Poll for Screening Results
Since screening runs asynchronously, poll for updates when status is `pending_screening`:

```javascript
useEffect(() => {
  const pendingApps = applications.filter(a => a.status === 'pending_screening');
  if (pendingApps.length === 0) return;
  
  const interval = setInterval(async () => {
    const { data } = await getMyApplications();
    setApplications(data.data);
    // Stop polling if no more pending
    if (!data.data.some(a => a.status === 'pending_screening')) {
      clearInterval(interval);
    }
  }, 5000); // Poll every 5 seconds
  
  return () => clearInterval(interval);
}, [applications]);
```

---

## Task 3: Rejection Feedback Modal

When an application is rejected at any stage, show a detailed feedback modal:

```
┌─────────────────────────────────────────────────┐
│  📊 SCREENING FEEDBACK — Frontend Developer     │
│                                                  │
│  ATS Match Score: 42/100                         │
│  Verdict: NEEDS IMPROVEMENT                      │
│                                                  │
│  ┌─ STRENGTHS ──────────────────────────────┐   │
│  │ • Strong JavaScript fundamentals          │   │
│  │ • Good project portfolio                  │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ┌─ AREAS TO IMPROVE ──────────────────────┐    │
│  │ • Resume lacks quantifiable achievements  │   │
│  │ • Missing TypeScript experience           │   │
│  │ • No mention of testing frameworks        │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ┌─ RECOMMENDED ACTIONS ───────────────────┐    │
│  │ 1. Add metrics to project descriptions    │   │
│  │ 2. Complete a TypeScript certification    │   │
│  │ 3. Add testing experience to resume       │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ⏰ You can re-apply in 7 days (Sep 12, 2026)   │
│                                                  │
│  [CLOSE]              [UPDATE RESUME & RETRY]    │
└─────────────────────────────────────────────────┘
```

**Component**: `frontend/src/components/modals/FeedbackModal.jsx`

Display data from `application.feedbacks[]`:
- `stage`: Which stage (screening, interview)
- `score`: Numeric score
- `feedbackText`: Overall assessment
- `strengths`: Array of strong points
- `improvements`: Array of things to improve

---

## Task 4: Application Count Badge

Show active application count in the Navbar and on the "Application Progress" tab:
```javascript
// In Navbar, next to the user's role badge
<span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full">
  {activeApplicationCount} Active
</span>
```

---

## Task 5: Empty States

### No Applications Yet
```
┌──────────────────────────────────────────┐
│          🎯 NO APPLICATIONS YET          │
│                                          │
│  Browse companies and roles in the       │
│  AI Market tab, then click "Apply Now"   │
│  to start your hiring journey!           │
│                                          │
│  [BROWSE ROLES →]                        │
└──────────────────────────────────────────┘
```

### Cooldown Active
If user tries to apply to a role they were rejected from and cooldown is active:
```
⏰ You're on cooldown for this role.
You can re-apply on Sep 12, 2026.
Review the feedback to improve your chances!
```

---

## Acceptance Criteria
- [ ] "Apply Now" button checks for resume before submitting
- [ ] Application submission calls real API and shows loading state
- [ ] Application Progress tab shows real applications from API
- [ ] Pipeline visualization accurately reflects application status
- [ ] Polling updates status when screening completes
- [ ] Rejection feedback modal displays all feedback fields
- [ ] Cooldown message shows when re-applying too soon
- [ ] Empty states display when no applications exist
- [ ] Error states handled gracefully (network errors, API errors)
- [ ] Application count badge shows in Navbar
- [ ] Matches the retro pixel arcade theme of the platform
