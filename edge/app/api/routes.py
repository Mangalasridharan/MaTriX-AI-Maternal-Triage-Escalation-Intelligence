from fastapi import APIRouter
from app.workflow.graph import run_workflow

router = APIRouter()

@router.post("/submit_case")
async def submit_case(payload: dict):
    result = run_workflow(payload)
    return result