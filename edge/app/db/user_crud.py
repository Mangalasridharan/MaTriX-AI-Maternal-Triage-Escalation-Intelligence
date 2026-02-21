"""CRUD operations for User model."""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.user_models import User
from app.utils.auth import hash_password


async def get_user_by_username(db: AsyncSession, username: str):
    result = await db.execute(select(User).where(User.username == username))
    return result.scalar_one_or_none()


async def create_user(db: AsyncSession, username: str, password: str, clinic_name: str = "Default Clinic") -> User:
    user = User(
        username=username,
        password_hash=hash_password(password),
        clinic_name=clinic_name,
        role="nurse",
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user
