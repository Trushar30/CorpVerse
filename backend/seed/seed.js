/**
 * CorpVerse Seed Data Script
 * Seeds 5 companies with 15 roles (3 per company).
 * Run: node seed/seed.js
 */

const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Import models
const Company = require('../src/models/Company');
const Role = require('../src/models/Role');

const SEED_COMPANIES = [
  {
    name: 'NovaTech Solutions',
    domain: 'Technology',
    description:
      'A fast-growing tech company specializing in cloud infrastructure, AI-powered developer tools, and enterprise SaaS solutions. Known for its innovative engineering culture and rapid deployment cycles.',
    tagline: 'Building the future, one deploy at a time',
    industry: 'Software & Technology',
    logoUrl: null,
    isSeedCompany: true,
    roles: [
      {
        title: 'Backend Developer',
        domain: 'Technology',
        level: 'junior',
        description:
          'Design and build scalable REST APIs and microservices. Work with Node.js, Express, and MongoDB to power our cloud platform. Collaborate with frontend and DevOps teams on feature delivery.',
        requirements: [
          'Proficiency in JavaScript/TypeScript and Node.js',
          'Experience with REST API design and database modeling',
          'Familiarity with Git version control',
          'Understanding of data structures and algorithms',
          'Strong problem-solving and debugging skills',
        ],
        responsibilities: [
          'Build and maintain backend services and APIs',
          'Write clean, tested, and documented code',
          'Participate in code reviews and technical discussions',
          'Collaborate with cross-functional teams',
        ],
        salaryRange: { min: 45000, max: 65000 },
        maxOpenings: 2,
      },
      {
        title: 'Frontend Developer',
        domain: 'Technology',
        level: 'junior',
        description:
          'Build responsive, performant user interfaces using React.js and modern frontend tooling. Transform Figma designs into pixel-perfect interactive experiences.',
        requirements: [
          'Strong HTML, CSS, and JavaScript fundamentals',
          'Experience with React.js and component-based architecture',
          'Understanding of responsive design principles',
          'Familiarity with REST APIs and async data fetching',
          'Eye for UI/UX detail',
        ],
        responsibilities: [
          'Implement UI designs from wireframes and mockups',
          'Build reusable React components',
          'Integrate with backend APIs',
          'Ensure cross-browser compatibility and accessibility',
        ],
        salaryRange: { min: 42000, max: 60000 },
        maxOpenings: 2,
      },
      {
        title: 'DevOps Engineer',
        domain: 'Technology',
        level: 'mid',
        description:
          'Manage CI/CD pipelines, cloud infrastructure (AWS/GCP), and monitoring systems. Ensure 99.9% uptime for production services.',
        requirements: [
          'Experience with Linux systems administration',
          'Familiarity with Docker and container orchestration',
          'Knowledge of CI/CD tools (GitHub Actions, Jenkins)',
          'Understanding of cloud platforms (AWS, GCP, or Azure)',
          'Scripting ability in Bash or Python',
        ],
        responsibilities: [
          'Design and maintain CI/CD pipelines',
          'Monitor and optimize system performance',
          'Manage cloud infrastructure and deployments',
          'Implement security best practices',
        ],
        salaryRange: { min: 60000, max: 85000 },
        maxOpenings: 1,
      },
    ],
  },
  {
    name: 'GreenPulse Energy',
    domain: 'Clean Energy',
    description:
      'A sustainability-focused company working on renewable energy analytics, carbon footprint tracking, and smart grid optimization. Combining data science with environmental impact.',
    tagline: 'Powering a sustainable tomorrow',
    industry: 'Clean Energy & Environment',
    logoUrl: null,
    isSeedCompany: true,
    roles: [
      {
        title: 'Data Analyst',
        domain: 'Clean Energy',
        level: 'junior',
        description:
          'Analyze energy consumption patterns, renewable output data, and carbon metrics. Build dashboards and reports that drive sustainability decisions.',
        requirements: [
          'Proficiency in Python or R for data analysis',
          'Experience with data visualization tools (Matplotlib, Tableau)',
          'SQL knowledge for querying databases',
          'Understanding of basic statistics',
          'Interest in sustainability and clean energy',
        ],
        responsibilities: [
          'Clean, process, and analyze large energy datasets',
          'Create visualizations and automated reports',
          'Identify trends and anomalies in energy data',
          'Present findings to non-technical stakeholders',
        ],
        salaryRange: { min: 40000, max: 55000 },
        maxOpenings: 2,
      },
      {
        title: 'Sustainability Consultant',
        domain: 'Clean Energy',
        level: 'mid',
        description:
          'Advise clients on carbon reduction strategies, renewable adoption, and ESG compliance. Blend technical knowledge with business communication.',
        requirements: [
          'Knowledge of sustainability frameworks (GRI, CDP, SDGs)',
          'Strong analytical and research skills',
          'Excellent written and verbal communication',
          'Familiarity with energy markets and regulations',
          'Project management experience',
        ],
        responsibilities: [
          'Conduct sustainability audits and assessments',
          'Develop carbon reduction roadmaps for clients',
          'Prepare ESG reports and compliance documentation',
          'Stay current on environmental regulations',
        ],
        salaryRange: { min: 55000, max: 75000 },
        maxOpenings: 1,
      },
      {
        title: 'Project Manager',
        domain: 'Clean Energy',
        level: 'mid',
        description:
          'Lead cross-functional teams delivering renewable energy projects. Manage timelines, budgets, and stakeholder communication.',
        requirements: [
          'Proven project management experience (Agile/Scrum)',
          'Strong organizational and communication skills',
          'Ability to manage multiple priorities simultaneously',
          'Experience with project management tools (Jira, Asana)',
          'Understanding of clean energy technologies',
        ],
        responsibilities: [
          'Plan and execute project deliverables on schedule',
          'Coordinate between engineering, design, and business teams',
          'Track progress, risks, and resource allocation',
          'Report project status to leadership',
        ],
        salaryRange: { min: 58000, max: 78000 },
        maxOpenings: 1,
      },
    ],
  },
  {
    name: 'MediCore Health',
    domain: 'Healthcare',
    description:
      'A health-tech company building AI-powered diagnostic tools, patient data platforms, and clinical research analytics. Bridging machine learning and medical science.',
    tagline: 'Intelligence for healthier lives',
    industry: 'Healthcare Technology',
    logoUrl: null,
    isSeedCompany: true,
    roles: [
      {
        title: 'ML Engineer',
        domain: 'Healthcare',
        level: 'mid',
        description:
          'Build and deploy machine learning models for medical image analysis, patient risk prediction, and clinical NLP. Work with medical professionals to validate model performance.',
        requirements: [
          'Strong Python and ML framework experience (PyTorch, TensorFlow)',
          'Understanding of ML fundamentals (supervised, unsupervised, deep learning)',
          'Experience with model training, evaluation, and deployment',
          'Knowledge of data preprocessing and feature engineering',
          'Interest in healthcare applications of AI',
        ],
        responsibilities: [
          'Develop and train ML models for clinical applications',
          'Evaluate model performance and iterate on improvements',
          'Collaborate with medical experts for domain validation',
          'Deploy models to production and monitor performance',
        ],
        salaryRange: { min: 65000, max: 90000 },
        maxOpenings: 1,
      },
      {
        title: 'Clinical Data Analyst',
        domain: 'Healthcare',
        level: 'junior',
        description:
          'Analyze clinical trial data, patient records, and health outcomes. Ensure data quality and compliance with healthcare regulations (HIPAA).',
        requirements: [
          'Experience with data analysis in Python, R, or SAS',
          'Understanding of healthcare data standards (HL7, FHIR)',
          'SQL proficiency for database queries',
          'Attention to detail and data quality',
          'Knowledge of basic biostatistics',
        ],
        responsibilities: [
          'Clean and validate clinical datasets',
          'Generate statistical reports for research teams',
          'Ensure data handling meets regulatory standards',
          'Support clinical trial data management',
        ],
        salaryRange: { min: 42000, max: 58000 },
        maxOpenings: 2,
      },
      {
        title: 'Product Manager',
        domain: 'Healthcare',
        level: 'senior',
        description:
          'Own the product roadmap for MediCore\'s diagnostic platform. Translate clinician needs into technical requirements, prioritize features, and drive cross-functional execution.',
        requirements: [
          'Proven product management experience in tech or health-tech',
          'Strong analytical and prioritization skills',
          'Excellent stakeholder communication',
          'Understanding of agile development workflows',
          'Ability to translate user research into product decisions',
        ],
        responsibilities: [
          'Define and maintain the product roadmap',
          'Gather and prioritize requirements from stakeholders',
          'Write clear product specs and user stories',
          'Lead sprint planning and feature prioritization',
        ],
        salaryRange: { min: 80000, max: 110000 },
        maxOpenings: 1,
      },
    ],
  },
  {
    name: 'FinEdge Capital',
    domain: 'Finance',
    description:
      'A fintech company building next-generation trading analytics, risk management systems, and regulatory compliance tools. Where quantitative finance meets software engineering.',
    tagline: 'Edge in every trade',
    industry: 'Financial Technology',
    logoUrl: null,
    isSeedCompany: true,
    roles: [
      {
        title: 'Risk Analyst',
        domain: 'Finance',
        level: 'junior',
        description:
          'Assess and quantify financial risks across portfolios. Build risk models, run stress tests, and generate compliance reports.',
        requirements: [
          'Strong quantitative and analytical skills',
          'Knowledge of financial instruments and markets',
          'Proficiency in Excel and basic programming (Python/R)',
          'Understanding of risk management frameworks (VaR, stress testing)',
          'Attention to detail and regulatory awareness',
        ],
        responsibilities: [
          'Analyze portfolio risk and exposure metrics',
          'Build and maintain risk assessment models',
          'Generate regulatory compliance reports',
          'Monitor market conditions for emerging risks',
        ],
        salaryRange: { min: 48000, max: 65000 },
        maxOpenings: 2,
      },
      {
        title: 'Quantitative Developer',
        domain: 'Finance',
        level: 'mid',
        description:
          'Build high-performance trading systems, pricing models, and analytics platforms. Combine software engineering with quantitative finance.',
        requirements: [
          'Strong programming skills in Python, C++, or Java',
          'Knowledge of financial mathematics and statistics',
          'Experience with numerical computing libraries (NumPy, pandas)',
          'Understanding of market microstructure',
          'Problem-solving under tight deadlines',
        ],
        responsibilities: [
          'Develop quantitative trading and pricing models',
          'Optimize system performance for low-latency execution',
          'Collaborate with traders and risk managers',
          'Maintain and improve existing analytics infrastructure',
        ],
        salaryRange: { min: 70000, max: 95000 },
        maxOpenings: 1,
      },
      {
        title: 'Compliance Officer',
        domain: 'Finance',
        level: 'mid',
        description:
          'Ensure the company meets all financial regulatory requirements. Monitor trading activity, manage audits, and update compliance policies.',
        requirements: [
          'Knowledge of financial regulations (SEC, MiFID II, Basel)',
          'Strong analytical and documentation skills',
          'Excellent written communication for policy drafting',
          'Attention to detail and ethical integrity',
          'Experience with compliance monitoring tools',
        ],
        responsibilities: [
          'Monitor and enforce regulatory compliance',
          'Prepare for and manage external audits',
          'Draft and update compliance policies',
          'Train staff on compliance requirements',
        ],
        salaryRange: { min: 55000, max: 75000 },
        maxOpenings: 1,
      },
    ],
  },
  {
    name: 'CreativeForge Studios',
    domain: 'Design & Media',
    description:
      'A creative agency and product studio building beautiful digital experiences, brand identities, and content strategies for startups and enterprises alike.',
    tagline: 'Where ideas take shape',
    industry: 'Design & Creative Services',
    logoUrl: null,
    isSeedCompany: true,
    roles: [
      {
        title: 'UI/UX Designer',
        domain: 'Design & Media',
        level: 'junior',
        description:
          'Design intuitive, beautiful user interfaces and experiences. Conduct user research, create wireframes, and deliver high-fidelity Figma prototypes.',
        requirements: [
          'Proficiency in Figma or similar design tools',
          'Understanding of UI/UX principles and design systems',
          'Portfolio demonstrating web/mobile design work',
          'Knowledge of accessibility standards (WCAG)',
          'Strong visual design sense (typography, color, layout)',
        ],
        responsibilities: [
          'Create wireframes, mockups, and interactive prototypes',
          'Conduct user research and usability testing',
          'Maintain and evolve the design system',
          'Collaborate with developers on implementation',
        ],
        salaryRange: { min: 40000, max: 55000 },
        maxOpenings: 2,
      },
      {
        title: 'Content Strategist',
        domain: 'Design & Media',
        level: 'mid',
        description:
          'Develop content strategies that drive engagement, SEO performance, and brand storytelling across web, social, and email channels.',
        requirements: [
          'Excellent writing and editing skills',
          'Experience with content management systems (CMS)',
          'Understanding of SEO principles and analytics',
          'Ability to develop editorial calendars and style guides',
          'Knowledge of social media and email marketing best practices',
        ],
        responsibilities: [
          'Develop and execute content strategies',
          'Write and edit blog posts, case studies, and web copy',
          'Analyze content performance metrics',
          'Collaborate with design and marketing teams',
        ],
        salaryRange: { min: 50000, max: 68000 },
        maxOpenings: 1,
      },
      {
        title: 'Brand Manager',
        domain: 'Design & Media',
        level: 'senior',
        description:
          'Own the brand identity and visual language for client projects. Lead creative direction, manage brand guidelines, and ensure consistency across all touchpoints.',
        requirements: [
          'Proven experience in brand strategy and management',
          'Strong creative direction and visual thinking',
          'Excellent client communication and presentation skills',
          'Portfolio of brand identity projects',
          'Leadership and team management experience',
        ],
        responsibilities: [
          'Lead brand strategy and creative direction for clients',
          'Develop and enforce brand guidelines',
          'Present creative concepts to clients and stakeholders',
          'Mentor junior designers and manage project timelines',
        ],
        salaryRange: { min: 72000, max: 95000 },
        maxOpenings: 1,
      },
    ],
  },
];

async function seed() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/corpverse';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing seed data
    await Company.deleteMany({ isSeedCompany: true });
    const seedCompanyNames = SEED_COMPANIES.map((c) => c.name);
    // Also clear roles that belonged to seed companies
    const oldSeedCompanies = await Company.find({ name: { $in: seedCompanyNames } });
    if (oldSeedCompanies.length > 0) {
      const oldIds = oldSeedCompanies.map((c) => c._id);
      await Role.deleteMany({ company: { $in: oldIds } });
    }

    console.log('🗑️  Cleared old seed data');

    // Insert companies and roles
    for (const companyData of SEED_COMPANIES) {
      const { roles, ...companyFields } = companyData;

      const company = await Company.create(companyFields);
      console.log(`🏢 Created company: ${company.name}`);

      for (const roleData of roles) {
        await Role.create({
          ...roleData,
          company: company._id,
        });
        console.log(`   └─ Role: ${roleData.title} (${roleData.level})`);
      }
    }

    console.log('\n✅ Seed data inserted successfully!');
    console.log(`   📊 ${SEED_COMPANIES.length} companies, ${SEED_COMPANIES.reduce((sum, c) => sum + c.roles.length, 0)} roles`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
