const Company = require('../models/Company');
const User = require('../models/User');
const Role = require('../models/Role');
const CompanyScenario = require('../models/CompanyScenario');

const SEED_SCENARIOS = [
  {
    title: 'Distributed Cloud GPU Bill Shock',
    category: 'tech',
    urgency: 'critical',
    description: 'Your autonomous AI hiring bots experienced a recursive request surge during a high-traffic applicant rush. Cloud GPU bills are 4x higher than budgeted.',
    options: [
      {
        text: 'Pay emergency surcharge & scale compute limiters',
        description: 'Settle the bill immediately from treasury to avoid downtime.',
        treasuryImpact: -3500,
        valuationImpact: 50000,
        riskRating: 'conservative',
        outcomeMessage: 'Systems stabilized. Cloud provider awarded verified enterprise uptime badge.',
      },
      {
        text: 'Throttle AI bot model size & downgrade inference speed',
        description: 'Cut costs by switching bots to lightweight open-source models.',
        treasuryImpact: -500,
        valuationImpact: -150000,
        riskRating: 'aggressive',
        outcomeMessage: 'Inference latency doubled. 2 candidate applicants left negative reviews.',
      },
    ],
  },
  {
    title: 'Series-A VC Term Sheet Influx',
    category: 'finance',
    urgency: 'medium',
    description: 'A tier-1 gaming venture fund offers strategic capital with stringent milestone covenants.',
    options: [
      {
        text: 'Accept venture injection with aggressive hiring milestones',
        description: 'Receive 8,000 CorpCoins cash infusion in exchange for $500k equity valuation benchmark.',
        treasuryImpact: 8000,
        valuationImpact: 500000,
        riskRating: 'aggressive',
        outcomeMessage: 'Treasury bolstered! Investor syndicate added company to featured directory.',
      },
      {
        text: 'Reject & remain 100% bootstrapped and self-funded',
        description: 'Maintain complete operational sovereignty without equity dilution.',
        treasuryImpact: 0,
        valuationImpact: 100000,
        riskRating: 'conservative',
        outcomeMessage: 'Bootstrapped resilience boosted team culture and founder ownership.',
      },
    ],
  },
  {
    title: 'Key Senior Engineer Poaching Attempt',
    category: 'hr',
    urgency: 'high',
    description: 'A rival AI seed venture is attempting to poach your top developer with double compensation.',
    options: [
      {
        text: 'Counter-offer with immediate promotion and salary hike',
        description: 'Disburse retention bonus from company treasury.',
        treasuryImpact: -2500,
        valuationImpact: 100000,
        riskRating: 'moderate',
        outcomeMessage: 'Developer stays! Team morale reinforced after public loyalty commitment.',
      },
      {
        text: 'Let them walk & rely on AI bot automation',
        description: 'Replace engineer workload with AI coding agents.',
        treasuryImpact: -800,
        valuationImpact: -100000,
        riskRating: 'aggressive',
        outcomeMessage: 'Saved treasury, but sprint velocity declined for 2 weeks.',
      },
    ],
  },
  {
    title: 'Zero-Day API Key Leak & Security Breach',
    category: 'crisis',
    urgency: 'critical',
    description: 'An automated pipeline runner accidentally committed internal API secret keys to a public sandbox fork.',
    options: [
      {
        text: 'Hire elite cyber auditors & rotate enterprise vaults',
        description: 'Commission emergency third-party security remediation from company treasury.',
        treasuryImpact: -4000,
        valuationImpact: 200000,
        riskRating: 'conservative',
        outcomeMessage: 'Auditors fortified enterprise perimeter and issued SOC-2 compliance attestation.',
      },
      {
        text: 'Execute quick internal hotfix & suppress disclosure',
        description: 'Patch locally and save treasury capital.',
        treasuryImpact: -1000,
        valuationImpact: -300000,
        riskRating: 'aggressive',
        outcomeMessage: 'Breach leaked on developer boards. Client trust declined significantly.',
      },
    ],
  },
  {
    title: 'Viral Social Product Launch Surge',
    category: 'marketing',
    urgency: 'medium',
    description: 'A tech influencer showcased your autonomous company on social media, generating an unprecedented 10x traffic surge.',
    options: [
      {
        text: 'Double down with high-impact sponsor campaign',
        description: 'Fund global ad blitz to convert viral views into enterprise signups.',
        treasuryImpact: -2000,
        valuationImpact: 350000,
        riskRating: 'aggressive',
        outcomeMessage: 'Campaign trended #1 across tech media! 5,000 new users joined enterprise waitlist.',
      },
      {
        text: 'Rely on purely organic growth and community word-of-mouth',
        description: 'Preserve cash reserve without committing ad spend.',
        treasuryImpact: 0,
        valuationImpact: 75000,
        riskRating: 'conservative',
        outcomeMessage: 'Steady organic adoption achieved with zero dilution of treasury runway.',
      },
    ],
  },
];

class ScenarioService {
  async getActiveScenario(founderId) {
    const company = await Company.findOne({ founder: founderId });
    if (!company) return null;

    // Check for existing pending scenario
    let scenario = await CompanyScenario.findOne({
      company: company._id,
      status: 'pending',
    });

    // If none exists, spawn a random seed scenario
    if (!scenario && !company.isSuspended) {
      const template = SEED_SCENARIOS[Math.floor(Math.random() * SEED_SCENARIOS.length)];
      scenario = await CompanyScenario.create({
        company: company._id,
        ...template,
      });
    }

    return {
      scenario,
      company: {
        _id: company._id,
        name: company.name,
        treasury: company.treasury,
        valuation: company.valuation,
        isSuspended: company.isSuspended,
        suspendedReason: company.suspendedReason,
      },
    };
  }

  async resolveDecision(founderId, scenarioId, optionIndex) {
    const company = await Company.findOne({ founder: founderId });
    if (!company) throw new Error('Company not found');
    if (company.isSuspended) throw new Error('Company is suspended and cannot make decisions');

    const scenario = await CompanyScenario.findOne({
      _id: scenarioId,
      company: company._id,
      status: 'pending',
    });
    if (!scenario) throw new Error('Scenario not found or already resolved');

    const option = scenario.options[optionIndex];
    if (!option) throw new Error('Invalid option index');

    // Update Company Treasury & Valuation
    company.treasury += option.treasuryImpact;
    company.valuation = Math.max(0, company.valuation + option.valuationImpact);

    let isBankrupt = false;

    // BANKRUPTCY & SUSPENSION CHECK
    if (company.treasury <= 0) {
      company.treasury = 0;
      company.isSuspended = true;
      company.suspendedReason = 'Insolvency: Company Treasury collapsed to 0 CorpCoins.';
      isBankrupt = true;

      // Demote founder back to Job Seeker
      await User.findByIdAndUpdate(founderId, {
        role: 'job_seeker',
        currentStatus: 'job_seeker',
      });

      // Close all company open roles
      await Role.updateMany({ company: company._id }, { status: 'closed', isOpen: false });
    }

    await company.save();

    // Mark scenario as resolved
    scenario.status = 'resolved';
    scenario.chosenOptionIndex = optionIndex;
    scenario.resolvedAt = new Date();
    await scenario.save();

    return {
      outcome: option.outcomeMessage,
      treasuryImpact: option.treasuryImpact,
      valuationImpact: option.valuationImpact,
      updatedTreasury: company.treasury,
      updatedValuation: company.valuation,
      isBankrupt,
      message: isBankrupt
        ? 'CRITICAL ALERT: Company is bankrupt and suspended! Founder reverted to Job Seeker.'
        : 'Decision implemented successfully.',
    };
  }
}

module.exports = new ScenarioService();
