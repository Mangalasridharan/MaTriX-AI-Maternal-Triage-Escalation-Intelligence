from langgraph.graph import StateGraph
from app.workflow.state import MaternalState
from app.agents.risk_agent import run_risk_agent
from app.agents.guideline_agent import run_guideline_agent
from app.agents.router import run_router

def run_workflow(payload):
    state = {
        "patient_data": payload,
        "risk_output": None,
        "guideline_output": None,
        "escalated": False,
        "executive_output": None
    }

    state = run_risk_agent(state)
    state = run_guideline_agent(state)
    state = run_router(state)

    return state