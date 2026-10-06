const companyService = require('../src/services/company.service');
const companyController = require('../src/controllers/company.controller');
const founderController = require('../src/controllers/founder.controller');
const { Company, Role, Application, EmployeeRecord, Domain, AIBot, BotPurchase } = require('../src/models');

jest.mock('../src/models', () => ({
  Company: {
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    countDocuments: jest.fn(),
  },
  Role: {
    find: jest.fn(),
    countDocuments: jest.fn(),
    aggregate: jest.fn(),
  },
  Application: {
    find: jest.fn(),
    countDocuments: jest.fn(),
  },
  EmployeeRecord: {
    countDocuments: jest.fn(),
  },
  Domain: {
    find: jest.fn(),
  },
  User: {
    findById: jest.fn(),
  },
  AIBot: {
    find: jest.fn(),
    findById: jest.fn(),
  },
  BotPurchase: {
    find: jest.fn(),
  },
}));

describe('Company Service & Controller & Founder Applicants', () => {
  const companyId = '507f1f77bcf86cd799439001';
  const founderId = '507f1f77bcf86cd799439002';
  const roleId1 = '507f1f77bcf86cd799439003';
  const roleId2 = '507f1f77bcf86cd799439004';

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

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('CompanyService.getCompanies', () => {
    it('should return paginated companies with openRoleCount and openRolesCount', async () => {
      const mockCompanies = [
        { _id: companyId, name: 'CyberCorp', domain: 'fintech' },
      ];

      Company.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue(mockCompanies),
              }),
            }),
          }),
        }),
      });
      Company.countDocuments.mockResolvedValue(1);
      Role.aggregate.mockResolvedValue([
        { _id: companyId, count: 3 },
      ]);

      const result = await companyService.getCompanies({ domain: 'fintech', page: 1, limit: 10 });

      expect(result.companies).toHaveLength(1);
      expect(result.companies[0].openRoleCount).toBe(3);
      expect(result.companies[0].openRolesCount).toBe(3);
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.pages).toBe(1);
      expect(result.pagination.totalPages).toBe(1);
    });

    it('should apply search filter by company name', async () => {
      const mockCompanies = [
        { _id: companyId, name: 'CyberCorp', domain: 'fintech' },
      ];

      Company.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue(mockCompanies),
              }),
            }),
          }),
        }),
      });
      Company.countDocuments.mockResolvedValue(1);
      Role.aggregate.mockResolvedValue([]);

      const result = await companyService.getCompanies({ search: 'Cyber' });
      expect(Company.find).toHaveBeenCalledWith(
        expect.objectContaining({
          name: { $regex: 'Cyber', $options: 'i' },
        })
      );
      expect(result.companies).toHaveLength(1);
    });
  });

  describe('CompanyService.getCompanyById', () => {
    it('should return null if company not found', async () => {
      Company.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(null),
        }),
      });

      const result = await companyService.getCompanyById(companyId);
      expect(result).toBeNull();
    });

    it('should return company with attached roles', async () => {
      const mockComp = { _id: companyId, name: 'CyberCorp' };
      const mockRoles = [{ _id: roleId1, title: 'AI Architect' }];

      Company.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockComp),
        }),
      });
      Role.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockRoles),
      });

      const result = await companyService.getCompanyById(companyId);
      expect(result.name).toBe('CyberCorp');
      expect(result.roles).toHaveLength(1);
    });
  });

  describe('CompanyService.getCompanyRoles', () => {
    it('should return active roles', async () => {
      Role.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([{ _id: roleId1, isOpen: true }]),
        }),
      });

      const roles = await companyService.getCompanyRoles(companyId);
      expect(roles).toHaveLength(1);
      expect(roles[0]._id).toBe(roleId1);
    });
  });

  describe('CompanyService.getCompanyMetrics', () => {
    it('should calculate metrics and return both new and legacy metrics accurately', async () => {
      Company.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({
            _id: companyId,
            treasury: 15000,
            valuation: 2000000,
            employeeCount: 5,
          }),
        }),
      });
      EmployeeRecord.countDocuments.mockResolvedValue(5);
      Role.countDocuments.mockResolvedValue(2);
      Role.find.mockReturnValue({
        select: jest.fn().mockResolvedValue([{ _id: roleId1 }, { _id: roleId2 }]),
      });
      Application.countDocuments.mockResolvedValue(8);

      const metrics = await companyService.getCompanyMetrics(companyId);
      expect(metrics.treasury).toBe(15000);
      expect(metrics.valuation).toBe(2000000);
      expect(metrics.openRolesCount).toBe(2);
      expect(metrics.activeEmployeesCount).toBe(5);
      expect(metrics.totalApplicantsCount).toBe(8);
      expect(metrics.totalHires).toBe(5);
      expect(metrics.activeRoles).toBe(2);
      expect(metrics.treasuryBalance).toBe(15000);
    });
  });

  describe('CompanyController delegation', () => {
    it('getCompanies should call companyService and send 200 response', async () => {
      const req = { query: { page: '1' } };
      const res = mockResponse();
      const next = jest.fn();

      const spy = jest.spyOn(companyService, 'getCompanies').mockResolvedValue({
        companies: [],
        pagination: { total: 0 },
      });

      await companyController.getCompanies(req, res, next);
      expect(spy).toHaveBeenCalledWith(req.query);
      expect(res.body.success).toBe(true);
      expect(res.body.data.companies).toEqual([]);
      spy.mockRestore();
    });

    it('getCompanyById should call companyService and send 200 response when found', async () => {
      const req = { params: { id: companyId } };
      const res = mockResponse();
      const next = jest.fn();

      const spy = jest.spyOn(companyService, 'getCompanyById').mockResolvedValue({
        _id: companyId,
        name: 'OmniCorp',
      });

      await companyController.getCompanyById(req, res, next);
      expect(spy).toHaveBeenCalledWith(companyId);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('OmniCorp');
      spy.mockRestore();
    });

    it('getCompanyById should send 404 response when company is not found', async () => {
      const req = { params: { id: companyId } };
      const res = mockResponse();
      const next = jest.fn();

      const spy = jest.spyOn(companyService, 'getCompanyById').mockResolvedValue(null);

      await companyController.getCompanyById(req, res, next);
      expect(spy).toHaveBeenCalledWith(companyId);
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Company not found');
      spy.mockRestore();
    });

    it('getCompanyRoles should call companyService and send 200 response', async () => {
      const req = { params: { id: companyId } };
      const res = mockResponse();
      const next = jest.fn();

      const spy = jest.spyOn(companyService, 'getCompanyRoles').mockResolvedValue([
        { _id: roleId1 },
      ]);

      await companyController.getCompanyRoles(req, res, next);
      expect(spy).toHaveBeenCalledWith(companyId);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      spy.mockRestore();
    });

    it('getDomains should return active domains and send 200 response', async () => {
      const req = {};
      const res = mockResponse();
      const next = jest.fn();

      Domain.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([{ name: 'Technology', isActive: true }]),
        }),
      });

      await companyController.getDomains(req, res, next);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe('Technology');
    });
  });

  describe('FounderController.getApplicants', () => {
    it('should return empty array if company not found for founder', async () => {
      const req = { user: { _id: founderId } };
      const res = mockResponse();
      const next = jest.fn();

      Company.findOne.mockResolvedValue(null);

      await founderController.getApplicants(req, res, next);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
      expect(res.body.message).toBe('No company registered for this founder');
    });

    it('should return empty array if no active roles posted yet', async () => {
      const req = { user: { _id: founderId } };
      const res = mockResponse();
      const next = jest.fn();

      Company.findOne.mockResolvedValue({ _id: companyId, founder: founderId });
      Role.find.mockReturnValue({
        select: jest.fn().mockResolvedValue([]),
      });

      await founderController.getApplicants(req, res, next);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
      expect(res.body.message).toBe('No active roles posted yet');
    });

    it('should query applications by company role ids and alias candidate to user', async () => {
      const req = { user: { _id: founderId } };
      const res = mockResponse();
      const next = jest.fn();

      Company.findOne.mockResolvedValue({ _id: companyId, founder: founderId });
      Role.find.mockReturnValue({
        select: jest.fn().mockResolvedValue([{ _id: roleId1 }, { _id: roleId2 }]),
      });

      const mockUserObj = {
        _id: 'user123',
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        avatarUrl: 'https://example.com/avatar.jpg',
        skills: ['AI', 'Python'],
        expTotal: 520,
        resumeUrl: 'https://example.com/resume.pdf',
        resumeMetadata: {},
        currentStatus: 'job_seeker',
      };

      const mockApplications = [
        {
          _id: 'app123',
          role: { _id: roleId1, title: 'Lead Architect', domain: 'Technology', level: 'senior' },
          user: mockUserObj,
        },
      ];

      Application.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue(mockApplications),
            }),
          }),
        }),
      });

      await founderController.getApplicants(req, res, next);

      expect(Role.find).toHaveBeenCalledWith({ company: companyId });
      expect(Application.find).toHaveBeenCalledWith({ role: { $in: [roleId1, roleId2] } });
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].candidate).toEqual(mockUserObj);
      expect(res.body.data[0].user).toEqual(mockUserObj);
      expect(res.body.message).toBe('Retrieved 1 applicants successfully');
    });
  });

  describe('founderController.pipeline', () => {
    const mockBot1 = { _id: 'bot1', name: 'ATS Bot', pricing: { pricePerRun: 30 } };
    const mockBot2 = { _id: 'bot2', name: 'Interview Bot', pricing: { pricePerRun: 40 } };

    it('getPipeline: should return 404 if company is not found', async () => {
      const req = { user: { _id: founderId } };
      const res = mockResponse();
      const next = jest.fn();

      Company.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              populate: jest.fn().mockResolvedValue(null),
            }),
          }),
        }),
      });

      await founderController.getPipeline(req, res, next);
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('getPipeline: should return pipeline and purchased bots when company exists', async () => {
      const req = { user: { _id: founderId } };
      const res = mockResponse();
      const next = jest.fn();

      const mockCompany = {
        _id: companyId,
        founder: founderId,
        pipeline: { atsBot: mockBot1, isDeployed: true },
      };

      Company.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              populate: jest.fn().mockResolvedValue(mockCompany),
            }),
          }),
        }),
      });

      BotPurchase.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([
            { bot: mockBot1, status: 'active' },
            { bot: mockBot2, status: 'active' },
          ]),
        }),
      });

      await founderController.getPipeline(req, res, next);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.purchasedBots).toHaveLength(2);
      expect(res.body.data.pipeline.isDeployed).toBe(true);
    });

    it('deployPipeline: should calculate totalCostPerRun, update company pipeline, and save', async () => {
      const req = {
        user: { _id: founderId },
        body: {
          atsBotId: 'bot1',
          interviewBotId: 'bot2',
          dailyTaskBotId: null,
          auditBotId: null,
        },
      };
      const res = mockResponse();
      const next = jest.fn();

      const mockCompanyDoc = {
        _id: companyId,
        founder: founderId,
        save: jest.fn().mockResolvedValue(true),
      };

      Company.findOne.mockResolvedValue(mockCompanyDoc);
      AIBot.find.mockResolvedValue([mockBot1, mockBot2]);

      const populatedCompany = {
        _id: companyId,
        pipeline: {
          atsBot: mockBot1,
          interviewBot: mockBot2,
          isDeployed: true,
          totalCostPerRun: 70,
        },
      };

      Company.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              populate: jest.fn().mockResolvedValue(populatedCompany),
            }),
          }),
        }),
      });

      await founderController.deployPipeline(req, res, next);

      expect(mockCompanyDoc.save).toHaveBeenCalled();
      expect(mockCompanyDoc.pipeline.totalCostPerRun).toBe(70);
      expect(mockCompanyDoc.pipeline.isDeployed).toBe(true);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalCostPerRun).toBe(70);
    });

    it('testSimulatePipeline: should simulate pipeline stages', async () => {
      const req = { user: { _id: founderId } };
      const res = mockResponse();
      const next = jest.fn();

      const mockCompany = {
        _id: companyId,
        pipeline: {
          atsBot: mockBot1,
          interviewBot: null,
          dailyTaskBot: null,
          auditBot: null,
          totalCostPerRun: 30,
          isDeployed: true,
        },
      };

      Company.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              populate: jest.fn().mockResolvedValue(mockCompany),
            }),
          }),
        }),
      });

      await founderController.testSimulatePipeline(req, res, next);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.simulated).toBe(true);
      expect(res.body.data.stages[0].status).toBe('ready');
      expect(res.body.data.stages[1].status).toBe('unassigned');
    });
  });
});

