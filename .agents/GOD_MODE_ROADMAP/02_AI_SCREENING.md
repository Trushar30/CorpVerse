# Module 2 — AI Resume Screening Engine

> **Priority:** 🔴 CRITICAL (unlocks the interview stage)
> **Difficulty:** Medium-High
> **Estimated Time:** 4-5 hours
> **Cost:** $0 (Groq free tier or pure rule-based fallback)

---

## Architecture: Dual-Layer Screening

The screening engine uses a **two-layer approach** to guarantee it works even without any LLM:

```
Layer 1: RULE-BASED SKILL MATCHER (always runs, instant, zero cost)
   │
   ├── Outputs: matchScore (0-100), matchedSkills[], missingSkills[]
   │
   ▼
Layer 2: FREE LLM FEEDBACK GENERATOR (optional enhancement)
   │
   ├── Uses: Groq Cloud Free Tier (Llama 3.1 70B) or HuggingFace
   ├── Input: resume text + role requirements + match score
   ├── Output: human-readable feedback paragraph, strengths[], improvements[]
   │
   ▼
Combined Result → saved as Application.feedbacks[0] (stage: 'screening')
```

**Key design decision:** The pass/fail verdict is **always determined by Layer 1** (deterministic, free, instant). Layer 2 only generates a prettier feedback message. If the LLM is down, the screener still works perfectly.

---

## Pass/Fail Logic

```
matchScore >= 60  →  PASS  →  status: screening_passed
matchScore < 60   →  FAIL  →  status: screening_rejected + 48hr cooldown
```

### Match Score Formula

```javascript
function calculateMatchScore(userSkills, roleRequirements, resumeText) {
  const normalizedUserSkills = userSkills.map(s => s.toLowerCase().trim());
  const normalizedReqs = roleRequirements.map(r => r.toLowerCase().trim());

  // 1. Direct skill match (70% weight)
  let directMatches = 0;
  const matchedSkills = [];
  const missingSkills = [];

  for (const req of normalizedReqs) {
    const found = normalizedUserSkills.some(skill =>
      skill.includes(req) || req.includes(skill)
    );
    if (found) {
      directMatches++;
      matchedSkills.push(req);
    } else {
      missingSkills.push(req);
    }
  }

  const directScore = normalizedReqs.length > 0
    ? (directMatches / normalizedReqs.length) * 70
    : 35; // Default if no requirements specified

  // 2. Resume keyword density (20% weight)
  const resumeLower = (resumeText || '').toLowerCase();
  let keywordHits = 0;
  for (const req of normalizedReqs) {
    if (resumeLower.includes(req)) keywordHits++;
  }
  const keywordScore = normalizedReqs.length > 0
    ? (keywordHits / normalizedReqs.length) * 20
    : 10;

  // 3. Profile completeness bonus (10% weight)
  let completenessScore = 0;
  if (userSkills.length >= 3) completenessScore += 4;
  if (resumeText && resumeText.length > 100) completenessScore += 4;
  if (userSkills.length >= 5) completenessScore += 2;

  return {
    totalScore: Math.round(directScore + keywordScore + completenessScore),
    matchedSkills,
    missingSkills,
    breakdown: { directScore, keywordScore, completenessScore },
  };
}
```

---

## Backend Implementation

### New File: `backend/src/utils/screeningEngine.js`

```javascript
const config = require('../config');

/**
 * Rule-based resume screening engine.
 * Deterministic, instant, zero cost.
 */
function calculateMatchScore(userSkills, roleRequirements, resumeText) {
  const normalizedUserSkills = (userSkills || []).map(s => s.toLowerCase().trim());
  const normalizedReqs = (roleRequirements || []).map(r => r.toLowerCase().trim());

  // Direct skill match (70% weight)
  let directMatches = 0;
  const matchedSkills = [];
  const missingSkills = [];

  for (const req of normalizedReqs) {
    const found = normalizedUserSkills.some(skill =>
      skill.includes(req) || req.includes(skill)
    );
    if (found) {
      directMatches++;
      matchedSkills.push(req);
    } else {
      missingSkills.push(req);
    }
  }

  const directScore = normalizedReqs.length > 0
    ? (directMatches / normalizedReqs.length) * 70
    : 35;

  // Resume keyword density (20% weight)
  const resumeLower = (resumeText || '').toLowerCase();
  let keywordHits = 0;
  for (const req of normalizedReqs) {
    if (resumeLower.includes(req)) keywordHits++;
  }
  const keywordScore = normalizedReqs.length > 0
    ? (keywordHits / normalizedReqs.length) * 20
    : 10;

  // Profile completeness bonus (10% weight)
  let completenessScore = 0;
  if (normalizedUserSkills.length >= 3) completenessScore += 4;
  if (resumeText && resumeText.length > 100) completenessScore += 4;
  if (normalizedUserSkills.length >= 5) completenessScore += 2;

  return {
    totalScore: Math.round(directScore + keywordScore + completenessScore),
    matchedSkills,
    missingSkills,
    breakdown: { directScore: Math.round(directScore), keywordScore: Math.round(keywordScore), completenessScore },
  };
}

/**
 * Generate rule-based screening feedback (no LLM needed).
 */
function generateRuleBasedFeedback(matchResult, roleName, companyName) {
  const { totalScore, matchedSkills, missingSkills } = matchResult;
  const passed = totalScore >= 60;

  let feedbackText;
  if (passed) {
    feedbackText = `Congratulations! Your profile scored ${totalScore}/100 for the "${roleName}" position at ${companyName}. ` +
      `You demonstrated strong alignment with ${matchedSkills.length} of the core requirements. ` +
      (missingSkills.length > 0
        ? `Consider strengthening: ${missingSkills.join(', ')}. `
        : 'Your skills are an excellent match across the board. ') +
      `You have been advanced to the interview stage.`;
  } else {
    feedbackText = `Thank you for applying to "${roleName}" at ${companyName}. Your profile scored ${totalScore}/100. ` +
      `While you matched on ${matchedSkills.length > 0 ? matchedSkills.join(', ') : 'some areas'}, ` +
      `the role requires stronger proficiency in: ${missingSkills.join(', ')}. ` +
      `You may reapply after the ${config.game.cooldownHours}-hour cooldown period.`;
  }

  return {
    passed,
    feedbackText,
    strengths: matchedSkills.map(s => `Proficiency in ${s}`),
    improvements: missingSkills.map(s => `Develop skills in ${s}`),
  };
}

module.exports = { calculateMatchScore, generateRuleBasedFeedback };
```

### New File: `backend/src/utils/llmFeedback.js`

```javascript
const config = require('../config');

/**
 * Optional: Generate enhanced screening feedback via free LLM API.
 * Uses Groq Cloud free tier (Llama 3.1 70B) — 30 RPM, 14.4K RPD.
 * Falls back gracefully to null if unavailable.
 */
async function generateLLMFeedback({ resumeText, roleTitle, roleRequirements, matchScore, passed }) {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) return null; // No key configured — skip LLM

  const systemPrompt = `You are CorpVerse ATS, an elite AI talent screening system. Generate a professional, constructive screening result for a job candidate. Be specific and actionable. Keep response under 200 words.`;

  const userPrompt = `
ROLE: ${roleTitle}
REQUIREMENTS: ${(roleRequirements || []).join(', ')}
MATCH SCORE: ${matchScore}/100
VERDICT: ${passed ? 'PASSED — Advanced to Interview' : 'NOT PASSED — Cooldown Applied'}

CANDIDATE RESUME EXCERPT:
${(resumeText || '').slice(0, 1500)}

Generate a professional screening feedback with:
1. Overall assessment (2-3 sentences)
2. Strengths identified (bullet points)
3. Areas for improvement (bullet points)
4. ${passed ? 'What to expect in the interview stage' : 'Recommendations before reapplying'}
`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (response.ok) {
      const data = await response.json();
      return data.choices?.[0]?.message?.content || null;
    }
    return null;
  } catch {
    return null; // Graceful degradation
  }
}

module.exports = { generateLLMFeedback };
```

### New File: `backend/src/controllers/screening.controller.js`

```javascript
const { Application, Role, User } = require('../models');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { calculateMatchScore, generateRuleBasedFeedback } = require('../utils/screeningEngine');
const { generateLLMFeedback } = require('../utils/llmFeedback');
const config = require('../config');

/**
 * POST /api/applications/:id/screen
 * Trigger AI screening on a pending application.
 * Can be called manually or automatically after application creation.
 */
const screenApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate({
      path: 'role',
      populate: { path: 'company', select: 'name domain' },
    });

  if (!application) throw ApiError.notFound('Application not found');
  if (application.status !== 'pending_screening') {
    throw ApiError.badRequest('Application has already been screened');
  }

  // Get candidate data
  const candidate = await User.findById(application.user);
  if (!candidate) throw ApiError.notFound('Candidate not found');

  const role = application.role;
  const companyName = role.company?.name || 'Company';

  // Layer 1: Rule-based scoring
  const matchResult = calculateMatchScore(
    candidate.skills,
    role.requirements,
    candidate.resumeText
  );

  const ruleFeedback = generateRuleBasedFeedback(matchResult, role.title, companyName);

  // Layer 2: Optional LLM-enhanced feedback
  let llmFeedbackText = null;
  try {
    llmFeedbackText = await generateLLMFeedback({
      resumeText: candidate.resumeText,
      roleTitle: role.title,
      roleRequirements: role.requirements,
      matchScore: matchResult.totalScore,
      passed: ruleFeedback.passed,
    });
  } catch {
    // Silently skip LLM
  }

  // Build feedback object
  const feedback = {
    stage: 'screening',
    feedbackText: llmFeedbackText || ruleFeedback.feedbackText,
    strengths: ruleFeedback.strengths,
    improvements: ruleFeedback.improvements,
    score: matchResult.totalScore,
  };

  // Update application
  application.screeningScore = matchResult.totalScore;
  application.feedbacks.push(feedback);

  if (ruleFeedback.passed) {
    application.status = 'screening_passed';
  } else {
    application.status = 'screening_rejected';
    application.cooldownUntil = new Date(Date.now() + config.game.cooldownHours * 60 * 60 * 1000);
  }

  await application.save();

  // Award EXP for completing screening (+10 EXP pass, +5 EXP fail)
  const expReward = ruleFeedback.passed ? 10 : 5;
  await User.findByIdAndUpdate(candidate._id, {
    $inc: { expTotal: expReward },
  });

  ApiResponse.ok({
    application,
    screening: {
      score: matchResult.totalScore,
      passed: ruleFeedback.passed,
      matchedSkills: matchResult.matchedSkills,
      missingSkills: matchResult.missingSkills,
      breakdown: matchResult.breakdown,
    },
    expAwarded: expReward,
  }, ruleFeedback.passed
    ? `✅ Screening Passed (${matchResult.totalScore}/100)! Interview stage unlocked. +${expReward} EXP`
    : `❌ Screening Score: ${matchResult.totalScore}/100. ${config.game.cooldownHours}hr cooldown applied. +${expReward} EXP`
  ).send(res);
});

module.exports = { screenApplication };
```

### Route Update: `backend/src/routes/application.routes.js`

Add the screening endpoint:

```javascript
const { screenApplication } = require('../controllers/screening.controller');

// Add after existing routes:
router.post('/:id/screen', requireProfile, screenApplication);
```

---

## Auto-Trigger Screening After Application

In `application.controller.js`, after creating the application, you can optionally auto-trigger screening:

```javascript
// At the end of createApplication, after the application is saved:

// Auto-trigger screening (non-blocking)
const { screenApplication } = require('./screening.controller');
// Or call the screening logic directly inline:
try {
  const matchResult = calculateMatchScore(req.user.skills, role.requirements, req.user.resumeText);
  // ... apply screening result to application
} catch {
  // Let manual screening handle it
}
```

---

## Frontend: Screening Result UI

After applying, the Dashboard should show the screening result:

```jsx
{/* Screening Result Card */}
{app.status === 'screening_passed' && (
  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
      <CheckCircle2 className="w-4 h-4" />
      <span>SCREENING PASSED — Score: {app.screeningScore}/100</span>
    </div>
    <p className="text-xs text-slate-400 mt-2">{app.feedbacks?.[0]?.feedbackText}</p>
    <button onClick={() => startInterview(app._id)} className="mt-3 px-4 py-2 bg-emerald-500 ...">
      Begin AI Interview →
    </button>
  </div>
)}

{app.status === 'screening_rejected' && (
  <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-4">
    <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
      <XCircle className="w-4 h-4" />
      <span>SCREENING NOT PASSED — Score: {app.screeningScore}/100</span>
    </div>
    <p className="text-xs text-slate-400 mt-2">{app.feedbacks?.[0]?.feedbackText}</p>
    {app.cooldownUntil && (
      <p className="text-[10px] text-slate-500 mt-2">
        Reapply after: {new Date(app.cooldownUntil).toLocaleString()}
      </p>
    )}
  </div>
)}
```

---

## Free LLM Setup (Optional but Recommended)

### Groq Cloud — Free Tier

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up (free, no credit card)
3. Create an API key
4. Add to `backend/.env`:
   ```
   GROQ_API_KEY=gsk_xxxxxxxxxxxxx
   ```

**Free limits:** 30 requests/minute, 14,400/day, 500K tokens/minute — MORE than enough for a demo.

If no key is provided, the system uses the rule-based feedback automatically. Zero downtime.

---

## Verification Checklist

- [ ] `POST /api/applications/:id/screen` runs skill matching against role requirements
- [ ] Score ≥ 60 → `screening_passed`, Score < 60 → `screening_rejected`
- [ ] Rejected applications get 48hr `cooldownUntil` timestamp
- [ ] Feedback is saved in `Application.feedbacks[]` with `stage: 'screening'`
- [ ] LLM feedback enhances the response when Groq key is available
- [ ] System works perfectly without any LLM key (pure rule-based)
- [ ] EXP is awarded (+10 pass, +5 fail)
- [ ] Frontend displays pass/fail with score breakdown and feedback text
