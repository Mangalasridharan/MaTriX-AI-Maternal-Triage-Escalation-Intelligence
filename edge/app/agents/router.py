def run_router(state):
    risk = state["risk_output"]["risk_level"]
    
    if risk in ["high", "severe"]:
        state["escalated"] = True
    else:
        state["escalated"] = False
    
    return state