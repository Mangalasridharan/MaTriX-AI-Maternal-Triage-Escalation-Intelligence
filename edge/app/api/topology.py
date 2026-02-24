"""
Topology Configuration API — MaTriX-AI
Allows hospital admins to dynamically switch between OFFLINE, HYBRID, and FULL_CLOUD modes.
Persists topology state in-memory (reloads from ENV on restart) and checks live service health.
"""
import httpx
import asyncio
import time
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Literal, Optional
from app.config import settings
from app.models.local_llm import local_llm
from app.utils.auth import get_current_user

router = APIRouter(prefix="/api/config", tags=["System Configuration"])

# ── In-memory topology state (singleton for the server process) ──────────────
_topology_state: dict = {
    "mode": "HYBRID",  # OFFLINE | HYBRID | CLOUD
    "fallback_enabled": True,
    "vision_enabled": True,
    "executive_agent_enabled": True,
    "data_collection_enabled": False,
    "updated_at": None,
    "updated_by": None,
}


class TopologyConfig(BaseModel):
    mode: Literal["OFFLINE", "HYBRID", "CLOUD"]
    fallback_enabled: bool = True
    vision_enabled: bool = True
    executive_agent_enabled: bool = True
    data_collection_enabled: bool = False

class TopologyResponse(BaseModel):
    mode: str
    fallback_enabled: bool
    vision_enabled: bool
    executive_agent_enabled: bool
    data_collection_enabled: bool
    updated_at: Optional[float]
    updated_by: Optional[str]
    model_status: dict


async def _check_service(url: str, timeout: float = 3.0) -> dict:
    """Ping a service endpoint and return status dict."""
    start = time.time()
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.get(url)
            latency_ms = int((time.time() - start) * 1000)
            return {"online": resp.status_code < 500, "latency_ms": latency_ms, "status_code": resp.status_code}
    except Exception as exc:
        return {"online": False, "latency_ms": -1, "error": str(exc)[:100]}


async def _get_all_service_status() -> dict:
    """Concurrent health check for all 3 services."""
    edge_task = local_llm.health_check()
    cloud_health_task = _check_service(f"{settings.cloud_api_url}/health")
    vision_task = _check_service(f"{settings.cloud_api_url}/health")  # Same cloud service hosts vision

    edge_online, cloud, vision = await asyncio.gather(edge_task, cloud_health_task, vision_task)

    return {
        "edge_4b": {
            "online": edge_online,
            "model": settings.local_model,
            "host": settings.ollama_base_url,
        },
        "cloud_27b": {
            **cloud,
            "model": "MedGemma-27B",
            "host": settings.cloud_api_url,
        },
        "vision_3b": {
            **vision,
            "model": "PaliGemma-3B",
            "host": f"{settings.cloud_api_url}/vision_analysis",
        },
    }


# ── GET /api/config/topology ─────────────────────────────────────────────────

from app.db.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.models import SystemConfig

@router.get("/topology", summary="Get current topology mode and live service health")
async def get_topology(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> dict:
    model_status = await _get_all_service_status()
    
    # Load data_collection state from DB if available
    stmt = select(SystemConfig).where(SystemConfig.key == "data_collection_enabled")
    res = await db.execute(stmt)
    config_row = res.scalar()
    if config_row:
        _topology_state["data_collection_enabled"] = config_row.value.get("enabled", False)
        
    return {**_topology_state, "model_status": model_status}


# ── POST /api/config/topology ────────────────────────────────────────────────

@router.post("/topology", summary="Switch topology mode (OFFLINE / HYBRID / CLOUD)")
async def set_topology(
    config: TopologyConfig,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> dict:
    """
    Dynamically switches the model routing architecture.
    - OFFLINE: Blocks all outbound cloud calls, uses only 4B + rule-based fallbacks.
    - HYBRID: Allows cloud escalation ONLY when risk_score >= threshold (default).
    - CLOUD: Routes all inference through cloud SageMaker endpoints.
    """
    _topology_state["mode"] = config.mode
    _topology_state["fallback_enabled"] = config.fallback_enabled
    _topology_state["vision_enabled"] = config.vision_enabled
    _topology_state["executive_agent_enabled"] = config.executive_agent_enabled
    _topology_state["data_collection_enabled"] = config.data_collection_enabled
    _topology_state["updated_at"] = time.time()
    _topology_state["updated_by"] = current_user.get("sub", "unknown")

    # Persist data_collection setting to database for GitHub Actions
    from sqlalchemy.dialects.postgresql import insert
    stmt = insert(SystemConfig).values(
        key="data_collection_enabled", 
        value={"enabled": config.data_collection_enabled}
    ).on_conflict_do_update(
        index_elements=['key'],
        set_=dict(value={"enabled": config.data_collection_enabled})
    )
    await db.execute(stmt)
    await db.commit()

    model_status = await _get_all_service_status()
    return {**_topology_state, "model_status": model_status, "message": f"Topology switched to {config.mode}"}


# ── GET /api/health ──────────────────────────────────────────────────────────

@router.get("/health", tags=["System Configuration"], summary="Edge service health probe (no auth)")
async def health():
    return {"status": "ok", "service": "matrix-edge", "topology": _topology_state["mode"]}


# ── Export topology_state getter for use in graph.py ─────────────────────────

def get_topology_mode() -> str:
    """Called from graph.py to enforce current topology restrictions."""
    return _topology_state["mode"]


def is_cloud_allowed() -> bool:
    return _topology_state["mode"] in ("HYBRID", "CLOUD")


def is_vision_allowed() -> bool:
    return _topology_state["vision_enabled"] and _topology_state["mode"] in ("HYBRID", "CLOUD")


def is_fallback_enabled() -> bool:
    return _topology_state["fallback_enabled"]
