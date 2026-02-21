"""Cloud FastAPI service — Executive Escalation Agent (27B via HF Inference on AWS)."""
from fastapi import FastAPI, Header, HTTPException, Depends
from app.executive_agent import run_executive_agent
from app.config import cloud_settings
from pydantic import BaseModel
from typing import Optional


app = FastAPI(
    title="MaTriX-AI Cloud Executive Service",
    description="27B Executive Agent (HuggingFace Inference on AWS) for senior obstetric escalation.",
    version="1.0.0",
)


# ── Auth dependency ──────────────────────────────────────────────────────────

async def verify_api_key(x_api_key: str = Header(..., description="Edge system API key")):
    if x_api_key != cloud_settings.cloud_api_key:
        raise HTTPException(status_code=401, detail="Invalid API key.")


# ── Request / Response models ─────────────────────────────────────────────────

class EscalationRequest(BaseModel):
    patient_data: dict
    risk_output: dict
    guideline_output: dict


class ExecutiveResponse(BaseModel):
    executive_summary: str
    care_plan: str
    referral_urgency: str
    referral_priority: str
    justification: str
    time_to_transfer_hours: Optional[float] = None
    receiving_facility_requirements: Optional[str] = None
    in_transit_care: Optional[str] = None


# ── Routes ────────────────────────────────────────────────────────────────────

@app.post(
    "/executive_escalation",
    response_model=ExecutiveResponse,
    dependencies=[Depends(verify_api_key)],
    summary="Trigger 27B Executive Agent for case escalation",
)
async def executive_escalation(payload: EscalationRequest):
    """
    Accepts a structured case summary from the edge system,
    calls the 27B model on HuggingFace Inference Endpoint (AWS),
    and returns a harmonised senior obstetric care plan.
    """
    result = await run_executive_agent(payload.model_dump())
    return result


@app.get("/health", tags=["Health"])
async def health():
    hf_configured = bool(cloud_settings.hf_inference_endpoint and cloud_settings.hf_api_token)
    return {
        "status": "healthy",
        "model": cloud_settings.hf_model_id if hf_configured else cloud_settings.cloud_model,
        "backend": "hf_inference_endpoint" if hf_configured else "ollama_fallback",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)