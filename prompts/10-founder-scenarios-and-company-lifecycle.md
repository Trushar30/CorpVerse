# Prompt 5.1 — Founder Scenarios & Company Lifecycle

## Context
The Founder dashboard already supports company creation, role posting, bot purchasing, and bot execution. But the gamification element for founders — scenario-based decisions that affect profit/loss, and the risk of company suspension — is not implemented. This is what makes the founder role exciting and challenging.

## Objective
Build the founder scenario decision system, company profit/loss tracking, company suspension mechanics, and the full company lifecycle from creation to potential collapse and revival.

---

## Task 1: Scenario Decision System

### 1.1 — Scenario Model
**Create**: `backend/src/models/Scenario.js`

```javascript
const scenarioSchema = new mongoose.Schema({
  company: { type: ObjectId, ref: 'Company', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['market', 'hr', 'finance', 'tech', 'legal', 'crisis'],
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'critical'],
    required: true,
  },
  options: [{
    label: String,          // "Invest in R&D"
    description: String,    // "Allocate 20% budget to research..."
    outcomeType: {
      type: String,
      enum: ['profit', 'loss', 'neutral', 'mixed'],
    },
    valuationImpact: Number,     // +50000 or -30000
    treasuryImpact: Number,      // +1000 or -500 CorpCoins
    employeeImpact: Number,      // +2 or -1 employees
    riskLevel: { type: String, enum: ['low', 'medium', 'high'] },
  }],
  chosenOption: { type: Number },  // Index of selected option
  outcome: {
    description: String,
    valuationChange: Number,
    treasuryChange: Number,
    resolved: Boolean,
  },
  expiresAt: { type: Date },      // Scenario must be decided before this
  status: {
    type: String,
    enum: ['pending', 'decided', 'expired'],
    default: 'pending',
  },
}, { timestamps: true });

scenarioSchema.index({ company: 1, status: 1 });
scenarioSchema.index({ expiresAt: 1 });
```

### 1.2 — Scenario Generation Service
**File**: `backend/src/services/scenario.service.js`

```javascript
class ScenarioService {
  /**
   * Generate a new scenario for a company using AI
   */
  async generateScenario(companyId) {
    const company = await Company.findById(companyId).populate('founder');
    
    // Get company context
    const context = {
      companyName: company.name,
      domain: company.domain,
      treasury: company.treasury,
      valuation: company.valuation,
      employeeCount: company.employeeCount,
      recentDecisions: await Scenario.find({ company: companyId, status: 'decided' })
        .sort('-createdAt').limit(5),
    };
    
    // Call AI to generate scenario
    const scenario = await aiService.generateScenario(context);
    
    return await Scenario.create({
      company: companyId,
      title: scenario.title,
      description: scenario.description,
      category: scenario.category,
      difficulty: this.calculateDifficulty(company),
      options: scenario.options,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours to decide
    });
  }

  /**
   * Founder makes a decision on a scenario
   */
  async makeDecision(scenarioId, optionIndex, userId) {
    const scenario = await Scenario.findById(scenarioId);
    
    // Validate
    if (scenario.status !== 'pending') throw ApiError.badRequest('Scenario already decided');
    if (new Date() > scenario.expiresAt) {
      scenario.status = 'expired';
      await scenario.save();
      // Apply worst-case outcome for expired decisions
      await this.applyExpiredPenalty(scenario);
      throw ApiError.badRequest('Decision deadline passed. Penalty applied.');
    }
    
    const chosen = scenario.options[optionIndex];
    if (!chosen) throw ApiError.badRequest('Invalid option');
    
    // Apply the outcome
    const company = await Company.findById(scenario.company);
    
    // Calculate actual impact (add some randomness)
    const variance = 0.8 + Math.random() * 0.4; // 80%-120% of expected
    const actualValuation = Math.round(chosen.valuationImpact * variance);
    const actualTreasury = Math.round(chosen.treasuryImpact * variance);
    
    company.valuation += actualValuation;
    company.treasury += actualTreasury;
    
    // Floor treasury at 0
    company.treasury = Math.max(0, company.treasury);
    
    // Check for suspension trigger
    if (company.valuation <= 0 || company.treasury <= 0) {
      await this.suspendCompany(company, 'Bankruptcy: company value or treasury depleted');
    } else {
      await company.save();
    }
    
    // Update scenario
    scenario.chosenOption = optionIndex;
    scenario.status = 'decided';
    scenario.outcome = {
      description: this.generateOutcomeDescription(chosen, actualValuation, actualTreasury),
      valuationChange: actualValuation,
      treasuryChange: actualTreasury,
      resolved: true,
    };
    await scenario.save();
    
    // Award/deduct EXP based on outcome
    if (actualValuation > 0) {
      await gamificationService.awardExp(userId, 15, 'scenario_profit');
    } else {
      await gamificationService.deductExp(userId, 10, 'scenario_loss');
    }
    
    return { scenario, company };
  }
}
```

---

## Task 2: Company Suspension & Revival

### 2.1 — Suspension Triggers
A company gets suspended when:
1. **Treasury depleted**: CorpCoins reach 0
2. **Valuation collapsed**: Company valuation reaches 0 or negative
3. **Accumulated losses**: 5 consecutive scenarios with negative outcomes
4. **All employees quit**: Employee count drops to 0 (after having > 0)

### 2.2 — Suspension Logic
```javascript
async suspendCompany(company, reason) {
  company.status = 'suspended';
  company.suspendedAt = new Date();
  company.suspensionReason = reason;
  await company.save();
  
  // Terminate all employees
  const activeRecords = await EmployeeRecord.find({
    company: company._id,
    employmentStatus: 'active',
  });
  
  for (const record of activeRecords) {
    record.employmentStatus = 'terminated';
    record.exitRecord = {
      exitType: 'company_suspended',
      reason: `Company ${company.name} was suspended: ${reason}`,
      exitedAt: new Date(),
    };
    await record.save();
    
    // Revert employee to job_seeker
    await User.findByIdAndUpdate(record.user, {
      role: 'job_seeker',
      currentStatus: 'job_seeker',
    });
  }
  
  // Revert founder to job_seeker
  await User.findByIdAndUpdate(company.founder, {
    role: 'job_seeker',
    currentStatus: 'job_seeker',
  });
}
```

### 2.3 — Company Schema Updates
**File**: `backend/src/models/Company.js`

Add fields:
```javascript
status: {
  type: String,
  enum: ['active', 'suspended', 'dissolved'],
  default: 'active',
},
suspendedAt: Date,
suspensionReason: String,
consecutiveLosses: { type: Number, default: 0 },
totalProfitLoss: { type: Number, default: 0 },  // Running P&L tracker
scenarioHistory: [{
  scenarioId: ObjectId,
  category: String,
  outcome: String,    // 'profit' or 'loss'
  amount: Number,
  decidedAt: Date,
}],
```

### 2.4 — Revival Mechanic
A suspended founder can revive by:
1. Accumulating 200 EXP as a job seeker (back to the grind)
2. Paying a revival fee (configurable)
3. Starting fresh with reduced treasury (5,000 CorpCoins instead of 10,000)

---

## Task 3: Scenario Generation AI Pipeline

**Create**: `ai_service/pipelines/scenario_generator.py`

```python
class ScenarioGeneratorPipeline(BasePipeline):
    """Generates business scenarios with multiple decision options for founders."""
    
    def build_prompt(self, input_data):
        return f"""Generate a realistic business scenario for a {input_data['domain']} company named "{input_data['company_name']}".

Company Stats:
- Treasury: {input_data['treasury']} CorpCoins
- Valuation: ${input_data['valuation']:,}
- Employees: {input_data['employee_count']}

Generate a scenario with EXACTLY 3 options. Each option should have different risk/reward profiles.

Return JSON:
{{
  "title": "Scenario title (max 80 chars)",
  "description": "2-3 paragraph scenario description with context",
  "category": "one of: market, hr, finance, tech, legal, crisis",
  "options": [
    {{
      "label": "Option name (max 40 chars)",
      "description": "What this option entails (1-2 sentences)",
      "outcomeType": "profit|loss|neutral|mixed",
      "valuationImpact": number (positive or negative),
      "treasuryImpact": number (positive or negative in CorpCoins),
      "employeeImpact": number (positive or negative),
      "riskLevel": "low|medium|high"
    }},
    // ... 2 more options
  ]
}}

Make one option safe (low risk, low reward), one aggressive (high risk, high reward), and one balanced."""
```

Register in `ai_service/main.py`.

---

## Task 4: Founder Scenario Endpoints

**File**: `backend/src/routes/founder.routes.js`

Add:
```javascript
// Get pending scenario (or generate new one if none pending)
router.get('/scenario/current', requireAuth, requireFounderOrAdmin, controller.getCurrentScenario);

// Make a decision on current scenario
router.post('/scenario/:id/decide', requireAuth, requireFounderOrAdmin, controller.makeDecision);

// Get scenario history
router.get('/scenario/history', requireAuth, requireFounderOrAdmin, controller.getScenarioHistory);

// Get company P&L summary
router.get('/company/financials', requireAuth, requireFounderOrAdmin, controller.getFinancials);
```

---

## Task 5: Daily Scenario Trigger

Similar to daily tasks for employees, founders get daily scenario decisions:
- One scenario per day
- If not decided within 24 hours, worst-case outcome applies automatically
- Scenario difficulty scales with company valuation:
  - Valuation < \$500K: mostly easy/medium
  - Valuation \$500K-\$2M: medium/hard mix
  - Valuation > \$2M: hard/critical scenarios

---

## Task 6: Founder Dashboard — Scenario Decision UI

Add a "Scenario" section to the Founder dashboard ventures tab:

```
┌─────────────────────────────────────────────────────────────┐
│  ⚡ TODAY'S BUSINESS DECISION          ⏰ 16h 32m remaining │
│─────────────────────────────────────────────────────────────│
│                                                             │
│  📊 MARKET SCENARIO: Market Disruption                      │
│                                                             │
│  A new competitor has launched in your space with            │
│  aggressive pricing. Your sales pipeline is showing          │
│  a 15% decline in leads. How do you respond?                 │
│                                                             │
│  ┌─ OPTION A: Price Match (Low Risk) ────────────────┐     │
│  │  Match competitor pricing to retain customers.      │     │
│  │  💰 Treasury: -500  📈 Valuation: +20,000          │     │
│  │  Risk: ████░░░░░░ LOW                               │     │
│  │  [SELECT THIS OPTION]                               │     │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─ OPTION B: Innovate & Differentiate (Medium Risk) ─┐    │
│  │  Invest in unique features competitors can't copy.   │    │
│  │  💰 Treasury: -2,000  📈 Valuation: +80,000         │    │
│  │  Risk: ██████░░░░ MEDIUM                             │    │
│  │  [SELECT THIS OPTION]                                │    │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─ OPTION C: Acquire Competitor (High Risk) ──────────┐   │
│  │  Attempt a hostile acquisition of the competitor.     │   │
│  │  💰 Treasury: -5,000  📈 Valuation: +200,000        │   │
│  │  Risk: █████████░ HIGH                               │   │
│  │  [SELECT THIS OPTION]                                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

After decision, show outcome with animation:
```
┌─────────────────────────────────────────────────────────────┐
│                    📊 DECISION OUTCOME                      │
│                                                             │
│  You chose: Innovate & Differentiate                        │
│                                                             │
│  Result: The investment paid off! Your new features         │
│  attracted 30% more enterprise clients.                     │
│                                                             │
│  💰 Treasury: -1,800 CorpCoins (variance applied)          │
│  📈 Valuation: +72,000 (variance applied)                  │
│  ⚡ +15 EXP earned                                          │
│                                                             │
│  Company Valuation: $1,072,000                              │
│  Treasury Balance: 8,200 CorpCoins                          │
│                                                             │
│  [CONTINUE →]                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Acceptance Criteria
- [ ] AI generates contextual business scenarios for founder companies
- [ ] Each scenario has 3 options with varying risk/reward
- [ ] Decision impacts company treasury and valuation
- [ ] Variance adds unpredictability to outcomes
- [ ] Expired scenarios apply worst-case penalty
- [ ] Company suspended when treasury or valuation reaches 0
- [ ] All employees terminated and reverted to job_seeker on suspension
- [ ] Founder reverted to job_seeker on suspension
- [ ] Revival mechanic allows starting over after earning 200 EXP
- [ ] Consecutive loss tracking triggers suspension at 5 losses
- [ ] Scenario history recorded for founder review
- [ ] P&L financials endpoint returns running totals
- [ ] Decision timer shows countdown in UI
- [ ] Outcome animation shows actual impact with variance
- [ ] Scenario difficulty scales with company valuation
