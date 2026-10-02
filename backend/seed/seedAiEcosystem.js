const mongoose = require('mongoose');
const config = require('../src/config');
const { User, AIProvider, AIBot } = require('../src/models');
const { calculateBotPricing } = require('../src/utils/pricingEngine');

// ─────────────────────────────────────────────────────
// AI ECOSYSTEM SEEDER
// Populates Free LLM Directory providers & initial marketplace bots.
// ─────────────────────────────────────────────────────

const SEED_PROVIDERS = [
  {
    name: 'Pollinations AI (Keyless Instant)',
    slug: 'pollinations',
    baseUrl: 'https://text.pollinations.ai/openai',
    keyHint: 'Public / Zero Key Required',
    isOpenAICompatible: true,
    isAnonymousAllowed: true,
    status: 'operational',
    rateLimits: { rpm: 15, rpd: 2000, tpm: 250000 },
    notes: 'Free anonymous tier. No credit card or API key required. Instant live execution.',
    models: [
      {
        id: 'openai',
        name: 'GPT-OSS / Hybrid General',
        family: 'OpenAI-OSS',
        contextWindow: 128000,
        speedTPS: 95,
        capabilityScore: 78,
        isFree: true,
        maxTokens: 4096,
        description: 'Instant zero-configuration general reasoning model.',
      },
      {
        id: 'mistral',
        name: 'Mistral Nemo Free',
        family: 'Mistral',
        contextWindow: 128000,
        speedTPS: 110,
        capabilityScore: 76,
        isFree: true,
        maxTokens: 4096,
        description: 'Fast lightweight European open weights model.',
      },
    ],
  },
  {
    name: 'Groq Cloud (Ultra-Fast LPU)',
    slug: 'groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    keyHint: 'Free API Key at console.groq.com',
    isOpenAICompatible: true,
    isAnonymousAllowed: false,
    status: 'operational',
    rateLimits: { rpm: 30, rpd: 14400, tpm: 30000 },
    notes: 'Fastest inference engine worldwide (~300+ TPS on Llama 3.3 70B).',
    models: [
      {
        id: 'llama-3.3-70b-versatile',
        name: 'Llama 3.3 70B Versatile',
        family: 'Meta Llama',
        contextWindow: 131072,
        speedTPS: 320,
        capabilityScore: 88,
        isFree: true,
        maxTokens: 8192,
        description: 'Top-tier open-weight model with 320 TPS generation.',
      },
      {
        id: 'qwen-2.5-32b',
        name: 'Qwen 2.5 32B Instruct',
        family: 'Alibaba Qwen',
        contextWindow: 131072,
        speedTPS: 360,
        capabilityScore: 84,
        isFree: true,
        maxTokens: 8192,
        description: 'Exceptional tool calling and structured reasoning.',
      },
    ],
  },
  {
    name: 'Cerebras Systems (Wafer-Scale)',
    slug: 'cerebras',
    baseUrl: 'https://api.cerebras.ai/v1',
    keyHint: 'Free API Key at cloud.cerebras.ai',
    isOpenAICompatible: true,
    isAnonymousAllowed: false,
    status: 'operational',
    rateLimits: { rpm: 30, rpd: 14400, tpm: 500000 },
    notes: 'World rank #1 in composite throughput and massive context on wafer-scale chips.',
    models: [
      {
        id: 'qwen-3-235b',
        name: 'Qwen 3 235B A22B MoE',
        family: 'Qwen',
        contextWindow: 131072,
        speedTPS: 400,
        capabilityScore: 92,
        isFree: true,
        maxTokens: 8192,
        description: 'Frontier reasoning MoE model with extreme throughput.',
      },
    ],
  },
  {
    name: 'Mistral AI (La Plateforme)',
    slug: 'mistral',
    baseUrl: 'https://api.mistral.ai/v1',
    keyHint: 'Free API Key at console.mistral.ai',
    isOpenAICompatible: true,
    isAnonymousAllowed: false,
    status: 'operational',
    rateLimits: { rpm: 20, rpd: 1000, tpm: 1000000 },
    notes: 'Up to 1B free tokens/month on Experiment tier. GDPR-friendly EU servers.',
    models: [
      {
        id: 'mistral-large-latest',
        name: 'Mistral Large 3',
        family: 'Mistral',
        contextWindow: 256000,
        speedTPS: 120,
        capabilityScore: 90,
        isFree: true,
        maxTokens: 8192,
        description: 'Frontier enterprise multilingual model.',
      },
      {
        id: 'codestral-latest',
        name: 'Codestral 25B',
        family: 'Mistral Code',
        contextWindow: 256000,
        speedTPS: 180,
        capabilityScore: 89,
        isFree: true,
        maxTokens: 8192,
        description: 'State-of-the-art coding and syntax inspection model.',
      },
    ],
  },
  {
    name: 'Google AI Studio',
    slug: 'google_ai_studio',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    keyHint: 'Free API Key at aistudio.google.com',
    isOpenAICompatible: true,
    isAnonymousAllowed: false,
    status: 'operational',
    rateLimits: { rpm: 15, rpd: 1500, tpm: 250000 },
    notes: '1 Million token context window and frontier multimodal capabilities.',
    models: [
      {
        id: 'gemini-2.5-flash',
        name: 'Gemini 2.5 Flash',
        family: 'Gemini',
        contextWindow: 1048576,
        speedTPS: 170,
        capabilityScore: 89,
        isFree: true,
        maxTokens: 8192,
        description: '1M context window with sub-second response times.',
      },
    ],
  },
  {
    name: 'OpenRouter (Multi-Provider)',
    slug: 'openrouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    keyHint: 'Free API Key at openrouter.ai/keys',
    isOpenAICompatible: true,
    isAnonymousAllowed: false,
    status: 'operational',
    rateLimits: { rpm: 20, rpd: 500, tpm: 100000 },
    notes: 'Aggregated unified interface routing to 25+ free open weight models.',
    models: [
      {
        id: 'meta-llama/llama-3.3-70b-instruct:free',
        name: 'Llama 3.3 70B (Free)',
        family: 'Meta',
        contextWindow: 131072,
        speedTPS: 90,
        capabilityScore: 87,
        isFree: true,
        maxTokens: 4096,
        description: 'Zero-cost route for Llama 3.3 70B Instruct.',
      },
    ],
  },
];

async function seedAiEcosystem() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB.');

    // 1. Ensure an AI Manager account exists
    let aiManager = await User.findOne({ role: 'ai_manager' });
    if (!aiManager) {
      console.log('Creating default AI Manager account (ai_manager@corpverse.io)...');
      aiManager = await User.create({
        name: 'Chief AI Architect',
        email: 'ai_manager@corpverse.io',
        password: 'CorpVerse123!',
        role: 'ai_manager',
        currentStatus: 'employee',
        profileComplete: true,
        isVerified: true,
        corpCoins: 50000,
        expTotal: 1500,
        bio: 'Guardian of CorpVerse Neural Infrastructure. Overseeing provider integrations, capability pricing, and company pipeline bots.',
      });
      console.log('AI Manager account created.');
    } else {
      console.log('AI Manager user already exists:', aiManager.email);
    }

    // 2. Seed Providers
    console.log('Seeding AI Providers...');
    const providerMap = {};
    for (const provData of SEED_PROVIDERS) {
      let prov = await AIProvider.findOne({ slug: provData.slug });
      if (!prov) {
        prov = await AIProvider.create({
          ...provData,
          addedBy: aiManager._id,
        });
        console.log(`✓ Created AI Provider: ${prov.name}`);
      } else {
        prov.models = provData.models;
        prov.rateLimits = provData.rateLimits;
        prov.baseUrl = provData.baseUrl;
        await prov.save();
        console.log(`↺ Updated AI Provider: ${prov.name}`);
      }
      providerMap[prov.slug] = prov;
    }

    // 3. Seed AI Bots
    console.log('Seeding AI Marketplace Bots...');
    const defaultBots = [
      {
        name: 'ScoutATS - Intelligent Resume Screener',
        slug: 'scout-ats',
        category: 'hiring',
        tagline: 'Autonomous resume parser, ATS benchmark match scorer, and hire candidate shortlister.',
        description:
          'Deep multi-factor candidate evaluation engine. Automatically parses candidate resumes against job opening requirements, scores technical depth, detects skill mismatches, and outputs clear hiring recommendations.',
        providerSlug: 'pollinations',
        modelId: 'openai',
        pipelineType: 'resume_screening',
        systemPrompt:
          'You are ScoutATS, an elite technical recruiting AI bot for CorpVerse startups. Evaluate the submitted candidate resume against the target role requirements. Provide match percentage, strengths, skill deficiencies, and an actionable interview verdict.',
        capabilities: ['ATS Scoring (0-100%)', 'Skill Deficiency Gap Map', 'Experience Recency Audit', 'Culture Fit Index'],
        capabilityScore: 82,
        icon: 'FileSearch',
        color: 'emerald',
      },
      {
        name: 'HirePulse - Behavioral & Tech Interviewer',
        slug: 'hire-pulse',
        category: 'interview',
        tagline: 'Interactive simulated technical interviewer that stress-tests candidate competency.',
        description:
          'Generates tailored domain-specific technical & behavioral interview questions, analyzes candidate live answers, detects buzzword inflation, and delivers objective scoring matrices for founder hiring panels.',
        providerSlug: 'pollinations',
        modelId: 'mistral',
        pipelineType: 'interview_evaluation',
        systemPrompt:
          'You are HirePulse, an uncompromising technical interviewer and candidate auditor. Grade the candidate answer for accuracy, depth, conciseness, and problem-solving velocity.',
        capabilities: ['Real-Time Question Synthesis', 'Answer Depth Scoring', 'Anti-Hallucination Audit', 'Hiring Panel Dossier'],
        capabilityScore: 85,
        icon: 'MessageSquareCode',
        color: 'cyan',
      },
      {
        name: 'CodeSentinel - PR & Vulnerability Inspector',
        slug: 'code-sentinel',
        category: 'code_review',
        tagline: 'High-throughput automated code auditor for engineering team task submissions.',
        description:
          'Inspects company employee code submissions, detects logic bugs, concurrency flaws, security vulnerabilities, and adherence to clean architecture principles before task EXP is awarded.',
        providerSlug: 'groq',
        modelId: 'llama-3.3-70b-versatile',
        pipelineType: 'code_review',
        systemPrompt:
          'You are CodeSentinel, a principal software architect and code reviewer. Analyze the supplied code snippet for bugs, performance bottlenecks, security vulnerabilities, and code elegance. Return a structured code grade.',
        capabilities: ['AST Bug Hunting', 'Security & SQLi Checks', 'Big-O Performance Audit', 'Refactoring Recommendations'],
        capabilityScore: 92,
        icon: 'ShieldCheck',
        color: 'violet',
      },
      {
        name: 'GrowthPilot - Viral Launchpad AI',
        slug: 'growth-pilot',
        category: 'growth',
        tagline: 'Multi-channel marketing copy, investor pitch deck, and press release engine.',
        description:
          'Accelerates startup traction. Generates viral Twitter/X announcement threads, investor pitch summaries, landing page value propositions, and customer acquisition emails tuned for tech founders.',
        providerSlug: 'pollinations',
        modelId: 'openai',
        pipelineType: 'growth_campaign',
        systemPrompt:
          'You are GrowthPilot, a seasoned Y-Combinator startup growth strategist. Transform raw product concepts into high-converting launch copy, value propositions, and growth hacks.',
        capabilities: ['Launch Thread Generation', 'Investor Elevator Pitch', 'A/B Hook Variations', 'SEO & Viral Positioning'],
        capabilityScore: 80,
        icon: 'Rocket',
        color: 'amber',
      },
      {
        name: 'OpsZen - Customer Support Autopilot',
        slug: 'ops-zen',
        category: 'support',
        tagline: 'Tier-1 customer ticket triage and automated empathetic incident resolution.',
        description:
          'Reduces founder support overhead. Categorizes customer bug reports, analyzes sentiment urgency, drafts high-empathy accurate resolutions, and escalates critical edge-cases to founder consoles.',
        providerSlug: 'pollinations',
        modelId: 'mistral',
        pipelineType: 'support_ops',
        systemPrompt:
          'You are OpsZen, a senior customer success manager. Triage the customer inquiry, diagnose their issue with empathy, and formulate a clear step-by-step resolution.',
        capabilities: ['Sentiment Detection', 'SLA Urgency Scoring', 'Step-by-Step Problem Solving', 'Escalation Triage'],
        capabilityScore: 74,
        icon: 'Bot',
        color: 'rose',
      },
    ];

    for (const b of defaultBots) {
      const provider = providerMap[b.providerSlug] || Object.values(providerMap)[0];
      const pricing = calculateBotPricing({
        capabilityScore: b.capabilityScore,
        contextWindow: 131072,
        speedTPS: 200,
        pipelineType: b.pipelineType,
        isFreeProvider: true,
      });

      const existingBot = await AIBot.findOne({ slug: b.slug });
      if (!existingBot) {
        await AIBot.create({
          name: b.name,
          slug: b.slug,
          category: b.category,
          tagline: b.tagline,
          description: b.description,
          provider: provider._id,
          modelId: b.modelId,
          pipelineType: b.pipelineType,
          systemPrompt: b.systemPrompt,
          capabilities: b.capabilities,
          pricing,
          icon: b.icon,
          color: b.color,
          status: 'active',
          totalRuns: Math.floor(Math.random() * 80) + 20,
          rating: 4.9,
          reviewsCount: Math.floor(Math.random() * 25) + 5,
          createdBy: aiManager._id,
        });
        console.log(`✓ Seeded Bot: ${b.name} (${pricing.tier.toUpperCase()} - ${pricing.basePrice} CorpCoins)`);
      } else {
        existingBot.pricing = pricing;
        existingBot.provider = provider._id;
        await existingBot.save();
        console.log(`↺ Refreshed Bot: ${b.name}`);
      }
    }

    console.log('\n✅ AI Ecosystem seeded successfully!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding AI Ecosystem:', err);
    process.exit(1);
  }
}

seedAiEcosystem();
