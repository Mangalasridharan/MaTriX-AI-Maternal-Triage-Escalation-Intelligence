"""FastAPI entrypoint for the MaTriX-AI edge clinic system."""
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.api.routes import router
from app.db.database import create_all_tables


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: create DB tables. Shutdown: (future cleanup)."""
    await create_all_tables()
    yield


app = FastAPI(
    title="MaTriX-AI — Maternal Triage Escalation Intelligence",
    description=(
        "Hybrid edge-cloud multi-agent AI system for maternal risk triage. "
        "Powered by MedGemma 4B (local) + 27B Executive Agent (cloud HF Inference)."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow the frontend (served locally or from same origin)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes
app.include_router(router)


@app.get("/health", tags=["Health"])
async def health_check():
    """Simple health probe for Docker / load-balancers."""
    return {"status": "healthy", "system": "MaTriX-AI Edge"}


# Serve the frontend SPA from /frontend folder
frontend_path = os.path.join(os.path.dirname(__file__), "..", "..", "frontend")
if os.path.isdir(frontend_path):
    app.mount("/app", StaticFiles(directory=frontend_path, html=True), name="frontend")

    @app.get("/", include_in_schema=False)
    async def serve_frontend():
        return FileResponse(os.path.join(frontend_path, "index.html"))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
