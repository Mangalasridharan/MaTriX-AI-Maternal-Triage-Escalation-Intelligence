"""
LangGraph workflow for MaTriX-AI — full StateGraph with conditional escalation.

Flow:
  risk_node → guideline_node → router_node → [escalation_node | END]
"""
import httpx
from langgraph.graph import StateGraph, END
from app.workflow.state import MaternalState
from app.agents.vision_agent import run_vision_agent
from app.agents.risk_agent import run_risk_agent
from app.agents.guideline_agent import run_guideline_agent
from app.agents.critique_agent import run_critique_agent
from app.agents.router import run_router
from app.config import settings


# ── Escalation Node ──────────────────────────────────────────────────────────

async def escalation_node(state: MaternalState) -> MaternalState:
    """
    Sends the full case summary to the cloud ExecutiveAgent.
    Called only when router decides to escalate.
    Respects the currently configured topology mode.
    """
    # Import here to avoid circular imports
    from app.api.topology import get_topology_mode

    current_mode = get_topology_mode()

    # OFFLINE mode: block all cloud calls entirely
    if current_mode == "OFFLINE":
        state["cloud_connected"] = False
        state["mode"] = "offline-forced"
        state["executive_output"] = {
            "executive_summary": (
                "System is in Strict Offline mode. "
                "Cloud 27B escalation is disabled by administrator. "
                "Please refer to the edge 4B guideline plan and escalate via standard hospital protocol."
            ),
            "care_plan": state.get("guideline_output", {}).get("stabilization_plan", "Unknown"),
            "referral_urgency": "urgent",
            "referral_priority": "urgent",
            "justification": "Topology locked to OFFLINE — cloud routing blocked.",
            "time_to_transfer_hours": 1.0,
        }
        return state

    payload = {
        "patient_data": state["patient_data"],
        "vision_output": state.get("vision_output"),
        "risk_output": state["risk_output"],
        "guideline_output": state["guideline_output"],
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"{settings.cloud_api_url}/executive_escalation",
                json=payload,
                headers={"X-API-Key": settings.cloud_api_key},
            )
            resp.raise_for_status()
            state["executive_output"] = resp.json()
            state["cloud_connected"] = True
            state["mode"] = "online"
    except Exception as exc:
        # Cloud service unavailable — set fallback executive output
        state["cloud_connected"] = False
        state["mode"] = "offline"
        state["executive_output"] = {
            "executive_summary": (
                "Cloud executive service unavailable. "
                "Please refer to the guideline plan and escalate via standard protocol."
            ),
            "care_plan": state.get("guideline_output", {}).get("stabilization_plan", ""),
            "referral_urgency": "urgent",
            "referral_priority": "urgent",
            "justification": f"Cloud unavailable: {exc}",
            "time_to_transfer_hours": 1.0,
        }
        state["error"] = f"Cloud escalation failed: {exc}"

    return state


# ── Conditional edge function ────────────────────────────────────────────────

def should_escalate(state: MaternalState) -> str:
    """Return 'escalate' or 'end' based on router decision AND topology mode."""
    from app.api.topology import get_topology_mode
    mode = get_topology_mode()
    
    # If topology is CLOUD, we bypass the risk threshold and always escalate to 27B
    if mode == "CLOUD":
        return "escalate"
        
    return "escalate" if state.get("escalation_triggered") else "end"


# ── Build the graph ──────────────────────────────────────────────────────────

def build_graph():
    workflow = StateGraph(MaternalState)

    workflow.add_node("vision_node", run_vision_agent)
    workflow.add_node("risk_node", run_risk_agent)
    workflow.add_node("guideline_node", run_guideline_agent)
    workflow.add_node("critique_node", run_critique_agent)
    workflow.add_node("router_node", run_router)
    workflow.add_node("escalation_node", escalation_node)

    workflow.set_entry_point("vision_node")
    workflow.add_edge("vision_node", "risk_node")
    workflow.add_edge("risk_node", "guideline_node")
    workflow.add_edge("guideline_node", "critique_node")
    workflow.add_edge("critique_node", "router_node")

    workflow.add_conditional_edges(
        "router_node",
        should_escalate,
        {
            "escalate": "escalation_node",
            "end": END,
        },
    )
    workflow.add_edge("escalation_node", END)

    return workflow.compile()


# Module-level compiled graph (import this)
maternal_graph = build_graph()


# ── Entrypoint ───────────────────────────────────────────────────────────────

async def run_workflow(patient_data: dict) -> dict:
    """Run the full MaTriX-AI workflow and return final state."""
    initial_state: MaternalState = {
        "patient_data": patient_data,
        "visit_id": None,
        "vision_output": None,
        "risk_output": None,
        "guideline_output": None,
        "critique_output": None,
        "escalation_triggered": False,
        "escalation_reason": "",
        "executive_output": None,
        "cloud_connected": False,
        "mode": "offline",
        "error": None,
    }
    return await maternal_graph.ainvoke(initial_state)