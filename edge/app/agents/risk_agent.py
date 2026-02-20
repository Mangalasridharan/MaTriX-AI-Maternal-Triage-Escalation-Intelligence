def run_risk_agent(state):
    # TODO: call 1.4B local model
    state["risk_output"] = {
        "risk_level": "high",
        "risk_score": 82,
        "confidence": 0.78
    }
    return state