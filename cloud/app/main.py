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
    vision_output: Optional[dict] = None
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


class VisionRequest(BaseModel):
    image_data: str  # Base64 or URL
    prompt: str = "Analyze clinical imagery for obstetric risks."


class VisionResponse(BaseModel):
    analysis: str
    findings: list
    risk_correction: Optional[float] = None


class RedundancyRequest(BaseModel):
    vitals: dict
    symptoms: list
    notes: Optional[str] = None


# ── Routes ────────────────────────────────────────────────────────────────────

@app.post("/executive_escalation", response_model=ExecutiveResponse, dependencies=[Depends(verify_api_key)])
async def executive_escalation(payload: EscalationRequest):
    """27B Executive Agent."""
    return await run_executive_agent(payload.model_dump())


@app.post("/vision_analysis", response_model=VisionResponse, dependencies=[Depends(verify_api_key)])
async def vision_analysis(payload: VisionRequest):
    """PaliGemma 3B Vision Agent."""
    from app.cloud_llm import cloud_llm
    result = await cloud_llm.generate(
        prompt=payload.prompt,
        system="You are a clinical vision specialist. Identify obstetric risks in visual data (e.g. edema, jaundice). Provide a JSON response with 'analysis' (text) and 'findings' (list).",
        model_type="vision",
        image_data=payload.image_data
    )
    return {
        "analysis": result.get("analysis", "Vision processing complete."),
        "findings": result.get("findings", []),
        "risk_correction": result.get("risk_correction")
    }


@app.post("/redundancy_triage", dependencies=[Depends(verify_api_key)])
async def redundancy_triage(payload: RedundancyRequest):
    """4B Cloud Redundancy Agent (handles load when Edge is overwhelmed)."""
    from app.cloud_llm import cloud_llm
    result = await cloud_llm.generate(
        prompt=f"Triage case: {payload.vitals}, {payload.symptoms}",
        system="You are a triage backup model. Provide rapid risk assessment.",
        model_type="4b"
    )
    return result


from app.analytics.predictive import MaternalRiskForecaster

@app.get("/analytics/forecast", dependencies=[Depends(verify_api_key)], summary="Population-wide risk forecasting")
async def get_forecast():
    """Returns predictive analytics for seasonal maternal health trends."""
    forecaster = MaternalRiskForecaster()
    return forecaster.predict_seasonality()

@app.get("/health", tags=["Health"])
async def health():
    return {
        "status": "healthy",
        "models": {
            "executive_27b": cloud_settings.sm_27b_endpoint or "hf_endpoint",
            "redundancy_4b": cloud_settings.sm_4b_endpoint,
            "vision_3b": cloud_settings.sm_paligemma_endpoint
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)