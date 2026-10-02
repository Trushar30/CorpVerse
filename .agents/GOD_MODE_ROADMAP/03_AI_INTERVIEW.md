# Module 3 — AI Interview Chat System

> **Priority:** 🔴 CRITICAL (the centerpiece feature of CorpVerse)
> **Difficulty:** High
> **Estimated Time:** 5-6 hours
> **Cost:** $0 (Groq free tier for Llama 3.1 70B)

---

## Architecture: Multi-Turn Contextual Interview

```
Candidate clicks "Begin Interview" (after screening_passed)
        │
        ▼
Interview document created (status: in_progress, maxTurns: 10)
        │
        ▼
AI sends opening question (contextual to role + resume)
        │
        ▼
┌──────────────────────────────────────────────┐
│   CHAT LOOP (max 10 turns)                   │
│                                              │
│   User types answer → saved to transcript    │
│          │                                   │
│          ▼                                   │
│   AI evaluates + asks next question          │
│          │                                   │
│          ▼                                   │
│   Repeat until maxTurns reached              │
└──────────────────────────────────────────────┘
        │
        ▼
AI generates final verdict (passed/failed + evaluationNotes)
        │
        ├── Pass → Application.status = interview_passed → Offer stage
        └── Fail → Application.status = interview_rejected + 48hr cooldown
```

---

## Backend Implementation

### File: `backend/src/controllers/interview.controller.js` (FULL REWRITE)

```javascript
const { Interview, Application, Role, User } = require('../models');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const config = require('../config');

/**
 * POST /api/interviews/:applicationId/start
 * Initialize an interview session after screening is passed.
 */
const startInterview = asyncHandler(async (req, res) => {
  const application = await Application.findOne({
    _id: req.params.applicationId,
    user: req.user._id,
    status: 'screening_passed',
  }).populate({
    path: 'role',
    populate: { path: 'company', select: 'name domain' },
  });

  if (!application) {
    throw ApiError.notFound('No screened application found. Complete screening first.');
  }

  // Check if interview already exists
  let interview = await Interview.findOne({ application: application._id });
  if (interview) {
    return ApiResponse.ok(interview, 'Interview already in progress. Continue chatting.').send(res);
  }

  // Get candidate resume for context
  const candidate = await User.findById(req.user._id);
  const role = application.role;

  // Generate contextual opening question
  const openingMessage = await generateAIMessage({
    role: role,
    company: role.company,
    resumeText: candidate.resumeText,
    transcript: [],
    isOpening: true,
  });

  // Create interview with opening AI message
  interview = await Interview.create({
    application: application._id,
    transcript: [
      {
        role: 'ai',
        message: openingMessage,
      },
    ],
    totalTurns: 0,
    maxTurns: 10,
    result: 'in_progress',
  });

  // Update application status
  application.status = 'interview_in_progress';
  await application.save();

  ApiResponse.created({
    interview,
    role: { title: role.title, domain: role.domain, company: role.company?.name },
  }, 'Interview started! Answer the AI interviewer\'s questions.').send(res);
});

/**
 * POST /api/interviews/:applicationId/message
 * Send a message in the ongoing interview chat.
 */
const sendMessage = asyncHandler(async (req, res) => {
  const { message } = req.body;
  if (!message || !message.trim()) {
    throw ApiError.badRequest('Message cannot be empty');
  }

  const application = await Application.findOne({
    _id: req.params.applicationId,
    user: req.user._id,
    status: 'interview_in_progress',
  }).populate({
    path: 'role',
    populate: { path: 'company', select: 'name domain' },
  });

  if (!application) {
    throw ApiError.notFound('No active interview found for this application');
  }

  const interview = await Interview.findOne({ application: application._id });
  if (!interview) throw ApiError.notFound('Interview session not found');

  if (interview.result !== 'in_progress') {
    throw ApiError.badRequest('This interview has already been completed');
  }

  // Add user message
  interview.transcript.push({
    role: 'user',
    message: message.trim(),
  });
  interview.totalTurns += 1;

  const candidate = await User.findById(req.user._id);

  // Check if this is the final turn
  if (interview.totalTurns >= interview.maxTurns) {
    // Generate final evaluation
    const verdict = await generateFinalVerdict({
      role: application.role,
      company: application.role.company,
      resumeText: candidate.resumeText,
      transcript: interview.transcript,
    });

    interview.transcript.push({
      role: 'ai',
      message: verdict.closingMessage,
    });

    interview.result = verdict.passed ? 'passed' : 'failed';
    interview.evaluationNotes = verdict.evaluationNotes;
    interview.completedAt = new Date();
    await interview.save();

    // Update application status
    if (verdict.passed) {
      application.status = 'interview_passed';
    } else {
      application.status = 'interview_rejected';
      application.cooldownUntil = new Date(Date.now() + config.game.cooldownHours * 60 * 60 * 1000);
    }

    // Save interview feedback to application
    application.feedbacks.push({
      stage: 'interview',
      feedbackText: verdict.evaluationNotes,
      strengths: verdict.strengths || [],
      improvements: verdict.improvements || [],
      score: verdict.score,
    });
    await application.save();

    // Award EXP
    const expReward = verdict.passed ? 50 : 15;
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { expTotal: expReward },
    });

    return ApiResponse.ok({
      interview,
      verdict: {
        passed: verdict.passed,
        score: verdict.score,
        evaluationNotes: verdict.evaluationNotes,
      },
      expAwarded: expReward,
    }, verdict.passed
      ? `🎉 Interview PASSED! Score: ${verdict.score}/100. Offer stage unlocked! +${expReward} EXP`
      : `Interview completed. Score: ${verdict.score}/100. +${expReward} EXP`
    ).send(res);
  }

  // Generate next AI question
  const aiResponse = await generateAIMessage({
    role: application.role,
    company: application.role.company,
    resumeText: candidate.resumeText,
    transcript: interview.transcript,
    isOpening: false,
    turnsRemaining: interview.maxTurns - interview.totalTurns,
  });

  interview.transcript.push({
    role: 'ai',
    message: aiResponse,
  });

  await interview.save();

  ApiResponse.ok({
    interview,
    turnsRemaining: interview.maxTurns - interview.totalTurns,
  }, `Turn ${interview.totalTurns}/${interview.maxTurns} recorded`).send(res);
});

/**
 * GET /api/interviews/:applicationId
 * Get the current interview state and transcript.
 */
const getInterview = asyncHandler(async (req, res) => {
  const application = await Application.findOne({
    _id: req.params.applicationId,
    user: req.user._id,
  });
  if (!application) throw ApiError.notFound('Application not found');

  const interview = await Interview.findOne({ application: application._id });
  if (!interview) throw ApiError.notFound('No interview found for this application');

  ApiResponse.ok(interview, 'Interview retrieved').send(res);
});

/**
 * GET /api/interviews/:applicationId/result
 * Get the final interview result and feedback.
 */
const getInterviewResult = asyncHandler(async (req, res) => {
  const application = await Application.findOne({
    _id: req.params.applicationId,
    user: req.user._id,
  });
  if (!application) throw ApiError.notFound('Application not found');

  const interview = await Interview.findOne({ application: application._id });
  if (!interview) throw ApiError.notFound('No interview found');

  if (interview.result === 'in_progress') {
    return ApiResponse.ok({ status: 'in_progress', turnsRemaining: interview.maxTurns - interview.totalTurns },
      'Interview is still in progress').send(res);
  }

  ApiResponse.ok({
    result: interview.result,
    evaluationNotes: interview.evaluationNotes,
    totalTurns: interview.totalTurns,
    completedAt: interview.completedAt,
    transcript: interview.transcript,
  }, 'Interview result retrieved').send(res);
});

// ─────────────────────────────────────────────────────
// AI MESSAGE GENERATION (Groq Free Tier or Fallback)
// ─────────────────────────────────────────────────────

async function generateAIMessage({ role, company, resumeText, transcript, isOpening, turnsRemaining }) {
  const groqApiKey = process.env.GROQ_API_KEY;

  // Try Groq LLM first
  if (groqApiKey) {
    try {
      const result = await callGroqChat({
        systemPrompt: buildInterviewerSystemPrompt(role, company, resumeText, turnsRemaining),
        transcript,
        isOpening,
      });
      if (result) return result;
    } catch {
      // Fall through to rule-based
    }
  }

  // Fallback: Smart rule-based questions
  return generateRuleBasedQuestion(role, transcript, isOpening, turnsRemaining);
}

async function generateFinalVerdict({ role, company, resumeText, transcript }) {
  const groqApiKey = process.env.GROQ_API_KEY;

  if (groqApiKey) {
    try {
      const result = await callGroqVerdict(role, company, resumeText, transcript);
      if (result) return result;
    } catch {
      // Fall through
    }
  }

  return generateRuleBasedVerdict(transcript);
}

// ─── Groq API Calls ─────────────────────────────

async function callGroqChat({ systemPrompt, transcript, isOpening }) {
  const messages = [{ role: 'system', content: systemPrompt }];

  if (isOpening) {
    messages.push({ role: 'user', content: 'Begin the interview with your opening question.' });
  } else {
    // Convert transcript to OpenAI message format
    for (const msg of transcript) {
      messages.push({
        role: msg.role === 'ai' ? 'assistant' : 'user',
        content: msg.message,
      });
    }
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-70b-versatile',
      messages,
      max_tokens: 400,
      temperature: 0.8,
    }),
    signal: AbortSignal.timeout(12000),
  });

  if (response.ok) {
    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  }
  return null;
}

async function callGroqVerdict(role, company, resumeText, transcript) {
  const transcriptStr = transcript.map(m =>
    `[${m.role.toUpperCase()}]: ${m.message}`
  ).join('\n\n');

  const systemPrompt = `You are a senior technical hiring manager at ${company?.name || 'a top startup'}. You just completed a ${role?.title || 'technical'} interview. Evaluate the candidate's performance.

Return your evaluation in this EXACT JSON format (nothing else):
{
  "passed": true/false,
  "score": 0-100,
  "closingMessage": "Your closing remarks to the candidate (2-3 sentences, professional tone)",
  "evaluationNotes": "Detailed evaluation paragraph (4-5 sentences)",
  "strengths": ["strength1", "strength2"],
  "improvements": ["area1", "area2"]
}

Scoring guide: 70+ = pass, below 70 = fail.
Be fair but rigorous. Evaluate: technical depth, communication clarity, problem-solving approach, and role fit.`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `INTERVIEW TRANSCRIPT:\n\n${transcriptStr}\n\nRESUME EXCERPT:\n${(resumeText || '').slice(0, 1000)}` },
      ],
      max_tokens: 600,
      temperature: 0.3,
      response_format: { type: 'json_object' },
    }),
    signal: AbortSignal.timeout(15000),
  });

  if (response.ok) {
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  }
  return null;
}

// ─── Rule-Based Fallback ────────────────────────

function buildInterviewerSystemPrompt(role, company, resumeText, turnsRemaining) {
  return `You are a professional AI interviewer at "${company?.name || 'CorpVerse Startup'}". You are interviewing a candidate for the "${role?.title || 'Software Engineer'}" position in the ${role?.domain || 'Technology'} domain.

Key requirements for this role: ${(role?.requirements || []).join(', ')}

The candidate's resume summary: ${(resumeText || 'Not available').slice(0, 800)}

Interview rules:
- Ask ONE clear, focused question per turn
- Mix technical and behavioral questions
- Evaluate depth of answers, not just surface-level correctness
- Be professional, warm, and encouraging
- ${turnsRemaining ? `You have ${turnsRemaining} questions remaining` : 'This is your opening question'}
- Do NOT reveal the scoring criteria
- Keep responses under 150 words`;
}

const QUESTION_BANK = {
  technical: [
    'Walk me through how you would design a scalable API endpoint that handles 10,000 concurrent requests. What technologies would you choose and why?',
    'Describe a challenging technical problem you solved recently. What was your debugging approach?',
    'How do you ensure code quality in a fast-moving team? What testing strategies do you advocate for?',
    'Explain the trade-offs between SQL and NoSQL databases. When would you choose each?',
    'How would you approach optimizing a slow database query that takes 5 seconds to return results?',
  ],
  behavioral: [
    'Tell me about a time you disagreed with a team member on a technical decision. How did you resolve it?',
    'Describe a project where you had to learn a completely new technology under time pressure. What was your approach?',
    'How do you prioritize tasks when multiple urgent deadlines are competing for your attention?',
    'Tell me about a time you received critical feedback. How did you respond and what changed?',
  ],
  situational: [
    'Your team just deployed to production and users are reporting a critical bug. Walk me through your incident response process.',
    'You\'re asked to estimate a project that has ambiguous requirements. How would you handle the estimation and communicate uncertainty?',
    'A junior developer on your team keeps submitting pull requests with the same recurring issues. How would you mentor them?',
  ],
};

function generateRuleBasedQuestion(role, transcript, isOpening, turnsRemaining) {
  if (isOpening) {
    return `Welcome to your interview for the ${role?.title || 'Software Engineer'} position at ${role?.company?.name || 'our company'}! I'm your AI interviewer today. We'll have a focused conversation to understand your skills, experience, and problem-solving approach. This interview consists of 10 questions.\n\nLet's start: ${QUESTION_BANK.behavioral[0]}`;
  }

  const turnIndex = transcript.filter(m => m.role === 'ai').length;
  const allQuestions = [
    ...QUESTION_BANK.technical,
    ...QUESTION_BANK.behavioral,
    ...QUESTION_BANK.situational,
  ];

  const question = allQuestions[turnIndex % allQuestions.length];
  const prefix = turnsRemaining <= 2 ? `We're nearing the end of our interview. ` : `Great response. `;

  return `${prefix}Next question: ${question}`;
}

function generateRuleBasedVerdict(transcript) {
  const userMessages = transcript.filter(m => m.role === 'user');
  const avgLength = userMessages.reduce((sum, m) => sum + m.message.length, 0) / (userMessages.length || 1);
  const totalWords = userMessages.reduce((sum, m) => sum + m.message.split(' ').length, 0);

  // Simple heuristic scoring
  let score = 50;
  if (avgLength > 200) score += 15; // Detailed responses
  if (avgLength > 100) score += 10;
  if (totalWords > 300) score += 10;
  if (userMessages.length >= 8) score += 5; // Completed most turns
  if (totalWords > 500) score += 5;

  score = Math.min(score, 95);
  const passed = score >= 70;

  return {
    passed,
    score,
    closingMessage: passed
      ? `Thank you for a great interview! Your responses demonstrated solid technical knowledge and clear communication. We're pleased to advance you to the offer stage.`
      : `Thank you for your time today. While you showed potential, we'd recommend gaining more hands-on experience with the core technologies before reapplying. You may reapply after the cooldown period.`,
    evaluationNotes: `Candidate completed ${userMessages.length} interview turns with an average response length of ${Math.round(avgLength)} characters. ${passed ? 'Responses showed depth and practical understanding.' : 'Responses could benefit from more technical detail and specific examples.'}`,
    strengths: passed
      ? ['Clear communication', 'Adequate technical depth', 'Professional demeanor']
      : ['Willingness to attempt all questions'],
    improvements: passed
      ? ['Could provide more concrete examples']
      : ['Provide more detailed technical explanations', 'Include specific project examples', 'Demonstrate deeper system design thinking'],
  };
}

module.exports = { startInterview, sendMessage, getInterview, getInterviewResult };
```

### Route Update: `backend/src/routes/interview.routes.js`

```javascript
const express = require('express');
const router = express.Router();
const {
  startInterview,
  sendMessage,
  getInterview,
  getInterviewResult,
} = require('../controllers/interview.controller');
const { requireAuth, requireProfile } = require('../middleware/auth');

router.use(requireAuth, requireProfile);

router.post('/:applicationId/start', startInterview);
router.post('/:applicationId/message', sendMessage);
router.get('/:applicationId', getInterview);
router.get('/:applicationId/result', getInterviewResult);

module.exports = router;
```

---

## Frontend: Interview Chat Screen

### New File: `frontend/src/pages/InterviewChat.jsx`

This is a **full chat UI** — terminal-aesthetic, real-time messages, turn counter. Key features:

1. **Opening message** from AI displayed immediately on load
2. **Message input** with send button — disabled during AI response
3. **Turn counter** (e.g., "Turn 3/10") with progress bar
4. **Typing indicator** while waiting for AI response
5. **Final verdict card** when interview completes (pass/fail with score)

The component should:
- Call `POST /api/interviews/:appId/start` on mount
- Call `POST /api/interviews/:appId/message` for each user message
- Display the full transcript from `interview.transcript[]`
- Show verdict when `interview.result !== 'in_progress'`

### Frontend API Helper: `frontend/src/api/interviews.js`

```javascript
import api from './client';

export const startInterview = (applicationId) =>
  api.post(`/interviews/${applicationId}/start`).then(r => r.data);

export const sendInterviewMessage = (applicationId, message) =>
  api.post(`/interviews/${applicationId}/message`, { message }).then(r => r.data);

export const getInterview = (applicationId) =>
  api.get(`/interviews/${applicationId}`).then(r => r.data);

export const getInterviewResult = (applicationId) =>
  api.get(`/interviews/${applicationId}/result`).then(r => r.data);
```

---

## God Mode UI Design Guidelines

The interview chat should feel like a **high-stakes terminal interrogation room**:

- **Dark glass panel** (`bg-[#0F1424]`) with border glow
- AI messages: left-aligned, emerald accent, with a `Bot` icon
- User messages: right-aligned, cyan accent
- Turn counter: animated progress bar (`Turn 7/10`)
- **Typing indicator**: 3 pulsing dots with emerald glow while AI responds
- **Verdict screen**: full-width card with pass/fail animation
  - Pass: emerald glow explosion, confetti-style sparkles
  - Fail: subtle red pulse, encouraging tone

---

## Verification Checklist

- [ ] `POST /api/interviews/:appId/start` creates Interview document with AI opening question
- [ ] `POST /api/interviews/:appId/message` adds user message + generates AI follow-up
- [ ] After 10 turns, AI generates final verdict (pass/fail + score)
- [ ] Groq LLM generates contextual questions based on role + resume
- [ ] If Groq is unavailable, rule-based question bank provides quality fallback
- [ ] Verdict updates Application status to `interview_passed` or `interview_rejected`
- [ ] 48hr cooldown applied on rejection
- [ ] Interview feedback saved to Application.feedbacks[]
- [ ] EXP awarded (+50 pass, +15 fail)
- [ ] Frontend chat UI renders full transcript with proper styling
- [ ] Turn counter and progress bar are visible
- [ ] Verdict screen shows score, strengths, improvements
