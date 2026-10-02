from typing import Dict, Any
from .base import BasePipeline

class GrowthCampaignPipeline(BasePipeline):
    """Generates viral launch copy, product elevator pitches, and marketing threads."""

    async def run(self, input_payload: Dict[str, Any], system_prompt: str) -> Dict[str, Any]:
        product_name = input_payload.get("product_name", "CorpVerse Venture")
        target_audience = input_payload.get("target_audience", "Developers and Tech Founders")
        product_description = input_payload.get("product_description", "AI-driven corporate simulation and career sandbox.")

        user_prompt = f"""
You are GrowthPilot, a viral Y-Combinator startup launch strategist.
Craft an aggressive, high-converting launch campaign for:
PRODUCT: {product_name}
AUDIENCE: {target_audience}
MISSION / DESCRIPTION: {product_description}

Return ONLY valid JSON matching this structure:
{{
  "campaign_title": "Short catchy title",
  "elevator_pitch": "Punchy 30-second pitch",
  "hero_headline": "Bold landing page hero headline",
  "hero_subheadline": "Compelling value proposition subtext",
  "viral_twitter_thread": [
    "Tweet 1 (Hook)",
    "Tweet 2 (The Problem)",
    "Tweet 3 (The Solution)",
    "Tweet 4 (CTA)"
  ],
  "recommended_growth_channels": ["Channel 1", "Channel 2", "Channel 3"]
}}
"""
        llm_res = await self.call_llm(system_prompt, user_prompt)

        if llm_res.get("success"):
            parsed = self.clean_json_response(llm_res["content"])
            return {
                "success": True,
                "data": parsed,
                "tokens_used": llm_res.get("tokens_used", 480),
                "duration_ms": llm_res.get("duration_ms", 950),
            }
        else:
            return {
                "success": True,
                "is_fallback": True,
                "data": {
                    "campaign_title": f"{product_name} Quantum Launch",
                    "elevator_pitch": f"{product_name} empowers teams with autonomous AI agent pipelines, cutting operational latency by 80% while scaling company throughput.",
                    "hero_headline": "The Autonomous Career & Enterprise Frontier",
                    "hero_subheadline": "Build, hire, code, and scale company ventures in an authentic simulated corporate metaverse powered by frontier neural models.",
                    "viral_twitter_thread": [
                        f"🚨 Introducing {product_name} — the next evolution in autonomous corporate intelligence.",
                        "Traditional hiring and engineering management is slow, manual, and fragmented. We built an AI workforce layer to solve this.",
                        "From automated ATS parsing to wafer-scale code inspection, your startup operates at 10x velocity.",
                        "Try the live demo now: Enter the arena and claim your founder seed capital. ⚡",
                    ],
                    "recommended_growth_channels": [
                        "Hacker News 'Show HN' Launch",
                        "ProductHunt #1 Daily Sprint",
                        "Developer Discord & Twitter Spaces",
                    ],
                },
                "tokens_used": 360,
                "duration_ms": llm_res.get("duration_ms", 100),
            }
