import json
import re
import time
import httpx
from typing import Dict, Any, Optional

class BasePipeline:
    """Base pipeline runner for CorpVerse AI bots."""

    def __init__(self, provider_url: str, model_id: str, api_key: Optional[str] = None):
        self.provider_url = provider_url.rstrip("/")
        self.model_id = model_id
        self.api_key = api_key

    async def call_llm(self, system_prompt: str, user_prompt: str, temperature: float = 0.5) -> Dict[str, Any]:
        """Calls the OpenAI-compatible chat completion endpoint."""
        start_time = time.time()

        endpoint = self.provider_url
        if not endpoint.endswith("/chat/completions"):
            endpoint = f"{endpoint}/chat/completions"

        headers = {
            "Content-Type": "application/json",
            "User-Agent": "CorpVerse-AI-Service/1.0",
        }
        if self.api_key and self.api_key != "None":
            headers["Authorization"] = f"Bearer {self.api_key}"

        payload = {
            "model": self.model_id,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": temperature,
            "max_tokens": 2048,
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(endpoint, headers=headers, json=payload)
                duration_ms = int((time.time() - start_time) * 1000)

                if response.status_code == 200:
                    data = response.json()
                    content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
                    usage = data.get("usage", {})
                    tokens_used = usage.get("total_tokens", len(content.split()) * 2)

                    return {
                        "success": True,
                        "content": content,
                        "tokens_used": tokens_used,
                        "duration_ms": duration_ms,
                        "raw": data,
                    }
                else:
                    return {
                        "success": False,
                        "error": f"LLM returned HTTP {response.status_code}: {response.text[:200]}",
                        "duration_ms": duration_ms,
                    }
        except Exception as e:
            duration_ms = int((time.time() - start_time) * 1000)
            return {
                "success": False,
                "error": str(e),
                "duration_ms": duration_ms,
            }

    def clean_json_response(self, text: str) -> Dict[str, Any]:
        """Extracts and parses JSON from markdown code fences or raw text."""
        try:
            # Try direct JSON parsing
            return json.loads(text.strip())
        except Exception:
            pass

        # Try to find ```json ... ``` blocks
        json_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
        if json_match:
            try:
                return json.loads(json_match.group(1).strip())
            except Exception:
                pass

        # Try finding the first '{' and last '}'
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            try:
                return json.loads(text[start : end + 1])
            except Exception:
                pass

        return {"raw_text": text}
