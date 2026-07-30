/**
 * Application-wide constants and enums.
 * Single source of truth for magic numbers and string values.
 */

const USER_ROLE = Object.freeze({
  ADMIN: 'admin',
  JOB_SEEKER: 'job_seeker',
  WORKING: 'working',
  FOUNDER: 'founder',
});

const USER_STATUS = Object.freeze({
  JOB_SEEKER: 'job_seeker',
  EMPLOYEE: 'employee',
  FOUNDER: 'founder',
});

const APPLICATION_STATUS = Object.freeze({
  PENDING_SCREENING: 'pending_screening',
  SCREENING_PASSED: 'screening_passed',
  SCREENING_REJECTED: 'screening_rejected',
  INTERVIEW_IN_PROGRESS: 'interview_in_progress',
  INTERVIEW_PASSED: 'interview_passed',
  INTERVIEW_REJECTED: 'interview_rejected',
  OFFER_PENDING: 'offer_pending',
  OFFER_ACCEPTED: 'offer_accepted',
  OFFER_DECLINED: 'offer_declined',
});

const EMPLOYMENT_STATUS = Object.freeze({
  ACTIVE: 'active',
  RESIGNED: 'resigned',
  TERMINATED: 'terminated',
});

const ROLE_LEVEL = Object.freeze({
  JUNIOR: 'junior',
  MID: 'mid',
  SENIOR: 'senior',
});

const TASK_STATUS = Object.freeze({
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
});

const EXIT_TYPE = Object.freeze({
  RESIGNATION: 'resignation',
  TERMINATION: 'termination',
});

const FEEDBACK_STAGE = Object.freeze({
  SCREENING: 'screening',
  INTERVIEW: 'interview',
  EXIT: 'exit',
});

const INTERVIEW_RESULT = Object.freeze({
  PASSED: 'passed',
  FAILED: 'failed',
  IN_PROGRESS: 'in_progress',
});

const EXP_SOURCE = Object.freeze({
  TASK_COMPLETION: 'task_completion',
  PROMOTION_BONUS: 'promotion_bonus',
  PERFORMANCE_REVIEW: 'performance_review',
  PENALTY: 'penalty',
  OTHER: 'other',
});

// Promotion thresholds (EXP needed)
const PROMOTION_THRESHOLDS = Object.freeze({
  [ROLE_LEVEL.JUNIOR]: 200,  // Junior → Mid
  [ROLE_LEVEL.MID]: 500,     // Mid → Senior
});

const NEXT_LEVEL = Object.freeze({
  [ROLE_LEVEL.JUNIOR]: ROLE_LEVEL.MID,
  [ROLE_LEVEL.MID]: ROLE_LEVEL.SENIOR,
  [ROLE_LEVEL.SENIOR]: null, // Already at max
});

const FOUNDER_UNLOCK_EXP = 500;
const COOLDOWN_HOURS = 48;
const MAX_INTERVIEW_TURNS = 10;

module.exports = {
  USER_ROLE,
  USER_STATUS,
  APPLICATION_STATUS,
  EMPLOYMENT_STATUS,
  ROLE_LEVEL,
  TASK_STATUS,
  EXIT_TYPE,
  FEEDBACK_STAGE,
  INTERVIEW_RESULT,
  EXP_SOURCE,
  PROMOTION_THRESHOLDS,
  NEXT_LEVEL,
  FOUNDER_UNLOCK_EXP,
  COOLDOWN_HOURS,
  MAX_INTERVIEW_TURNS,
};
