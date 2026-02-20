"""FastAPI entrypoint for the edge clinic system."""
from fastapi import FastAPI

app = FastAPI(title="Edge Clinic System")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
