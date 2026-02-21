"""
Router Node — MaTriX-AI Edge System
Pure rule-based escalation decision — no LLM involved.
Escalates if any of the defined clinical triggers are met.
"""


def run_router(state: dict) -> dict:
    """
    Evaluate risk_output + patient_data and decide whether to escalate to cloud.
    Sets state['escalation_triggered'] and state['escalation_reason'].
    """
    risk = state.get("risk_output", {})
    p = state.get("patient_data", {})

    risk_level = risk.get("risk_level", "low")
    confidence = risk.get("confidence", 0.0)
    risk_score = risk.get("risk_score", 0)
    bp_sys = p.get("bp_systolic", 0)
    headache = p.get("headache", False)
    visual = p.get("visual_disturbance", False)

    escalation_reason = None

    # ── Escalation Rules (ANY trigger = escalate) ──────────────────────────
    if risk_level == "severe":
        escalation_reason = "Severe maternal risk classification."
    elif risk_level == "high" and confidence >= 0.60:
        escalation_reason = f"High risk (score {risk_score}) with confidence {confidence:.2f}."
    elif bp_sys >= 160:
        escalation_reason = f"Systolic BP critically elevated at {bp_sys} mmHg."
    elif headache and visual:
        escalation_reason = "Combined neurological symptoms (headache + visual disturbance)."
    elif risk_score >= 70:
        escalation_reason = f"Risk score {risk_score} exceeds escalation threshold."

    if escalation_reason:
        state["escalation_triggered"] = True
        state["escalation_reason"] = escalation_reason
    else:
        state["escalation_triggered"] = False
        state["escalation_reason"] = ""

    return state