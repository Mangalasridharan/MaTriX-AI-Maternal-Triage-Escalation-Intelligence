#!/usr/bin/env python3
"""
Seed the edge database with a demo user for judge/demo access.

Usage:
    cd edge
    python scripts/seed_demo.py
"""
import asyncio
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from app.config import settings
from app.utils.auth import hash_password
from app.db.user_models import User
from app.db.database import Base

DEMO_USERNAME = "demo"
DEMO_PASSWORD = "demo1234"
DEMO_CLINIC   = "Demo Clinic — MaTriX-AI Judge Access"


async def seed():
    engine = create_async_engine(settings.database_url, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    Session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with Session() as db:
        # Check if demo user already exists
        from sqlalchemy import select
        result = await db.execute(select(User).where(User.username == DEMO_USERNAME))
        existing = result.scalar_one_or_none()
        if existing:
            print(f"✅ Demo user '{DEMO_USERNAME}' already exists. Updating password hash to new bcrypt.")
            existing.password_hash = hash_password(DEMO_PASSWORD)
            await db.commit()
            return

        user = User(
            username=DEMO_USERNAME,
            password_hash=hash_password(DEMO_PASSWORD),
            clinic_name=DEMO_CLINIC,
            role="demo",
        )
        db.add(user)
        await db.commit()
        print(f"✅ Demo user created: username='{DEMO_USERNAME}' password='{DEMO_PASSWORD}'")
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed())
