import asyncio
from sqlalchemy.ext.asyncio import create_async_engine

async def test():
    try:
        print("Testing connection...")
        engine = create_async_engine('postgresql+asyncpg://matrix:matrix@localhost:5432/matrixdb')
        async with engine.connect() as conn:
            print("DB Connection OK!")
    except Exception as e:
        print(f"DB Connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(test())
