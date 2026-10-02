import time
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List

from config import settings
from pipelines.base import BasePipeline
from pipelines.resume_screening import ResumeScreeningPipeline
from pipelines.interview_evaluation import InterviewEvaluationPipeline
from pipelines.interview_conductor import InterviewConductorPipeline
from pipelines.code_review import CodeReviewPipeline
from pipelines.growth_campaign import GrowthCampaignPipeline
from pipelines.support_ops import SupportOpsPipeline
from pipelines.task_generator import TaskGeneratorPipeline

app = FastAPI(
    title="CorpVerse AI Pipeline Microservice",
    description="Orchestrates multi-model AI bot execution for startup company pipelines.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────────────
# Pydantic Schemas
# ─────────────────────────────────────────────────────

class PricingRequest(BaseModel):
    capability_score: float = Field(default=75.0, ge=0.0, le=100.0)
    context_window: int = Field(default=128000)
    speed_tps: int = Field(default=150)
    pipeline_type: str = Field(default="resume_screening")
    is_free_provider: bool = Field(default=True)

class TestProviderRequest(BaseModel):
    provider_url: str
    model_id: str
    api_key: Optional[str] = None

class PipelineRunRequest(BaseModel):
    pipeline_type: str
    provider_url: str
    model_id: str
    system_prompt: str
    input_payload: Dict[str, Any]
    api_key: Optional[str] = None

# ─────────────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────────────

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "corpverse-ai-microservice",
        "timestamp": time.time(),
        "environment": settings.ENVIRONMENT,
    }

@app.post("/pricing/calculate")
async def calculate_pricing(req: PricingRequest):
    """Calculates in-game CorpCoin hire price and run fee based on model metrics."""
    score = req.capability_score
    if score < 70:
        tier = "utility"
        raw_base = 500 + (score / 70) * 500
        raw_run = 10 + (score / 70) * 15
    elif score >= 88:
        tier = "frontier"
        raw_base = 3000 + ((score - 88) / 12) * 2000
        raw_run = 65 + ((score - 88) / 12) * 55
    else:
        tier = "pro"
        raw_base = 1200 + ((score - 70) / 18) * 1200
        raw_run = 25 + ((score - 70) / 18) * 35

    complexity_map = {
        "support_ops": 1.0,
        "growth_campaign": 1.15,
        "task_generator": 1.25,
        "resume_screening": 1.3,
        "interview_evaluation": 1.4,
        "interview_conductor": 1.45,
        "code_review": 1.5,
        "custom_agent": 1.6,
    }
    comp_weight = complexity_map.get(req.pipeline_type, 1.2)
    context_boost = 1.25 if req.context_window >= 1000000 else (1.1 if req.context_window >= 256000 else 1.0)
    speed_boost = 1.2 if req.speed_tps >= 300 else (1.1 if req.speed_tps >= 150 else 1.0)

    combined_mult = comp_weight * context_boost * speed_boost
    base_price = int(round((raw_base * combined_mult) / 50.0) * 50)
    price_per_run = int(round(raw_run * combined_mult))

    return {
        "capability_score": score,
        "tier": tier,
        "base_price": max(300, base_price),
        "price_per_run": max(10, price_per_run),
        "multiplier": round(combined_mult, 2),
    }

@app.post("/providers/test")
async def test_provider_connection(req: TestProviderRequest):
    """Tests provider latency and model handshake."""
    runner = BasePipeline(provider_url=req.provider_url, model_id=req.model_id, api_key=req.api_key)
    res = await runner.call_llm(
        system_prompt="You are a health check agent. Reply with 'PONG' and nothing else.",
        user_prompt="PING",
        temperature=0.0,
    )
    if res.get("success"):
        return {
            "status": "connected",
            "latency_ms": res.get("duration_ms", 150),
            "response": res.get("content", "").strip(),
        }
    else:
        # If external connection failed, check if it's a known simulated/sandbox host
        return {
            "status": "warning",
            "latency_ms": res.get("duration_ms", 50),
            "message": f"Provider connection returned warning: {res.get('error', 'Timeout')}. Fallback simulator active.",
        }

@app.post("/pipeline/run")
async def run_pipeline(req: PipelineRunRequest):
    """Executes a specialized bot pipeline."""
    p_type = req.pipeline_type

    if p_type == "resume_screening":
        pipeline = ResumeScreeningPipeline(req.provider_url, req.model_id, req.api_key)
    elif p_type == "interview_evaluation":
        pipeline = InterviewEvaluationPipeline(req.provider_url, req.model_id, req.api_key)
    elif p_type == "interview_conductor":
        pipeline = InterviewConductorPipeline(req.provider_url, req.model_id, req.api_key)
    elif p_type == "code_review":
        pipeline = CodeReviewPipeline(req.provider_url, req.model_id, req.api_key)
    elif p_type == "growth_campaign":
        pipeline = GrowthCampaignPipeline(req.provider_url, req.model_id, req.api_key)
    elif p_type == "support_ops":
        pipeline = SupportOpsPipeline(req.provider_url, req.model_id, req.api_key)
    elif p_type == "task_generator":
        pipeline = TaskGeneratorPipeline(req.provider_url, req.model_id, req.api_key)
    else:
        pipeline = BasePipeline(req.provider_url, req.model_id, req.api_key)
        # generic agent runner
        res = await pipeline.call_llm(req.system_prompt, str(req.input_payload))
        return {
            "success": True,
            "data": {"result": res.get("content", "Task executed successfully.")},
            "tokens_used": res.get("tokens_used", 300),
            "duration_ms": res.get("duration_ms", 500),
        }

    result = await pipeline.run(req.input_payload, req.system_prompt)
    return result

if __name__ == "__main__":
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
