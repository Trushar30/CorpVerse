const scenarioService = require('../src/services/scenario.service');
const scenarioController = require('../src/controllers/scenario.controller');
const Company = require('../src/models/Company');
const User = require('../src/models/User');
const Role = require('../src/models/Role');
const CompanyScenario = require('../src/models/CompanyScenario');

jest.mock('../src/models/Company');
jest.mock('../src/models/User');
jest.mock('../src/models/Role');
jest.mock('../src/models/CompanyScenario');

describe('Founder Scenario Engine, P&L, and Bankruptcy Simulation', () => {
  const founderId = '507f1f77bcf86cd799439001';
  const companyId = '507f1f77bcf86cd799439002';
  const scenarioId = '507f1f77bcf86cd799439003';

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

  describe('ScenarioService.getActiveScenario', () => {
    it('should return null if no company found for founder', async () => {
      Company.findOne.mockResolvedValue(null);

      const result = await scenarioService.getActiveScenario(founderId);
      expect(result).toBeNull();
      expect(Company.findOne).toHaveBeenCalledWith({ founder: founderId });
    });

    it('should return existing pending scenario if already created', async () => {
      const mockCompany = {
        _id: companyId,
        name: 'Apex AI Labs',
        treasury: 10000,
        valuation: 1000000,
        isSuspended: false,
      };

      const mockPendingScenario = {
        _id: scenarioId,
        title: 'Distributed Cloud GPU Bill Shock',
        status: 'pending',
        options: [],
      };

      Company.findOne.mockResolvedValue(mockCompany);
      CompanyScenario.findOne.mockResolvedValue(mockPendingScenario);

      const result = await scenarioService.getActiveScenario(founderId);

      expect(result.scenario).toEqual(mockPendingScenario);
      expect(result.company.treasury).toBe(10000);
      expect(CompanyScenario.create).not.toHaveBeenCalled();
    });

    it('should create and return a new pending scenario from seed templates if none exists', async () => {
      const mockCompany = {
        _id: companyId,
        name: 'Apex AI Labs',
        treasury: 8000,
        valuation: 1200000,
        isSuspended: false,
      };

      const createdScenario = {
        _id: scenarioId,
        company: companyId,
        title: 'Series-A VC Term Sheet Influx',
        status: 'pending',
        options: [
          {
            text: 'Accept venture injection',
            treasuryImpact: 8000,
            valuationImpact: 500000,
          },
        ],
      };

      Company.findOne.mockResolvedValue(mockCompany);
      CompanyScenario.findOne.mockResolvedValue(null);
      CompanyScenario.create.mockResolvedValue(createdScenario);

      const result = await scenarioService.getActiveScenario(founderId);

      expect(CompanyScenario.create).toHaveBeenCalledWith(
        expect.objectContaining({
          company: companyId,
          title: expect.any(String),
          options: expect.any(Array),
        })
      );
      expect(result.scenario).toEqual(createdScenario);
      expect(result.company.name).toBe('Apex AI Labs');
    });
  });

  describe('ScenarioService.resolveDecision — P&L and Treasury Math', () => {
    it('should correctly apply positive treasury and valuation impact', async () => {
      const mockCompany = {
        _id: companyId,
        founder: founderId,
        treasury: 5000,
        valuation: 1000000,
        isSuspended: false,
        save: jest.fn().mockResolvedValue(true),
      };

      const mockScenario = {
        _id: scenarioId,
        company: companyId,
        status: 'pending',
        options: [
          {
            text: 'Accept venture injection',
            description: 'Receive 8,000 CorpCoins',
            treasuryImpact: 8000,
            valuationImpact: 500000,
            outcomeMessage: 'Treasury bolstered!',
          },
        ],
        save: jest.fn().mockResolvedValue(true),
      };

      Company.findOne.mockResolvedValue(mockCompany);
      CompanyScenario.findOne.mockResolvedValue(mockScenario);

      const result = await scenarioService.resolveDecision(founderId, scenarioId, 0);

      expect(mockCompany.treasury).toBe(13000);
      expect(mockCompany.valuation).toBe(1500000);
      expect(mockCompany.save).toHaveBeenCalled();
      expect(mockScenario.status).toBe('resolved');
      expect(mockScenario.chosenOptionIndex).toBe(0);
      expect(mockScenario.save).toHaveBeenCalled();

      expect(result.isBankrupt).toBe(false);
      expect(result.updatedTreasury).toBe(13000);
      expect(result.updatedValuation).toBe(1500000);
      expect(result.treasuryImpact).toBe(8000);
    });

    it('should correctly apply negative treasury impact while remaining solvent', async () => {
      const mockCompany = {
        _id: companyId,
        founder: founderId,
        treasury: 8000,
        valuation: 1000000,
        isSuspended: false,
        save: jest.fn().mockResolvedValue(true),
      };

      const mockScenario = {
        _id: scenarioId,
        company: companyId,
        status: 'pending',
        options: [
          {
            text: 'Pay emergency surcharge',
            treasuryImpact: -3500,
            valuationImpact: 50000,
            outcomeMessage: 'Systems stabilized.',
          },
        ],
        save: jest.fn().mockResolvedValue(true),
      };

      Company.findOne.mockResolvedValue(mockCompany);
      CompanyScenario.findOne.mockResolvedValue(mockScenario);

      const result = await scenarioService.resolveDecision(founderId, scenarioId, 0);

      expect(mockCompany.treasury).toBe(4500);
      expect(mockCompany.valuation).toBe(1050000);
      expect(result.isBankrupt).toBe(false);
      expect(result.updatedTreasury).toBe(4500);
      expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
    });
  });

  describe('ScenarioService.resolveDecision — Bankruptcy State Machine Invariant', () => {
    it('should trigger bankruptcy when treasury drops to <= 0: suspend company, revert founder to job_seeker, and close roles', async () => {
      const mockCompany = {
        _id: companyId,
        founder: founderId,
        treasury: 2000,
        valuation: 500000,
        isSuspended: false,
        save: jest.fn().mockResolvedValue(true),
      };

      const mockScenario = {
        _id: scenarioId,
        company: companyId,
        status: 'pending',
        options: [
          {
            text: 'Massive emergency fine',
            treasuryImpact: -3500, // 2000 - 3500 = -1500 -> collapses to 0
            valuationImpact: -200000,
            outcomeMessage: 'Insolvency crisis.',
          },
        ],
        save: jest.fn().mockResolvedValue(true),
      };

      Company.findOne.mockResolvedValue(mockCompany);
      CompanyScenario.findOne.mockResolvedValue(mockScenario);
      User.findByIdAndUpdate.mockResolvedValue(true);
      Role.updateMany.mockResolvedValue({ modifiedCount: 3 });

      const result = await scenarioService.resolveDecision(founderId, scenarioId, 0);

      // Verify Company Bankruptcy State
      expect(mockCompany.treasury).toBe(0);
      expect(mockCompany.isSuspended).toBe(true);
      expect(mockCompany.suspendedReason).toContain('Insolvency');
      expect(mockCompany.save).toHaveBeenCalled();

      // Verify Founder Role Demotion
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(founderId, {
        role: 'job_seeker',
        currentStatus: 'job_seeker',
      });

      // Verify Role Freezing
      expect(Role.updateMany).toHaveBeenCalledWith(
        { company: companyId },
        { status: 'closed', isOpen: false }
      );

      // Verify Result Payload
      expect(result.isBankrupt).toBe(true);
      expect(result.updatedTreasury).toBe(0);
      expect(result.message).toContain('CRITICAL ALERT');
    });

    it('should reject decision resolution if company is already suspended', async () => {
      const suspendedCompany = {
        _id: companyId,
        founder: founderId,
        isSuspended: true,
      };

      Company.findOne.mockResolvedValue(suspendedCompany);

      await expect(
        scenarioService.resolveDecision(founderId, scenarioId, 0)
      ).rejects.toThrow('Company is suspended and cannot make decisions');
    });

    it('should reject decision resolution if scenario not found or already resolved', async () => {
      const activeCompany = {
        _id: companyId,
        founder: founderId,
        isSuspended: false,
      };

      Company.findOne.mockResolvedValue(activeCompany);
      CompanyScenario.findOne.mockResolvedValue(null);

      await expect(
        scenarioService.resolveDecision(founderId, scenarioId, 0)
      ).rejects.toThrow('Scenario not found or already resolved');
    });
  });

  describe('Scenario Controller HTTP Endpoints', () => {
    it('getActiveScenario: should return 200 with active scenario and company summary', async () => {
      const req = { user: { _id: founderId } };
      const res = mockResponse();

      const mockData = {
        scenario: { _id: scenarioId, title: 'Bill Shock' },
        company: { _id: companyId, treasury: 5000 },
      };

      jest.spyOn(scenarioService, 'getActiveScenario').mockResolvedValue(mockData);

      await scenarioController.getActiveScenario(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockData);
    });

    it('resolveDecision: should return 200 with decision outcome and updated economics', async () => {
      const req = {
        user: { _id: founderId },
        params: { id: scenarioId },
        body: { optionIndex: 0 },
      };
      const res = mockResponse();

      const mockOutcome = {
        outcome: 'Bill paid successfully',
        treasuryImpact: -3500,
        updatedTreasury: 6500,
        isBankrupt: false,
        message: 'Decision implemented successfully.',
      };

      jest.spyOn(scenarioService, 'resolveDecision').mockResolvedValue(mockOutcome);

      await scenarioController.resolveDecision(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.updatedTreasury).toBe(6500);
      expect(res.body.message).toBe('Decision implemented successfully.');
    });
  });
});
