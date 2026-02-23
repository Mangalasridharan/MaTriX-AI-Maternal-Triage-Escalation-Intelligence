import asyncio
from app.db.database import create_all_tables

async def main():
    print("Initializing Database Tables...")
    try:
        await create_all_tables()
        print("✅ Tables created successfully.")
    except Exception as e:
        print(f"❌ Error creating tables: {e}")

if __name__ == "__main__":
    asyncio.run(main())
