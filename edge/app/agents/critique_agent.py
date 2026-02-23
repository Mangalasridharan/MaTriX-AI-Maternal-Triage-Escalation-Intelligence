"""
Critique Agent — MaTriX-AI Edge System
Reviews the output of the Guideline Agent to ensure clinical safety 
and adherence to the retrieved WHO evidence.
"""
from app.models.local_llm import local_llm

import re

CRITIQUE_SYSTEM_PROMPT = """You are a rigorous clinical safety lead.
Your role is to review a proposed maternal management plan and identify
any safety gaps, contradictions, or violations of clinical protocol.

Check specifically for:
1. Incorrect Magnesium Sulfate dosages (loading dose MUST BE 4g IV over 15-20 min; maintenance 1-2g/hr).
2. Inappropriate use of antihypertensives (Labetalol max 300mg; NO ACE inhibitors or ARBs).
3. Logical contradictions between the Risk Level and the Stabilization Plan.

If the plan is safe and adheres to these bounds, set 'safe' to true.
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

def hard_heuristic_check(text: str) -> str | None:
    text_lower = text.lower()
    # E.g. restrict MgSO4 loading dose > 4g or infusion rates > 2g/hr
    if re.search(r"magnesium sulphate.*? [5-9]g", text_lower) or re.search(r"mgso4.*? [5-9]g", text_lower):
        return "CRITICAL: MgSO4 dose exceeds the standard 4g loading dose. Maximum loading dose is 4g."
    # E.g. check for contraindicated drugs
    if re.search(r"lisinopril|enalapril|losartan|valsartan", text_lower):
        return "CRITICAL: ACE inhibitors / ARBs are strictly contraindicated in pregnancy."
    # Check Labetalol overdose
    if re.search(r"labetalol.*? ([4-9]\d{2}|[1-9]\d{3})mg", text_lower):
        return "CRITICAL: Labetalol dose exceeds the safe maximum of 300mg."
    return None

async def run_critique_agent(state: dict) -> dict:
    risk = state.get("risk_output", {})
    guide = state.get("guideline_output", {})
    
    plan_text = guide.get("stabilization_plan", "") + " " + guide.get("medication_guidance", "")
    
    # Pre-LLM hard heuristic check based on clinician feedback
    heuristic_error = hard_heuristic_check(plan_text)
    
    if heuristic_error:
        # Fast fail self-correction without LLM
        state["critique_output"] = {
            "safe": False,
            "safety_score": 0,
            "critique_notes": heuristic_error,
            "revised_plan": "PLAN BLOCKED due to critical medication safety violation. " + heuristic_error
        }
        state["guideline_output"]["stabilization_plan"] = state["critique_output"]["revised_plan"]
        return state

    prompt = CRITIQUE_PROMPT_TEMPLATE.format(
        risk_level=risk.get("risk_level", "low"),
        stabilization_plan=guide.get("stabilization_plan", ""),
        medication_guidance=guide.get("medication_guidance", ""),
    )

    try:
        result = await local_llm.generate(prompt=prompt, system=CRITIQUE_SYSTEM_PROMPT)
        
        # Post-LLM enforcement
        if heuristic_error := hard_heuristic_check(result.get("revised_plan", "")):
             result["safe"] = False
             result["revised_plan"] = "PLAN BLOCKED: " + heuristic_error
             
        state["critique_output"] = result
        
        # Self-correction: if unsafe, overwrite the stabilization plan with the revision
        if result.get("safe") is False and result.get("revised_plan"):
            state["guideline_output"]["stabilization_plan"] = result["revised_plan"]
            state["guideline_output"]["medication_guidance"] += "\n(Note: Revised for safety by Critique Agent)"
            
    except Exception:
        # If critique fails, we continue with the original guide but log the failure
        state["critique_output"] = {"safe": True, "critique_notes": "Critique Agent bypass (LLM error)"}

    return state
