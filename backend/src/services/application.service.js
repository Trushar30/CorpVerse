const Application = require('../models/Application');
const Resume = require('../models/Resume');
const Role = require('../models/Role');
const User = require('../models/User');
const Company = require('../models/Company');
const EmployeeRecord = require('../models/EmployeeRecord');
const ApiError = require('../utils/ApiError');
const aiService = require('./ai.service');
const { APPLICATION_STATUS, FEEDBACK_STAGE, SCREENING } = require('../utils/constants');

class ApplicationService {
  async createApplication(userId, roleId) {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');
    if (!user.profileComplete) {
      throw new ApiError(400, 'Profile is incomplete. Please complete your profile first.');
    }

    const resume = await Resume.findOne({ user: userId });
    if (!resume) {
      throw new ApiError(400, 'No resume uploaded. Please upload a resume first.');
    }

    const role = await Role.findById(roleId);
    if (!role) throw new ApiError(404, 'Role not found');
    if (!role.isOpen) throw new ApiError(400, 'This role is no longer open');
    if (role.filledCount >= role.maxOpenings) throw new ApiError(400, 'All openings for this role have been filled');

    const activeApp = await Application.findOne({
      user: userId,
      role: roleId,
      status: {
        $nin: [
          APPLICATION_STATUS.SCREENING_REJECTED,
          APPLICATION_STATUS.INTERVIEW_REJECTED,
          APPLICATION_STATUS.OFFER_DECLINED,
        ],
      },
    });
    if (activeApp) {
      throw new ApiError(400, 'You already have an active application for this role');
    }

    const previousApp = await Application.findOne({
      user: userId,
      role: roleId,
    }).sort({ createdAt: -1 });

    if (previousApp && previousApp.cooldownUntil && new Date() < previousApp.cooldownUntil) {
      throw new ApiError(400, `You are on cooldown for this role. Try again after ${previousApp.cooldownUntil.toDateString()}`);
    }

    const application = await Application.create({
      user: userId,
      role: roleId,
      status: APPLICATION_STATUS.PENDING_SCREENING,
    });

    // Check and award first_application badge
    try {
      const gamificationService = require('./gamification.service');
      await gamificationService.checkAndAwardBadges(userId, 'application_submitted');
    } catch (err) {
      // Non-blocking
    }

    // Trigger async ATS screening
    this.processScreening(application._id).catch(err => {
      console.error('Async screening failed:', err);
    });

    return application;
  }

  async processScreening(applicationId) {
    try {
      const application = await Application.findById(applicationId).populate('role').populate('user');
      if (!application) return;

      const resume = await Resume.findOne({ user: application.user._id });
      if (!resume) {
        throw new Error('Resume not found during screening');
      }

      const role = application.role;
      const jobRequirements = `${role.requirements.join(', ')} ${role.responsibilities.join(', ')}`;

      const aiResponse = await aiService.screenResume({
        resumeText: resume.extractedText,
        jobRequirements: jobRequirements,
        roleTitle: role.title,
        roleDomain: role.domain
      });

      const score = aiResponse?.score ?? SCREENING.FALLBACK_SCORE;
      
      if (score >= SCREENING.PASS_THRESHOLD) {
        application.status = APPLICATION_STATUS.SCREENING_PASSED;
        application.screeningScore = score;
        application.feedbacks.push({
          stage: FEEDBACK_STAGE.SCREENING,
          score,
          feedbackText: aiResponse?.fit_verdict || 'Screening passed successfully.',
          strengths: aiResponse?.strengths || [],
          improvements: aiResponse?.gaps || [],
        });
      } else {
        application.status = APPLICATION_STATUS.SCREENING_REJECTED;
        application.screeningScore = score;
        
        const cooldownDate = new Date();
        cooldownDate.setDate(cooldownDate.getDate() + SCREENING.COOLDOWN_DAYS);
        application.cooldownUntil = cooldownDate;

        application.feedbacks.push({
          stage: FEEDBACK_STAGE.SCREENING,
          score,
          feedbackText: aiResponse?.fit_verdict || 'Unfortunately, your profile does not meet the requirements for this role at this time.',
          strengths: aiResponse?.strengths || [],
          improvements: aiResponse?.gaps || [],
        });
      }

      await application.save();
    } catch (error) {
      console.error('Error processing screening:', error);
      // Fallback
      const application = await Application.findById(applicationId);
      if (application && application.status === APPLICATION_STATUS.PENDING_SCREENING) {
        application.status = APPLICATION_STATUS.SCREENING_PASSED;
        application.screeningScore = SCREENING.FALLBACK_SCORE;
        application.feedbacks.push({
          stage: FEEDBACK_STAGE.SCREENING,
          score: SCREENING.FALLBACK_SCORE,
          feedbackText: 'Screening auto-passed due to system unavailability.',
        });
        await application.save();
      }
    }
  }

  async getMyApplications(userId, { status, page = 1, limit = 10 }) {
    const query = { user: userId };
    if (status && status !== 'all') {
      if (status === 'active') {
        query.status = {
          $nin: [
            APPLICATION_STATUS.SCREENING_REJECTED,
            APPLICATION_STATUS.INTERVIEW_REJECTED,
            APPLICATION_STATUS.OFFER_DECLINED,
          ]
        };
      } else if (status === 'rejected') {
        query.status = {
          $in: [
            APPLICATION_STATUS.SCREENING_REJECTED,
            APPLICATION_STATUS.INTERVIEW_REJECTED,
          ]
        };
      } else {
        query.status = status;
      }
    }

    const skip = (page - 1) * limit;

    const applications = await Application.find(query)
      .populate({
        path: 'role',
        select: 'title company domain level',
        populate: {
          path: 'company',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Application.countDocuments(query);

    return {
      applications,
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    };
  }

  async getApplicationById(applicationId, userId) {
    const application = await Application.findById(applicationId)
      .populate({
        path: 'role',
        populate: {
          path: 'company',
        }
      });

    if (!application) {
      throw new ApiError(404, 'Application not found');
    }

    // In a real app we would check for admin or company founder.
    // For now, ensuring it belongs to the user.
    if (application.user.toString() !== userId.toString()) {
      throw new ApiError(403, 'You do not have permission to view this application');
    }

    return application;
  }

  async acceptOffer(applicationId, userId) {
    const application = await Application.findById(applicationId).populate('role');
    if (!application) {
      throw ApiError.notFound('Application not found');
    }
    if (application.user.toString() !== userId.toString()) {
      throw ApiError.forbidden('You do not have permission to accept this offer');
    }
    if (application.status !== APPLICATION_STATUS.OFFER_PENDING) {
      throw ApiError.badRequest(
        `Cannot accept offer: application status is '${application.status}', expected '${APPLICATION_STATUS.OFFER_PENDING}'`
      );
    }

    const role = application.role;
    if (!role) {
      throw ApiError.notFound('Associated role not found');
    }

    // 2. Update application status to 'offer_accepted'
    application.status = APPLICATION_STATUS.OFFER_ACCEPTED;
    await application.save();

    // 3. Create EmployeeRecord:
    //    { user, company, role, employmentStatus: 'active', currentLevel: role.level }
    const employeeRecord = await EmployeeRecord.create({
      user: userId,
      company: role.company,
      role: role._id,
      employmentStatus: 'active',
      currentLevel: role.level || 'junior',
      hiredAt: new Date(),
    });

    // 4. Update User:
    //    - role: 'working'
    //    - currentStatus: 'employee'
    await User.findByIdAndUpdate(userId, {
      role: 'working',
      currentStatus: 'employee',
    });

    // 5. Update Role: increment filledCount
    await Role.findByIdAndUpdate(role._id, {
      $inc: { filledCount: 1 },
    });

    // 6. Update Company: increment employeeCount
    await Company.findByIdAndUpdate(role.company, {
      $inc: { employeeCount: 1 },
    });

    // 7. Generate first task for the new employee
    const employeeService = require('./employee.service');
    try {
      await employeeService.generateDailyTask(employeeRecord._id);
    } catch (err) {
      console.error('Failed to generate initial task on offer acceptance:', err);
    }

    // Award first_job badge
    try {
      const gamificationService = require('./gamification.service');
      await gamificationService.checkAndAwardBadges(userId, 'offer_accepted');
    } catch (err) {
      // Non-blocking
    }

    // 8. Return the EmployeeRecord populated
    return EmployeeRecord.findById(employeeRecord._id).populate('role company');
  }

  async declineOffer(applicationId, userId) {
    const application = await Application.findById(applicationId);
    if (!application) {
      throw ApiError.notFound('Application not found');
    }
    if (application.user.toString() !== userId.toString()) {
      throw ApiError.forbidden('You do not have permission to decline this offer');
    }
    if (application.status !== APPLICATION_STATUS.OFFER_PENDING) {
      throw ApiError.badRequest(
        `Cannot decline offer: application status is '${application.status}', expected '${APPLICATION_STATUS.OFFER_PENDING}'`
      );
    }

    application.status = APPLICATION_STATUS.OFFER_DECLINED;
    await application.save();

    return application;
  }
}

module.exports = new ApplicationService();
