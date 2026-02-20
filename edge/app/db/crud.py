"""CRUD operations for database models."""
from sqlalchemy.orm import Session

async def create_patient(db: Session, patient_data: dict):
    """Create a new patient record."""
    pass

async def get_patient(db: Session, patient_id: int):
    """Get patient by ID."""
    pass

async def list_patients(db: Session, skip: int = 0, limit: int = 100):
    """List all patients with pagination."""
    pass
