from typing import Dict, Any, List
from .base import BasePipeline

class InterviewConductorPipeline(BasePipeline):
    """Conducts multi-turn AI interviews, generating contextual follow-up questions."""

    def format_transcript(self, transcript: List[Dict[str, str]]) -> str:
        """Formats transcript array into readable conversation text."""
        lines = []
        for entry in transcript:
            role_label = "Interviewer" if entry.get("role") == "ai" else "Candidate"
            lines.append(f"{role_label}: {entry.get('message', '')}")
        return "\n".join(lines)

    async def run(self, input_payload: Dict[str, Any], system_prompt: str) -> Dict[str, Any]:
        transcript = input_payload.get('transcript', [])
        role_context = input_payload.get('role_context', {})
        turn_number = input_payload.get('turn_number', 1)
        max_turns = input_payload.get('max_turns', 10)

        role_title = role_context.get('title', 'Software Engineer')
        role_level = role_context.get('level', 'mid')
        role_domain = role_context.get('domain', 'Technology')
        requirements = role_context.get('requirements', [])

        # Build difficulty guidance based on level
        level_guidance = {
            'junior': 'Ask fundamental questions about core concepts, basic problem-solving, and coding basics. Keep questions approachable but meaningful.',
            'mid': 'Ask questions about system design basics, real-world scenarios, debugging approaches, and practical engineering trade-offs.',
            'senior': 'Ask about architecture decisions, leadership experience, complex trade-offs, system scalability, mentoring approaches, and strategic technical thinking.'
        }
        difficulty = level_guidance.get(role_level, level_guidance['mid'])

        # Build progress guidance
        progress_pct = (turn_number / max_turns) * 100
        if progress_pct <= 30:
            phase = 'EARLY - Start with introductory and fundamental questions to ease the candidate in.'
        elif progress_pct <= 70:
            phase = 'MIDDLE - Progress to more challenging questions. Follow up on previous answers with probing questions.'
        else:
            phase = 'LATE - Ask your most challenging questions. Wrap up any loose threads from earlier answers.'

        completion_instruction = ''
        if turn_number >= max_turns - 1:
            completion_instruction = '\n\nIMPORTANT: This is the final turn. Provide a brief closing remark thanking the candidate. End your response with [INTERVIEW_COMPLETE].'

        formatted_transcript = self.format_transcript(transcript)

        user_prompt = f"""You are an experienced technical interviewer conducting an interview for the role of {role_title} ({role_level} level) in the {role_domain} domain.

Interview Guidelines:
- Ask ONE question at a time
- {difficulty}
- Follow up on the candidate's previous answers with probing questions when appropriate
- Be professional but friendly and encouraging
- Evaluate both technical knowledge and communication skills
- Current progress: Turn {turn_number}/{max_turns} ({phase})

Role Requirements: {', '.join(requirements) if requirements else 'General technical proficiency'}
{completion_instruction}

Conversation so far:
{formatted_transcript}

Generate your next interviewer response. Do NOT include any role prefix like 'Interviewer:' — just provide the response directly."""

        llm_res = await self.call_llm(system_prompt, user_prompt, temperature=0.7)

        if llm_res.get("success"):
            content = llm_res["content"].strip()
            # Remove any accidental role prefix
            if content.startswith("Interviewer:"):
                content = content[len("Interviewer:"):].strip()
            
            return {
                "success": True,
                "data": {
                    "response": content,
                    "contains_completion_marker": "[INTERVIEW_COMPLETE]" in content,
                },
                "tokens_used": llm_res.get("tokens_used", 300),
                "duration_ms": llm_res.get("duration_ms", 800),
            }
        else:
            # Fallback: generate a generic question based on level and turn
            fallback_questions = {
                'junior': [
                    'Can you explain the difference between a stack and a queue? When would you use each?',
                    'How would you approach debugging an issue where a web page loads slowly?',
                    'What is version control, and why is it important in a team environment?',
                    'Can you walk me through how you would design a simple to-do list application?',
                    'What are the key principles of writing clean, readable code?',
                ],
                'mid': [
                    'How would you design a caching layer for a web application that handles millions of requests?',
                    'Tell me about a time you had to refactor a significant piece of code. What was your approach?',
                    'How do you approach writing tests for a feature with complex business logic?',
                    'What strategies would you use to optimize a slow database query?',
                    'How would you handle a situation where two microservices need to maintain data consistency?',
                ],
                'senior': [
                    'How would you design a system that needs to handle 10x traffic growth over the next year?',
                    'Describe your approach to making build-vs-buy decisions for critical infrastructure.',
                    'How do you mentor junior developers while maintaining your own technical contributions?',
                    'What is your approach to managing technical debt in a fast-moving product organization?',
                    'How would you evaluate and introduce a new technology into your team\'s stack?',
                ],
            }
            questions = fallback_questions.get(role_level, fallback_questions['mid'])
            idx = min(turn_number - 1, len(questions) - 1)
            fallback_response = questions[idx]
            
            if turn_number >= max_turns:
                fallback_response = f"Thank you for your thoughtful answers throughout this interview. That concludes our conversation for the {role_title} position. We appreciate your time! [INTERVIEW_COMPLETE]"

            return {
                "success": True,
                "is_fallback": True,
                "data": {
                    "response": fallback_response,
                    "contains_completion_marker": "[INTERVIEW_COMPLETE]" in fallback_response,
                },
                "tokens_used": 50,
                "duration_ms": llm_res.get("duration_ms", 100),
            }
