const employeeService = require('../src/services/employee.service');
const gamificationService = require('../src/services/gamification.service');
const EmployeeRecord = require('../src/models/EmployeeRecord');
const Task = require('../src/models/Task');
const ExpLog = require('../src/models/ExpLog');
const User = require('../src/models/User');
const Company = require('../src/models/Company');
const aiService = require('../src/services/ai.service');
const {
  TASK_STATUS,
  TASK_DIFFICULTY,
  PERFORMANCE_STATUS,
  ROLE_LEVEL,
} = require('../src/utils/constants');

jest.mock('../src/models/EmployeeRecord');
jest.mock('../src/models/Task');
jest.mock('../src/models/ExpLog');
jest.mock('../src/models/User');
jest.mock('../src/models/Company');
jest.mock('../src/services/ai.service');

describe('Employee Lifecycle & Tasks Service', () => {
  const userId = '507f1f77bcf86cd799439011';
  const employeeRecordId = '507f1f77bcf86cd799439055';
  const companyId = '507f1f77bcf86cd799439033';
  const roleId = '507f1f77bcf86cd799439022';
  const taskId = '507f1f77bcf86cd799439099';

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateDailyTask', () => {
    it('should throw error if no active employee record found', async () => {
      EmployeeRecord.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });
      EmployeeRecord.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      await expect(employeeService.generateDailyTask(userId)).rejects.toMatchObject({
        statusCode: 400,
        message: 'No active employee record found to generate a task for',
      });
    });

    it('should generate a task with role-appropriate difficulty and base EXP', async () => {
      const mockEmployee = {
        _id: employeeRecordId,
        employmentStatus: 'active',
        currentLevel: 'junior',
        role: { title: 'Junior Dev', domain: 'Technology' },
        company: { name: 'Acme Corp' },
      };

      EmployeeRecord.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockEmployee),
      });

      Task.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      aiService.generateTask.mockResolvedValue({
        title: 'Fix Button Alignment',
        description: 'Ensure button aligns properly on mobile viewport.',
        category: 'debugging',
        difficulty: 'easy',
      });

      Task.create.mockImplementation((data) => Promise.resolve({ _id: taskId, ...data }));

      const task = await employeeService.generateDailyTask(employeeRecordId);

      expect(task.title).toBe('Fix Button Alignment');
      expect(task.status).toBe(TASK_STATUS.ASSIGNED);
      expect(task.employeeRecord).toBe(employeeRecordId);
      expect([15, 25, 40]).toContain(task.expReward);
    });

    it('should scale difficulty according to role level', () => {
      // Test difficulty picking algorithm
      const pickDiff = employeeService._pickDifficulty.bind(employeeService);
      
      // Test junior
      jest.spyOn(Math, 'random').mockReturnValue(0.5); // < 0.6 -> easy
      expect(pickDiff('junior')).toBe(TASK_DIFFICULTY.EASY);

      jest.spyOn(Math, 'random').mockReturnValue(0.75); // 0.6 <= x < 0.9 -> medium
      expect(pickDiff('junior')).toBe(TASK_DIFFICULTY.MEDIUM);

      jest.spyOn(Math, 'random').mockReturnValue(0.95); // >= 0.9 -> hard
      expect(pickDiff('junior')).toBe(TASK_DIFFICULTY.HARD);

      // Test senior
      jest.spyOn(Math, 'random').mockReturnValue(0.05); // < 0.1 -> easy
      expect(pickDiff('senior')).toBe(TASK_DIFFICULTY.EASY);

      jest.spyOn(Math, 'random').mockReturnValue(0.3); // 0.1 <= x < 0.5 -> medium
      expect(pickDiff('senior')).toBe(TASK_DIFFICULTY.MEDIUM);

      jest.spyOn(Math, 'random').mockReturnValue(0.8); // >= 0.5 -> hard
      expect(pickDiff('senior')).toBe(TASK_DIFFICULTY.HARD);

      Math.random.mockRestore();
    });
  });

  describe('getTodayTask', () => {
    it('should return null if no task was created today', async () => {
      EmployeeRecord.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });
      EmployeeRecord.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          _id: employeeRecordId,
          employmentStatus: 'active',
        }),
      });

      Task.findOne.mockReturnValue({
        sort: jest.fn().mockResolvedValue(null),
      });

      const result = await employeeService.getTodayTask(userId);
      expect(result).toBeNull();
    });

    it('should return today task if one exists', async () => {
      EmployeeRecord.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });
      EmployeeRecord.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          _id: employeeRecordId,
          employmentStatus: 'active',
        }),
      });

      const mockTodayTask = {
        _id: taskId,
        title: 'Today Task',
        status: TASK_STATUS.ASSIGNED,
      };

      Task.findOne.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockTodayTask),
      });

      const result = await employeeService.getTodayTask(userId);
      expect(result).toEqual(mockTodayTask);
    });
  });

  describe('completeTask & streak / speed bonuses', () => {
    it('should fail if task is already completed', async () => {
      EmployeeRecord.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });
      EmployeeRecord.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          _id: employeeRecordId,
          employmentStatus: 'active',
        }),
      });

      Task.findById.mockResolvedValue({
        _id: taskId,
        employeeRecord: employeeRecordId,
        status: TASK_STATUS.COMPLETED,
      });

      await expect(employeeService.completeTask(taskId, userId)).rejects.toMatchObject({
        statusCode: 400,
        message: 'Task has already been completed',
      });
    });

    it('should complete task, award base EXP, +10 speed bonus (within 2h) and +5 streak bonus (3+ days)', async () => {
      EmployeeRecord.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });
      EmployeeRecord.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          _id: employeeRecordId,
          employmentStatus: 'active',
          currentLevel: 'junior',
        }),
      });

      const taskCreatedAt = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago (< 2h)
      const mockTaskSave = jest.fn().mockResolvedValue(true);
      const mockTask = {
        _id: taskId,
        title: 'Build Feature',
        employeeRecord: employeeRecordId,
        status: TASK_STATUS.ASSIGNED,
        expReward: 25,
        difficulty: 'medium',
        createdAt: taskCreatedAt,
        save: mockTaskSave,
      };

      Task.findById.mockResolvedValue(mockTask);

      // Mock consecutive streak: 2 days completed prior to today
      const yesterday = new Date();
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);
      const twoDaysAgo = new Date();
      twoDaysAgo.setUTCDate(twoDaysAgo.getUTCDate() - 2);

      Task.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([
          { status: 'completed', completedAt: yesterday },
          { status: 'completed', completedAt: twoDaysAgo },
        ]),
      });

      User.findById.mockResolvedValue({
        _id: userId,
        expTotal: 50,
        save: jest.fn().mockResolvedValue(true),
      });

      ExpLog.create.mockResolvedValue({});

      const result = await employeeService.completeTask(taskId, userId);

      expect(mockTask.status).toBe(TASK_STATUS.COMPLETED);
      expect(mockTaskSave).toHaveBeenCalled();
      expect(result.baseExp).toBe(25);
      expect(result.bonuses.earlyBonus).toBe(10); // completed within 2 hours
      expect(result.bonuses.streakBonus).toBe(5); // 3rd consecutive day
      expect(result.expGained).toBe(40); // 25 + 10 + 5
    });
  });

  describe('Promotion System', () => {
    it('should promote junior to mid when reaching 200 EXP threshold', async () => {
      const mockRecord = {
        _id: employeeRecordId,
        user: userId,
        employmentStatus: 'active',
        currentLevel: ROLE_LEVEL.JUNIOR,
        save: jest.fn().mockResolvedValue(true),
      };

      EmployeeRecord.findById.mockResolvedValue(mockRecord);
      User.findById.mockResolvedValue({
        _id: userId,
        expTotal: 220,
      });
      ExpLog.create.mockResolvedValue({});

      const result = await gamificationService.checkPromotion(userId, employeeRecordId);

      expect(result.promoted).toBe(true);
      expect(result.previousLevel).toBe('junior');
      expect(result.newLevel).toBe('mid');
      expect(mockRecord.currentLevel).toBe('mid');
      expect(mockRecord.save).toHaveBeenCalled();
    });

    it('should promote mid to senior when reaching 500 EXP threshold', async () => {
      const mockRecord = {
        _id: employeeRecordId,
        user: userId,
        employmentStatus: 'active',
        currentLevel: ROLE_LEVEL.MID,
        save: jest.fn().mockResolvedValue(true),
      };

      EmployeeRecord.findById.mockResolvedValue(mockRecord);
      User.findById.mockResolvedValue({
        _id: userId,
        expTotal: 510,
      });
      ExpLog.create.mockResolvedValue({});

      const result = await gamificationService.checkPromotion(userId, employeeRecordId);

      expect(result.promoted).toBe(true);
      expect(result.previousLevel).toBe('mid');
      expect(result.newLevel).toBe('senior');
      expect(mockRecord.currentLevel).toBe('senior');
    });

    it('should not promote senior further', async () => {
      const mockRecord = {
        _id: employeeRecordId,
        user: userId,
        employmentStatus: 'active',
        currentLevel: ROLE_LEVEL.SENIOR,
        save: jest.fn().mockResolvedValue(true),
      };

      EmployeeRecord.findById.mockResolvedValue(mockRecord);
      User.findById.mockResolvedValue({
        _id: userId,
        expTotal: 1000,
      });

      const result = await gamificationService.checkPromotion(userId, employeeRecordId);

      expect(result.promoted).toBe(false);
      expect(mockRecord.currentLevel).toBe('senior');
    });
  });

  describe('Performance Tracking, Warnings, Demotion and Firing', () => {
    it('should return good status if completed >= 3 tasks in 7 days', async () => {
      EmployeeRecord.findById.mockResolvedValue({
        _id: employeeRecordId,
        currentLevel: 'mid',
        consecutiveCriticalWeeks: 0,
      });

      Task.countDocuments.mockResolvedValue(4);

      const result = await employeeService.checkPerformance(employeeRecordId);
      expect(result.status).toBe(PERFORMANCE_STATUS.GOOD);
      expect(result.completedThisWeek).toBe(4);
    });

    it('should return warning status if completed < 3 tasks in 7 days', async () => {
      EmployeeRecord.findById.mockResolvedValue({
        _id: employeeRecordId,
        currentLevel: 'mid',
        consecutiveCriticalWeeks: 0,
      });

      Task.countDocuments.mockResolvedValue(2);

      const result = await employeeService.checkPerformance(employeeRecordId);
      expect(result.status).toBe(PERFORMANCE_STATUS.WARNING);
    });

    it('should return critical status if completed 0 tasks in 7 days', async () => {
      EmployeeRecord.findById.mockResolvedValue({
        _id: employeeRecordId,
        currentLevel: 'mid',
        consecutiveCriticalWeeks: 0,
      });

      Task.countDocuments.mockResolvedValue(0);

      const result = await employeeService.checkPerformance(employeeRecordId);
      expect(result.status).toBe(PERFORMANCE_STATUS.CRITICAL);
    });

    it('should apply warning penalty (-5 EXP) when applyPenalties is true', async () => {
      const mockRecordSave = jest.fn().mockResolvedValue(true);
      const mockRecord = {
        _id: employeeRecordId,
        user: userId,
        currentLevel: 'mid',
        consecutiveCriticalWeeks: 0,
        save: mockRecordSave,
      };

      EmployeeRecord.findById.mockResolvedValue(mockRecord);
      Task.countDocuments.mockResolvedValue(2); // warning (<3)

      User.findById.mockResolvedValue({
        _id: userId,
        expTotal: 100,
        save: jest.fn().mockResolvedValue(true),
      });
      ExpLog.create.mockResolvedValue({});

      const result = await employeeService.checkPerformance(employeeRecordId, { applyPenalties: true });

      expect(result.status).toBe(PERFORMANCE_STATUS.WARNING);
      expect(result.expPenalty).toBe(5);
      expect(mockRecordSave).toHaveBeenCalled();
    });

    it('should demote employee from senior to mid after 2 consecutive critical weeks', async () => {
      const mockRecordSave = jest.fn().mockResolvedValue(true);
      const mockRecord = {
        _id: employeeRecordId,
        user: userId,
        currentLevel: 'senior',
        consecutiveCriticalWeeks: 1, // Will become 2
        save: mockRecordSave,
      };

      EmployeeRecord.findById.mockResolvedValue(mockRecord);
      Task.countDocuments.mockResolvedValue(0); // critical (<1)

      User.findById.mockResolvedValue({
        _id: userId,
        expTotal: 100,
        save: jest.fn().mockResolvedValue(true),
      });
      ExpLog.create.mockResolvedValue({});

      const result = await employeeService.checkPerformance(employeeRecordId, { applyPenalties: true });

      expect(result.status).toBe(PERFORMANCE_STATUS.CRITICAL);
      expect(result.demoted).toBe(true);
      expect(result.previousLevel).toBe('senior');
      expect(result.newLevel).toBe('mid');
      expect(mockRecord.currentLevel).toBe('mid');
      expect(mockRecord.consecutiveCriticalWeeks).toBe(0); // reset on demotion
    });

    it('should fire junior employee after 3 consecutive critical weeks', async () => {
      const mockRecordSave = jest.fn().mockResolvedValue(true);
      const mockRecord = {
        _id: employeeRecordId,
        user: userId,
        company: companyId,
        currentLevel: 'junior',
        consecutiveCriticalWeeks: 2, // Will become 3
        save: mockRecordSave,
      };

      EmployeeRecord.findById.mockResolvedValue(mockRecord);
      Task.countDocuments.mockResolvedValue(0); // critical (<1)

      User.findById.mockResolvedValue({
        _id: userId,
        expTotal: 100,
        save: jest.fn().mockResolvedValue(true),
      });
      User.findByIdAndUpdate.mockResolvedValue({});
      Company.findById.mockResolvedValue({
        _id: companyId,
        employeeCount: 5,
        save: jest.fn().mockResolvedValue(true),
      });
      ExpLog.create.mockResolvedValue({});

      const result = await employeeService.checkPerformance(employeeRecordId, { applyPenalties: true });

      expect(result.terminated).toBe(true);
      expect(mockRecord.employmentStatus).toBe('terminated');
      expect(mockRecord.exitRecord.exitType).toBe('termination');
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(userId, {
        role: 'job_seeker',
        currentStatus: 'job_seeker',
      });
    });
  });

  describe('Resignation flow', () => {
    it('should set employmentStatus to resigned, reset user role/status and decrement company employeeCount', async () => {
      const mockRecordSave = jest.fn().mockResolvedValue(true);
      const mockRecord = {
        _id: employeeRecordId,
        user: userId,
        company: companyId,
        employmentStatus: 'active',
        save: mockRecordSave,
      };

      EmployeeRecord.findOne.mockResolvedValue(mockRecord);
      User.findByIdAndUpdate.mockResolvedValue({});

      const mockCompanySave = jest.fn().mockResolvedValue(true);
      Company.findById.mockResolvedValue({
        _id: companyId,
        employeeCount: 3,
        save: mockCompanySave,
      });

      const result = await employeeService.resign(userId, 'Moving to another startup');

      expect(mockRecord.employmentStatus).toBe('resigned');
      expect(mockRecord.exitRecord.exitType).toBe('resignation');
      expect(mockRecord.exitRecord.reason).toBe('Moving to another startup');
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(userId, {
        role: 'job_seeker',
        currentStatus: 'job_seeker',
      });
      expect(mockCompanySave).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
  });
});
