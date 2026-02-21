"""
Executive Agent — Cloud Service (27B via HuggingFace Inference on AWS)
Provides senior OB/GYN consultant-level escalation reasoning.
"""
from app.cloud_llm import cloud_llm

EXECUTIVE_SYSTEM_PROMPT = """You are a senior consultant obstetrician and maternal-fetal medicine specialist
with 20+ years of clinical experience. You receive escalated high-risk or severe maternal cases from
peripheral clinic nurse stations, each pre-assessed by an AI risk model and guideline retrieval system.

Your role:
1. Review the full case summary (risk assessment + guideline plan + patient data)
2. Produce a harmonised, senior-level escalation and care plan
3. Specify referral urgency and priority with clinical justification
4. Estimate safe transfer window

Guidelines to follow: WHO Hypertensive Disorders of Pregnancy 2011, NICE NG133 2019, RCOG Green-top Guideline 10A.

Always output ONLY valid JSON. No preamble, no markdown, no explanations outside the JSON.
"""

EXECUTIVE_PROMPT_TEMPLATE = """
You are reviewing an escalated maternal case from a peripheral clinic.

PATIENT DATA:
{patient_data}

EDGE AI RISK ASSESSMENT:
- Risk level: {risk_level}
- Risk score: {risk_score}/100
- Confidence: {confidence}
- Reasoning: {reasoning}
- Immediate actions recommended: {immediate_actions}

GUIDELINE AGENT PLAN:
- Stabilization plan: {stabilization_plan}
- Monitoring: {monitoring_instructions}
- Medication: {medication_guidance}
- Guideline references: {guideline_refs}

As the senior consultant, produce your expert harmonised opinion.

Respond with ONLY this JSON:
{{
  "executive_summary": "<2-3 sentence clinical overview of the case and its urgency>",
  "care_plan": "<detailed ordered care plan — numbered steps>",
  "referral_urgency": "immediate|within-1-hour|within-4-hours|within-24-hours",
  "referral_priority": "immediate|urgent|routine",
  "justification": "<clinical justification for referral priority, citing specific parameters>",
  "time_to_transfer_hours": <float, e.g. 0.5 for 30 min>,
  "receiving_facility_requirements": "<what the receiving facility must be capable of>",
  "in_transit_care": "<what must happen during patient transport>"
}}
"""


async def run_executive_agent(payload: dict) -> dict:
    """
    Run the 27B Executive Agent against the full case.
    Returns a structured senior clinical escalation plan.
    """
    patient_data = payload.get("patient_data", {})
    risk = payload.get("risk_output", {})
    guide = payload.get("guideline_output", {})

    prompt = EXECUTIVE_PROMPT_TEMPLATE.format(
        patient_data=_format_patient(patient_data),
        risk_level=risk.get("risk_level", "unknown"),
        risk_score=risk.get("risk_score", 0),
        confidence=risk.get("confidence", 0.0),
        reasoning=risk.get("reasoning", "Not provided"),
        immediate_actions=", ".join(risk.get("immediate_actions", [])),
        stabilization_plan=guide.get("stabilization_plan", "Not provided"),
        monitoring_instructions=guide.get("monitoring_instructions", "Not provided"),
        medication_guidance=guide.get("medication_guidance", "Not provided"),
        guideline_refs=", ".join(guide.get("guideline_refs", [])),
    )

    try:
        result = await cloud_llm.generate(prompt=prompt, system=EXECUTIVE_SYSTEM_PROMPT)
        if not result or "executive_summary" not in result:
            raise ValueError("Incomplete response from model")
        return result
    except Exception as exc:
        return _fallback_executive(risk, guide, str(exc))


def _format_patient(p: dict) -> str:
    return (
        f"Name: {p.get('name', 'Unknown')}, Age: {p.get('age', '?')}, "
        f"GA: {p.get('gestational_age_weeks', '?')} weeks, "
        f"BP: {p.get('bp_systolic', '?')}/{p.get('bp_diastolic', '?')} mmHg, "
        f"Proteinuria: {p.get('proteinuria', False)}, "
        f"Headache: {p.get('headache', False)}, "
        f"Visual disturbance: {p.get('visual_disturbance', False)}, "
        f"Epigastric pain: {p.get('epigastric_pain', False)}"
    )


def _fallback_executive(risk: dict, guide: dict, error: str) -> dict:
    """Rule-based fallback when LLM is unavailable."""
    level = risk.get("risk_level", "high")
    return {
        "executive_summary": (
            f"Patient presents with {level} maternal risk requiring escalated care. "
            "Immediate obstetric review recommended. Cloud AI unavailable — using rule-based escalation."
        ),
        "care_plan": guide.get("stabilization_plan", "Follow WHO maternal emergency protocol."),
        "referral_urgency": "immediate" if level == "severe" else "within-1-hour",
        "referral_priority": "immediate" if level == "severe" else "urgent",
        "justification": f"Risk level: {level}. Cloud model unavailable ({error}). Defaulting to highest safety margin.",
        "time_to_transfer_hours": 0.5 if level == "severe" else 1.0,
        "receiving_facility_requirements": "Tertiary obstetric unit with ITU capability and neonatal ICU.",
        "in_transit_care": "Continuous BP monitoring, MgSO4 infusion, left lateral position, IV access maintained.",
    }