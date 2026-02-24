"""SQLAlchemy ORM models — exact schema from spec using UUID PKs."""
import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Boolean,
    DateTime, ForeignKey, Text, JSON, Index
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.database import Base


def new_uuid():
    return str(uuid.uuid4())


class SystemConfig(Base):
    """Global system configuration flags shared across edge and cloud nodes."""
    __tablename__ = "system_config"

    key = Column(String(50), primary_key=True)
    value = Column(JSON, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Patient(Base):
    __tablename__ = "patients"

    id = Column(UUID(as_uuid=False), primary_key=True, default=new_uuid)
    name = Column(Text, nullable=False)
    age = Column(Integer, nullable=False)
    gestational_age_weeks = Column(Integer, nullable=True)
    clinic_id = Column(String, nullable=True, index=True) # Multitenancy tie to user/clinic
    created_at = Column(DateTime, default=datetime.utcnow)

    visits = relationship("Visit", back_populates="patient")


class Visit(Base):
    __tablename__ = "visits"

    id = Column(UUID(as_uuid=False), primary_key=True, default=new_uuid)
    patient_id = Column(UUID(as_uuid=False), ForeignKey("patients.id"), nullable=False)
    clinic_id = Column(String, nullable=True, index=True) # Multitenancy tie
    visit_date = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text, nullable=True)

    patient = relationship("Patient", back_populates="visits")
    vitals = relationship("Vital", back_populates="visit")
    symptoms = relationship("Symptom", back_populates="visit")
    risk_output = relationship("RiskOutput", back_populates="visit", uselist=False)
    guideline_output = relationship("GuidelineOutput", back_populates="visit", uselist=False)
    escalation_log = relationship("EscalationLog", back_populates="visit", uselist=False)


class Vital(Base):
    """Time-series vitals — one row per measurement."""
    __tablename__ = "vitals"

    id = Column(UUID(as_uuid=False), primary_key=True, default=new_uuid)
    visit_id = Column(UUID(as_uuid=False), ForeignKey("visits.id"), nullable=False)
    systolic = Column(Integer, nullable=False)
    diastolic = Column(Integer, nullable=False)
    proteinuria = Column(String(20), nullable=True)   # none | trace | 1+ | 2+ | 3+
    heart_rate = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    visit = relationship("Visit", back_populates="vitals")


# Index for time-series BP queries
Index("idx_vitals_visit_time", Vital.visit_id, Vital.created_at)


class Symptom(Base):
    """One row per symptom — normalised."""
    __tablename__ = "symptoms"

    id = Column(UUID(as_uuid=False), primary_key=True, default=new_uuid)
    visit_id = Column(UUID(as_uuid=False), ForeignKey("visits.id"), nullable=False)
    symptom = Column(Text, nullable=False)   # e.g. "headache", "visual_disturbance"

    visit = relationship("Visit", back_populates="symptoms")


class RiskOutput(Base):
    __tablename__ = "risk_outputs"

    id = Column(UUID(as_uuid=False), primary_key=True, default=new_uuid)
    visit_id = Column(UUID(as_uuid=False), ForeignKey("visits.id"), unique=True, nullable=False)
    risk_level = Column(Text, nullable=False)       # low | moderate | high | severe
    risk_score = Column(Float, nullable=False)       # 0.0–100.0
    reasoning = Column(Text, nullable=True)
    confidence = Column(Float, nullable=False)
    immediate_actions = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    visit = relationship("Visit", back_populates="risk_output")


class GuidelineOutput(Base):
    __tablename__ = "guideline_outputs"

    id = Column(UUID(as_uuid=False), primary_key=True, default=new_uuid)
    visit_id = Column(UUID(as_uuid=False), ForeignKey("visits.id"), unique=True, nullable=False)
    stabilization_plan = Column(Text, nullable=True)
    guideline_sources = Column(Text, nullable=True)
    monitoring_instructions = Column(Text, nullable=True)
    medication_guidance = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    visit = relationship("Visit", back_populates="guideline_output")


class EscalationLog(Base):
    __tablename__ = "escalation_logs"

    id = Column(UUID(as_uuid=False), primary_key=True, default=new_uuid)
    visit_id = Column(UUID(as_uuid=False), ForeignKey("visits.id"), unique=True, nullable=False)
    escalated = Column(Boolean, default=False)
    escalation_reason = Column(Text, nullable=True)
    cloud_response = Column(JSON, nullable=True)    # full executive JSON stored here
    created_at = Column(DateTime, default=datetime.utcnow)

    visit = relationship("Visit", back_populates="escalation_log")
