"""API routes — UUID visits, vitals/symptoms split, JWT auth, signup."""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from datetime import datetime
import httpx

from app.db.database import get_db
from app.db.schemas import (
    CaseSubmission, CaseResult, HistoryItem, 
    UserCreate, Token, User as UserSchema
)
from app.db import crud
from app.db.user_crud import get_user_by_username, create_user, get_user_by_id
from app.workflow.graph import run_workflow
from app.utils.auth import create_access_token, get_current_user, verify_password
from app.config import settings

router = APIRouter(prefix="/api", tags=["MaTriX-AI"])


# ── Auth ──────────────────────────────────────────────────────────────────────

@router.post("/auth/signup", tags=["Auth"], response_model=UserSchema, summary="Create a new clinic account")
async def signup(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    existing = await get_user_by_username(db, payload.username)
    if existing:
        raise HTTPException(status_code=409, detail="Username already exists")
    user = await create_user(db, payload.username, payload.password, payload.clinic_name)
    return user


@router.get("/auth/me", tags=["Auth"], response_model=UserSchema, summary="Get current user details")
async def get_me(db: AsyncSession = Depends(get_db), token_data: dict = Depends(get_current_user)):
    user = await get_user_by_username(db, token_data["sub"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/auth/token", tags=["Auth"], response_model=Token, summary="Obtain JWT access token")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    """Check users table first, then fall back to shared clinic_password for demo."""
    user = await get_user_by_username(db, form_data.username)
    if user:
        if not verify_password(form_data.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Incorrect credentials")
        token = create_access_token({"sub": user.username, "role": user.role})
        return {"access_token": token, "token_type": "bearer"}
    # Fallback: shared clinic password
    if form_data.password == settings.clinic_password:
        token = create_access_token({"sub": form_data.username, "role": "nurse"})
        return {"access_token": token, "token_type": "bearer"}
    raise HTTPException(status_code=401, detail="Incorrect credentials")


class VisionRequest(BaseModel):
    image_data: str # base64
    prompt: str = "Identify any clinical anomalies or signs of severe maternal risk."


@router.post(
    "/submit_case",
    response_model=CaseResult,
    summary="Submit a maternal case for AI triage",
)
async def submit_case(
    payload: CaseSubmission,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Run the full LangGraph triage workflow and persist all outputs."""
    # Flatten for workflow
    patient_dict = {
        "name": payload.name,
        "age": payload.age,
        "gestational_age_weeks": payload.gestational_age_weeks,
        "bp_systolic": payload.vitals.systolic,
        "bp_diastolic": payload.vitals.diastolic,
        "proteinuria": payload.vitals.proteinuria not in (None, "none"),
        "heart_rate": payload.vitals.heart_rate,
        "headache": "headache" in payload.symptoms,
        "visual_disturbance": "visual_disturbance" in payload.symptoms,
        "epigastric_pain": "epigastric_pain" in payload.symptoms,
        "oedema": "oedema" in payload.symptoms,
        "fetal_movement_reduced": "fetal_movement_reduced" in payload.symptoms,
        "notes": payload.notes,
    }

    try:
        state = await run_workflow(patient_dict)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Workflow error: {exc}")

    # Persist
    patient = await crud.get_or_create_patient(
        db, name=payload.name, age=payload.age,
        gestational_age_weeks=payload.gestational_age_weeks,
    )
    visit = await crud.create_visit(
        db, patient_id=patient.id,
        vitals_data=payload.vitals.model_dump(),
        symptoms_list=payload.symptoms,
        notes=payload.notes,
    )
    await crud.save_risk_output(db, visit_id=visit.id, risk=state["risk_output"])
    await crud.save_guideline_output(db, visit_id=visit.id, guide=state["guideline_output"])
    await crud.save_escalation_log(db, visit_id=visit.id, state=state)
    await db.commit()

    risk = state["risk_output"]
    guide = state["guideline_output"]
    exec_out = state.get("executive_output")

    return CaseResult(
        visit_id=visit.id,
        patient_name=payload.name,
        submitted_at=datetime.utcnow(),
        risk_output=risk,
        guideline_output={
            **guide,
            "guideline_sources": ", ".join(guide.get("guideline_refs", [])),
        },
        escalated=state["escalation_triggered"],
        escalation_reason=state.get("escalation_reason"),
        executive_output=exec_out,
        cloud_connected=state.get("cloud_connected", False),
        mode=state.get("mode", "offline"),
    )


@router.post("/triage/vision", summary="Analyze clinical imagery using cloud PaliGemma 3B")
async def triage_vision(payload: VisionRequest, current_user: dict = Depends(get_current_user)):
    """Proxies the vision request to the Cloud Executive service."""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"{settings.cloud_api_url}/vision_analysis",
                json=payload.model_dump(),
                headers={"X-API-Key": settings.cloud_api_key}
            )
            resp.raise_for_status()
            return resp.json()
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Cloud Vision service unavailable: {exc}")


# ── Case Retrieval ────────────────────────────────────────────────────────────

@router.get("/case/{visit_id}", summary="Get stored case result")
async def get_case(
    visit_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    row = await crud.get_case(db, visit_id=visit_id)
    if not row:
        raise HTTPException(status_code=404, detail=f"Case {visit_id} not found.")
    visit, patient, risk, guide, esc = (
        row["visit"], row["patient"], row["risk"], row["guide"], row["esc"]
    )
    return {
        "visit_id": visit.id,
        "patient_name": patient.name,
        "submitted_at": visit.visit_date,
        "risk_output": {
            "risk_level": risk.risk_level, "risk_score": risk.risk_score,
            "confidence": risk.confidence, "reasoning": risk.reasoning,
            "immediate_actions": risk.immediate_actions or [],
        } if risk else None,
        "guideline_output": {
            "stabilization_plan": guide.stabilization_plan,
            "monitoring_instructions": guide.monitoring_instructions,
            "medication_guidance": guide.medication_guidance,
            "guideline_sources": guide.guideline_sources,
        } if guide else None,
        "escalated": esc.escalated if esc else False,
        "escalation_reason": esc.escalation_reason if esc else None,
        "executive_output": esc.cloud_response if (esc and esc.escalated) else None,
    }


@router.get("/history", response_model=list[HistoryItem], summary="List case history")
async def list_history(
    skip: int = 0, limit: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await crud.list_history(db, skip=skip, limit=limit)


@router.get("/patient/{patient_id}/bp_history", summary="Get BP trend data for chart")
async def bp_history(
    patient_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await crud.get_bp_history(db, patient_id=patient_id)