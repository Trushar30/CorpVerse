export const ROLES = {
  ADMIN: 'admin',
  AI_MANAGER: 'ai_manager',
  JOB_SEEKER: 'job_seeker',
  WORKING: 'working',
  FOUNDER: 'founder',
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'System Admin',
  [ROLES.AI_MANAGER]: 'AI Manager',
  [ROLES.JOB_SEEKER]: 'Job Seeker',
  [ROLES.WORKING]: 'Employee',
  [ROLES.FOUNDER]: 'Founder',
};

export const APPLICATION_STATUS = {
  PENDING_SCREENING: 'pending_screening',
  SCREENING_PASSED: 'screening_passed',
  SCREENING_REJECTED: 'screening_rejected',
  INTERVIEW_IN_PROGRESS: 'interview_in_progress',
  INTERVIEW_PASSED: 'interview_passed',
  INTERVIEW_REJECTED: 'interview_rejected',
  OFFER_PENDING: 'offer_pending',
  OFFER_ACCEPTED: 'offer_accepted',
  OFFER_DECLINED: 'offer_declined',
};

export const APPLICATION_STATUS_LABELS = {
  pending_screening: 'ATS Screening',
  screening_passed: 'Screening Passed',
  screening_rejected: 'Screening Rejected',
  interview_in_progress: 'Interview In Progress',
  interview_passed: 'Interview Passed',
  interview_rejected: 'Interview Rejected',
  offer_pending: 'Offer Pending',
  offer_accepted: 'Hired!',
  offer_declined: 'Offer Declined',
};

export const EXP_THRESHOLDS = {
  FOUNDER_UNLOCK: 500,
  PROMOTION_JUNIOR_TO_MID: 150,
  PROMOTION_MID_TO_SENIOR: 350,
};
