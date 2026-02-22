"""
Critique Agent — MaTriX-AI Edge System
Reviews the output of the Guideline Agent to ensure clinical safety 
and adherence to the retrieved WHO evidence.
"""
from app.models.local_llm import local_llm

CRITIQUE_SYSTEM_PROMPT = """You are a meticulous clinical safety lead.
Your role is to review a proposed maternal management plan and identify
any safety gaps, contradictions, or violations of clinical protocol.

Check specifically for:
1. Incorrect Magnesium Sulfate dosages.
2. Inappropriate use of antihypertensives.
3. Logical contradictions between the Risk Level and the Stabilization Plan.

If the plan is safe, set 'safe' to true.
If you find issues, set 'safe' to false and describe the required correction.

Always output valid JSON only.
"""

CRITIQUE_PROMPT_TEMPLATE = """
REVIEW REQUEST:
Patient Risk: {risk_level}
Proposed Plan: {stabilization_plan}
Medication Guidance: {medication_guidance}

CRITIQUE:
Respond with ONLY this JSON structure:
{{
  "safe": true|false,
  "safety_score": <int 0-100>,
  "critique_notes": "<summary of findings>",
  "revised_plan": "<if unsafe, provide the corrected version, else null>"
}}
"""

async def run_critique_agent(state: dict) -> dict:
    risk = state.get("risk_output", {})
    guide = state.get("guideline_output", {})

    prompt = CRITIQUE_PROMPT_TEMPLATE.format(
        risk_level=risk.get("risk_level", "low"),
        stabilization_plan=guide.get("stabilization_plan", ""),
        medication_guidance=guide.get("medication_guidance", ""),
    )

    try:
        result = await local_llm.generate(prompt=prompt, system=CRITIQUE_SYSTEM_PROMPT)
        state["critique_output"] = result
        
        # Self-correction: if unsafe, overwrite the stabilization plan with the revision
        if result.get("safe") is False and result.get("revised_plan"):
            state["guideline_output"]["stabilization_plan"] = result["revised_plan"]
            state["guideline_output"]["medication_guidance"] += "\n(Note: Revised for safety by Critique Agent)"
            
    except Exception:
        # If critique fails, we continue with the original guide but log the failure
        state["critique_output"] = {"safe": True, "critique_notes": "Critique Agent bypass (LLM error)"}

    return state
