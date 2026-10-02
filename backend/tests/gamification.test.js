const gamificationService = require('../src/services/gamification.service');
const User = require('../src/models/User');
const EmployeeRecord = require('../src/models/EmployeeRecord');
const ExpLog = require('../src/models/ExpLog');
const Badge = require('../src/models/Badge');
const Task = require('../src/models/Task');
const Company = require('../src/models/Company');
const Application = require('../src/models/Application');
const {
  ROLE_LEVEL,
  EXP_SOURCE,
  PROMOTION_RULES,
  STREAK_REWARDS,
  CORPCOIN_EVENTS,
  BADGE_DEFINITIONS,
  FOUNDER_UNLOCK_EXP,
} = require('../src/utils/constants');

jest.mock('../src/models/User');
jest.mock('../src/models/EmployeeRecord');
jest.mock('../src/models/ExpLog');
jest.mock('../src/models/Badge');
jest.mock('../src/models/Task');
jest.mock('../src/models/Company');
jest.mock('../src/models/Application');

describe('Gamification Engine & Progression Service', () => {
  const userId = '507f1f77bcf86cd799439011';
  const employeeRecordId = '507f1f77bcf86cd799439055';
  const companyId = '507f1f77bcf86cd799439033';

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('EXP Award System (awardExp & deductExp)', () => {
    it('should award EXP, increment user total, create ExpLog, and return results', async () => {
      const mockUserSave = jest.fn().mockResolvedValue(true);
      const mockUser = {
        _id: userId,
        expTotal: 50,
        longestStreak: 0,
        save: mockUserSave,
      };

      User.findById.mockResolvedValue(mockUser);
      EmployeeRecord.findOne.mockResolvedValue(null);
      ExpLog.create.mockImplementation((data) => Promise.resolve({ _id: 'log1', ...data }));
      Badge.findOne.mockResolvedValue(null);

      const result = await gamificationService.awardExp(userId, 30, 'task_completion', {
        reason: 'Completed bug fix',
      });

      expect(mockUser.expTotal).toBe(80);
      expect(mockUserSave).toHaveBeenCalled();
      expect(result.newTotal).toBe(80);
      expect(result.awarded).toBe(30);
      expect(ExpLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user: userId,
          expChange: 30,
          reason: 'Completed bug fix',
          source: 'task_completion',
        })
      );
      expect(result.founderUnlocked).toBe(false);
    });

    it('should flag founderUnlocked when user crosses 500 EXP', async () => {
      const mockUser = {
        _id: userId,
        expTotal: 480,
        longestStreak: 0,
        save: jest.fn().mockResolvedValue(true),
      };

      User.findById.mockResolvedValue(mockUser);
      EmployeeRecord.findOne.mockResolvedValue(null);
      ExpLog.create.mockResolvedValue({});
      Badge.findOne.mockResolvedValue(null);
      Badge.create.mockResolvedValue({ unlockedAt: new Date() });

      const result = await gamificationService.awardExp(userId, 30, 'task_completion');

      expect(mockUser.expTotal).toBe(510);
      expect(result.founderUnlocked).toBe(true);
    });

    it('should deduct EXP with floor at 0 and log penalty in ExpLog', async () => {
      const mockUserSave = jest.fn().mockResolvedValue(true);
      const mockUser = {
        _id: userId,
        expTotal: 15,
        save: mockUserSave,
      };

      User.findById.mockResolvedValue(mockUser);
      EmployeeRecord.findOne.mockResolvedValue(null);
      ExpLog.create.mockImplementation((data) => Promise.resolve({ _id: 'pen1', ...data }));

      const result = await gamificationService.deductExp(userId, 25, 'Performance penalty');

      expect(mockUser.expTotal).toBe(0); // floored at 0
      expect(result.newTotal).toBe(0);
      expect(result.deducted).toBe(15);
      expect(ExpLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user: userId,
          expChange: -25,
          reason: 'Performance penalty',
          source: EXP_SOURCE.PENALTY,
        })
      );
    });
  });

  describe('Promotion Rules & Progression Checks', () => {
    it('should report ineligible when stats do not meet multi-metric criteria', async () => {
      const mockRecord = {
        _id: employeeRecordId,
        user: userId,
        employmentStatus: 'active',
        currentLevel: 'junior',
        save: jest.fn().mockResolvedValue(true),
      };

      EmployeeRecord.findOne.mockResolvedValue(mockRecord);
      EmployeeRecord.findById.mockResolvedValue(mockRecord);
      User.findById.mockResolvedValue({
        _id: userId,
        expTotal: 100, // < 150 required
        longestStreak: 2, // < 5 required
      });
      Task.countDocuments.mockResolvedValue(10); // < 30 required

      const promo = await gamificationService.checkPromotion(userId);

      expect(promo.eligible).toBe(false);
      expect(promo.currentLevel).toBe('junior');
      expect(promo.nextLevel).toBe('mid');
      expect(promo.progress.exp.current).toBe(100);
      expect(promo.progress.exp.required).toBe(150);
      expect(promo.progress.tasks.current).toBe(10);
      expect(promo.progress.tasks.required).toBe(30);
    });

    it('should report eligible and promote when all junior_to_mid criteria are satisfied', async () => {
      const mockRecordSave = jest.fn().mockResolvedValue(true);
      const mockRecord = {
        _id: employeeRecordId,
        user: userId,
        employmentStatus: 'active',
        currentLevel: 'junior',
        save: mockRecordSave,
      };

      EmployeeRecord.findOne.mockResolvedValue(mockRecord);
      EmployeeRecord.findById.mockResolvedValue(mockRecord);
      User.findById.mockResolvedValue({
        _id: userId,
        expTotal: 160, // >= 150
        longestStreak: 6, // >= 5
      });
      // Mock task counts: total tasks = 35 (>=30), monthly tasks = 20 (avg 5/wk >= 4)
      Task.countDocuments
        .mockResolvedValueOnce(35) // total completed
        .mockResolvedValueOnce(20); // monthly completed

      ExpLog.create.mockResolvedValue({});

      const promo = await gamificationService.checkPromotion(userId);

      expect(promo.eligible).toBe(true);
      expect(promo.promoted).toBe(true);
      expect(mockRecord.currentLevel).toBe('mid');
      expect(mockRecordSave).toHaveBeenCalled();
    });

    it('should execute promotion, advance level, award bonus EXP and CorpCoins', async () => {
      const mockRecordSave = jest.fn().mockResolvedValue(true);
      const mockRecord = {
        _id: employeeRecordId,
        user: userId,
        employmentStatus: 'active',
        currentLevel: 'junior',
        save: mockRecordSave,
      };

      const mockUserSave = jest.fn().mockResolvedValue(true);
      const mockUser = {
        _id: userId,
        expTotal: 160,
        corpCoins: 100,
        save: mockUserSave,
      };

      EmployeeRecord.findOne.mockResolvedValue(mockRecord);
      EmployeeRecord.findById.mockResolvedValue(mockRecord);
      User.findById.mockResolvedValue(mockUser);
      ExpLog.create.mockResolvedValue({});
      Badge.findOne.mockResolvedValue(null);
      Badge.create.mockResolvedValue({ unlockedAt: new Date() });

      const promoResult = await gamificationService.executePromotion(userId);

      expect(promoResult.previousLevel).toBe('junior');
      expect(promoResult.newLevel).toBe('mid');
      expect(promoResult.bonusExp).toBe(50); // junior_to_mid bonus
      expect(promoResult.bonusCoins).toBe(50);
      expect(mockRecord.currentLevel).toBe('mid');
      expect(mockRecordSave).toHaveBeenCalled();
    });

    it('should return ineligible if already at senior level', async () => {
      const mockRecord = {
        _id: employeeRecordId,
        user: userId,
        employmentStatus: 'active',
        currentLevel: 'senior',
      };

      EmployeeRecord.findOne.mockResolvedValue(mockRecord);
      EmployeeRecord.findById.mockResolvedValue(mockRecord);
      User.findById.mockResolvedValue({ _id: userId, expTotal: 1000 });

      const promo = await gamificationService.checkPromotion(userId);

      expect(promo.eligible).toBe(false);
      expect(promo.reason).toBe('Already at max level');
    });
  });

  describe('Streak System (updateStreak & milestone bonuses)', () => {
    it('should maintain streak if user completes multiple tasks on the same day', async () => {
      const today = new Date();
      const mockUser = {
        _id: userId,
        currentStreak: 4,
        longestStreak: 5,
        lastTaskCompletedDate: today,
        save: jest.fn().mockResolvedValue(true),
      };

      User.findById.mockResolvedValue(mockUser);

      const result = await gamificationService.updateStreak(userId);

      expect(result.currentStreak).toBe(4);
      expect(result.longestStreak).toBe(5);
      expect(mockUser.save).not.toHaveBeenCalled();
    });

    it('should increment streak on consecutive day completion', async () => {
      const yesterday = new Date(Date.now() - 86400000);
      const mockUserSave = jest.fn().mockResolvedValue(true);
      const mockUser = {
        _id: userId,
        currentStreak: 2,
        longestStreak: 2,
        lastTaskCompletedDate: yesterday,
        expTotal: 50,
        save: mockUserSave,
      };

      User.findById.mockResolvedValue(mockUser);
      Badge.findOne.mockResolvedValue(null);
      Badge.create.mockResolvedValue({ unlockedAt: new Date() });
      ExpLog.create.mockResolvedValue({});

      const result = await gamificationService.updateStreak(userId);

      expect(mockUser.currentStreak).toBe(3);
      expect(mockUser.longestStreak).toBe(3);
      expect(mockUserSave).toHaveBeenCalled();
      // 3-day milestone awards +5 EXP bonus
      expect(result.bonusExp).toBe(5);
    });

    it('should reset streak to 1 if consecutive days were broken', async () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 86400000);
      const mockUserSave = jest.fn().mockResolvedValue(true);
      const mockUser = {
        _id: userId,
        currentStreak: 8,
        longestStreak: 8,
        lastTaskCompletedDate: threeDaysAgo,
        expTotal: 100,
        save: mockUserSave,
      };

      User.findById.mockResolvedValue(mockUser);

      const result = await gamificationService.updateStreak(userId);

      expect(mockUser.currentStreak).toBe(1);
      expect(mockUser.longestStreak).toBe(8); // longest retained
      expect(result.currentStreak).toBe(1);
    });

    it('should award 15 EXP, 25 CorpCoins, and streak_7 badge at 7-day milestone', async () => {
      const yesterday = new Date(Date.now() - 86400000);
      const mockUserSave = jest.fn().mockResolvedValue(true);
      const mockUser = {
        _id: userId,
        currentStreak: 6,
        longestStreak: 6,
        lastTaskCompletedDate: yesterday,
        expTotal: 100,
        corpCoins: 50,
        save: mockUserSave,
      };

      User.findById.mockResolvedValue(mockUser);
      Badge.findOne.mockResolvedValue(null);
      Badge.create.mockImplementation((data) => Promise.resolve({ ...data, unlockedAt: new Date() }));
      ExpLog.create.mockResolvedValue({});

      const result = await gamificationService.updateStreak(userId);

      expect(mockUser.currentStreak).toBe(7);
      expect(result.bonusExp).toBe(15);
      expect(result.bonusCoins).toBe(25);
      expect(mockUser.corpCoins).toBe(75);
    });
  });

  describe('Achievement Badge System', () => {
    it('should award unique badge and not duplicate existing unlocked badge', async () => {
      const mockUser = {
        _id: userId,
        expTotal: 120,
      };
      User.findById.mockResolvedValue(mockUser);

      // Already has exp_100 badge
      Badge.findOne.mockResolvedValue({ _id: 'badge1', badgeType: 'exp_100' });

      const awarded = await gamificationService.checkAndAwardBadges(userId, 'exp_updated', {
        expTotal: 120,
      });

      expect(awarded.length).toBe(0);
      expect(Badge.create).not.toHaveBeenCalled();
    });

    it('should verify eligibility and create badge for new achievements', async () => {
      const mockUser = {
        _id: userId,
        expTotal: 550,
      };
      User.findById.mockResolvedValue(mockUser);
      Badge.findOne.mockResolvedValue(null);
      Badge.create.mockImplementation((data) => Promise.resolve({ ...data, unlockedAt: new Date() }));

      const awarded = await gamificationService.checkAndAwardBadges(userId, 'exp_updated', {
        expTotal: 550,
      });

      const awardedTypes = awarded.map((b) => b.badgeType);
      expect(awardedTypes).toContain('exp_100');
      expect(awardedTypes).toContain('exp_500');
      expect(awardedTypes).toContain('founder_unlocked');
    });

    it('getUserBadges should return status for all 19 system badges', async () => {
      const unlockedDate = new Date();
      Badge.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([
            { badgeType: 'first_application', unlockedAt: unlockedDate },
            { badgeType: 'exp_100', unlockedAt: unlockedDate },
          ]),
        }),
      });

      const result = await gamificationService.getUserBadges(userId);

      expect(result.totalUnlocked).toBe(2);
      expect(result.totalAvailable).toBe(19);
      expect(result.badges.length).toBe(19);

      const firstAppBadge = result.badges.find((b) => b.badgeType === 'first_application');
      expect(firstAppBadge.unlocked).toBe(true);

      const streak100Badge = result.badges.find((b) => b.badgeType === 'streak_100');
      expect(streak100Badge.unlocked).toBe(false);
    });
  });

  describe('Founder Mode Unlock & Transition', () => {
    it('should reject transition if user has less than 500 EXP', async () => {
      User.findById.mockResolvedValue({
        _id: userId,
        expTotal: 300,
      });

      await expect(gamificationService.transitionToFounder(userId)).rejects.toMatchObject({
        statusCode: 400,
        message: expect.stringContaining('500 EXP'),
      });
    });

    it('should transition eligible user (500+ EXP) to founder status and resign active employee record', async () => {
      const mockUserSave = jest.fn().mockResolvedValue(true);
      const mockUser = {
        _id: userId,
        expTotal: 520,
        role: 'working',
        currentStatus: 'employee',
        save: mockUserSave,
      };

      const mockEmployeeSave = jest.fn().mockResolvedValue(true);
      const mockEmployee = {
        _id: employeeRecordId,
        user: userId,
        company: companyId,
        employmentStatus: 'active',
        save: mockEmployeeSave,
      };

      const mockCompanySave = jest.fn().mockResolvedValue(true);
      const mockCompany = {
        _id: companyId,
        employeeCount: 4,
        save: mockCompanySave,
      };

      User.findById.mockResolvedValue(mockUser);
      EmployeeRecord.findOne.mockResolvedValue(mockEmployee);
      Company.findById.mockResolvedValue(mockCompany);
      Badge.findOne.mockResolvedValue(null);
      Badge.create.mockResolvedValue({ unlockedAt: new Date() });

      const result = await gamificationService.transitionToFounder(userId);

      expect(result.success).toBe(true);
      expect(mockUser.role).toBe('founder');
      expect(mockUser.currentStatus).toBe('founder');
      expect(mockUserSave).toHaveBeenCalled();
      expect(mockEmployee.employmentStatus).toBe('resigned');
      expect(mockEmployeeSave).toHaveBeenCalled();
      expect(mockCompany.employeeCount).toBe(3);
      expect(mockCompanySave).toHaveBeenCalled();
    });

    it('should return alreadyFounder message if user is already founder', async () => {
      User.findById.mockResolvedValue({
        _id: userId,
        expTotal: 600,
        role: 'founder',
        currentStatus: 'founder',
      });

      const result = await gamificationService.transitionToFounder(userId);
      expect(result.alreadyFounder).toBe(true);
    });
  });

  describe('Demotion and Performance Penalties', () => {
    it('should demote from senior to mid if EXP falls below 350', async () => {
      const mockRecordSave = jest.fn().mockResolvedValue(true);
      const mockRecord = {
        _id: employeeRecordId,
        user: userId,
        currentLevel: 'senior',
        employmentStatus: 'active',
        save: mockRecordSave,
      };

      EmployeeRecord.findOne.mockResolvedValue(mockRecord);
      User.findById.mockResolvedValue({ _id: userId, expTotal: 300 });
      ExpLog.create.mockResolvedValue({});

      const result = await gamificationService.checkDemotion(userId);

      expect(result.demoted).toBe(true);
      expect(result.previousLevel).toBe('senior');
      expect(result.newLevel).toBe('mid');
      expect(mockRecord.currentLevel).toBe('mid');
      expect(mockRecordSave).toHaveBeenCalled();
    });

    it('should demote from mid to junior if EXP falls below 150', async () => {
      const mockRecordSave = jest.fn().mockResolvedValue(true);
      const mockRecord = {
        _id: employeeRecordId,
        user: userId,
        currentLevel: 'mid',
        employmentStatus: 'active',
        save: mockRecordSave,
      };

      EmployeeRecord.findOne.mockResolvedValue(mockRecord);
      User.findById.mockResolvedValue({ _id: userId, expTotal: 120 });
      ExpLog.create.mockResolvedValue({});

      const result = await gamificationService.checkDemotion(userId);

      expect(result.demoted).toBe(true);
      expect(result.previousLevel).toBe('mid');
      expect(result.newLevel).toBe('junior');
      expect(mockRecord.currentLevel).toBe('junior');
    });

    it('should not demote if junior', async () => {
      const mockRecord = {
        _id: employeeRecordId,
        user: userId,
        currentLevel: 'junior',
        employmentStatus: 'active',
      };

      EmployeeRecord.findOne.mockResolvedValue(mockRecord);
      User.findById.mockResolvedValue({ _id: userId, expTotal: 0 });

      const result = await gamificationService.checkDemotion(userId);

      expect(result.demoted).toBe(false);
    });
  });

  describe('addExp Backward Compatibility Wrapper', () => {
    it('addExp should delegate positive amount to awardExp', async () => {
      const mockUser = { _id: userId, expTotal: 50, save: jest.fn().mockResolvedValue(true) };
      User.findById.mockResolvedValue(mockUser);
      EmployeeRecord.findOne.mockResolvedValue(null);
      ExpLog.create.mockResolvedValue({});
      Badge.findOne.mockResolvedValue(null);

      const result = await gamificationService.addExp(userId, 20, 'Task done', 'task_completion');

      expect(result.user.expTotal).toBe(70);
    });

    it('addExp should delegate negative amount to deductExp', async () => {
      const mockUser = { _id: userId, expTotal: 50, save: jest.fn().mockResolvedValue(true) };
      User.findById.mockResolvedValue(mockUser);
      EmployeeRecord.findOne.mockResolvedValue(null);
      ExpLog.create.mockResolvedValue({});

      const result = await gamificationService.addExp(userId, -15, 'Penalty', 'penalty');

      expect(result.user.expTotal).toBe(35);
    });
  });

  describe('Additional Badge Criteria Verification', () => {
    it('should check eligibility for application, job, task counts, and company badges', async () => {
      User.findById.mockResolvedValue({
        _id: userId,
        currentStreak: 30,
        longestStreak: 100,
        expTotal: 1200,
      });

      Application.countDocuments.mockResolvedValue(1);
      EmployeeRecord.countDocuments.mockResolvedValue(1);
      EmployeeRecord.find.mockReturnValue({
        select: jest.fn().mockResolvedValue([{ _id: employeeRecordId }]),
      });
      Task.countDocuments.mockResolvedValue(110);
      Company.countDocuments.mockResolvedValue(1);
      Company.find.mockReturnValue({
        select: jest.fn().mockResolvedValue([{ _id: companyId }]),
      });

      expect(await gamificationService.checkBadgeEligibility(userId, 'first_application')).toBe(true);
      expect(await gamificationService.checkBadgeEligibility(userId, 'first_job')).toBe(true);
      expect(await gamificationService.checkBadgeEligibility(userId, 'streak_14')).toBe(true);
      expect(await gamificationService.checkBadgeEligibility(userId, 'streak_30')).toBe(true);
      expect(await gamificationService.checkBadgeEligibility(userId, 'streak_100')).toBe(true);
      expect(await gamificationService.checkBadgeEligibility(userId, 'tasks_10')).toBe(true);
      expect(await gamificationService.checkBadgeEligibility(userId, 'tasks_50')).toBe(true);
      expect(await gamificationService.checkBadgeEligibility(userId, 'tasks_100')).toBe(true);
      expect(await gamificationService.checkBadgeEligibility(userId, 'first_company')).toBe(true);
      expect(await gamificationService.checkBadgeEligibility(userId, 'first_hire')).toBe(true);
      expect(await gamificationService.checkBadgeEligibility(userId, 'profitable_quarter', { profitable: true })).toBe(true);
      expect(await gamificationService.checkBadgeEligibility(userId, 'exp_1000')).toBe(true);
    });
  });
});
