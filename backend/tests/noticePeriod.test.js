const employeeService = require('../src/services/employee.service');
const EmployeeRecord = require('../src/models/EmployeeRecord');
const User = require('../src/models/User');
const Company = require('../src/models/Company');
const Role = require('../src/models/Role');

jest.mock('../src/models/EmployeeRecord');
jest.mock('../src/models/User');
jest.mock('../src/models/Company');
jest.mock('../src/models/Role');
jest.mock('../src/services/gamification.service');
jest.mock('../src/services/ai.service');

describe('FR-20: Resignation Notice Period Flow', () => {
  const userId = '507f1f77bcf86cd799439011';
  const employeeRecordId = '507f1f77bcf86cd799439022';
  const companyId = '507f1f77bcf86cd799439033';
  const roleId = '507f1f77bcf86cd799439044';

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initiateNoticePeriod', () => {
    it('should transition status to notice_period, create 2 handover tasks and maintain user as employee', async () => {
      const mockSave = jest.fn().mockResolvedValue(true);
      const mockRecord = {
        _id: employeeRecordId,
        user: userId,
        company: { _id: companyId, name: 'CyberCorp' },
        role: { _id: roleId, title: 'Engineer' },
        employmentStatus: 'active',
        save: mockSave,
      };

      EmployeeRecord.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockRecord),
      });

      const result = await employeeService.initiateNoticePeriod(userId, 'Pursuing entrepreneurship');

      expect(mockRecord.employmentStatus).toBe('notice_period');
      expect(mockRecord.noticePeriod.noticeTasksRemaining).toBe(2);
      expect(mockRecord.noticePeriod.handoverTasks).toHaveLength(2);
      expect(mockRecord.noticePeriod.handoverTasks[0].isCompleted).toBe(false);
      expect(mockSave).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.message).toContain('Notice period initiated');
    });
  });

  describe('completeNoticeTask & auto-finalization', () => {
    it('should complete first handover task and decrement noticeTasksRemaining to 1', async () => {
      const mockSave = jest.fn().mockResolvedValue(true);
      const mockRecord = {
        _id: employeeRecordId,
        user: userId,
        company: { _id: companyId, name: 'CyberCorp' },
        role: { _id: roleId, title: 'Engineer' },
        employmentStatus: 'notice_period',
        noticePeriod: {
          noticeTasksRemaining: 2,
          handoverTasks: [
            { title: 'Doc Handover', isCompleted: false },
            { title: 'Team Briefing', isCompleted: false },
          ],
        },
        save: mockSave,
      };

      EmployeeRecord.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockRecord),
      });

      const result = await employeeService.completeNoticeTask(userId, 0);

      expect(mockRecord.noticePeriod.handoverTasks[0].isCompleted).toBe(true);
      expect(mockRecord.noticePeriod.noticeTasksRemaining).toBe(1);
      expect(result.finalized).toBe(false);
      expect(mockRecord.employmentStatus).toBe('notice_period');
      expect(mockSave).toHaveBeenCalled();
    });

    it('should auto-finalize resignation when final handover task is completed', async () => {
      const mockSave = jest.fn().mockResolvedValue(true);
      const mockRecord = {
        _id: employeeRecordId,
        user: userId,
        company: companyId,
        role: roleId,
        hiredAt: new Date(Date.now() - 30 * 86400000),
        employmentStatus: 'notice_period',
        noticePeriod: {
          reason: 'Pursuing new venture',
          noticeTasksRemaining: 1,
          handoverTasks: [
            { title: 'Doc Handover', isCompleted: true },
            { title: 'Team Briefing', isCompleted: false },
          ],
        },
        save: mockSave,
      };

      EmployeeRecord.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockRecord),
      });

      User.findById.mockResolvedValue({ _id: userId, name: 'Alex Rivera' });
      User.findByIdAndUpdate.mockResolvedValue({});
      Company.findById.mockResolvedValue({ _id: companyId, name: 'CyberCorp', employeeCount: 5, save: jest.fn() });
      Role.findById.mockResolvedValue({ _id: roleId, title: 'Senior Engineer' });

      const result = await employeeService.completeNoticeTask(userId, 1);

      expect(mockRecord.employmentStatus).toBe('resigned');
      expect(mockRecord.exitRecord.exitType).toBe('resignation');
      expect(mockRecord.noticePeriod.referenceLetter).toBeDefined();
      expect(mockRecord.noticePeriod.referenceLetter.companyName).toBe('CyberCorp');
      expect(mockRecord.noticePeriod.referenceLetter.rating).toContain('Exemplary');
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(userId, {
        role: 'job_seeker',
        currentStatus: 'job_seeker',
      });
      expect(result.finalized).toBe(true);
      expect(result.referenceLetter).toBeDefined();
    });
  });
});
