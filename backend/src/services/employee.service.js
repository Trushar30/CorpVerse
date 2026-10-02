const EmployeeRecord = require('../models/EmployeeRecord');
const Task = require('../models/Task');
const ExpLog = require('../models/ExpLog');
const User = require('../models/User');
const Role = require('../models/Role');
const Company = require('../models/Company');
const ApiError = require('../utils/ApiError');
const aiService = require('./ai.service');
const gamificationService = require('./gamification.service');
const {
  TASK_STATUS,
  TASK_DIFFICULTY,
  TASK_EXP_REWARD,
  TASK_BONUS,
  PERFORMANCE_STATUS,
  PERFORMANCE_CONFIG,
  PREVIOUS_LEVEL,
  EXP_SOURCE,
} = require('../utils/constants');

class EmployeeService {
  /**
   * Helper to resolve active employee record by record ID or user ID.
   */
  async _resolveActiveRecord(id) {
    let record = await EmployeeRecord.findById(id).populate('role company');
    if (!record) {
      record = await EmployeeRecord.findOne({ user: id, employmentStatus: 'active' }).populate('role company');
    }
    return record;
  }

  /**
   * Rolls a task difficulty based on the employee's current level.
   * - Junior: 60% easy, 30% medium, 10% hard
   * - Mid:    30% easy, 50% medium, 20% hard
   * - Senior: 10% easy, 40% medium, 50% hard
   */
  _pickDifficulty(level) {
    const roll = Math.random();
    if (level === 'senior') {
      if (roll < 0.10) return TASK_DIFFICULTY.EASY;
      if (roll < 0.50) return TASK_DIFFICULTY.MEDIUM;
      return TASK_DIFFICULTY.HARD;
    }
    if (level === 'mid') {
      if (roll < 0.30) return TASK_DIFFICULTY.EASY;
      if (roll < 0.80) return TASK_DIFFICULTY.MEDIUM;
      return TASK_DIFFICULTY.HARD;
    }
    // Default junior
    if (roll < 0.60) return TASK_DIFFICULTY.EASY;
    if (roll < 0.90) return TASK_DIFFICULTY.MEDIUM;
    return TASK_DIFFICULTY.HARD;
  }

  /**
   * Generates a contextual daily task using the AI service or templates.
   * Accepts either employeeRecordId or userId.
   */
  async generateDailyTask(targetId) {
    const employee = await this._resolveActiveRecord(targetId);
    if (!employee || employee.employmentStatus !== 'active') {
      throw ApiError.badRequest('No active employee record found to generate a task for');
    }

    const difficulty = this._pickDifficulty(employee.currentLevel);

    const previousTasks = await Task.find({ employeeRecord: employee._id })
      .sort('-createdAt')
      .limit(5)
      .select('title difficulty');

    const generated = await aiService.generateTask({
      roleTitle: employee.role?.title || 'Software Engineer',
      level: employee.currentLevel || 'junior',
      domain: employee.role?.domain || 'Technology',
      difficulty,
      companyName: employee.company?.name || 'CorpVerse',
      previousTasks,
    });

    const expReward = TASK_EXP_REWARD[difficulty] || 25;

    const task = await Task.create({
      employeeRecord: employee._id,
      title: (generated.title || `Daily ${employee.currentLevel} Task`).slice(0, 200),
      description: generated.description || 'Complete the assigned daily objective.',
      status: TASK_STATUS.ASSIGNED,
      expReward,
      difficulty,
      category: generated.category || 'debugging',
    });

    return task;
  }

  /**
   * Returns today's task for an employee if already generated.
   * "Today" is bounded by midnight start of today.
   */
  async getTodayTask(userId) {
    const employee = await this._resolveActiveRecord(userId);
    if (!employee || employee.employmentStatus !== 'active') {
      throw ApiError.badRequest('No active employee record found');
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayTask = await Task.findOne({
      employeeRecord: employee._id,
      createdAt: { $gte: todayStart },
    }).sort({ createdAt: -1 });

    return todayTask;
  }

  /**
   * Calculates the consecutive day streak of completed tasks for an employee.
   */
  async calculateStreak(employeeRecordId) {
    const tasks = await Task.find({
      employeeRecord: employeeRecordId,
      status: TASK_STATUS.COMPLETED,
      completedAt: { $ne: null },
    }).sort({ completedAt: -1 });

    if (!tasks.length) return 0;

    const completedDates = new Set(
      tasks.map((t) => new Date(t.completedAt).toISOString().split('T')[0])
    );

    let streak = 0;
    const current = new Date();
    current.setUTCDate(current.getUTCDate() - 1);

    while (true) {
      const dateStr = current.toISOString().split('T')[0];
      if (completedDates.has(dateStr)) {
        streak++;
        current.setUTCDate(current.getUTCDate() - 1);
      } else {
        break;
      }
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (completedDates.has(todayStr)) {
      streak += 1;
    }

    return streak;
  }

  /**
   * Completes a task, awards EXP with bonuses, creates ExpLog, checks promotions.
   */
  async completeTask(taskId, userId, submissionData = null) {
    const employee = await this._resolveActiveRecord(userId);
    if (!employee || employee.employmentStatus !== 'active') {
      throw ApiError.badRequest('No active employee record found');
    }

    const task = await Task.findById(taskId);
    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    if (task.employeeRecord.toString() !== employee._id.toString()) {
      throw ApiError.forbidden('You do not have permission to complete this task');
    }

    if (task.status === TASK_STATUS.COMPLETED) {
      throw ApiError.badRequest('Task has already been completed');
    }

    const baseExp = task.expReward || TASK_EXP_REWARD[task.difficulty] || 25;

    // Speed bonus: completed within first 2 hours
    const hoursElapsed = (Date.now() - new Date(task.createdAt).getTime()) / (1000 * 60 * 60);
    const earlyBonus = hoursElapsed <= TASK_BONUS.EARLY_COMPLETION_WINDOW_HOURS ? TASK_BONUS.EARLY_COMPLETION : 0;

    // Streak bonus: 3+ consecutive days
    const currentStreak = await this.calculateStreak(employee._id);
    // After today's completion, streak will be currentStreak + 1 (if today was not counted yet)
    const effectiveStreak = currentStreak >= TASK_BONUS.MIN_STREAK_DAYS ? currentStreak : currentStreak + 1;
    const streakBonus = effectiveStreak >= TASK_BONUS.MIN_STREAK_DAYS ? TASK_BONUS.STREAK : 0;

    const totalExp = baseExp + earlyBonus + streakBonus;

    // 5. Update Task
    task.status = TASK_STATUS.COMPLETED;
    task.completedAt = new Date();
    await task.save();

    // 6 & 7. Create ExpLog and update User expTotal
    const bonusLabels = [];
    if (streakBonus > 0) bonusLabels.push(`+${streakBonus} streak bonus`);
    if (earlyBonus > 0) bonusLabels.push(`+${earlyBonus} speed bonus`);
    const bonusText = bonusLabels.length ? ` (${bonusLabels.join(', ')})` : '';
    const reason = `Completed task "${task.title}" (+${baseExp} base${bonusText})`;

    await gamificationService.addExp(
      userId,
      totalExp,
      reason,
      EXP_SOURCE.TASK_COMPLETION,
      task._id,
      employee._id
    );

    // Update user streak on completion
    if (typeof gamificationService.updateStreak === 'function') {
      await gamificationService.updateStreak(userId);
    }

    // Award daily task CorpCoin bonus (+5 CorpCoins)
    if (typeof gamificationService.awardCoins === 'function') {
      await gamificationService.awardCoins(userId, 5, `Completed task "${task.title}"`);
    }

    // Check task count badges (tasks_10, tasks_50, tasks_100)
    if (typeof gamificationService.checkAndAwardBadges === 'function') {
      await gamificationService.checkAndAwardBadges(userId, 'task_completed');
    }

    // 8. Check for promotion
    const promotion = await gamificationService.checkPromotion(userId, employee._id);

    return {
      task,
      expGained: totalExp,
      baseExp,
      bonuses: {
        streakBonus,
        earlyBonus,
      },
      streak: effectiveStreak,
      promotion,
    };
  }

  /**
   * Retrieves paginated tasks for an employee with status and difficulty filters.
   */
  async getMyTasks(userId, filters = {}) {
    const employee = await this._resolveActiveRecord(userId);
    if (!employee || employee.employmentStatus !== 'active') {
      throw ApiError.badRequest('No active employee record found');
    }

    const { status, difficulty, fromDate, toDate, page = 1, limit = 10 } = filters;
    const query = { employeeRecord: employee._id };

    if (status && status !== 'all') {
      query.status = status;
    }
    if (difficulty && difficulty !== 'all') {
      query.difficulty = difficulty;
    }
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) query.createdAt.$lte = new Date(toDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [tasks, total] = await Promise.all([
      Task.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Task.countDocuments(query),
    ]);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayTask = await Task.findOne({
      employeeRecord: employee._id,
      createdAt: { $gte: todayStart },
    }).sort({ createdAt: -1 });

    return {
      tasks,
      todayTask,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Retrieves paginated EXP history for the employee.
   */
  async getExpHistory(userId, { page = 1, limit = 10 } = {}) {
    const employee = await this._resolveActiveRecord(userId);
    const query = { user: userId };
    if (employee) {
      query.$or = [{ user: userId }, { employeeRecord: employee._id }];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [expLogs, total] = await Promise.all([
      ExpLog.find(query)
        .populate('taskId', 'title difficulty expReward category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      ExpLog.countDocuments(query),
    ]);

    return {
      expLogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Checks employee performance based on completed tasks over the past 7 days.
   * Can optionally apply consequences (EXP deductions, demotion, termination).
   */
  async checkPerformance(employeeRecordId, options = {}) {
    const { applyPenalties = false } = options;
    const record = await EmployeeRecord.findById(employeeRecordId);
    if (!record) {
      throw ApiError.notFound('Employee record not found');
    }

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const completedThisWeek = await Task.countDocuments({
      employeeRecord: record._id,
      status: TASK_STATUS.COMPLETED,
      completedAt: { $gte: weekAgo },
    });

    let status = PERFORMANCE_STATUS.GOOD;
    if (completedThisWeek < PERFORMANCE_CONFIG.CRITICAL_THRESHOLD_DAYS) {
      status = PERFORMANCE_STATUS.CRITICAL;
    } else if (completedThisWeek < PERFORMANCE_CONFIG.WARNING_THRESHOLD_DAYS) {
      status = PERFORMANCE_STATUS.WARNING;
    }

    let demoted = false;
    let terminated = false;
    let expPenalty = 0;
    let previousLevel = record.currentLevel;
    let newLevel = record.currentLevel;

    if (applyPenalties) {
      if (status === PERFORMANCE_STATUS.CRITICAL) {
        expPenalty = PERFORMANCE_CONFIG.EXP_PENALTY_CRITICAL;
        record.consecutiveCriticalWeeks = (record.consecutiveCriticalWeeks || 0) + 1;

        if (
          record.consecutiveCriticalWeeks >= PERFORMANCE_CONFIG.CONSECUTIVE_CRITICAL_TERMINATION &&
          record.currentLevel === 'junior'
        ) {
          // Fired / Terminated
          terminated = true;
          record.employmentStatus = 'terminated';
          record.exitRecord = {
            exitType: 'termination',
            reason: 'Performance termination: 3 consecutive critical weeks at junior level',
            exitedAt: new Date(),
          };

          await User.findByIdAndUpdate(record.user, {
            role: 'job_seeker',
            currentStatus: 'job_seeker',
          });

          const company = await Company.findById(record.company);
          if (company && company.employeeCount > 0) {
            company.employeeCount -= 1;
            await company.save();
          }
        } else if (record.consecutiveCriticalWeeks >= PERFORMANCE_CONFIG.CONSECUTIVE_CRITICAL_DEMOTION) {
          // Demote if higher than junior
          const demotedLevel = PREVIOUS_LEVEL[record.currentLevel];
          if (demotedLevel) {
            demoted = true;
            newLevel = demotedLevel;
            record.currentLevel = demotedLevel;
            record.consecutiveCriticalWeeks = 0; // reset counter on demotion
          }
        }
      } else if (status === PERFORMANCE_STATUS.WARNING) {
        expPenalty = PERFORMANCE_CONFIG.EXP_PENALTY_WARNING;
        record.consecutiveCriticalWeeks = 0;
      } else {
        record.consecutiveCriticalWeeks = 0;
      }

      if (expPenalty > 0) {
        await gamificationService.addExp(
          record.user,
          -expPenalty,
          `Performance review penalty: ${status} status (${completedThisWeek}/7 days completed)`,
          EXP_SOURCE.PENALTY,
          null,
          record._id
        );
      }

      record.performanceStatus = status;
      record.lastPerformanceCheckAt = new Date();
      await record.save();
    }

    return {
      status,
      completedThisWeek,
      consecutiveCriticalWeeks: record.consecutiveCriticalWeeks,
      demoted,
      terminated,
      previousLevel,
      newLevel,
      expPenalty,
      lastPerformanceCheckAt: record.lastPerformanceCheckAt,
    };
  }

  /**
   * Retrieves the current performance dashboard data for an employee.
   */
  async getPerformance(userId) {
    const employee = await this._resolveActiveRecord(userId);
    if (!employee || employee.employmentStatus !== 'active') {
      throw ApiError.badRequest('No active employee record found');
    }

    const perf = await this.checkPerformance(employee._id, { applyPenalties: false });
    const streak = await this.calculateStreak(employee._id);

    let message = 'You are performing great! Keep up the daily momentum.';
    if (perf.status === PERFORMANCE_STATUS.WARNING) {
      message = 'Performance warning: You completed fewer than 3 tasks in the last 7 days. Complete daily tasks to avoid penalties.';
    } else if (perf.status === PERFORMANCE_STATUS.CRITICAL) {
      message = 'CRITICAL WARNING: 0 tasks completed this week. You are at risk of demotion or termination.';
    }

    return {
      ...perf,
      currentLevel: employee.currentLevel,
      streak,
      message,
    };
  }

  /**
   * Retrieves the employee's active record with populated company and role.
   */
  async getMyRecord(userId) {
    const employee = await EmployeeRecord.findOne({ user: userId, employmentStatus: 'active' })
      .populate('role company');
    if (!employee) {
      throw ApiError.notFound('No active employee record found');
    }
    return employee;
  }

  /**
   * Voluntary resignation: sets employee to resigned, resets user role/status, decrements company employeeCount.
   */
  async resign(userId, reason = 'Player resigned') {
    const employee = await EmployeeRecord.findOne({ user: userId, employmentStatus: 'active' });
    if (!employee) {
      throw ApiError.badRequest('No active employee record found to resign from');
    }

    employee.employmentStatus = 'resigned';
    employee.exitRecord = {
      exitType: 'resignation',
      reason,
      exitedAt: new Date(),
    };
    await employee.save();

    await User.findByIdAndUpdate(userId, {
      role: 'job_seeker',
      currentStatus: 'job_seeker',
    });

    const company = await Company.findById(employee.company);
    if (company && company.employeeCount > 0) {
      company.employeeCount -= 1;
      await company.save();
    }

    return {
      success: true,
      message: 'Resignation accepted. You have returned to job seeker status.',
      exitRecord: employee.exitRecord,
    };
  }
}

module.exports = new EmployeeService();
