"""Users table for MaTriX-AI edge.

Run: python scripts/seed_demo.py  --> creates demo/demo1234 user
"""
import uuid
from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id            = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username      = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    clinic_name   = Column(String, default="Default Clinic")
    role          = Column(String, default="nurse")
    created_at    = Column(DateTime(timezone=True), server_default=func.now())
