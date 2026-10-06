const TrainingModule = require('../models/TrainingModule');
const Application = require('../models/Application');
const ApiError = require('../utils/ApiError');
const gamificationService = require('./gamification.service');
const { EXP_SOURCE } = require('../utils/constants');
const { defaultModules } = require('../../seed/seedTrainingModules');

class TrainingService {
  /**
   * Helper to ensure default modules exist in database if collection is empty
   */
  async ensureSeedModules() {
    const count = await TrainingModule.countDocuments();
    if (count === 0 && defaultModules?.length) {
      await TrainingModule.insertMany(defaultModules);
    }
  }

  /**
   * List available training modules filtered by domain
   */
  async listModules(domain) {
    await this.ensureSeedModules();

    const query = {};
    if (domain && domain !== 'all') {
      query.domain = { $regex: new RegExp(`^${domain}$`, 'i') };
    }

    const modules = await TrainingModule.find(query)
      .select('title domain level description expReward cooldownReductionHours createdAt')
      .sort({ createdAt: -1 });

    return modules;
  }

  /**
   * Retrieve module content and quiz questions
   */
  async getModuleById(id) {
    await this.ensureSeedModules();

    const module = await TrainingModule.findById(id);
    if (!module) {
      throw ApiError.notFound('Training module not found');
    }

    return module;
  }

  /**
   * Submit quiz answers, evaluate score, clear domain cooldowns, and award EXP
   *
   * @param {string} id - TrainingModule ID
   * @param {string} userId - User ID
   * @param {Array} answers - Array of selected option indices e.g. [1, 2, 0] or objects
   */
  async completeModule(id, userId, answers = []) {
    const module = await TrainingModule.findById(id);
    if (!module) {
      throw ApiError.notFound('Training module not found');
    }

    if (!Array.isArray(answers)) {
      throw ApiError.badRequest('Answers must be provided as an array');
    }

    const totalQuestions = module.questions.length;
    if (totalQuestions === 0) {
      throw ApiError.badRequest('Training module has no quiz questions');
    }

    let correctCount = 0;
    const review = [];

    module.questions.forEach((q, idx) => {
      let selectedIndex = null;
      if (typeof answers[idx] === 'number') {
        selectedIndex = answers[idx];
      } else if (answers[idx] && typeof answers[idx].selectedOption === 'number') {
        selectedIndex = answers[idx].selectedOption;
      } else if (answers[idx] && typeof answers[idx].selectedIndex === 'number') {
        selectedIndex = answers[idx].selectedIndex;
      }

      const isCorrect = selectedIndex === q.correctAnswerIndex;
      if (isCorrect) correctCount += 1;

      review.push({
        questionIndex: idx,
        question: q.question,
        options: q.options,
        selectedOption: selectedIndex,
        correctAnswerIndex: q.correctAnswerIndex,
        isCorrect,
        explanation: q.explanation || '',
      });
    });

    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= 80;

    let clearedCount = 0;
    let expAwarded = 0;

    if (passed) {
      // 1. Clear cooldown on user's rejected applications in this domain
      const now = new Date();
      const applications = await Application.find({
        user: userId,
        cooldownUntil: { $gt: now },
      }).populate('role');

      const domainLower = (module.domain || '').toLowerCase();

      for (const app of applications) {
        const appDomain = (app.role?.domain || '').toLowerCase();
        if (appDomain === domainLower || !appDomain) {
          app.cooldownUntil = null;
          await app.save();
          clearedCount += 1;
        }
      }

      // 2. Award EXP to user
      expAwarded = module.expReward || 25;
      try {
        if (typeof gamificationService.awardExp === 'function') {
          await gamificationService.awardExp(
            userId,
            expAwarded,
            EXP_SOURCE.ACHIEVEMENT || 'achievement',
            { reason: `Completed training: ${module.title}` }
          );
        } else if (typeof gamificationService.addExp === 'function') {
          await gamificationService.addExp(
            userId,
            expAwarded,
            `Completed training: ${module.title}`,
            EXP_SOURCE.ACHIEVEMENT || 'achievement'
          );
        }
      } catch (err) {
        console.error('Error awarding EXP for training completion:', err);
      }
    }

    return {
      passed,
      score,
      correctCount,
      totalQuestions,
      expAwarded,
      clearedApplicationsCount: clearedCount,
      review,
      message: passed
        ? `Congratulations! You passed with ${score}% and cleared ${clearedCount} active cooldown(s). +${expAwarded} EXP awarded!`
        : `You scored ${score}%. An 80% score is required to bypass cooldown. Review the notes and try again!`,
    };
  }
}

module.exports = new TrainingService();
