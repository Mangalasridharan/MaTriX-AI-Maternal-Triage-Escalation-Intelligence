import asyncio
from app.db.database import engine
from sqlalchemy import text

async def main():
    async with engine.begin() as conn:
        try:
            await conn.execute(text("ALTER TABLE patients ADD COLUMN clinic_id VARCHAR;"))
            print("Added clinic_id to patients.")
        except Exception as e:
            print(f"Patients alter failed (could already exist): {e}")
            
        try:
            await conn.execute(text("ALTER TABLE visits ADD COLUMN clinic_id VARCHAR;"))
            print("Added clinic_id to visits.")
        except Exception as e:
            print(f"Visits alter failed (could already exist): {e}")

if __name__ == "__main__":
    asyncio.run(main())
