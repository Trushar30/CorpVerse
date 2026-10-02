const { requireAuth, requireProfile, requireStatus } = require('../src/middleware/auth');
const employeeController = require('../src/controllers/employee.controller');
const applicationController = require('../src/controllers/application.controller');
const employeeService = require('../src/services/employee.service');
const applicationService = require('../src/services/application.service');
const User = require('../src/models/User');
const { generateToken } = require('../src/utils/jwt');

jest.mock('../src/models/User');
jest.mock('../src/services/employee.service');
jest.mock('../src/services/application.service');

describe('Employee & Application Controllers & Middleware', () => {
  const employeeUserId = '507f1f77bcf86cd799439011';
  const jobSeekerUserId = '507f1f77bcf86cd799439022';
  const appId = '507f1f77bcf86cd799439033';
  const taskId = '507f1f77bcf86cd799439044';

  let employeeToken;
  let jobSeekerToken;

  beforeAll(() => {
    employeeToken = generateToken(employeeUserId);
    jobSeekerToken = generateToken(jobSeekerUserId);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockResponse = () => {
    const res = {};
    res.statusCode = 200;
    res.status = jest.fn().mockImplementation((code) => {
      res.statusCode = code;
      return res;
    });
    res.json = jest.fn().mockImplementation((body) => {
      res.body = body;
      return res;
    });
    return res;
  };

  describe('Auth & Status Middleware', () => {
    it('should reject unauthenticated request with 401', async () => {
      const req = { headers: {} };
      const res = mockResponse();
      const next = jest.fn();

      await requireAuth(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401, message: 'Authentication required' })
      );
    });

    it('should attach user when token is valid', async () => {
      const mockUser = {
        _id: employeeUserId,
        role: 'working',
        currentStatus: 'employee',
        profileComplete: true,
      };
      User.findById.mockResolvedValue(mockUser);

      const req = { headers: { authorization: `Bearer ${employeeToken}` } };
      const res = mockResponse();
      const next = jest.fn();

      await requireAuth(req, res, next);

      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalledWith();
    });

    it('should block incomplete profiles via requireProfile', () => {
      const req = { user: { profileComplete: false } };
      const res = mockResponse();
      const next = jest.fn();

      requireProfile(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 403 })
      );
    });

    it('should block non-employee status via requireStatus', () => {
      const req = { user: { currentStatus: 'job_seeker' } };
      const res = mockResponse();
      const next = jest.fn();

      const middleware = requireStatus('employee');
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 403 })
      );
    });

    it('should allow employee status via requireStatus', () => {
      const req = { user: { currentStatus: 'employee' } };
      const res = mockResponse();
      const next = jest.fn();

      const middleware = requireStatus('employee');
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('Employee Controller Handlers', () => {
    it('getMyTasks should return tasks from employeeService', async () => {
      const req = {
        user: { _id: employeeUserId },
        query: { status: 'assigned' },
      };
      const res = mockResponse();
      const next = jest.fn();

      employeeService.getMyTasks.mockResolvedValue({
        tasks: [{ _id: taskId, title: 'Fix bug' }],
        todayTask: null,
      });

      await employeeController.getMyTasks(req, res, next);

      expect(res.json).toHaveBeenCalled();
      expect(res.body.success).toBe(true);
      expect(res.body.data.tasks.length).toBe(1);
    });

    it('getTodayTask should return existing task or generate daily task', async () => {
      const req = { user: { _id: employeeUserId } };
      const res = mockResponse();
      const next = jest.fn();

      employeeService.getTodayTask.mockResolvedValue(null);
      employeeService.generateDailyTask.mockResolvedValue({
        _id: taskId,
        title: 'Fresh Daily Task',
      });

      await employeeController.getTodayTask(req, res, next);

      expect(employeeService.getTodayTask).toHaveBeenCalledWith(employeeUserId);
      expect(employeeService.generateDailyTask).toHaveBeenCalledWith(employeeUserId);
      expect(res.body.data.title).toBe('Fresh Daily Task');
    });

    it('completeTask should invoke employeeService.completeTask', async () => {
      const req = {
        params: { id: taskId },
        user: { _id: employeeUserId },
        body: { submissionData: { note: 'Done' } },
      };
      const res = mockResponse();
      const next = jest.fn();

      employeeService.completeTask.mockResolvedValue({
        task: { _id: taskId, status: 'completed' },
        expGained: 25,
      });

      await employeeController.completeTask(req, res, next);

      expect(employeeService.completeTask).toHaveBeenCalledWith(
        taskId,
        employeeUserId,
        { note: 'Done' }
      );
      expect(res.body.data.expGained).toBe(25);
    });

    it('resign should invoke employeeService.resign', async () => {
      const req = {
        user: { _id: employeeUserId },
        body: { reason: 'Career change' },
      };
      const res = mockResponse();
      const next = jest.fn();

      employeeService.resign.mockResolvedValue({
        success: true,
        message: 'Resignation accepted.',
      });

      await employeeController.resign(req, res, next);

      expect(employeeService.resign).toHaveBeenCalledWith(employeeUserId, 'Career change');
      expect(res.body.success).toBe(true);
    });

    it('getPerformance should return performance metrics', async () => {
      const req = { user: { _id: employeeUserId } };
      const res = mockResponse();
      const next = jest.fn();

      employeeService.getPerformance.mockResolvedValue({
        status: 'good',
        completedThisWeek: 5,
      });

      await employeeController.getPerformance(req, res, next);

      expect(employeeService.getPerformance).toHaveBeenCalledWith(employeeUserId);
      expect(res.body.data.status).toBe('good');
    });

    it('getMyRecord should return active employee record', async () => {
      const req = { user: { _id: employeeUserId } };
      const res = mockResponse();
      const next = jest.fn();

      employeeService.getMyRecord.mockResolvedValue({
        _id: 'record123',
        currentLevel: 'mid',
      });

      await employeeController.getMyRecord(req, res, next);

      expect(employeeService.getMyRecord).toHaveBeenCalledWith(employeeUserId);
      expect(res.body.data.currentLevel).toBe('mid');
    });

    it('getExpHistory should return paginated EXP logs', async () => {
      const req = {
        user: { _id: employeeUserId },
        query: { page: '1', limit: '10' },
      };
      const res = mockResponse();
      const next = jest.fn();

      employeeService.getExpHistory.mockResolvedValue({
        expLogs: [{ expChange: 25 }],
        pagination: { total: 1 },
      });

      await employeeController.getExpHistory(req, res, next);

      expect(employeeService.getExpHistory).toHaveBeenCalledWith(employeeUserId, req.query);
      expect(res.body.data.expLogs.length).toBe(1);
    });
  });

  describe('Application Offer Handlers', () => {
    it('acceptOffer should call applicationService.acceptOffer', async () => {
      const req = {
        params: { id: appId },
        user: { _id: employeeUserId },
      };
      const res = mockResponse();
      const next = jest.fn();

      applicationService.acceptOffer.mockResolvedValue({
        _id: 'rec1',
        employmentStatus: 'active',
      });

      await applicationController.acceptOffer(req, res, next);

      expect(applicationService.acceptOffer).toHaveBeenCalledWith(appId, employeeUserId);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.employmentStatus).toBe('active');
    });

    it('declineOffer should call applicationService.declineOffer', async () => {
      const req = {
        params: { id: appId },
        user: { _id: employeeUserId },
      };
      const res = mockResponse();
      const next = jest.fn();

      applicationService.declineOffer.mockResolvedValue({
        _id: appId,
        status: 'offer_declined',
      });

      await applicationController.declineOffer(req, res, next);

      expect(applicationService.declineOffer).toHaveBeenCalledWith(appId, employeeUserId);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe('offer_declined');
    });
  });
});
