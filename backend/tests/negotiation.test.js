const applicationService = require('../src/services/application.service');
const Application = require('../src/models/Application');
const EmployeeRecord = require('../src/models/EmployeeRecord');
const Role = require('../src/models/Role');
const User = require('../src/models/User');
const Company = require('../src/models/Company');
const { APPLICATION_STATUS } = require('../src/utils/constants');

jest.mock('../src/models/Application');
jest.mock('../src/models/EmployeeRecord');
jest.mock('../src/models/Role');
jest.mock('../src/models/User');
jest.mock('../src/models/Company');
jest.mock('../src/services/employee.service');
jest.mock('../src/services/gamification.service');

describe('FR-21: Job Offer Salary Negotiation', () => {
  const userId = '507f1f77bcf86cd799439011';
  const appId = '507f1f77bcf86cd799439022';
  const roleId = '507f1f77bcf86cd799439033';
  const companyId = '507f1f77bcf86cd799439044';

  const mockRole = {
    _id: roleId,
    title: 'Software Engineer',
    salaryRange: { min: 80000, max: 100000 },
    company: companyId,
    level: 'junior',
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('negotiateOffer validation & constraints', () => {
    it('should throw 400 if application status is not offer_pending', async () => {
      Application.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          _id: appId,
          user: userId,
          status: APPLICATION_STATUS.PENDING_SCREENING,
          role: mockRole,
        }),
      });

      await expect(
        applicationService.negotiateOffer(appId, userId, { counterSalary: 110000 })
      ).rejects.toMatchObject({
        statusCode: 400,
        message: expect.stringContaining('Cannot negotiate offer'),
      });
    });

    it('should throw 400 if candidate already negotiated this offer', async () => {
      Application.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          _id: appId,
          user: userId,
          status: APPLICATION_STATUS.OFFER_PENDING,
          role: mockRole,
          offerDetails: {
            baseSalary: 100000,
            offeredSalary: 100000,
            isNegotiated: true,
          },
        }),
      });

      await expect(
        applicationService.negotiateOffer(appId, userId, { counterSalary: 110000 })
      ).rejects.toMatchObject({
        statusCode: 400,
        message: expect.stringContaining('already negotiated'),
      });
    });

    it('should throw 400 if counter-offer exceeds +20% above base offer', async () => {
      Application.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          _id: appId,
          user: userId,
          status: APPLICATION_STATUS.OFFER_PENDING,
          role: mockRole,
          offerDetails: {
            baseSalary: 100000,
            offeredSalary: 100000,
            isNegotiated: false,
          },
        }),
      });

      // +25% = 125,000 > 120,000 max
      await expect(
        applicationService.negotiateOffer(appId, userId, { counterSalary: 125000 })
      ).rejects.toMatchObject({
        statusCode: 400,
        message: expect.stringContaining('cannot exceed +20%'),
      });
    });

    it('should throw 400 if counter-offer is lower or equal to base offer', async () => {
      Application.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          _id: appId,
          user: userId,
          status: APPLICATION_STATUS.OFFER_PENDING,
          role: mockRole,
          offerDetails: {
            baseSalary: 100000,
            offeredSalary: 100000,
            isNegotiated: false,
          },
        }),
      });

      await expect(
        applicationService.negotiateOffer(appId, userId, { counterSalary: 95000 })
      ).rejects.toMatchObject({
        statusCode: 400,
        message: expect.stringContaining('must be higher than the current offer'),
      });
    });
  });

  describe('negotiateOffer evaluation & outcomes', () => {
    it('should update offer to counter-offer when negotiation is accepted', async () => {
      const mockSave = jest.fn().mockResolvedValue(true);
      const mockApp = {
        _id: appId,
        user: userId,
        status: APPLICATION_STATUS.OFFER_PENDING,
        role: mockRole,
        feedbacks: [{ stage: 'interview', score: 90 }], // high score bonus
        screeningScore: 88,
        save: mockSave,
      };

      Application.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockApp),
      });

      User.findById.mockResolvedValue({ _id: userId, expTotal: 350 }); // high EXP bonus

      // Force Math.random to return 0.05 (guaranteed acceptance)
      jest.spyOn(Math, 'random').mockReturnValue(0.05);

      const result = await applicationService.negotiateOffer(appId, userId, {
        counterSalary: 115000,
        argument: 'Strong system design interview feedback and extensive portfolio',
      });

      expect(result.outcome).toBe('accepted');
      expect(result.newSalary).toBe(115000);
      expect(mockApp.offerDetails.isNegotiated).toBe(true);
      expect(mockApp.offerDetails.offeredSalary).toBe(115000);
      expect(mockSave).toHaveBeenCalled();

      Math.random.mockRestore();
    });

    it('should record negotiated salary into EmployeeRecord upon acceptOffer', async () => {
      const mockSave = jest.fn().mockResolvedValue(true);
      const mockApp = {
        _id: appId,
        user: userId,
        status: APPLICATION_STATUS.OFFER_PENDING,
        role: mockRole,
        offerDetails: {
          baseSalary: 100000,
          offeredSalary: 115000,
          isNegotiated: true,
        },
        save: mockSave,
      };

      Application.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockApp),
      });
      User.findByIdAndUpdate.mockResolvedValue({});
      Role.findByIdAndUpdate.mockResolvedValue({});
      Company.findByIdAndUpdate.mockResolvedValue({});

      EmployeeRecord.create.mockResolvedValue({
        _id: 'rec123',
        salary: { currentSalary: 115000 },
      });
      EmployeeRecord.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          _id: 'rec123',
          salary: { currentSalary: 115000 },
          role: mockRole,
        }),
      });

      await applicationService.acceptOffer(appId, userId);

      expect(EmployeeRecord.create).toHaveBeenCalledWith(
        expect.objectContaining({
          salary: expect.objectContaining({
            currentSalary: 115000,
          }),
        })
      );
    });
  });
});
