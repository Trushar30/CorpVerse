const trainingService = require('../src/services/training.service');
const TrainingModule = require('../src/models/TrainingModule');
const Application = require('../src/models/Application');
const gamificationService = require('../src/services/gamification.service');
const { EXP_SOURCE } = require('../src/utils/constants');

jest.mock('../src/models/TrainingModule');
jest.mock('../src/models/Application');
jest.mock('../src/services/gamification.service');

describe('FR-19: Training Modules to Bypass Cooldown', () => {
  const userId = '507f1f77bcf86cd799439011';
  const moduleId = '507f1f77bcf86cd799439022';

  const mockModule = {
    _id: moduleId,
    title: 'Full-Stack System Reliability',
    domain: 'Technology',
    level: 'junior',
    description: 'Learn system resilience and REST architecture',
    content: 'Module study content...',
    expReward: 25,
    cooldownReductionHours: 48,
    questions: [
      {
        question: 'Is PUT idempotent?',
        options: ['No', 'Yes', 'Sometimes'],
        correctAnswerIndex: 1,
        explanation: 'PUT is idempotent by spec.',
      },
      {
        question: 'Which status indicates forbidden access?',
        options: ['401', '403', '404'],
        correctAnswerIndex: 1,
        explanation: '403 Forbidden indicates unauthorized resource.',
      },
      {
        question: 'Why paginate queries?',
        options: ['For encryption', 'To prevent memory exhaustion', 'To bypass CORS'],
        correctAnswerIndex: 1,
        explanation: 'Pagination bounds memory consumption.',
      },
    ],
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listModules', () => {
    it('should list training modules filtered by domain', async () => {
      TrainingModule.countDocuments.mockResolvedValue(1);
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([mockModule]),
      };
      TrainingModule.find.mockReturnValue(mockQuery);

      const result = await trainingService.listModules('Technology');

      expect(TrainingModule.find).toHaveBeenCalledWith({
        domain: { $regex: /^Technology$/i },
      });
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Full-Stack System Reliability');
    });
  });

  describe('getModuleById', () => {
    it('should return module by id', async () => {
      TrainingModule.countDocuments.mockResolvedValue(1);
      TrainingModule.findById.mockResolvedValue(mockModule);

      const result = await trainingService.getModuleById(moduleId);

      expect(result._id).toBe(moduleId);
      expect(result.questions).toHaveLength(3);
    });

    it('should throw 404 if module does not exist', async () => {
      TrainingModule.countDocuments.mockResolvedValue(1);
      TrainingModule.findById.mockResolvedValue(null);

      await expect(trainingService.getModuleById(moduleId)).rejects.toMatchObject({
        statusCode: 404,
        message: 'Training module not found',
      });
    });
  });

  describe('completeModule', () => {
    it('should pass quiz (100%), clear cooldowns on matching domain applications, and award 25 EXP', async () => {
      TrainingModule.findById.mockResolvedValue(mockModule);

      const mockAppSave = jest.fn().mockResolvedValue(true);
      const mockRejectedApp = {
        _id: 'app123',
        user: userId,
        cooldownUntil: new Date(Date.now() + 24 * 3600 * 1000),
        role: { domain: 'Technology' },
        save: mockAppSave,
      };

      Application.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue([mockRejectedApp]),
      });
      gamificationService.awardExp.mockResolvedValue(true);

      // Submitting correct answers: [1, 1, 1]
      const result = await trainingService.completeModule(moduleId, userId, [1, 1, 1]);

      expect(result.passed).toBe(true);
      expect(result.score).toBe(100);
      expect(result.correctCount).toBe(3);
      expect(mockRejectedApp.cooldownUntil).toBeNull();
      expect(mockAppSave).toHaveBeenCalled();
      expect(gamificationService.awardExp).toHaveBeenCalledWith(
        userId,
        25,
        EXP_SOURCE.ACHIEVEMENT,
        expect.objectContaining({ reason: expect.stringContaining('Full-Stack System Reliability') })
      );
      expect(result.clearedApplicationsCount).toBe(1);
    });

    it('should fail quiz (< 80%), not clear cooldowns, and not award EXP when score is below threshold', async () => {
      TrainingModule.findById.mockResolvedValue(mockModule);

      // Submitting 1 correct, 2 incorrect: score = 33%
      const result = await trainingService.completeModule(moduleId, userId, [1, 0, 0]);

      expect(result.passed).toBe(false);
      expect(result.score).toBe(33);
      expect(result.correctCount).toBe(1);
      expect(Application.find).not.toHaveBeenCalled();
      expect(gamificationService.awardExp).not.toHaveBeenCalled();
      expect(result.expAwarded).toBe(0);
    });
  });
});
