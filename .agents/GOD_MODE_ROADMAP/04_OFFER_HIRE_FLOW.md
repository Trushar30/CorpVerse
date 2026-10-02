# Module 4 — Offer → Hire → Employee Transition

> **Priority:** 🟠 HIGH (bridges interview completion to employee lifecycle)
> **Difficulty:** Medium
> **Estimated Time:** 3-4 hours
> **Cost:** $0

---

## The Transition Flow

```
Interview PASSED
     │
     ▼
Application.status = "offer_pending"
     │     (Offer card appears in Candidate Dashboard)
     │
     ├── ACCEPT OFFER
     │       │
     │       ▼
     │   Application.status = "offer_accepted"
     │       │
     │       ▼
     │   EmployeeRecord CREATED (user, company, role, level: 'junior')
     │       │
     │       ▼
     │   User.role = "working"
     │   User.currentStatus = "employee"
     │       │
     │       ▼
     │   Role.filledCount += 1
     │   (if filledCount >= maxOpenings → Role.isOpen = false)
     │       │
     │       ▼
     │   3 starter tasks auto-assigned from Task seed pool
     │       │
     │       ▼
     │   User redirected to /dashboard/working
     │
     └── DECLINE OFFER
             │
             ▼
         Application.status = "offer_declined"
         (User stays as job_seeker, can apply elsewhere)
```

---

## Backend Implementation

### Update: `backend/src/controllers/interview.controller.js`

In the `sendMessage` function, after the verdict is calculated and `interview_passed` is set, **auto-create the offer**:

```javascript
// After setting application.status = 'interview_passed':
if (verdict.passed) {
  application.status = 'offer_pending'; // Changed from interview_passed
  // The offer is now ready for the candidate to accept/decline
}
```

Alternatively, keep `interview_passed` and add a separate endpoint to generate the offer. The simpler approach is to go directly to `offer_pending`.

---

### Update: `backend/src/controllers/application.controller.js`

The `acceptOffer` function needs real employee creation logic:

```javascript
const { Application, Role, Company, User, EmployeeRecord, Task } = require('../models');

/**
 * POST /api/applications/:id/accept-offer
 * Accept offer → Create EmployeeRecord → Transition user to working role → Assign starter tasks.
 */
const acceptOffer = asyncHandler(async (req, res) => {
  const application = await Application.findOne({
    _id: req.params.id,
    user: req.user._id,
    status: 'offer_pending',
  }).populate('role');

  if (!application) {
    throw ApiError.notFound('No pending offer found for this application');
  }

  const role = application.role;
  if (!role) throw ApiError.notFound('Role associated with offer no longer exists');

  const company = await Company.findById(role.company);
  if (!company) throw ApiError.notFound('Company no longer exists');

  // 1. Create EmployeeRecord
  const employeeRecord = await EmployeeRecord.create({
    user: req.user._id,
    company: company._id,
    role: role._id,
    employmentStatus: 'active',
    currentLevel: 'junior',
  });

  // 2. Transition user role
  await User.findByIdAndUpdate(req.user._id, {
    role: 'working',
    currentStatus: 'employee',
    $inc: { expTotal: 100 }, // Hiring bonus!
  });

  // 3. Update role fill count
  role.filledCount = (role.filledCount || 0) + 1;
  if (role.filledCount >= role.maxOpenings) {
    role.isOpen = false;
  }
  await role.save();

  // 4. Update application status
  application.status = 'offer_accepted';
  await application.save();

  // 5. Auto-assign 3 starter tasks
  const starterTasks = generateStarterTasks(role, company);
  const createdTasks = await Task.insertMany(
    starterTasks.map((t) => ({
      ...t,
      employeeRecord: employeeRecord._id,
    }))
  );

  ApiResponse.ok({
    employeeRecord,
    company: { name: company.name, domain: company.domain },
    role: { title: role.title, level: employeeRecord.currentLevel },
    tasksAssigned: createdTasks.length,
    expAwarded: 100,
  }, `🎉 Welcome to ${company.name}! You're now a Junior ${role.title}. +100 EXP hiring bonus!`).send(res);
});
```

### Task Auto-Assignment Helper

```javascript
/**
 * Generate 3 domain-appropriate starter tasks for new employees.
 */
function generateStarterTasks(role, company) {
  const domain = role.domain || company.domain || 'Technology';

  const tasksByDomain = {
    Technology: [
      { title: 'Complete Development Environment Setup', description: 'Set up your local development environment, install required dependencies, and verify all build processes run successfully.', difficulty: 'easy', expReward: 15, category: 'Onboarding' },
      { title: 'Review Codebase Architecture Documentation', description: 'Read through the existing codebase architecture docs. Write a 200-word summary of the tech stack and key design patterns used.', difficulty: 'easy', expReward: 20, category: 'Knowledge' },
      { title: 'Fix a Starter Bug from the Issue Tracker', description: 'Pick a "good-first-issue" labeled bug from the tracker. Debug, fix, and submit a clean pull request with tests.', difficulty: 'medium', expReward: 35, category: 'Engineering' },
    ],
    'Clean Energy': [
      { title: 'Audit Current Energy Dashboard Metrics', description: 'Review all metrics displayed on the energy monitoring dashboard. Document any data gaps or inaccuracies.', difficulty: 'easy', expReward: 15, category: 'Audit' },
      { title: 'Research Renewable Integration Standards', description: 'Compile a brief on ISO 50001 energy management standards relevant to our smart grid operations.', difficulty: 'easy', expReward: 20, category: 'Research' },
      { title: 'Optimize Sensor Data Pipeline Latency', description: 'Profile the IoT sensor ingestion pipeline. Identify bottlenecks and propose optimizations for sub-second processing.', difficulty: 'medium', expReward: 35, category: 'Engineering' },
    ],
    Healthcare: [
      { title: 'Complete HIPAA Compliance Training Module', description: 'Complete the internal HIPAA compliance training and pass the assessment quiz with 90%+ score.', difficulty: 'easy', expReward: 15, category: 'Compliance' },
      { title: 'Map Patient Data Flow Architecture', description: 'Document the end-to-end data flow from patient intake forms to the analytics dashboard.', difficulty: 'easy', expReward: 20, category: 'Documentation' },
      { title: 'Build Data Validation Layer for Lab Results', description: 'Implement input validation and sanitization for the lab results API endpoint with comprehensive test coverage.', difficulty: 'medium', expReward: 35, category: 'Engineering' },
    ],
    Finance: [
      { title: 'Review Regulatory Compliance Checklist', description: 'Audit the current compliance checklist against SOX and PCI-DSS requirements. Flag any gaps.', difficulty: 'easy', expReward: 15, category: 'Compliance' },
      { title: 'Analyze Transaction Processing Metrics', description: 'Pull the last 30 days of transaction processing metrics. Create a summary with latency p50/p95/p99 breakdowns.', difficulty: 'easy', expReward: 20, category: 'Analytics' },
      { title: 'Implement Rate Limiter for Trading API', description: 'Design and implement a token-bucket rate limiter for the high-frequency trading API endpoint.', difficulty: 'medium', expReward: 35, category: 'Engineering' },
    ],
    'Design & Media': [
      { title: 'Audit Design System Component Library', description: 'Review all existing UI components for visual consistency, accessibility (WCAG AA), and responsive behavior.', difficulty: 'easy', expReward: 15, category: 'Audit' },
      { title: 'Create Brand Guidelines Quick Reference', description: 'Compile a 1-page visual quick reference card covering typography, color palette, spacing, and icon usage.', difficulty: 'easy', expReward: 20, category: 'Design' },
      { title: 'Redesign the Onboarding Flow Wireframes', description: 'Create high-fidelity wireframes for an improved user onboarding experience with micro-interaction annotations.', difficulty: 'medium', expReward: 35, category: 'Design' },
    ],
  };

  return tasksByDomain[domain] || tasksByDomain['Technology'];
}
```

---

## Frontend: Offer Card in Candidate Dashboard

When `application.status === 'offer_pending'`, show an epic offer card:

```jsx
{app.status === 'offer_pending' && (
  <div className="bg-gradient-to-r from-violet-500/10 via-emerald-500/5 to-cyan-500/10 border-2 border-emerald-500/40 rounded-xl p-6 shadow-[0_0_30px_rgba(0,245,160,0.15)]">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center animate-pulse">
        <Gift className="w-5 h-5 text-emerald-400" />
      </div>
      <div>
        <h3 className="text-sm font-extrabold text-emerald-300">🎉 OFFER RECEIVED</h3>
        <p className="text-[10px] text-slate-400">{app.role?.company?.name} • {app.role?.title}</p>
      </div>
    </div>

    <p className="text-xs text-slate-300 mb-4">
      Congratulations! You've been selected for the <span className="text-emerald-400 font-bold">{app.role?.title}</span> position.
      Accept to begin your journey as a Junior professional.
    </p>

    <div className="flex gap-3">
      <button onClick={() => handleAcceptOffer(app._id)}
        className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg shadow-[0_0_15px_rgba(0,245,160,0.3)] transition-all flex items-center justify-center gap-2">
        <CheckCircle2 className="w-4 h-4" /> ACCEPT OFFER
      </button>
      <button onClick={() => handleDeclineOffer(app._id)}
        className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-700 font-bold text-xs rounded-lg transition-all">
        Decline
      </button>
    </div>
  </div>
)}
```

### Accept Handler

```javascript
const handleAcceptOffer = async (applicationId) => {
  try {
    const res = await acceptOffer(applicationId);
    showToast(res.message || '🎉 Welcome aboard! Redirecting to your workspace...');

    // Refresh user to get updated role
    await refreshUser();

    // After refreshUser, the ProtectedRoute + DashboardRouter will
    // automatically redirect to /dashboard/working
  } catch (err) {
    showToast(`❌ ${err.response?.data?.message || err.message}`);
  }
};
```

---

## Verification Checklist

- [ ] After interview passes, Application.status becomes `offer_pending`
- [ ] Offer card appears in Candidate Dashboard with Accept/Decline buttons
- [ ] Accept creates `EmployeeRecord` in MongoDB (status: active, level: junior)
- [ ] User.role transitions from `job_seeker` to `working`
- [ ] User.currentStatus transitions to `employee`
- [ ] Role.filledCount increments (closes role if all openings filled)
- [ ] 3 domain-appropriate starter tasks are auto-assigned
- [ ] +100 EXP hiring bonus is awarded
- [ ] User is redirected to `/dashboard/working` after accepting
- [ ] Decline sets status to `offer_declined`, user stays as job_seeker
- [ ] All transitions persist across page reloads
