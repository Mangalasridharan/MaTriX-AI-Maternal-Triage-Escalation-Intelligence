"""
Guideline RAG Agent — MaTriX-AI Edge System
Retrieves WHO maternal health guideline chunks from pgvector,
then uses MedGemma (1.4B via Ollama) to produce an evidence-grounded
clinical management plan.
"""
from app.models.local_llm import local_llm
from app.rag.retrieve import retrieve_guideline_chunks

GUIDELINE_SYSTEM_PROMPT = """You are an evidence-based maternal health clinical advisor.
Your role is to produce a clear, actionable clinical management plan grounded in
WHO and NICE guidelines for hypertensive disorders of pregnancy.

Use ONLY the guideline excerpts provided in the prompt context.
Do NOT invent medications or dosages — cite from the provided excerpts.
Always output valid JSON only. No preamble. No markdown.
"""

GUIDELINE_PROMPT_TEMPLATE = """
You are advising on the clinical management of a maternal patient.

RISK ASSESSMENT:
- Risk Level: {risk_level}
- Risk Score: {risk_score} / 100
- Reasoning: {reasoning}

KEY VITALS:
- BP: {bp_systolic}/{bp_diastolic} mmHg
- Gestational age: {gestational_age_weeks} weeks
- Proteinuria: {proteinuria}

RETRIEVED WHO GUIDELINE EXCERPTS:
{guideline_context}

Based on the above risk level and guideline excerpts, produce a clinical management plan.

Respond with ONLY this JSON structure:
{{
  "stabilization_plan": "<step-by-step stabilization actions>",
  "monitoring_instructions": "<what to monitor and at what intervals>",
  "medication_guidance": "<recommended medications with doses based on guidelines>",
  "guideline_refs": ["<relevant guideline reference 1>", "<reference 2>"]
}}
"""


async def run_guideline_agent(state: dict) -> dict:
    """
    Guideline RAG Agent node — retrieves relevant WHO guideline chunks,
    then calls MedGemma 1.4B to generate an evidence-grounded management plan.
    """
    risk = state.get("risk_output", {})
    p = state.get("patient_data", {})
    risk_level = risk.get("risk_level", "low")

    # Build RAG query from risk context
    rag_query = (
        f"maternal {risk_level} risk hypertension management "
        f"BP {p.get('bp_systolic')}/{p.get('bp_diastolic')} "
        f"gestational weeks {p.get('gestational_age_weeks')} "
        f"{'proteinuria' if p.get('proteinuria') else ''} "
        f"{'preeclampsia' if risk_level in ('high', 'severe') else 'hypertension monitoring'}"
    )

    # Retrieve guideline chunks
    try:
        chunks = await retrieve_guideline_chunks(rag_query, top_k=3)
        guideline_context = "\n\n".join(
            f"[{i+1}] ({c['source']}, similarity {c['similarity']}):\n{c['chunk_text']}"
            for i, c in enumerate(chunks)
        )
        refs = [c["source"] for c in chunks]
    except Exception:
        # Fallback if pgvector not yet populated
        guideline_context = _hardcoded_fallback_context(risk_level)
        refs = ["WHO 2011 — Hypertensive Disorders of Pregnancy"]

    prompt = GUIDELINE_PROMPT_TEMPLATE.format(
        risk_level=risk_level,
        risk_score=risk.get("risk_score", 0),
        reasoning=risk.get("reasoning", ""),
        bp_systolic=p.get("bp_systolic", "?"),
        bp_diastolic=p.get("bp_diastolic", "?"),
        gestational_age_weeks=p.get("gestational_age_weeks", "?"),
        proteinuria=p.get("proteinuria", False),
        guideline_context=guideline_context,
    )

    try:
        result = await local_llm.generate(prompt=prompt, system=GUIDELINE_SYSTEM_PROMPT)
        assert "stabilization_plan" in result
        result.setdefault("guideline_refs", refs)
    except Exception:
        result = _rule_based_guideline(risk_level, refs)

    state["guideline_output"] = result
    return state


def _rule_based_guideline(risk_level: str, refs: list) -> dict:
    """Deterministic guideline fallback when LLM is unavailable."""
    base = {
        "severe": {
            "stabilization_plan": (
                "1. Call obstetric emergency team immediately.\n"
                "2. Secure IV access (two large-bore lines).\n"
                "3. Administer MgSO4 4g IV loading dose over 15–20 min.\n"
                "4. Start antihypertensive: Labetalol 20mg IV or Nifedipine 10mg oral.\n"
                "5. Insert urinary catheter and monitor urine output (target >25mL/hr).\n"
                "6. Arrange emergency obstetric transfer."
            ),
            "monitoring_instructions": (
                "BP every 5 minutes until stable, then every 15 minutes. "
                "Continuous CTG. Pulse oximetry. GCS monitoring every 30 minutes. "
                "Blood tests: FBC, U&E, LFT, uric acid, coagulation."
            ),
            "medication_guidance": (
                "MgSO4: 4g IV over 20 min (loading), then 1–2g/hr maintenance. "
                "Labetalol 20mg IV q10min (max 300mg) OR Nifedipine 10mg oral (may repeat). "
                "Hydralazine 5mg IV if BP remains > 160/110 after labetalol."
            ),
        },
        "high": {
            "stabilization_plan": (
                "1. Semi-recumbent position, O2 if SpO2 < 95%.\n"
                "2. IV access, blood samples (FBC, LFT, renal function, uric acid).\n"
                "3. Urine dipstick and 24-hour urine protein collection.\n"
                "4. Oral antihypertensive if BP ≥ 150/100."
            ),
            "monitoring_instructions": (
                "BP every 15 minutes. Urine output hourly. Daily bloods. "
                "CTG twice daily. Watch for headache, visual changes, epigastric pain."
            ),
            "medication_guidance": (
                "Nifedipine LA 20mg oral BD or Methyldopa 250mg oral TDS. "
                "Do NOT use ACE inhibitors or ARBs in pregnancy."
            ),
        },
        "moderate": {
            "stabilization_plan": (
                "1. Rest and repeat BP after 5–10 minutes.\n"
                "2. Urine dipstick for protein.\n"
                "3. Review medications and dietary salt intake."
            ),
            "monitoring_instructions": (
                "BP twice daily. Urine dipstick every visit. Weekly blood tests if on antihypertensives. "
                "Fetal growth scan if < 34 weeks."
            ),
            "medication_guidance": "Consider starting antihypertensive if BP consistently ≥ 140/90.",
        },
        "low": {
            "stabilization_plan": "Continue routine antenatal care. No immediate interventions required.",
            "monitoring_instructions": "Routine antenatal BP monitoring at each visit.",
            "medication_guidance": "No medications currently indicated.",
        },
    }
    plan = base.get(risk_level, base["low"])
    plan["guideline_refs"] = refs
    return plan


def _hardcoded_fallback_context(risk_level: str) -> str:
    """Inline WHO guideline text used when pgvector is not yet populated."""
    if risk_level in ("severe", "high"):
        return (
            "[WHO 2011 — Severe Preeclampsia]: Magnesium sulphate is the drug of choice for "
            "the prevention and treatment of eclampsia. The loading dose is 4g IV over 20 minutes, "
            "followed by 1g/hr IV maintenance for 24 hours after the last seizure.\n\n"
            "[WHO 2011 — Antihypertensives]: Antihypertensive drugs should be given when "
            "BP ≥ 160/110 mmHg. Labetalol IV, oral nifedipine, or IV hydralazine are all appropriate.\n\n"
            "[NICE NG133 2019]: Women with severe hypertension should receive IV labetalol as "
            "first-line if there are no contraindications."
        )
    return (
        "[WHO 2011 — Mild Hypertension]: Blood pressure should be checked at every antenatal visit. "
        "Women with BP 140-159/90-109 without proteinuria should receive expectant management "
        "with close surveillance and antihypertensive treatment if BP rises above 150/100."
    )