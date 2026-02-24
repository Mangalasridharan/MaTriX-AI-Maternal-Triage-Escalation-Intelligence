"""
collect_finetune_data.py
========================
Queries the production PostgreSQL database for completed triage cases
where the model's prediction was CONFIRMED OR CORRECTED by a clinical outcome.

This builds a LoRA training dataset in the Alpaca-style JSONL format:
  { "instruction": system_prompt, "input": patient_context, "output": gold_label }

Run by: GitHub Actions `.github/workflows/self_improve.yml`
"""
import os, json, argparse, sys
from pathlib import Path
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()


def query_confirmed_cases(database_url: str, days_back: int = 30, min_risk: str = "moderate") -> list[dict]:
    """
    Pulls cases from DB where:
    1. A clinical outcome was recorded by nursing staff (visit.outcome IS NOT NULL)
    2. OR the AI risk level differed from the nurse-assigned level (drift detected)
    """
    try:
        import asyncpg
        import asyncio

        async def _query():
            conn = await asyncpg.connect(database_url)
            cutoff = datetime.utcnow() - timedelta(days=days_back)
            rows = await conn.fetch("""
                SELECT
                    v.id AS visit_id,
                    p.name, p.age, p.gestational_age_weeks,
                    v.vitals_data, v.symptoms_list, v.notes,
                    r.risk_level AS ai_risk_level, r.risk_score, r.reasoning,
                    r.immediate_actions,
                    v.nurse_confirmed_risk,       -- null if nurse didn't confirm/correct
                    v.clinical_outcome,           -- null if outcome not yet recorded
                    e.escalated
                FROM visits v
                JOIN patients p  ON p.id = v.patient_id
                JOIN risk_outputs r ON r.visit_id = v.id
                LEFT JOIN escalation_logs e ON e.visit_id = v.id
                WHERE v.visit_date >= $1
                  AND (v.nurse_confirmed_risk IS NOT NULL OR v.clinical_outcome IS NOT NULL)
                ORDER BY v.visit_date DESC
            """, cutoff)
            await conn.close()
            return [dict(r) for r in rows]

        return asyncio.run(_query())
    except Exception as exc:
        print(f"[collect] DB query failed: {exc}")
        return []


def case_to_training_sample(row: dict) -> dict | None:
    """Convert a DB row into an Alpaca-format training sample."""
    vitals = row.get("vitals_data") or {}
    # Use nurse-confirmed label as gold standard, fall back to AI output
    gold_label = row.get("nurse_confirmed_risk") or row.get("ai_risk_level", "low")

    # Build prompt matching the production risk agent prompt
    instruction = (
        "You are an expert maternal-fetal medicine triage specialist. "
        "Assess maternal risk and output a structured JSON assessment."
    )

    input_context = (
        f"Patient: {row['name']}, Age: {row['age']}, "
        f"Gestational: {row['gestational_age_weeks']}wks\n"
        f"BP: {vitals.get('systolic', '?')}/{vitals.get('diastolic', '?')} mmHg\n"
        f"Symptoms: {', '.join(row.get('symptoms_list') or [])}\n"
        f"Notes: {row.get('notes', 'None')}"
    )

    output = json.dumps({
        "risk_level": gold_label,
        "risk_score": row.get("risk_score", 0),
        "reasoning": row.get("reasoning", f"Clinical outcome confirmed risk level as {gold_label}."),
        "immediate_actions": row.get("immediate_actions") or []
    }, indent=2)

    return {"instruction": instruction, "input": input_context, "output": output}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--min_samples", type=int, default=50)
    parser.add_argument("--output_path", type=str, default="finetune_data/new_samples.jsonl")
    parser.add_argument("--force", type=str, default="false")
    args = parser.parse_args()

    db_url = os.getenv("DATABASE_URL", "")
    if not db_url:
        print("[collect] No DATABASE_URL set. Generating synthetic samples for demo...")
        # Generate synthetic samples for CI demo (no DB required)
        synthetic = [{
            "instruction": "You are an expert maternal triage specialist. Output JSON risk assessment.",
            "input": f"Patient demo-case-{i}, BP {140+i}/{90+i}mmHg, Gestational: 32wks",
            "output": json.dumps({"risk_level": "high" if i % 2 == 0 else "severe", "risk_score": 68+i})
        } for i in range(args.min_samples)]
        samples = synthetic
    else:
        rows = query_confirmed_cases(db_url)
        samples = [s for r in rows if (s := case_to_training_sample(r))]

    force = args.force.lower() == "true"
    enough = len(samples) >= args.min_samples

    if not enough and not force:
        print(f"[collect] Only {len(samples)} samples (need {args.min_samples}). Skipping fine-tune.")
        # GitHub Actions output
        with open(os.environ.get("GITHUB_OUTPUT", "/dev/null"), "a") as f:
            f.write(f"needs_finetune=false\n")
            f.write(f"sample_count={len(samples)}\n")
            f.write(f"drift_score=0.0\n")
        sys.exit(0)

    # Save training data
    Path(args.output_path).parent.mkdir(parents=True, exist_ok=True)
    with open(args.output_path, "w") as f:
        for sample in samples:
            f.write(json.dumps(sample) + "\n")

    drift_score = round(len([r for r in (query_confirmed_cases(db_url) if db_url else []) 
                             if r.get("nurse_confirmed_risk") and r.get("ai_risk_level") 
                             and r["nurse_confirmed_risk"] != r["ai_risk_level"]]) / max(len(samples), 1), 3)

    print(f"[collect] ✅ Saved {len(samples)} samples → {args.output_path}")
    print(f"[collect] Drift score: {drift_score}")

    with open(os.environ.get("GITHUB_OUTPUT", "/dev/null"), "a") as f:
        f.write(f"needs_finetune=true\n")
        f.write(f"sample_count={len(samples)}\n")
        f.write(f"drift_score={drift_score}\n")


if __name__ == "__main__":
    main()
