const employeeService = require('../src/services/employee.service');
const EmployeeRecord = require('../src/models/EmployeeRecord');
const Task = require('../src/models/Task');
const gamificationService = require('../src/services/gamification.service');

jest.mock('../src/models/EmployeeRecord');
jest.mock('../src/models/Task');
jest.mock('../src/services/gamification.service');
jest.mock('../src/services/ai.service');

describe('FR-17 & FR-18: Performance Review Cycle & Merit Raises', () => {
  const userId = '507f1f77bcf86cd799439011';
  const employeeRecordId = '507f1f77bcf86cd799439022';

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('requestPerformanceReview qualification', () => {
    it('should reject with 400 if employee has completed fewer than 5 tasks', async () => {
      const mockRecord = {
        _id: employeeRecordId,
        user: userId,
        employmentStatus: 'active',
      };

      EmployeeRecord.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockRecord),
      });

      // Only 3 tasks completed
      Task.countDocuments.mockResolvedValue(3);

      await expect(employeeService.requestPerformanceReview(userId)).rejects.toMatchObject({
        statusCode: 400,
        message: expect.stringContaining('Minimum 5 completed tasks required'),
      });
    });
  });

  describe('requestPerformanceReview score & outcomes', () => {
    it('should award 10% merit raise and bonus coins when performance score >= 85', async () => {
      const mockSave = jest.fn().mockResolvedValue(true);
      const mockRecord = {
        _id: employeeRecordId,
        user: userId,
        employmentStatus: 'active',
        salary: {
          currentSalary: 90000,
          salaryHistory: [{ effectiveDate: new Date(), amount: 90000, reason: 'Initial offer' }],
        },
        manager: { feedbackHistory: [] },
        reviewHistory: [],
        save: mockSave,
      };

      EmployeeRecord.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockRecord),
      });

      // 10 completed tasks total, 5 this week
      Task.countDocuments
        .mockResolvedValueOnce(10) // total completed
        .mockResolvedValueOnce(5); // completed this week

      // Mock calculateStreak (tasks query inside calculateStreak)
      Task.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([
          { completedAt: new Date() },
          { completedAt: new Date(Date.now() - 86400000) },
          { completedAt: new Date(Date.now() - 172800000) },
          { completedAt: new Date(Date.now() - 259200000) },
          { completedAt: new Date(Date.now() - 345600000) },
        ]),
        select: jest.fn().mockResolvedValue([
          { difficulty: 'hard' },
          { difficulty: 'hard' },
          { difficulty: 'medium' },
        ]),
      });

      gamificationService.awardCoins.mockResolvedValue(true);

      const result = await employeeService.requestPerformanceReview(userId);

      expect(result.score).toBeGreaterThanOrEqual(85);
      expect(result.verdict).toBe('merit_raise');
      expect(result.salaryChange).toBe(9000); // 10% of 90,000
      expect(result.newSalary).toBe(99000);
      expect(mockRecord.salary.currentSalary).toBe(99000);
      expect(mockRecord.salary.salaryHistory).toHaveLength(2);
      expect(gamificationService.awardCoins).toHaveBeenCalledWith(
        userId,
        50,
        expect.stringContaining('Merit Raise')
      );
      expect(mockSave).toHaveBeenCalled();
    });

    it('should award 50 EXP bonus when score is satisfactory (>= 70 and < 85)', async () => {
      const mockSave = jest.fn().mockResolvedValue(true);
      const mockRecord = {
        _id: employeeRecordId,
        user: userId,
        employmentStatus: 'active',
        salary: {
          currentSalary: 85000,
          salaryHistory: [],
        },
        manager: { feedbackHistory: [] },
        reviewHistory: [],
        save: mockSave,
      };

      EmployeeRecord.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockRecord),
      });

      // 6 completed tasks total, 3 this week
      Task.countDocuments
        .mockResolvedValueOnce(6)
        .mockResolvedValueOnce(3);

      Task.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([
          { completedAt: new Date() },
          { completedAt: new Date(Date.now() - 86400000) },
        ]),
        select: jest.fn().mockResolvedValue([
          { difficulty: 'medium' },
          { difficulty: 'easy' },
        ]),
      });

      gamificationService.awardExp.mockResolvedValue(true);

      const result = await employeeService.requestPerformanceReview(userId);

      expect(result.verdict).toBe('satisfactory');
      expect(result.salaryChange).toBe(0);
      expect(result.expAwarded).toBe(50);
      expect(gamificationService.awardExp).toHaveBeenCalled();
      expect(mockSave).toHaveBeenCalled();
    });
  });
});
