"""Pydantic schemas for request/response validation."""
from pydantic import BaseModel
from datetime import datetime

class PatientBase(BaseModel):
    """Base patient schema."""
    name: str
    age: int
    medical_history: str

class PatientCreate(PatientBase):
    """Schema for creating patient."""
    pass

class Patient(PatientBase):
    """Patient schema with ID."""
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
