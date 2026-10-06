const employeeService = require('../src/services/employee.service');
const EmployeeRecord = require('../src/models/EmployeeRecord');
const Task = require('../src/models/Task');
const User = require('../src/models/User');

jest.mock('../src/models/EmployeeRecord');
jest.mock('../src/models/Task');
jest.mock('../src/models/User');
jest.mock('../src/services/gamification.service');
jest.mock('../src/services/ai.service');

describe('FR-16: AI Team Manager in Employee Dashboard', () => {
  const userId = '507f1f77bcf86cd799439011';
  const employeeRecordId = '507f1f77bcf86cd799439022';

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getManagerProfile', () => {
    it('should return manager profile with name Sarah Chen and feedback history', async () => {
      const mockRecord = {
        _id: employeeRecordId,
        user: userId,
        employmentStatus: 'active',
        manager: {
          name: 'Sarah Chen',
          title: 'Engineering Director',
          avatarUrl: '/avatars/manager-1.png',
          style: 'supportive',
          feedbackHistory: [
            {
              date: new Date(),
              note: 'Welcome to the team!',
              sentiment: 'praise',
            },
          ],
        },
        save: jest.fn().mockResolvedValue(true),
      };

      EmployeeRecord.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockRecord),
      });

      const manager = await employeeService.getManagerProfile(userId);

      expect(manager.name).toBe('Sarah Chen');
      expect(manager.title).toBe('Engineering Director');
      expect(manager.feedbackHistory).toHaveLength(1);
    });
  });

  describe('request1On1Feedback', () => {
    it('should evaluate recent tasks and append advice to manager feedback history', async () => {
      const mockSave = jest.fn().mockResolvedValue(true);
      const mockRecord = {
        _id: employeeRecordId,
        user: userId,
        employmentStatus: 'active',
        manager: {
          name: 'Sarah Chen',
          title: 'Engineering Director',
          style: 'supportive',
          feedbackHistory: [],
        },
        save: mockSave,
      };

      EmployeeRecord.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockRecord),
      });

      Task.countDocuments.mockResolvedValue(5); // 5 tasks this week
      Task.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([]),
      });

      const result = await employeeService.request1On1Feedback(userId);

      expect(result.manager.feedbackHistory).toHaveLength(1);
      expect(result.latestFeedback.sentiment).toBe('praise');
      expect(result.latestFeedback.note).toContain('Exceptional momentum');
      expect(mockSave).toHaveBeenCalled();
    });
  });
});
