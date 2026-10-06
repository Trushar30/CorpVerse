const mongoose = require('mongoose');
const TrainingModule = require('../src/models/TrainingModule');

const defaultModules = [
  {
    title: 'Full-Stack System Reliability & Architecture Mastery',
    domain: 'Technology',
    level: 'junior',
    description: 'Master core backend reliability, RESTful design principles, and defensive error-handling patterns.',
    content: `### Module Overview: System Reliability & API Architecture

Building resilient modern software requires mastering system boundaries, predictable error handling, and robust data modeling.

#### 1. RESTful Idempotency & Status Codes
- **GET / PUT / DELETE** are inherently idempotent operations — executing them multiple times produces the identical side-effect state.
- **POST** operations are non-idempotent by default. To prevent duplicate charges or record creations, systems use **Idempotency Keys** stored in cache/DB.
- Always use standard HTTP status codes:
  - \`200 OK\` / \`201 Created\` for successful transactions.
  - \`400 Bad Request\` for invalid user input.
  - \`401 Unauthorized\` for missing/invalid credentials.
  - \`403 Forbidden\` for authenticated users lacking permissions.
  - \`429 Too Many Requests\` when rate limits are breached.

#### 2. Defensive Data Access & Immutability
- Never mutate state objects directly. Always return fresh copies with transformed fields.
- Use parameterized queries or schema-based ORMs/ODMs to prevent SQL/NoSQL injection vulnerabilities.
- Implement pagination (\`limit\` and \`skip\` or cursor-based) on all listing endpoints to protect database memory under high concurrency.`,
    questions: [
      {
        question: 'Which of the following HTTP methods is expected to be idempotent according to RFC specifications?',
        options: ['POST', 'PUT', 'PATCH (without idempotency header)', 'CONNECT'],
        correctAnswerIndex: 1,
        explanation: 'PUT replaces target state completely and is defined by the HTTP specification as idempotent, unlike standard POST.',
      },
      {
        question: 'How should an API respond when an authenticated user attempts to access a resource they do not own?',
        options: ['401 Unauthorized', '403 Forbidden', '500 Internal Server Error', '404 Not Found (always)'],
        correctAnswerIndex: 1,
        explanation: '403 Forbidden indicates that the server understands the client identity, but refuses authorization for this specific resource.',
      },
      {
        question: 'What is the primary architectural purpose of pagination on data listing endpoints?',
        options: [
          'To encrypt user payloads across transmission networks',
          'To prevent database memory exhaustion and ensure predictable query response latency',
          'To bypass browser CORS policy checks',
          'To enable automatic database schema migrations',
        ],
        correctAnswerIndex: 1,
        explanation: 'Pagination limits the volume of documents returned per query, preventing unbounded memory spikes and slow response times.',
      },
    ],
    expReward: 25,
    cooldownReductionHours: 48,
  },
  {
    title: 'Corporate Valuation & Financial Risk Controls',
    domain: 'Finance',
    level: 'junior',
    description: 'Understand unit economics, cash runway calculations, and financial controls for emerging enterprises.',
    content: `### Module Overview: Financial Analysis & Unit Economics

A firm's longevity depends on rigorous cash flow management, disciplined unit economics, and systematic financial controls.

#### 1. Fundamental Financial Statements
- **Income Statement (P&L)**: Measures revenue, cost of goods sold (COGS), operating expenses, and net profit over a defined timeframe.
- **Balance Sheet**: Captures snapshot of Assets = Liabilities + Shareholders' Equity.
- **Cash Flow Statement**: Tracks cash inflows and outflows across Operating, Investing, and Financing activities.

#### 2. Key SaaS & Enterprise Metrics
- **Burn Rate**: Gross burn is total monthly spend; Net burn is total spend minus cash receipts.
- **Runway**: Total Available Cash divided by Monthly Net Burn Rate.
- **LTV/CAC Ratio**: Customer Lifetime Value divided by Customer Acquisition Cost. A healthy baseline ratio is 3:1 or higher.`,
    questions: [
      {
        question: 'If a startup has $600,000 in cash and a net monthly burn rate of $50,000, what is its runway?',
        options: ['6 months', '12 months', '18 months', '24 months'],
        correctAnswerIndex: 1,
        explanation: '$600,000 / $50,000 per month = 12 months of runway.',
      },
      {
        question: 'What does a healthy LTV:CAC ratio of 3:1 signify?',
        options: [
          'The company loses money on every customer acquired',
          'Each customer generates three times the revenue it cost to acquire them',
          'Marketing expenses equal 300% of gross margin',
          'Runway decreases by three months per customer',
        ],
        correctAnswerIndex: 1,
        explanation: 'An LTV:CAC of 3:1 means the expected gross contribution from a customer is 3x the cost to acquire them.',
      },
      {
        question: 'Which financial statement reflects the financial snapshot of a firm at a single specific point in time?',
        options: ['Income Statement', 'Balance Sheet', 'Cash Flow Statement', 'Statement of Retained Earnings'],
        correctAnswerIndex: 1,
        explanation: 'The Balance Sheet reports assets, liabilities, and equity at a specific calendar date, whereas the Income Statement spans a period.',
      },
    ],
    expReward: 25,
    cooldownReductionHours: 48,
  },
  {
    title: 'Growth Funnel Optimization & Audience Analytics',
    domain: 'Marketing',
    level: 'junior',
    description: 'Learn conversion rate optimization (CRO), multi-touch attribution, and retention cohort analysis.',
    content: `### Module Overview: Modern Growth Marketing & Attribution

Modern marketing is scientific and hypothesis-driven, turning user intent into predictable customer journeys.

#### 1. The AARRR Pirate Metrics Framework
- **Acquisition**: How visitors find your platform (SEO, Paid Search, Social).
- **Activation**: The "Aha! moment" when visitors experience core product value.
- **Retention**: Percentage of users who continue returning across Day 1, Day 7, Day 30 cohorts.
- **Revenue**: Monetization efficiency (ARPU, expansion revenue).
- **Referral**: Viral coefficient (K-factor) where existing users invite new prospects.

#### 2. Conversion Rate Optimization (CRO)
- Always formulate hypothesis before running A/B tests.
- Maintain statistical significance (p < 0.05 / 95% confidence) before declaring winning variants.`,
    questions: [
      {
        question: 'In the AARRR funnel framework, which stage describes the user reaching their initial "Aha! moment"?',
        options: ['Acquisition', 'Activation', 'Retention', 'Referral'],
        correctAnswerIndex: 1,
        explanation: 'Activation occurs when a new registrant first experiences core product utility and value.',
      },
      {
        question: 'What statistical confidence level is standard before declaring an A/B test variant superior?',
        options: ['50%', '75%', '95%', '100%'],
        correctAnswerIndex: 2,
        explanation: 'A 95% confidence level (alpha = 0.05) is the established benchmark to reduce false positives.',
      },
      {
        question: 'What metric measures the virality of existing users inviting newcomers?',
        options: ['Churn rate', 'K-factor / Viral coefficient', 'Bounce rate', 'Net Promoter Score'],
        correctAnswerIndex: 1,
        explanation: 'The K-factor measures how many new users each active user successfully invites into the product.',
      },
    ],
    expReward: 25,
    cooldownReductionHours: 48,
  },
  {
    title: 'Health Informatics & Clinical Data Privacy Standards',
    domain: 'Healthcare',
    level: 'junior',
    description: 'Understand HIPAA/GDPR clinical data privacy, electronic medical records (EMR), and audit compliance.',
    content: `### Module Overview: Healthcare Compliance & Data Security

Healthcare software requires strict compliance to safeguard Protected Health Information (PHI).

#### 1. Protected Health Information (PHI) & HIPAA
- PHI includes any identifiable health information: names, medical records, biometric data, insurance identifiers.
- The HIPAA Security Rule mandates:
  - **Encryption in transit** (TLS 1.3) and **at rest** (AES-256).
  - **Role-Based Access Control (RBAC)**: Least-privilege access restricted to authorized care teams.
  - **Immutable Audit Trails**: Every read, write, and export of patient data must be logged with timestamp and user ID.`,
    questions: [
      {
        question: 'Under healthcare data security regulations, what encryption standard is standard for PHI at rest?',
        options: ['DES', 'MD5', 'AES-256', 'Base64 encoding'],
        correctAnswerIndex: 2,
        explanation: 'AES-256 is the accepted industry gold standard for encrypting sensitive clinical records at rest.',
      },
      {
        question: 'What principle dictates that healthcare personnel should only access the minimum patient data necessary for care?',
        options: ['Maximum Availability Rule', 'Principle of Least Privilege', 'Open Audit Standard', 'Public Record Policy'],
        correctAnswerIndex: 1,
        explanation: 'The Principle of Least Privilege ensures operators only have access to information required for their specific clinical duty.',
      },
      {
        question: 'What is mandatory when clinical records are accessed, edited, or exported?',
        options: ['An immutable audit log entry', 'Immediate fax notification', 'Manual signature verification', 'Public record publication'],
        correctAnswerIndex: 0,
        explanation: 'Immutable audit logging is legally required to verify who accessed patient records and when.',
      },
    ],
    expReward: 25,
    cooldownReductionHours: 48,
  },
  {
    title: 'Agile Workflow Optimization & Incident Escalation',
    domain: 'Operations',
    level: 'junior',
    description: 'Learn modern incident response frameworks, blameless postmortems, and sprint throughput optimization.',
    content: `### Module Overview: Incident Response & Operational Excellence

High-performing teams prepare for production incidents through clear escalation trees, runbooks, and blameless retrospectives.

#### 1. Severity Levels & Incident Command
- **SEV-1 (Critical)**: Production outage affecting major user base or core financial transaction flows.
- **SEV-2 (High)**: Major feature degraded, no full workaround available.
- **SEV-3 (Moderate)**: Minor issue with established workaround.

#### 2. Blameless Postmortems
- Focus on system and architectural failure modes rather than individual human blame.
- Establish root cause using the "5 Whys" methodology.
- Create concrete preventive action items with assigned owners.`,
    questions: [
      {
        question: 'What is the primary philosophy of a "blameless postmortem"?',
        options: [
          'Identify the single individual responsible to issue disciplinary action',
          'Focus on systemic vulnerabilities and organizational defenses rather than human errors',
          'Delete incident logs immediately after resolution',
          'Ignore root causes to move faster on new features',
        ],
        correctAnswerIndex: 1,
        explanation: 'Blameless retrospectives treat human errors as symptoms of flawed systemic safeguards rather than individual negligence.',
      },
      {
        question: 'Which severity tier denotes a complete platform outage impacting core user transactions?',
        options: ['SEV-1', 'SEV-3', 'SEV-5', 'SEV-INFO'],
        correctAnswerIndex: 0,
        explanation: 'SEV-1 represents the most critical tier of production outages requiring immediate all-hands incident command.',
      },
      {
        question: 'What root-cause analysis technique involves repeatedly asking why a problem occurred until the fundamental defect is identified?',
        options: ['5 Whys', 'Fibonacci sizing', 'Pareto charting', 'Burndown projection'],
        correctAnswerIndex: 0,
        explanation: 'The 5 Whys is the classic investigative drill-down method to uncover underlying procedural or technical root causes.',
      },
    ],
    expReward: 25,
    cooldownReductionHours: 48,
  },
  {
    title: 'User-Centric Interface Architecture & Micro-Interactions',
    domain: 'Design',
    level: 'junior',
    description: 'Master WCAG AA accessibility, tokenized design systems, and delightful UI micro-interactions.',
    content: `### Module Overview: Design Systems & Interface Psychology

Elite software pairs visual elegance with uncompromising accessibility, performance, and cognitive ergonomics.

#### 1. Design Tokens & Design Systems
- Design tokens represent atomic values (colors, spacing, typography, elevation) as reusable variables.
- Ensures cross-platform consistency between web, iOS, and Android applications.

#### 2. Accessibility (WCAG 2.2 AA)
- Minimum contrast ratio of **4.5:1** for normal text and **3:1** for large text against background.
- Full keyboard navigability: Every interactive element must have a visible focus indicator and respond to \`Tab\`, \`Enter\`, and \`Space\`.
- Semantic HTML and ARIA labels for screen reader accessibility.`,
    questions: [
      {
        question: 'According to WCAG AA guidelines, what is the minimum color contrast ratio required for regular body text?',
        options: ['2:1', '3:1', '4.5:1', '7:1'],
        correctAnswerIndex: 2,
        explanation: 'WCAG 2.2 AA requires a minimum contrast ratio of 4.5:1 for standard body text.',
      },
      {
        question: 'What are design tokens used for in modern engineering teams?',
        options: [
          'Cryptocurrency micropayments to designers',
          'Centralized, platform-agnostic variables representing visual style attributes (colors, typography, spacing)',
          'OAuth tokens used for designer login',
          'Database indexing keys for user sessions',
        ],
        correctAnswerIndex: 1,
        explanation: 'Design tokens provide a single source of truth for design values across codebases.',
      },
      {
        question: 'Why is visual focus indicator retention crucial for accessible web applications?',
        options: [
          'It satisfies search engine web crawler requirements',
          'It allows keyboard-only and assistive technology users to track where they are on the screen',
          'It automatically compresses image assets',
          'It enables browser caching on SVG icons',
        ],
        correctAnswerIndex: 1,
        explanation: 'Visible focus indicators allow keyboard navigators to clearly see which interactive control is currently active.',
      },
    ],
    expReward: 25,
    cooldownReductionHours: 48,
  },
];

async function seedTrainingModules() {
  const count = await TrainingModule.countDocuments();
  if (count === 0) {
    await TrainingModule.insertMany(defaultModules);
    console.log(`[Seed] Inserted ${defaultModules.length} default training modules.`);
  } else {
    // Optionally update or ensure domains exist
    for (const mod of defaultModules) {
      await TrainingModule.findOneAndUpdate(
        { domain: mod.domain, title: mod.title },
        { $setOnInsert: mod },
        { upsert: true }
      );
    }
  }
}

module.exports = { seedTrainingModules, defaultModules };
