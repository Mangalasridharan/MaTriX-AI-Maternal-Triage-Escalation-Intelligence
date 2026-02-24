import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv(dotenv_path='edge/.env')

async def test_connection():
    # Fetch variables
    DATABASE_URL = os.getenv("DATABASE_URL")
    
    if not DATABASE_URL:
        print("Error: DATABASE_URL not found in edge/.env")
        return

    print(f"DEBUG: Using DATABASE_URL={repr(DATABASE_URL)}")
    print(f"Testing async connection to Supabase...")
    
    try:
        # Supabase requires SSL. asyncpg uses ssl=require in the query params.
        engine = create_async_engine(DATABASE_URL)
        async with engine.connect() as conn:
            print("Connection successful! DB is reachable.")
            # Simple query to confirm
            result = await conn.execute(__import__("sqlalchemy").text("SELECT 1"))
            print(f"Query test (SELECT 1): {result.scalar()}")
    except Exception as e:
        print(f"Failed to connect: {e}")
    finally:
        try:
            await engine.dispose()
        except:
            pass

if __name__ == "__main__":
    asyncio.run(test_connection())
