"""Extended MaternalState TypedDict for LangGraph workflow."""
from typing import TypedDict, Optional


class MaternalState(TypedDict):
    """Full state object passed through the LangGraph workflow."""
    # Input
    patient_data: dict

    # Persisted visit ID (set after DB write in FastAPI)
    visit_id: Optional[int]

    # Agent outputs
    risk_output: Optional[dict]
    guideline_output: Optional[dict]

    # Router decision
    escalation_triggered: bool
    escalation_reason: str

    # Cloud executive output (only if escalated)
    executive_output: Optional[dict]

    # Error tracking
    error: Optional[str]