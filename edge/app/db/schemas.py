"""Updated Pydantic schemas aligned with spec (UUID keys, vitals/symptoms split)."""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ── Request ──────────────────────────────────────────────────────────────────

class VitalReading(BaseModel):
    systolic: int = Field(..., ge=60, le=260)
    diastolic: int = Field(..., ge=40, le=180)
    proteinuria: Optional[str] = Field(None, description="none | trace | 1+ | 2+ | 3+")
    heart_rate: Optional[int] = Field(None, ge=30, le=250)


class CaseSubmission(BaseModel):
    """Spec-aligned case submission payload."""
    # Patient
    name: str
    age: int = Field(..., ge=10, le=60)
    gestational_age_weeks: int = Field(..., ge=4, le=45)
    notes: Optional[str] = None

    # Vitals (primary reading)
    vitals: VitalReading

    # Symptoms as list of strings (spec: symptoms table)
    symptoms: List[str] = Field(default_factory=list,
        description="E.g. ['headache', 'visual_disturbance', 'epigastric_pain']")

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Priya Sharma",
                "age": 29,
                "gestational_age_weeks": 34,
                "vitals": {"systolic": 165, "diastolic": 110, "proteinuria": "2+", "heart_rate": 92},
                "symptoms": ["headache", "visual_disturbance"],
                "notes": "First pregnancy, no prior HTN."
            }
        }


# ── Sub-schemas ───────────────────────────────────────────────────────────────

class RiskResult(BaseModel):
    risk_level: str
    risk_score: float
    confidence: float
    reasoning: str
    immediate_actions: List[str]


class GuidelineResult(BaseModel):
    stabilization_plan: str
    monitoring_instructions: str
    medication_guidance: str
    guideline_sources: str


class ExecutivePlan(BaseModel):
    executive_summary: str
    care_plan: str
    referral_urgency: str
    referral_priority: str
    justification: str
    time_to_transfer_hours: Optional[float] = None
    receiving_facility_requirements: Optional[str] = None
    in_transit_care: Optional[str] = None


# ── Response ──────────────────────────────────────────────────────────────────

class CaseResult(BaseModel):
    visit_id: str
    patient_name: str
    submitted_at: datetime
    risk_output: RiskResult
    guideline_output: GuidelineResult
    escalated: bool
    escalation_reason: Optional[str] = None
    executive_output: Optional[ExecutivePlan] = None
    cloud_connected: bool = False
    mode: str = "offline"


class HistoryItem(BaseModel):
    visit_id: str
    patient_name: str
    submitted_at: datetime
    risk_level: str
    risk_score: float
    escalated: bool


# ── Auth ──────────────────────────────────────────────────────────────────────

class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class UserBase(BaseModel):
    username: str
    clinic_name: Optional[str] = "Default Clinic"


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: str  # UUID as string
    role: str
    created_at: datetime

    class Config:
        from_attributes = True


# ── Cloud ─────────────────────────────────────────────────────────────────────

class EscalationRequest(BaseModel):
    risk_output: dict
    guideline_output: dict
    case_summary: dict
