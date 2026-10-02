// ─────────────────────────────────────────────────────
// AI BOT CAPABILITY & PRICING ENGINE
// Calculates in-game CorpCoin hire price and run fee
// based on LLM model capabilities, throughput, context, and pipeline complexity.
// ─────────────────────────────────────────────────────

const PIPELINE_COMPLEXITY = {
  support_ops: 1.0,
  growth_campaign: 1.15,
  resume_screening: 1.3,
  interview_evaluation: 1.4,
  code_review: 1.5,
  custom_agent: 1.6,
};

/**
 * Calculate capability score and CorpCoin pricing
 * @param {Object} params
 * @param {number} params.capabilityScore - Raw or estimated capability (0-100)
 * @param {number} params.contextWindow - Max context tokens (e.g. 128000)
 * @param {number} params.speedTPS - Output speed in tokens/sec (e.g. 300)
 * @param {string} params.pipelineType - Type of company pipeline
 * @param {boolean} params.isFreeProvider - Whether host API has zero subscription fee
 * @returns {Object} { capabilityScore, tier, basePrice, pricePerRun, multiplier, details }
 */
function calculateBotPricing({
  capabilityScore = 75,
  contextWindow = 128000,
  speedTPS = 150,
  pipelineType = 'resume_screening',
  isFreeProvider = true,
}) {
  // 1. Normalize capability score (0 - 100)
  const score = Math.max(10, Math.min(100, Number(capabilityScore) || 75));

  // 2. Determine Tier
  let tier = 'pro';
  if (score < 70) {
    tier = 'utility';
  } else if (score >= 88) {
    tier = 'frontier';
  }

  // 3. Pipeline complexity weight
  const complexity = PIPELINE_COMPLEXITY[pipelineType] || 1.2;

  // 4. Context & Speed bonuses
  const contextMultiplier = contextWindow >= 1000000 ? 1.25 : contextWindow >= 256000 ? 1.1 : 1.0;
  const speedMultiplier = speedTPS >= 300 ? 1.2 : speedTPS >= 150 ? 1.1 : 1.0;

  // 5. Tier-based base price curve (in CorpCoins)
  // Utility: ~500 - 1,000 CorpCoins
  // Pro: ~1,200 - 2,500 CorpCoins
  // Frontier: ~3,000 - 5,000 CorpCoins
  let rawBasePrice = 0;
  let rawPricePerRun = 0;

  if (tier === 'utility') {
    rawBasePrice = 500 + (score / 70) * 500;
    rawPricePerRun = 10 + (score / 70) * 15;
  } else if (tier === 'pro') {
    rawBasePrice = 1200 + ((score - 70) / 18) * 1200;
    rawPricePerRun = 25 + ((score - 70) / 18) * 35;
  } else {
    // frontier
    rawBasePrice = 3000 + ((score - 88) / 12) * 2000;
    rawPricePerRun = 65 + ((score - 88) / 12) * 55;
  }

  // Apply complexity and multipliers
  const combinedMultiplier = complexity * contextMultiplier * speedMultiplier;
  const finalBasePrice = Math.round((rawBasePrice * combinedMultiplier) / 50) * 50; // rounded to nearest 50
  const finalPricePerRun = Math.round(rawPricePerRun * combinedMultiplier);

  return {
    capabilityScore: score,
    tier,
    basePrice: Math.max(300, finalBasePrice),
    pricePerRun: Math.max(10, finalPricePerRun),
    multiplier: parseFloat(combinedMultiplier.toFixed(2)),
    details: {
      tier,
      complexityWeight: complexity,
      contextBoost: contextMultiplier,
      speedBoost: speedMultiplier,
      tokenEconomy: isFreeProvider ? 'Subsidized Free Tier' : 'Enterprise Quota',
    },
  };
}

module.exports = {
  calculateBotPricing,
  PIPELINE_COMPLEXITY,
};
