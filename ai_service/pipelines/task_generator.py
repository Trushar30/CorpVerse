from typing import Dict, Any
from .base import BasePipeline

class TaskGeneratorPipeline(BasePipeline):
    """Generates role-specific daily scenario tasks for employees."""

    def build_prompt(self, input_data: Dict[str, Any]) -> str:
        role = input_data.get('role_title', 'Developer')
        level = input_data.get('level', 'junior')
        domain = input_data.get('domain', 'Technology')
        difficulty = input_data.get('difficulty', 'medium')

        return f"""Generate a realistic, concise daily work task for a {level} {role} in the {domain} industry.

Difficulty: {difficulty}

The task should be:
- Completable in 15-30 minutes of focused work
- Based on a realistic workplace scenario
- Specific enough to evaluate completion
- Educational and skill-building

Return JSON:
{{
  "title": "Brief task title (max 60 chars)",
  "description": "Detailed task description with context and requirements (2-3 paragraphs)",
  "category": "one of: debugging, feature, optimization, review, design, analysis",
  "skills_tested": ["skill1", "skill2"],
  "expected_output": "What a completed submission should include"
}}"""

    async def run(self, input_payload: Dict[str, Any], system_prompt: str) -> Dict[str, Any]:
        user_prompt = self.build_prompt(input_payload)
        llm_res = await self.call_llm(system_prompt, user_prompt)

        if llm_res.get("success"):
            parsed = self.clean_json_response(llm_res["content"])
            return {
                "success": True,
                "data": parsed,
                "tokens_used": llm_res.get("tokens_used", 400),
                "duration_ms": llm_res.get("duration_ms", 800),
            }
        else:
            role = input_payload.get('role_title', 'Developer')
            level = input_payload.get('level', 'junior')
            difficulty = input_payload.get('difficulty', 'medium')
            category = input_payload.get('category', 'debugging')
            domain = input_payload.get('domain', 'Technology')

            fallback_titles = {
                "easy": f"Verify {role} Input Validation",
                "medium": f"Debug {role} Component Workflow",
                "hard": f"Architect Resilient {domain} Service Layer",
            }
            title = fallback_titles.get(difficulty, f"Complete Daily {role} Task")

            return {
                "success": True,
                "is_fallback": True,
                "data": {
                    "title": title[:60],
                    "description": (
                        f"An urgent incident was reported in the {domain} module. "
                        f"As a {level} {role}, inspect the relevant service logs and system behaviors. "
                        f"Identify any regressions or bottlenecks, then prepare a robust, production-ready fix."
                    ),
                    "category": category,
                    "difficulty": difficulty,
                    "skills_tested": ["troubleshooting", "system-design" if level == "senior" else "code-debugging"],
                    "expected_output": "A reproducible diagnosis, root cause summary, and verified pull request or patch.",
                },
                "tokens_used": 250,
                "duration_ms": llm_res.get("duration_ms", 50),
            }
