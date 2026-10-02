const applicationService = require('../src/services/application.service');
const interviewService = require('../src/services/interview.service');
const employeeService = require('../src/services/employee.service');
const Application = require('../src/models/Application');
const EmployeeRecord = require('../src/models/EmployeeRecord');
const User = require('../src/models/User');
const Role = require('../src/models/Role');
const Company = require('../src/models/Company');
const Interview = require('../src/models/Interview');
const aiService = require('../src/services/ai.service');
const { APPLICATION_STATUS, INTERVIEW_RESULT } = require('../src/utils/constants');

jest.mock('../src/models/Application');
jest.mock('../src/models/EmployeeRecord');
jest.mock('../src/models/User');
jest.mock('../src/models/Role');
jest.mock('../src/models/Company');
jest.mock('../src/models/Interview');
jest.mock('../src/services/employee.service');
jest.mock('../src/services/ai.service');

describe('Offer Acceptance and Interview Transition Flow', () => {
  const userId = '507f1f77bcf86cd799439011';
  const roleId = '507f1f77bcf86cd799439022';
  const companyId = '507f1f77bcf86cd799439033';
  const appId = '507f1f77bcf86cd799439044';
  const recordId = '507f1f77bcf86cd799439055';

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('acceptOffer', () => {
    it('should throw 404 if application does not exist', async () => {
      Application.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      await expect(applicationService.acceptOffer(appId, userId)).rejects.toMatchObject({
        statusCode: 404,
        message: 'Application not found',
      });
    });

    it('should throw 403 if application does not belong to user', async () => {
      Application.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          _id: appId,
          user: '507f1f77bcf86cd799439999',
          status: APPLICATION_STATUS.OFFER_PENDING,
          role: { _id: roleId, company: companyId, level: 'mid' },
        }),
      });

      await expect(applicationService.acceptOffer(appId, userId)).rejects.toMatchObject({
        statusCode: 403,
        message: 'You do not have permission to accept this offer',
      });
    });

    it('should throw 400 if application is not in offer_pending status', async () => {
      Application.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          _id: appId,
          user: userId,
          status: APPLICATION_STATUS.PENDING_SCREENING,
          role: { _id: roleId, company: companyId, level: 'mid' },
        }),
      });

      await expect(applicationService.acceptOffer(appId, userId)).rejects.toMatchObject({
        statusCode: 400,
      });
    });

    it('should transition user to employee, create EmployeeRecord, update counts and generate first task', async () => {
      const mockSave = jest.fn().mockResolvedValue(true);
      const mockApp = {
        _id: appId,
        user: userId,
        status: APPLICATION_STATUS.OFFER_PENDING,
        role: { _id: roleId, company: companyId, level: 'mid' },
        save: mockSave,
      };

      Application.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockApp),
      });

      EmployeeRecord.create.mockResolvedValue({
        _id: recordId,
        user: userId,
        company: companyId,
        role: roleId,
        employmentStatus: 'active',
        currentLevel: 'mid',
      });

      EmployeeRecord.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          _id: recordId,
          user: userId,
          company: { _id: companyId, name: 'Acme Corp' },
          role: { _id: roleId, title: 'Backend Dev' },
          employmentStatus: 'active',
          currentLevel: 'mid',
        }),
      });

      User.findByIdAndUpdate.mockResolvedValue({});
      Role.findByIdAndUpdate.mockResolvedValue({});
      Company.findByIdAndUpdate.mockResolvedValue({});
      employeeService.generateDailyTask.mockResolvedValue({ _id: 'task1' });

      const result = await applicationService.acceptOffer(appId, userId);

      expect(mockApp.status).toBe(APPLICATION_STATUS.OFFER_ACCEPTED);
      expect(mockSave).toHaveBeenCalled();
      expect(EmployeeRecord.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user: userId,
          company: companyId,
          role: roleId,
          employmentStatus: 'active',
          currentLevel: 'mid',
        })
      );
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(userId, {
        role: 'working',
        currentStatus: 'employee',
      });
      expect(Role.findByIdAndUpdate).toHaveBeenCalledWith(roleId, {
        $inc: { filledCount: 1 },
      });
      expect(Company.findByIdAndUpdate).toHaveBeenCalledWith(companyId, {
        $inc: { employeeCount: 1 },
      });
      expect(employeeService.generateDailyTask).toHaveBeenCalledWith(recordId);
      expect(result.employmentStatus).toBe('active');
    });
  });

  describe('declineOffer', () => {
    it('should decline offer if status is offer_pending', async () => {
      const mockSave = jest.fn().mockResolvedValue(true);
      const mockApp = {
        _id: appId,
        user: userId,
        status: APPLICATION_STATUS.OFFER_PENDING,
        save: mockSave,
      };
      Application.findById.mockResolvedValue(mockApp);

      const result = await applicationService.declineOffer(appId, userId);

      expect(result.status).toBe(APPLICATION_STATUS.OFFER_DECLINED);
      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe('Auto-advance to offer_pending after interview pass', () => {
    it('should set application status to offer_pending when interview is passed', async () => {
      const mockAppSave = jest.fn().mockResolvedValue(true);
      const mockInterviewSave = jest.fn().mockResolvedValue(true);

      const mockInterview = {
        _id: 'interview123',
        application: appId,
        result: INTERVIEW_RESULT.IN_PROGRESS,
        transcript: [{ role: 'user', message: 'Hello' }],
        save: mockInterviewSave,
      };

      const mockApp = {
        _id: appId,
        status: APPLICATION_STATUS.INTERVIEW_IN_PROGRESS,
        feedbacks: [],
        role: { title: 'Engineer', level: 'mid', domain: 'Tech', company: { name: 'Acme' } },
        save: mockAppSave,
      };

      Interview.findById.mockResolvedValue(mockInterview);
      Application.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockApp),
      });

      aiService.evaluateInterview.mockResolvedValue({
        overallScore: 85,
        verdict: 'PASS',
        evaluationNotes: 'Great job!',
      });

      await interviewService.evaluateInterview('interview123');

      expect(mockInterview.result).toBe(INTERVIEW_RESULT.PASSED);
      expect(mockApp.status).toBe(APPLICATION_STATUS.OFFER_PENDING);
      expect(mockAppSave).toHaveBeenCalled();
    });
  });
});
