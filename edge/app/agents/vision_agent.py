"""
Vision Agent — MaTriX-AI Swarm Node
Proxies to the cloud-hosted PaliGemma-3B model to analyze clinical imagery.
"""
import httpx
from app.config import settings

async def run_vision_agent(state: dict) -> dict:
    """
    Vision Node — If an image is present in the patient data, 
    analyze it using the cloud PaliGemma service.
    """
    patient_data = state.get("patient_data", {})
    image_data = patient_data.get("image_data") # base64 encoded string

    if not image_data:
        state["vision_output"] = {"status": "skipped", "findings": "No clinical imagery provided."}
        return state

    try:
        payload = {
            "image_data": image_data,
            "prompt": "Analyze this clinical image of a pregnant patient for visible symptoms like edema (swelling), jaundice, or rashes. Identify any clinical anomalies."
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"{settings.cloud_api_url}/vision_analysis",
                json=payload,
                headers={"X-API-Key": settings.cloud_api_key}
            )
            resp.raise_for_status()
            vision_result = resp.json()
            
            state["vision_output"] = {
                "status": "success",
                "findings": vision_result.get("analysis", "No findings returned."),
                "model": "PaliGemma-3B"
            }
    except Exception as exc:
        state["vision_output"] = {
            "status": "failed",
            "findings": f"Vision service error: {exc}",
            "error": str(exc)
        }
        
    return state
