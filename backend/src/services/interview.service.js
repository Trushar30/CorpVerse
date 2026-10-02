const Interview = require('../models/Interview');
const Application = require('../models/Application');
const Role = require('../models/Role');
const Company = require('../models/Company');
const ApiError = require('../utils/ApiError');
const aiService = require('./ai.service');
const {
  APPLICATION_STATUS,
  INTERVIEW_RESULT,
  FEEDBACK_STAGE,
  INTERVIEW,
} = require('../utils/constants');

// ─────────────────────────────────────────────────────
// INTERVIEW SERVICE
// Orchestrates the multi-turn AI interview lifecycle:
// start → message loop → evaluate → result
// ─────────────────────────────────────────────────────

class InterviewService {
  // ─── Helpers ──────────────────────────────────────

  /**
   * Generates a welcoming opening message for the interview.
   * @param {Object} role  - Role document (title, level, domain)
   * @param {Object} company - Company document (name)
   * @returns {string}
   */
  _generateOpeningMessage(role, company) {
    const companyName = company?.name || 'the company';
    const levelLabel = role.level
      ? role.level.charAt(0).toUpperCase() + role.level.slice(1)
      : '';
    const titleWithLevel = levelLabel
      ? `${levelLabel} ${role.title}`
      : role.title;

    return (
      `Welcome to your interview for the ${titleWithLevel} position at ${companyName}! ` +
      `I'll be your interviewer today. We'll have a conversation covering technical concepts, ` +
      `problem-solving, and your experience relevant to the ${role.domain || 'technology'} domain. ` +
      `Feel free to ask me to clarify any question. Let's get started!\n\n` +
      `Can you start by telling me about yourself and what draws you to this role?`
    );
  }

  /**
   * Determines max interview turns based on role level.
   * @param {string} level - 'junior' | 'mid' | 'senior'
   * @returns {number}
   */
  _getMaxTurns(level) {
    return INTERVIEW.MAX_TURNS[level] || INTERVIEW.MAX_TURNS.mid;
  }

  /**
   * Builds the role context object sent to the AI service.
   * @param {Object} role - Role document
   * @returns {Object}
   */
  _buildRoleContext(role) {
    return {
      title: role.title,
      level: role.level || 'mid',
      domain: role.domain || 'Technology',
      requirements: role.requirements || [],
      responsibilities: role.responsibilities || [],
    };
  }

  /**
   * Validates application ownership and returns the populated application.
   * @param {string} applicationId
   * @param {string} userId
   * @returns {Promise<Object>} application document
   */
  async _getOwnedApplication(applicationId, userId) {
    const application = await Application.findById(applicationId).populate({
      path: 'role',
      populate: { path: 'company' },
    });

    if (!application) {
      throw ApiError.notFound('Application not found');
    }
    if (application.user.toString() !== userId.toString()) {
      throw ApiError.forbidden('You do not have permission to access this application');
    }

    return application;
  }

  // ─── 1. Start Interview ───────────────────────────

  /**
   * Starts a new interview for a screening-passed application.
   * Creates the Interview document with an AI opening message
   * and transitions the application status.
   *
   * @param {string} applicationId
   * @param {string} userId
   * @returns {Promise<Object>} interview document
   */
  async startInterview(applicationId, userId) {
    // 1. Verify ownership + status
    const application = await this._getOwnedApplication(applicationId, userId);

    if (application.status !== APPLICATION_STATUS.SCREENING_PASSED) {
      throw ApiError.badRequest(
        `Cannot start interview: application status is '${application.status}'. ` +
        `Only applications with status '${APPLICATION_STATUS.SCREENING_PASSED}' can proceed to interview.`
      );
    }

    // 2. Check for existing interview
    const existingInterview = await Interview.findOne({ application: applicationId });
    if (existingInterview) {
      throw ApiError.conflict(
        'An interview already exists for this application. ' +
        'Please continue the existing interview or view the result.'
      );
    }

    // 3. Fetch role and company
    const role = application.role;
    const company = role.company; // Already populated

    // 4. Generate opening message
    const openingMessage = this._generateOpeningMessage(role, company);
    const maxTurns = this._getMaxTurns(role.level);

    // 5. Create Interview document
    const interview = await Interview.create({
      application: applicationId,
      transcript: [
        {
          role: 'ai',
          message: openingMessage,
          sentAt: new Date(),
        },
      ],
      result: INTERVIEW_RESULT.IN_PROGRESS,
      totalTurns: 1,
      maxTurns,
    });

    // 6. Update application status
    application.status = APPLICATION_STATUS.INTERVIEW_IN_PROGRESS;
    await application.save();

    return interview;
  }

  // ─── 2. Send Message (Conversation Loop) ──────────

  /**
   * Processes a user message in the interview conversation.
   * Adds user message, calls AI for response, checks for completion.
   *
   * @param {string} applicationId
   * @param {string} userId
   * @param {string} userMessage
   * @returns {Promise<Object>} { message, turnsRemaining, isComplete }
   */
  async sendMessage(applicationId, userId, userMessage) {
    // 1. Validate ownership
    const application = await this._getOwnedApplication(applicationId, userId);

    // 2. Fetch interview
    const interview = await Interview.findOne({ application: applicationId });
    if (!interview) {
      throw ApiError.notFound(
        'No interview found for this application. Please start an interview first.'
      );
    }

    // 3. Verify interview is still in progress
    if (interview.result !== INTERVIEW_RESULT.IN_PROGRESS) {
      throw ApiError.badRequest(
        `This interview has already concluded with result: '${interview.result}'. ` +
        `You can view your result using the result endpoint.`
      );
    }

    // 4. Verify turns remaining
    if (interview.totalTurns >= interview.maxTurns) {
      // Should not normally reach here, but guard against it
      await this.evaluateInterview(interview._id);
      throw ApiError.badRequest(
        'This interview has reached the maximum number of turns and is being evaluated.'
      );
    }

    // 5. Add user message to transcript
    interview.transcript.push({
      role: 'user',
      message: userMessage,
      sentAt: new Date(),
    });

    // 6. Call AI for response
    const role = application.role;
    const roleContext = this._buildRoleContext(role);
    const turnNumber = interview.totalTurns + 1; // Next AI turn number

    const aiResponse = await aiService.conductInterview({
      transcript: interview.transcript.map((t) => ({
        role: t.role,
        message: t.message,
      })),
      roleContext,
      turnNumber,
      maxTurns: interview.maxTurns,
    });

    const aiMessage = aiResponse.message || 'Thank you for your response. Could you elaborate further?';
    const containsCompletionMarker = aiResponse.containsCompletionMarker || false;

    // 7. Add AI response to transcript
    // Strip the completion marker from the visible message
    const cleanMessage = aiMessage.replace(INTERVIEW.COMPLETION_MARKER, '').trim();
    interview.transcript.push({
      role: 'ai',
      message: cleanMessage,
      sentAt: new Date(),
    });

    // 8. Increment turns (user message + AI response = 1 complete turn pair, but we count each message)
    interview.totalTurns += 2; // +1 for user, +1 for AI

    // 9. Check if interview should conclude
    const shouldConclude =
      interview.totalTurns >= interview.maxTurns || containsCompletionMarker;

    await interview.save();

    if (shouldConclude) {
      // Trigger evaluation asynchronously (don't block the response)
      this.evaluateInterview(interview._id).catch((err) => {
        console.error('Interview evaluation failed:', err.message);
      });
    }

    return {
      message: cleanMessage,
      turnsRemaining: Math.max(0, interview.maxTurns - interview.totalTurns),
      totalTurns: interview.totalTurns,
      maxTurns: interview.maxTurns,
      isComplete: shouldConclude,
    };
  }

  // ─── 3. Evaluate Interview ────────────────────────

  /**
   * Evaluates the complete interview transcript.
   * Called when max turns reached or AI signals completion.
   *
   * @param {string} interviewId
   * @returns {Promise<void>}
   */
  async evaluateInterview(interviewId) {
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      throw ApiError.notFound('Interview not found for evaluation');
    }

    // Guard: don't evaluate twice
    if (interview.result !== INTERVIEW_RESULT.IN_PROGRESS) {
      return;
    }

    const application = await Application.findById(interview.application).populate({
      path: 'role',
      populate: { path: 'company' },
    });

    if (!application) {
      throw ApiError.notFound('Application not found for interview evaluation');
    }

    const roleContext = this._buildRoleContext(application.role);

    // Call AI evaluation
    const evaluation = await aiService.evaluateInterview({
      transcript: interview.transcript.map((t) => ({
        role: t.role,
        message: t.message,
      })),
      roleContext,
    });

    const overallScore = evaluation.overallScore ?? INTERVIEW.FALLBACK_SCORE;
    const passed = overallScore >= INTERVIEW.PASS_THRESHOLD;

    // Store structured evaluation as JSON in evaluationNotes
    const evaluationData = {
      overallScore,
      verdict: passed ? 'PASS' : 'FAIL',
      categories: evaluation.categories || {},
      strengths: evaluation.strengths || [],
      improvements: evaluation.improvements || [],
      notes: evaluation.evaluationNotes || '',
      isFallback: evaluation.isFallback || false,
    };

    interview.evaluationNotes = JSON.stringify(evaluationData);
    interview.completedAt = new Date();

    // Check and award first_interview badge
    try {
      const gamificationService = require('./gamification.service');
      const candidateId = application.user?._id || application.user;
      await gamificationService.checkAndAwardBadges(candidateId, 'interview_completed');
    } catch (err) {
      // Non-blocking
    }

    if (passed) {
      interview.result = INTERVIEW_RESULT.PASSED;
      application.status = APPLICATION_STATUS.OFFER_PENDING;

      // Add positive feedback to application
      application.feedbacks.push({
        stage: FEEDBACK_STAGE.INTERVIEW,
        score: overallScore,
        feedbackText: evaluation.evaluationNotes || 'Congratulations! You have passed the interview.',
        strengths: evaluation.strengths || [],
        improvements: evaluation.improvements || [],
      });
    } else {
      interview.result = INTERVIEW_RESULT.FAILED;
      application.status = APPLICATION_STATUS.INTERVIEW_REJECTED;

      // Set cooldown
      const cooldownDate = new Date();
      cooldownDate.setDate(cooldownDate.getDate() + INTERVIEW.COOLDOWN_DAYS);
      application.cooldownUntil = cooldownDate;

      // Add detailed feedback with improvement suggestions
      application.feedbacks.push({
        stage: FEEDBACK_STAGE.INTERVIEW,
        score: overallScore,
        feedbackText:
          evaluation.evaluationNotes ||
          'Thank you for your effort. Unfortunately, the interview score did not meet the threshold for this role at this time.',
        strengths: evaluation.strengths || [],
        improvements: evaluation.improvements || [],
      });
    }

    await interview.save();
    await application.save();
  }

  // ─── 4. Get Interview Result ──────────────────────

  /**
   * Retrieves the full interview result with transcript and evaluation.
   *
   * @param {string} applicationId
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async getInterviewResult(applicationId, userId) {
    // Verify ownership
    await this._getOwnedApplication(applicationId, userId);

    const interview = await Interview.findOne({ application: applicationId });
    if (!interview) {
      throw ApiError.notFound('No interview found for this application');
    }

    // Parse evaluation data
    let evaluation = null;
    if (interview.evaluationNotes) {
      try {
        evaluation = JSON.parse(interview.evaluationNotes);
      } catch {
        evaluation = { notes: interview.evaluationNotes };
      }
    }

    return {
      interviewId: interview._id,
      applicationId: interview.application,
      result: interview.result,
      isComplete: interview.result !== INTERVIEW_RESULT.IN_PROGRESS,
      transcript: interview.transcript,
      totalTurns: interview.totalTurns,
      maxTurns: interview.maxTurns,
      turnsRemaining: Math.max(0, interview.maxTurns - interview.totalTurns),
      evaluation,
      completedAt: interview.completedAt,
      createdAt: interview.createdAt,
    };
  }
}

module.exports = new InterviewService();
