/**
 * Application-wide constants and enums.
 * Single source of truth for magic numbers and string values.
 */

const USER_ROLE = Object.freeze({
  ADMIN: 'admin',
  AI_MANAGER: 'ai_manager',
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
  REDEEM_CODE: 'redeem_code',
  STREAK_BONUS: 'streak_bonus',
  ACHIEVEMENT: 'achievement',
  OTHER: 'other',
});

// Promotion thresholds (EXP needed) - legacy fallback
const PROMOTION_THRESHOLDS = Object.freeze({
  [ROLE_LEVEL.JUNIOR]: 150,  // Junior → Mid
  [ROLE_LEVEL.MID]: 350,     // Mid → Senior
});

// Full promotion rules matrix
const PROMOTION_RULES = Object.freeze({
  employee: {
    junior_to_mid: {
      expRequired: 150,        // Cumulative EXP as employee
      tasksCompleted: 30,      // Minimum tasks completed
      minStreak: 5,            // Had at least a 5-day streak
      weeklyAvg: 4,            // Average 4+ tasks/week over last month
    },
    mid_to_senior: {
      expRequired: 350,
      tasksCompleted: 80,
      minStreak: 10,
      weeklyAvg: 5,
    },
  },
  transitions: {
    job_seeker_to_employee: 'automatic',  // Via offer acceptance
    employee_to_founder: {
      expRequired: 500,        // Total lifetime EXP
      // User gets the OPTION to become founder, not forced
    },
  },
});

// Streak reward milestones
const STREAK_REWARDS = Object.freeze({
  3: { expBonus: 5, coinBonus: 0, badge: null },
  7: { expBonus: 15, coinBonus: 25, badge: 'streak_7' },
  14: { expBonus: 30, coinBonus: 0, badge: 'streak_14' },
  30: { expBonus: 75, coinBonus: 100, badge: 'streak_30' },
  100: { expBonus: 200, coinBonus: 0, badge: 'streak_100' },
});

// CorpCoin economy events
const CORPCOIN_EVENTS = Object.freeze({
  FOUNDER_SEED_GRANT: 10000,    // On company creation
  DAILY_TASK_BONUS: 5,          // Small coin bonus per completed task
  STREAK_BONUS_7: 25,           // Weekly streak coin bonus
  STREAK_BONUS_30: 100,         // Monthly streak coin bonus
  PROMOTION_BONUS: 50,          // On level promotion
  BOT_PURCHASE: 'dynamic',      // Varies per bot
  BOT_RUN: 'dynamic',           // Varies per bot
});

// 19 Achievement Badge definitions
const BADGE_DEFINITIONS = Object.freeze({
  first_application: { name: 'First Step', description: 'Submitted your first application', icon: '🎯', rarity: 'common' },
  first_interview: { name: 'Interview Ready', description: 'Completed your first interview', icon: '🎤', rarity: 'common' },
  first_job: { name: 'Hired!', description: 'Got your first job offer accepted', icon: '💼', rarity: 'uncommon' },
  streak_7: { name: 'Week Warrior', description: '7-day task streak', icon: '🔥', rarity: 'uncommon' },
  streak_14: { name: 'Fortnight Force', description: '14-day task streak', icon: '⚡', rarity: 'rare' },
  streak_30: { name: 'Monthly Master', description: '30-day task streak', icon: '🌟', rarity: 'rare' },
  streak_100: { name: 'Century Centurion', description: '100-day task streak', icon: '🏆', rarity: 'legendary' },
  tasks_10: { name: 'Task Novice', description: 'Completed 10 tasks', icon: '📝', rarity: 'common' },
  tasks_50: { name: 'Task Pro', description: 'Completed 50 tasks', icon: '📋', rarity: 'uncommon' },
  tasks_100: { name: 'Task Master', description: 'Completed 100 tasks', icon: '🥇', rarity: 'rare' },
  promoted_mid: { name: 'Mid-Level Ascent', description: 'Promoted to Mid level', icon: '🚀', rarity: 'uncommon' },
  promoted_senior: { name: 'Senior Status', description: 'Promoted to Senior level', icon: '⭐', rarity: 'rare' },
  founder_unlocked: { name: 'Founder Mode', description: 'Unlocked Founder capabilities', icon: '🚀', rarity: 'epic' },
  first_company: { name: 'Unicorn Dreams', description: 'Founded your first company', icon: '🏢', rarity: 'epic' },
  first_hire: { name: 'Team Builder', description: 'Hired your first employee', icon: '🤝', rarity: 'epic' },
  profitable_quarter: { name: 'In The Green', description: 'Achieved a profitable quarter', icon: '💰', rarity: 'legendary' },
  exp_100: { name: 'Rising Star', description: 'Reached 100 total EXP', icon: '🥉', rarity: 'common' },
  exp_500: { name: 'Corporate Veteran', description: 'Reached 500 total EXP', icon: '🥈', rarity: 'rare' },
  exp_1000: { name: 'Living Legend', description: 'Reached 1000 total EXP', icon: '👑', rarity: 'legendary' },
});

// Event to badge candidate mappings
const BADGE_TRIGGERS = Object.freeze({
  application_submitted: ['first_application'],
  interview_completed: ['first_interview'],
  offer_accepted: ['first_job'],
  task_completed: ['tasks_10', 'tasks_50', 'tasks_100'],
  streak_updated: ['streak_7', 'streak_14', 'streak_30', 'streak_100'],
  exp_updated: ['exp_100', 'exp_500', 'exp_1000', 'founder_unlocked'],
  promotion: ['promoted_mid', 'promoted_senior'],
  company_created: ['first_company'],
  employee_hired: ['first_hire'],
  profitable_quarter: ['profitable_quarter'],
});

const NEXT_LEVEL = Object.freeze({
  [ROLE_LEVEL.JUNIOR]: ROLE_LEVEL.MID,
  [ROLE_LEVEL.MID]: ROLE_LEVEL.SENIOR,
  [ROLE_LEVEL.SENIOR]: null, // Already at max
});

const PREVIOUS_LEVEL = Object.freeze({
  [ROLE_LEVEL.SENIOR]: ROLE_LEVEL.MID,
  [ROLE_LEVEL.MID]: ROLE_LEVEL.JUNIOR,
  [ROLE_LEVEL.JUNIOR]: null, // Already at lowest level
});

const PERFORMANCE_STATUS = Object.freeze({
  GOOD: 'good',
  WARNING: 'warning',
  CRITICAL: 'critical',
});

const PERFORMANCE_CONFIG = Object.freeze({
  WARNING_THRESHOLD_DAYS: 3,        // Completed < 3 days in 7 days -> warning
  CRITICAL_THRESHOLD_DAYS: 1,       // Completed < 1 day in 7 days -> critical
  EXP_PENALTY_WARNING: 5,           // -5 EXP
  EXP_PENALTY_CRITICAL: 20,         // -20 EXP
  CONSECUTIVE_CRITICAL_DEMOTION: 2, // 2 weeks critical -> demote
  CONSECUTIVE_CRITICAL_TERMINATION: 3, // 3 weeks critical at junior -> terminate
});

const TASK_DIFFICULTY = Object.freeze({
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
});

const TASK_EXP_REWARD = Object.freeze({
  [TASK_DIFFICULTY.EASY]: 15,
  [TASK_DIFFICULTY.MEDIUM]: 25,
  [TASK_DIFFICULTY.HARD]: 40,
});

const TASK_BONUS = Object.freeze({
  STREAK: 5,
  EARLY_COMPLETION: 10,
  EARLY_COMPLETION_WINDOW_HOURS: 2,
  MIN_STREAK_DAYS: 3,
});

const FOUNDER_UNLOCK_EXP = 500;
const COOLDOWN_HOURS = 48;
const MAX_INTERVIEW_TURNS = 10;

const INTERVIEW = Object.freeze({
  MAX_TURNS: { junior: 8, mid: 10, senior: 12 },
  PASS_THRESHOLD: 65,            // Minimum evaluation score to pass interview
  COOLDOWN_DAYS: 14,             // Days before user can re-apply after interview rejection
  AI_RESPONSE_TIMEOUT: 30000,    // 30 seconds timeout for AI responses
  COMPLETION_MARKER: '[INTERVIEW_COMPLETE]',
  FALLBACK_SCORE: 70,            // Score given when AI evaluation is unavailable
});

const SCREENING = {
  PASS_THRESHOLD: 60,          // Minimum ATS score to pass screening
  COOLDOWN_DAYS: 7,             // Days before user can re-apply to same role
  FALLBACK_SCORE: 70,           // Score given when AI service is unavailable
  MAX_ACTIVE_APPLICATIONS: 5,   // Max concurrent active applications per user
};

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
  PROMOTION_RULES,
  STREAK_REWARDS,
  CORPCOIN_EVENTS,
  BADGE_DEFINITIONS,
  BADGE_TRIGGERS,
  NEXT_LEVEL,
  PREVIOUS_LEVEL,
  PERFORMANCE_STATUS,
  PERFORMANCE_CONFIG,
  TASK_DIFFICULTY,
  TASK_EXP_REWARD,
  TASK_BONUS,
  FOUNDER_UNLOCK_EXP,
  COOLDOWN_HOURS,
  MAX_INTERVIEW_TURNS,
  INTERVIEW,
  SCREENING,
};
