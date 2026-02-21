"""
Risk Agent — MaTriX-AI Edge System
Uses MedGemma (1.4B via Ollama) to assess maternal risk from clinical vitals.
"""
from app.models.local_llm import local_llm

RISK_SYSTEM_PROMPT = """You are an expert maternal-fetal medicine triage specialist.
Your role is to assess maternal risk from clinical vitals and symptoms and output
a structured JSON risk assessment. You must follow WHO and NICE guidelines for
preeclampsia and hypertensive disorders of pregnancy.

RISK LEVELS:
- severe: Immediate life-threatening danger. BP ≥ 160/110 + neurological/organ signs
- high: Significant risk requiring urgent escalation. BP ≥ 140/90 + proteinuria or symptoms
- moderate: Monitoring warranted. BP 130–139/80–89 or isolated single symptom
- low: No significant concern at present

SCORING GUIDE (0–100):
- severe: 75–100
- high: 50–74
- moderate: 25–49
- low: 0–24

Always output valid JSON only. No preamble. No markdown.
"""

RISK_PROMPT_TEMPLATE = """
Assess the maternal risk for the following patient:

PATIENT:
- Name: {name}
- Age: {age} years
- Gestational age: {gestational_age_weeks} weeks

VITALS:
- Blood Pressure: {bp_systolic}/{bp_diastolic} mmHg
- Proteinuria: {proteinuria}

SYMPTOMS:
- Severe headache: {headache}
- Visual disturbance: {visual_disturbance}
- Epigastric pain: {epigastric_pain}
- Oedema: {oedema}
- Reduced fetal movements: {fetal_movement_reduced}
- Additional symptoms: {additional_symptoms}

MEDICAL HISTORY: {medical_history}

Respond with ONLY this JSON structure:
{{
  "risk_level": "low|moderate|high|severe",
  "risk_score": <integer 0-100>,
  "confidence": <float 0.0-1.0>,
  "reasoning": "<one to three clear clinical sentences explaining your assessment>",
  "immediate_actions": ["<action 1>", "<action 2>"]
}}
"""


async def run_risk_agent(state: dict) -> dict:
    """
    Risk Agent node — invokes MedGemma 1.4B to produce a structured risk assessment.
    Falls back to rule-based scoring if the LLM is unavailable.
    """
    p = state["patient_data"]

    prompt = RISK_PROMPT_TEMPLATE.format(
        name=p.get("name", "Unknown"),
        age=p.get("age", "?"),
        gestational_age_weeks=p.get("gestational_age_weeks", "?"),
        bp_systolic=p.get("bp_systolic", "?"),
        bp_diastolic=p.get("bp_diastolic", "?"),
        proteinuria=p.get("proteinuria", False),
        headache=p.get("headache", False),
        visual_disturbance=p.get("visual_disturbance", False),
        epigastric_pain=p.get("epigastric_pain", False),
        oedema=p.get("oedema", False),
        fetal_movement_reduced=p.get("fetal_movement_reduced", False),
        additional_symptoms=p.get("additional_symptoms", "None"),
        medical_history=p.get("medical_history", "None"),
    )

    try:
        result = await local_llm.generate(prompt=prompt, system=RISK_SYSTEM_PROMPT)
        # Validate required keys
        assert "risk_level" in result and "risk_score" in result
        result.setdefault("immediate_actions", [])
        result.setdefault("reasoning", "")
    except Exception as exc:
        # Rule-based fallback
        result = _rule_based_risk(p)
        result["reasoning"] += f" (LLM unavailable: {exc})"

    state["risk_output"] = result
    return state


def _rule_based_risk(p: dict) -> dict:
    """Deterministic rule-based risk scoring as LLM fallback."""
    sys = p.get("bp_systolic", 0)
    dia = p.get("bp_diastolic", 0)
    neuro = p.get("headache", False) or p.get("visual_disturbance", False)
    proteinuria = p.get("proteinuria", False)
    epigastric = p.get("epigastric_pain", False)

    if sys >= 160 or (sys >= 140 and neuro):
        return {
            "risk_level": "severe",
            "risk_score": 90,
            "confidence": 0.95,
            "reasoning": "Severe hypertension with neurological symptoms meets criteria for severe preeclampsia.",
            "immediate_actions": [
                "Administer MgSO4 4g IV loading dose over 20 minutes",
                "Give antihypertensive (labetalol 20mg IV or nifedipine 10mg oral)",
                "Arrange immediate transfer to obstetric unit",
                "Continuous fetal monitoring",
            ],
        }
    elif sys >= 140 and proteinuria:
        return {
            "risk_level": "high",
            "risk_score": 68,
            "confidence": 0.85,
            "reasoning": "Hypertension with proteinuria consistent with preeclampsia.",
            "immediate_actions": [
                "Monitor BP every 15 minutes",
                "Urine output monitoring",
                "Blood tests: FBC, LFT, urate, creatinine",
            ],
        }
    elif sys >= 130 or epigastric:
        return {
            "risk_level": "moderate",
            "risk_score": 40,
            "confidence": 0.75,
            "reasoning": "Borderline hypertension or concerning symptoms warrant closer monitoring.",
            "immediate_actions": ["Repeat BP in 30 minutes", "Urine dipstick"],
        }
    else:
        return {
            "risk_level": "low",
            "risk_score": 12,
            "confidence": 0.90,
            "reasoning": "Vital signs within normal range. No significant risk factors identified.",
            "immediate_actions": ["Routine antenatal monitoring at next visit"],
        }