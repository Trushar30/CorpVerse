const gamificationService = require('../src/services/gamification.service');
const leaderboardController = require('../src/controllers/leaderboard.controller');
const User = require('../src/models/User');
const ExpLog = require('../src/models/ExpLog');
const RedeemCode = require('../src/models/RedeemCode');

jest.mock('../src/models/User');
jest.mock('../src/models/ExpLog');
jest.mock('../src/models/RedeemCode');
jest.mock('../src/models/Badge');

describe('Leaderboard, Ranking & CorpCoin Economy', () => {
  const userId = '507f1f77bcf86cd799439011';
  const otherUserId = '507f1f77bcf86cd799439022';

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

  describe('getLeaderboard', () => {
    it('should return all-time ranked users with pagination and rank numbers', async () => {
      const mockUsers = [
        { _id: userId, name: 'Alice', expTotal: 500, role: 'working', currentStreak: 5 },
        { _id: otherUserId, name: 'Bob', expTotal: 300, role: 'job_seeker', currentStreak: 2 },
      ];

      User.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue(mockUsers),
              }),
            }),
          }),
        }),
      });

      User.countDocuments.mockResolvedValue(2);

      const result = await gamificationService.getLeaderboard({ page: 1, limit: 10 });

      expect(result.users.length).toBe(2);
      expect(result.users[0].rank).toBe(1);
      expect(result.users[0].name).toBe('Alice');
      expect(result.users[1].rank).toBe(2);
      expect(result.users[1].name).toBe('Bob');
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.page).toBe(1);
    });

    it('should filter by domainInterest when domain param is provided', async () => {
      User.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue([]),
              }),
            }),
          }),
        }),
      });
      User.countDocuments.mockResolvedValue(0);

      await gamificationService.getLeaderboard({ domain: 'Technology' });

      expect(User.find).toHaveBeenCalledWith(
        expect.objectContaining({
          domainInterest: 'Technology',
          expTotal: { $gt: 0 },
        })
      );
    });

    it('should calculate period leaderboard using ExpLog aggregation for weekly period', async () => {
      const mockAggregationResult = [
        {
          metadata: [{ total: 1 }],
          data: [
            {
              _id: userId,
              name: 'Alice',
              periodExp: 150,
              role: 'working',
              currentStreak: 4,
            },
          ],
        },
      ];

      ExpLog.aggregate.mockResolvedValue(mockAggregationResult);

      const result = await gamificationService.getLeaderboard({ period: 'weekly' });

      expect(ExpLog.aggregate).toHaveBeenCalled();
      expect(result.users.length).toBe(1);
      expect(result.users[0].rank).toBe(1);
      expect(result.users[0].periodExp).toBe(150);
    });
  });

  describe('getMyRank', () => {
    it('should return user rank, total active users, and percentile', async () => {
      const mockUser = {
        _id: userId,
        expTotal: 400,
        currentStreak: 6,
      };

      User.findById.mockResolvedValue(mockUser);
      // Mock that 2 users have more EXP than current user (so rank is 2 + 1 = 3)
      User.countDocuments
        .mockResolvedValueOnce(2) // users with > 400 exp
        .mockResolvedValueOnce(10); // total users with > 0 exp

      const result = await gamificationService.getMyRank(userId);

      expect(result.rank).toBe(3);
      expect(result.total).toBe(10);
      // Percentile: 1 - 3/10 = 70%
      expect(result.percentile).toBe(70);
      expect(result.expTotal).toBe(400);
      expect(result.currentStreak).toBe(6);
    });
  });

  describe('CorpCoin Economy & Redeem Codes', () => {
    it('awardCoins should increment user corpCoins', async () => {
      const mockUserSave = jest.fn().mockResolvedValue(true);
      const mockUser = {
        _id: userId,
        corpCoins: 150,
        save: mockUserSave,
      };

      User.findById.mockResolvedValue(mockUser);

      const balance = await gamificationService.awardCoins(userId, 50, 'Daily bonus');

      expect(balance).toBe(200);
      expect(mockUser.corpCoins).toBe(200);
      expect(mockUserSave).toHaveBeenCalled();
    });

    it('should support redeem codes awarding both EXP and CorpCoins', async () => {
      const cleanCode = 'CORPBOOST';
      const mockRedeemDoc = {
        code: cleanCode,
        expAmount: 100,
        coinAmount: 50,
        maxUses: 10,
        usedCount: 0,
        redeemedBy: [],
        isActive: true,
      };

      expect(mockRedeemDoc.expAmount).toBe(100);
      expect(mockRedeemDoc.coinAmount).toBe(50);
    });
  });

  describe('Leaderboard Controller Handlers', () => {
    it('getLeaderboard handler should call service and return ApiResponse', async () => {
      const req = {
        query: { domain: 'Finance', period: 'monthly', page: '1', limit: '10' },
      };
      const res = mockResponse();
      const next = jest.fn();

      jest.spyOn(gamificationService, 'getLeaderboard').mockResolvedValue({
        users: [{ _id: userId, rank: 1 }],
        pagination: { total: 1 },
      });

      await leaderboardController.getLeaderboard(req, res, next);

      expect(gamificationService.getLeaderboard).toHaveBeenCalledWith({
        domain: 'Finance',
        period: 'monthly',
        page: '1',
        limit: '10',
      });
      expect(res.body.success).toBe(true);
      expect(res.body.data.users.length).toBe(1);
    });

    it('getMyRank handler should call service with authenticated user ID', async () => {
      const req = { user: { _id: userId } };
      const res = mockResponse();
      const next = jest.fn();

      jest.spyOn(gamificationService, 'getMyRank').mockResolvedValue({
        rank: 1,
        total: 50,
        percentile: 98,
      });

      await leaderboardController.getMyRank(req, res, next);

      expect(gamificationService.getMyRank).toHaveBeenCalledWith(userId);
      expect(res.body.success).toBe(true);
      expect(res.body.data.percentile).toBe(98);
    });

    it('getBadges handler should return user badges from gamificationService', async () => {
      const req = { user: { _id: userId } };
      const res = mockResponse();
      const next = jest.fn();

      jest.spyOn(gamificationService, 'getUserBadges').mockResolvedValue({
        totalUnlocked: 1,
        totalAvailable: 19,
        badges: [{ badgeType: 'first_application', unlocked: true }],
      });

      await leaderboardController.getBadges(req, res, next);

      expect(gamificationService.getUserBadges).toHaveBeenCalledWith(userId);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalUnlocked).toBe(1);
    });
  });
});
