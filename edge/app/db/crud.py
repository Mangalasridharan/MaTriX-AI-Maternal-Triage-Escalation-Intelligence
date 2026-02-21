"""Updated CRUD operations for UUID-based schema with vitals/symptoms tables."""
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.db.models import Patient, Visit, Vital, Symptom, RiskOutput, GuidelineOutput, EscalationLog
import uuid


def _uid():
    return str(uuid.uuid4())

# ── Patient ───────────────────────────────────────────────────────────────────

async def get_or_create_patient(db: AsyncSession, name: str, age: int,
                                gestational_age_weeks: int) -> Patient:
    result = await db.execute(
        select(Patient).where(Patient.name == name, Patient.age == age)
    )
    patient = result.scalars().first()
    if not patient:
        patient = Patient(id=_uid(), name=name, age=age,
                          gestational_age_weeks=gestational_age_weeks)
        db.add(patient)
        await db.flush()
    return patient


# ── Visit + Vitals + Symptoms ─────────────────────────────────────────────────

async def create_visit(db: AsyncSession, patient_id: str,
                       vitals_data: dict, symptoms_list: list[str],
                       notes: str | None) -> Visit:
    visit = Visit(id=_uid(), patient_id=patient_id,
                  visit_date=datetime.utcnow(), notes=notes)
    db.add(visit)
    await db.flush()

    # Insert vitals row
    vital = Vital(
        id=_uid(), visit_id=visit.id,
        systolic=vitals_data["systolic"],
        diastolic=vitals_data["diastolic"],
        proteinuria=vitals_data.get("proteinuria"),
        heart_rate=vitals_data.get("heart_rate"),
    )
    db.add(vital)

    # Insert symptom rows
    for sym in symptoms_list:
        db.add(Symptom(id=_uid(), visit_id=visit.id, symptom=sym))

    await db.flush()
    return visit


# ── Risk Output ───────────────────────────────────────────────────────────────

async def save_risk_output(db: AsyncSession, visit_id: str, risk: dict) -> RiskOutput:
    obj = RiskOutput(
        id=_uid(), visit_id=visit_id,
        risk_level=risk["risk_level"],
        risk_score=float(risk["risk_score"]),
        confidence=float(risk["confidence"]),
        reasoning=risk.get("reasoning", ""),
        immediate_actions=risk.get("immediate_actions", []),
    )
    db.add(obj)
    await db.flush()
    return obj


# ── Guideline Output ──────────────────────────────────────────────────────────

async def save_guideline_output(db: AsyncSession, visit_id: str, guide: dict) -> GuidelineOutput:
    obj = GuidelineOutput(
        id=_uid(), visit_id=visit_id,
        stabilization_plan=guide.get("stabilization_plan", ""),
        guideline_sources=", ".join(guide.get("guideline_refs", [])),
        monitoring_instructions=guide.get("monitoring_instructions", ""),
        medication_guidance=guide.get("medication_guidance", ""),
    )
    db.add(obj)
    await db.flush()
    return obj


# ── Escalation Log ────────────────────────────────────────────────────────────

async def save_escalation_log(db: AsyncSession, visit_id: str, state: dict) -> EscalationLog:
    obj = EscalationLog(
        id=_uid(), visit_id=visit_id,
        escalated=state.get("escalation_triggered", False),
        escalation_reason=state.get("escalation_reason", ""),
        cloud_response=state.get("executive_output"),
    )
    db.add(obj)
    await db.flush()
    return obj


# ── History ───────────────────────────────────────────────────────────────────

async def list_history(db: AsyncSession, skip: int = 0, limit: int = 50) -> list:
    result = await db.execute(
        select(Visit, Patient, RiskOutput, EscalationLog)
        .join(Patient, Visit.patient_id == Patient.id)
        .outerjoin(RiskOutput, RiskOutput.visit_id == Visit.id)
        .outerjoin(EscalationLog, EscalationLog.visit_id == Visit.id)
        .order_by(desc(Visit.visit_date))
        .offset(skip).limit(limit)
    )
    items = []
    for visit, patient, risk, esc in result.all():
        items.append({
            "visit_id": visit.id,
            "patient_name": patient.name,
            "submitted_at": visit.visit_date,
            "risk_level": risk.risk_level if risk else "unknown",
            "risk_score": risk.risk_score if risk else 0.0,
            "escalated": esc.escalated if esc else False,
        })
    return items


async def get_case(db: AsyncSession, visit_id: str) -> dict | None:
    result = await db.execute(
        select(Visit, Patient, RiskOutput, GuidelineOutput, EscalationLog)
        .join(Patient, Visit.patient_id == Patient.id)
        .outerjoin(RiskOutput, RiskOutput.visit_id == Visit.id)
        .outerjoin(GuidelineOutput, GuidelineOutput.visit_id == Visit.id)
        .outerjoin(EscalationLog, EscalationLog.visit_id == Visit.id)
        .where(Visit.id == visit_id)
    )
    row = result.first()
    if not row:
        return None
    visit, patient, risk, guide, esc = row
    return {"visit": visit, "patient": patient, "risk": risk, "guide": guide, "esc": esc}


async def get_bp_history(db: AsyncSession, patient_id: str, limit: int = 10) -> list:
    """Fetch time-series BP readings for a patient's chart."""
    result = await db.execute(
        select(Vital, Visit)
        .join(Visit, Vital.visit_id == Visit.id)
        .where(Visit.patient_id == patient_id)
        .order_by(desc(Vital.created_at))
        .limit(limit)
    )
    return [
        {"systolic": v.systolic, "diastolic": v.diastolic,
         "timestamp": v.created_at.isoformat()}
        for v, _ in result.all()
    ]
