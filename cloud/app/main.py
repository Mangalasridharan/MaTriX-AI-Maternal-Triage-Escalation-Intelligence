from fastapi import FastAPI
from app.executive_agent import run_executive_agent

app = FastAPI(title="Cloud Executive Service")

@app.post("/executive_escalation")
async def executive(payload: dict):
    result = run_executive_agent(payload)
    return result