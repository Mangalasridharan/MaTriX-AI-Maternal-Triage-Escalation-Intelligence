def run_guideline_agent(state):
    # TODO: RAG retrieval + 1.4B call
    state["guideline_output"] = {
        "plan": "Monitor BP and prepare magnesium sulfate."
    }
    return state