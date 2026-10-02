const axios = require('axios');
const config = require('../config');
const AIBot = require('../models/AIBot');
const AIProvider = require('../models/AIProvider');
const { decrypt } = require('../utils/encryption');
const { INTERVIEW } = require('../utils/constants');

class AIService {
  constructor() {
    this.baseUrl = config.aiServiceUrl || 'http://localhost:8000';
    this.timeout = 45000;
  }

  // ─── Helper: resolve bot + provider credentials ───
  async _resolveBotCredentials(pipelineType, fallbackPipelineType = null) {
    let bot = await AIBot.findOne({ pipelineType, status: 'active' });
    if (!bot && fallbackPipelineType) {
      bot = await AIBot.findOne({ pipelineType: fallbackPipelineType, status: 'active' });
    }
    if (!bot) return null;

    const provider = await AIProvider.findById(bot.provider);
    if (!provider) return null;

    const decryptedKey = decrypt(provider.apiKeyEncrypted);
    return {
      providerUrl: provider.baseUrl,
      apiKey: decryptedKey,
      modelId: bot.modelId,
      systemPrompt: bot.systemPrompt,
    };
  }

  // ─── Resume Screening ─────────────────────────────
  async screenResume({ resumeText, jobRequirements, roleTitle, roleDomain }) {
    try {
      // Find the resume_screening bot and its provider
      const bot = await AIBot.findOne({ pipelineType: 'resume_screening', status: 'active' });
      if (!bot) {
        return this.fallbackScreening(resumeText, jobRequirements);
      }
      
      const provider = await AIProvider.findById(bot.provider);
      const decryptedKey = decrypt(provider.apiKeyEncrypted);
      
      const response = await axios.post(`${this.baseUrl}/pipeline/run`, {
        pipeline_type: 'resume_screening',
        provider_url: provider.baseUrl,
        api_key: decryptedKey,
        model_id: bot.modelId,
        system_prompt: bot.systemPrompt,
        input_payload: {
          resume_text: resumeText,
          job_requirements: jobRequirements,
          role_title: roleTitle,
        }
      }, { timeout: this.timeout });
      
      return response.data;
    } catch (error) {
      console.error('AI screening failed, using fallback:', error.message);
      return this.fallbackScreening(resumeText, jobRequirements);
    }
  }

  fallbackScreening(resumeText, jobRequirements) {
    return {
      score: 70,
      fit_verdict: 'Screening auto-passed due to system unavailability.',
      strengths: [],
      gaps: []
    };
  }

  // ─── Interview Conductor ──────────────────────────
  async conductInterview({ transcript, roleContext, turnNumber, maxTurns }) {
    try {
      const creds = await this._resolveBotCredentials('interview_conductor', 'interview_evaluation');
      if (!creds) {
        console.warn('No interview conductor bot found, using fallback');
        return this.fallbackConductInterview(roleContext, turnNumber, maxTurns);
      }

      const response = await axios.post(`${this.baseUrl}/pipeline/run`, {
        pipeline_type: 'interview_conductor',
        provider_url: creds.providerUrl,
        api_key: creds.apiKey,
        model_id: creds.modelId,
        system_prompt: creds.systemPrompt,
        input_payload: {
          transcript,
          role_context: roleContext,
          turn_number: turnNumber,
          max_turns: maxTurns,
        },
      }, { timeout: INTERVIEW.AI_RESPONSE_TIMEOUT });

      const result = response.data;
      if (result.success && result.data) {
        return {
          success: true,
          message: result.data.response,
          containsCompletionMarker: result.data.contains_completion_marker || false,
          isFallback: result.is_fallback || false,
        };
      }

      return this.fallbackConductInterview(roleContext, turnNumber, maxTurns);
    } catch (error) {
      console.error('AI interview conductor failed, using fallback:', error.message);
      return this.fallbackConductInterview(roleContext, turnNumber, maxTurns);
    }
  }

  fallbackConductInterview(roleContext, turnNumber, maxTurns) {
    const level = roleContext.level || 'mid';
    const title = roleContext.title || 'Software Engineer';

    const fallbackQuestions = {
      junior: [
        'Can you tell me about your experience with the core technologies listed in the job requirements?',
        'How do you approach learning a new programming language or framework?',
        'Walk me through how you would debug an application that is running slowly.',
        'What do you consider best practices for writing clean, maintainable code?',
        'Can you describe a project you worked on that you are particularly proud of?',
      ],
      mid: [
        'How would you design a caching strategy for a high-traffic web application?',
        'Tell me about a challenging technical problem you solved recently.',
        'How do you approach code reviews and what do you look for?',
        'What strategies do you use for database query optimization?',
        'How do you balance shipping features quickly with maintaining code quality?',
      ],
      senior: [
        'How would you design a system to handle 10x traffic growth?',
        'Describe your approach to making build-vs-buy decisions for critical infrastructure.',
        'How do you mentor junior developers while maintaining your own output?',
        'What is your strategy for managing technical debt in a fast-paced environment?',
        'How would you drive adoption of a new technology across your team?',
      ],
    };

    const questions = fallbackQuestions[level] || fallbackQuestions.mid;
    const idx = Math.min(turnNumber - 1, questions.length - 1);

    let message = questions[idx];
    if (turnNumber >= maxTurns) {
      message = `Thank you for your thoughtful answers throughout this interview for the ${title} position. That concludes our conversation. We appreciate your time! ${INTERVIEW.COMPLETION_MARKER}`;
    }

    return {
      success: true,
      message,
      containsCompletionMarker: message.includes(INTERVIEW.COMPLETION_MARKER),
      isFallback: true,
    };
  }

  // ─── Interview Evaluation ─────────────────────────
  async evaluateInterview({ transcript, roleContext }) {
    try {
      const creds = await this._resolveBotCredentials('interview_evaluation');
      if (!creds) {
        console.warn('No interview evaluation bot found, using fallback');
        return this.fallbackEvaluateInterview(roleContext);
      }

      const response = await axios.post(`${this.baseUrl}/pipeline/run`, {
        pipeline_type: 'interview_evaluation',
        provider_url: creds.providerUrl,
        api_key: creds.apiKey,
        model_id: creds.modelId,
        system_prompt: creds.systemPrompt,
        input_payload: {
          transcript,
          role_context: roleContext,
        },
      }, { timeout: INTERVIEW.AI_RESPONSE_TIMEOUT });

      const result = response.data;
      if (result.success && result.data) {
        const d = result.data;
        return {
          success: true,
          overallScore: d.overall_score ?? INTERVIEW.FALLBACK_SCORE,
          verdict: d.verdict || (d.overall_score >= INTERVIEW.PASS_THRESHOLD ? 'PASS' : 'FAIL'),
          categories: {
            technicalDepth: d.technical_depth ?? d.technical_depth_score ?? 70,
            communication: d.communication ?? d.clarity_score ?? 70,
            problemSolving: d.problem_solving ?? 70,
            culturalFit: d.cultural_fit ?? 70,
          },
          evaluationNotes: d.evaluation_notes || d.critique || 'Evaluation completed.',
          strengths: d.strengths || d.correct_concepts_demonstrated || [],
          improvements: d.improvements || d.omissions_or_misconceptions || [],
          isFallback: result.is_fallback || false,
        };
      }

      return this.fallbackEvaluateInterview(roleContext);
    } catch (error) {
      console.error('AI interview evaluation failed, using fallback:', error.message);
      return this.fallbackEvaluateInterview(roleContext);
    }
  }

  fallbackEvaluateInterview(roleContext) {
    const title = roleContext?.title || 'Software Engineer';
    return {
      success: true,
      overallScore: INTERVIEW.FALLBACK_SCORE,
      verdict: 'PASS',
      categories: {
        technicalDepth: 70,
        communication: 72,
        problemSolving: 68,
        culturalFit: 70,
      },
      evaluationNotes: `Interview evaluation auto-passed for ${title} due to AI service unavailability. Manual review recommended.`,
      strengths: ['Completed the full interview process'],
      improvements: ['AI evaluation unavailable — manual review recommended'],
      isFallback: true,
    };
  }

  // ─── Task Generator Pipeline ──────────────────────
  async generateTask({ roleTitle, level = 'junior', domain = 'Technology', difficulty = 'medium', companyName = 'CorpVerse Inc.', previousTasks = [] }) {
    try {
      const creds = await this._resolveBotCredentials('task_generator');
      if (creds) {
        const response = await axios.post(
          `${this.baseUrl}/pipeline/run`,
          {
            pipeline_type: 'task_generator',
            provider_url: creds.providerUrl,
            api_key: creds.apiKey,
            model_id: creds.modelId,
            system_prompt: creds.systemPrompt || 'You are an engineering manager creating daily workplace tasks for employees.',
            input_payload: {
              role_title: roleTitle,
              level,
              domain,
              difficulty,
              company_name: companyName,
              previous_tasks: previousTasks,
            },
          },
          { timeout: 15000 }
        );

        const result = response.data;
        if (result && result.success && result.data && result.data.title) {
          return {
            title: result.data.title,
            description: result.data.description,
            category: result.data.category || 'debugging',
            difficulty: result.data.difficulty || difficulty,
            skillsTested: result.data.skills_tested || ['problem-solving'],
            expectedOutput: result.data.expected_output || 'A tested patch or solution.',
            isFallback: result.is_fallback || false,
          };
        }
      }

      return this.fallbackGenerateTask({ roleTitle, level, domain, difficulty, companyName });
    } catch (error) {
      console.warn('AI task generation failed, using fallback:', error.message);
      return this.fallbackGenerateTask({ roleTitle, level, domain, difficulty, companyName });
    }
  }

  fallbackGenerateTask({ roleTitle = 'Software Engineer', level = 'junior', domain = 'Technology', difficulty = 'medium', companyName = 'the company' }) {
    const scenarios = {
      junior: {
        easy: [
          {
            title: 'Fix Login Form Input Validation',
            description: `Users report entering invalid emails without immediate inline warnings. Add client-side validation rules and unit tests to the login form at ${companyName}.`,
            category: 'debugging',
            skillsTested: ['input-validation', 'unit-testing'],
            expectedOutput: 'Verified input validation component and test suite.',
          },
          {
            title: 'Update API Documentation Examples',
            description: `The onboarding guide for the ${domain} service has outdated curl examples. Verify all endpoints and update the documentation with correct payload formats.`,
            category: 'review',
            skillsTested: ['documentation', 'api-testing'],
            expectedOutput: 'Updated markdown documentation with valid API examples.',
          },
        ],
        medium: [
          {
            title: 'Debug the Checkout Flow',
            description: `A customer reported that the payment form loses focus after selecting a shipping address at ${companyName}. Investigate the state management in the checkout component and fix the issue.`,
            category: 'debugging',
            skillsTested: ['react', 'state-management', 'debugging'],
            expectedOutput: 'Bug root cause explanation and fix ensuring smooth checkout focus retention.',
          },
          {
            title: 'Implement User Profile Avatar Upload',
            description: `Add avatar image upload handling to the user profile settings, including file size limitation and format checks before upload to cloud storage.`,
            category: 'feature',
            skillsTested: ['file-upload', 'security-validation'],
            expectedOutput: 'Implemented avatar upload endpoint and client upload handling.',
          },
        ],
        hard: [
          {
            title: 'Optimize Responsive Layout Performance',
            description: `Mobile users experience layout thrashing on the dashboard page. Profile the CSS animations and DOM updates, eliminating unnecessary re-renders.`,
            category: 'optimization',
            skillsTested: ['web-performance', 'css-profiling'],
            expectedOutput: 'Lighthouse audit report showing improved Cumulative Layout Shift (CLS).',
          },
        ],
      },
      mid: {
        easy: [
          {
            title: 'Standardize API Error Response Envelope',
            description: `Audit endpoint responses across ${domain} modules to ensure consistent error formats and status codes matching CorpVerse standards.`,
            category: 'review',
            skillsTested: ['api-design', 'error-handling'],
            expectedOutput: 'Refactored error handling middleware and normalized response format.',
          },
        ],
        medium: [
          {
            title: 'Optimize Database Query Indexes for Activity Feed',
            description: `Query latency on the ${domain} activity feed spikes during peak hours. Analyze explain plans, add composite indexes, and verify performance improvements.`,
            category: 'optimization',
            skillsTested: ['mongodb', 'indexing', 'query-optimization'],
            expectedOutput: 'Query execution explain plan showing index usage and reduced scan times.',
          },
          {
            title: 'Implement Webhook Retry with Exponential Backoff',
            description: `Outbound integration webhooks are occasionally dropped due to transient network blips. Implement a persistent retry queue with exponential backoff.`,
            category: 'feature',
            skillsTested: ['queueing', 'resilience', 'async-processing'],
            expectedOutput: 'Robust retry handler with dead-letter queue routing.',
          },
        ],
        hard: [
          {
            title: 'Refactor Auth Token Refresh Concurrency',
            description: `Multiple simultaneous requests trigger race conditions during JWT refresh. Implement a request locking mutex to deduplicate refresh token exchanges.`,
            category: 'optimization',
            skillsTested: ['concurrency', 'auth', 'security'],
            expectedOutput: 'Race-condition-free token refresh flow verified with concurrent tests.',
          },
        ],
      },
      senior: {
        easy: [
          {
            title: 'Conduct Security Code Audit on Payment Flow',
            description: `Review payment processing modules for OWASP Top 10 vulnerabilities, verify cryptographic hashing, and enforce strict input sanitization.`,
            category: 'review',
            skillsTested: ['security-audit', 'owasp', 'code-review'],
            expectedOutput: 'Security review checklist with vulnerability assessments and remedies.',
          },
        ],
        medium: [
          {
            title: 'Design Microservice Circuit Breaker Pattern',
            description: `Downstream service degradations are causing cascading timeouts. Implement a circuit breaker pattern with fallback states to preserve uptime for ${companyName}.`,
            category: 'design',
            skillsTested: ['system-resilience', 'circuit-breaker', 'architecture'],
            expectedOutput: 'Circuit breaker implementation with open/half-open/closed state transitions.',
          },
        ],
        hard: [
          {
            title: 'Architect Distributed Rate Limiting System',
            description: `Design and implement a sliding-window rate limiter capable of handling high-throughput API traffic across multiple cluster nodes with Redis.`,
            category: 'design',
            skillsTested: ['distributed-systems', 'redis', 'high-availability'],
            expectedOutput: 'Production-ready rate limiter middleware with unit and load test benchmarks.',
          },
        ],
      },
    };

    const levelScenarios = scenarios[level] || scenarios.junior;
    const diffScenarios = levelScenarios[difficulty] || levelScenarios.medium || levelScenarios.easy;
    const selected = diffScenarios[Math.floor(Math.random() * diffScenarios.length)];

    return {
      title: selected.title,
      description: selected.description,
      category: selected.category,
      difficulty,
      skillsTested: selected.skillsTested,
      expectedOutput: selected.expectedOutput,
      isFallback: true,
    };
  }

  // ─── Stubs for other pipelines ────────────────────
  async reviewCode({ code, language, context }) {}
  
  // Health check
  async ping() {}
}

module.exports = new AIService();
