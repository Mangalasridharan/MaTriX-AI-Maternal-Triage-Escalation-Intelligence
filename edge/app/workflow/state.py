from typing import TypedDict, Optional

class MaternalState(TypedDict):
    patient_data: dict
    risk_output: Optional[dict]
    guideline_output: Optional[dict]
    escalated: bool
    executive_output: Optional[dict]