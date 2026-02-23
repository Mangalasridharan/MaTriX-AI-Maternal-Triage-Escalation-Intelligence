"""
WHO Maternal Guideline Ingestion Script
Run once to populate the pgvector guideline_chunks table.

Usage:
    cd edge
    python scripts/ingest_guidelines.py
"""
import asyncio
import asyncpg
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.rag.embed import embed_batch
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://matrix:matrix@localhost:5432/matrixdb"
).replace("postgresql+asyncpg://", "postgresql://")

# ── Embedded WHO / NICE Guideline Chunks ──────────────────────────────────────

WHO_GUIDELINE_CHUNKS = [
    {
        "source": "WHO 2011 — Hypertensive Disorders of Pregnancy",
        "text": (
            "Severe hypertension in pregnancy is defined as a systolic BP of 160 mmHg or higher, "
            "or a diastolic BP of 110 mmHg or higher. Women with severe hypertension require urgent "
            "antihypertensive treatment to reduce the risk of stroke and cardiac failure."
        ),
    },
    {
        "source": "WHO 2011 — Magnesium Sulphate",
        "text": (
            "Magnesium sulphate is the drug of choice for prevention and treatment of eclampsia. "
            "Loading dose: 4g IV over 15–20 minutes. Maintenance: 1–2g per hour IV for at least 24 hours "
            "after the last seizure or delivery. Monitor for signs of toxicity: loss of patellar reflexes, "
            "respirations < 12/min, oliguria < 25mL/hr."
        ),
    },
    {
        "source": "WHO 2011 — Antihypertensive Treatment",
        "text": (
            "Antihypertensive drugs recommended in severe hypertension in pregnancy: "
            "Labetalol 20mg IV (can repeat every 10 minutes, max 300mg); "
            "Nifedipine 10mg oral (short-acting, repeat after 30 minutes if needed); "
            "Hydralazine 5mg IV slowly (repeat every 20 min, max 20mg). "
            "Do not use ACE inhibitors, ARBs, or atenolol in pregnancy."
        ),
    },
    {
        "source": "WHO 2011 — Preeclampsia Diagnosis",
        "text": (
            "Preeclampsia is diagnosed when hypertension (BP ≥ 140/90 mmHg on two readings at least "
            "4 hours apart) is accompanied by proteinuria (≥ 300mg in 24 hours or 2+ on dipstick) "
            "after 20 weeks gestation. Severe preeclampsia includes BP ≥ 160/110, seizure risk indicators, "
            "or evidence of end-organ damage."
        ),
    },
    {
        "source": "WHO 2011 — HELLP Syndrome",
        "text": (
            "HELLP syndrome (Haemolysis, Elevated Liver enzymes, Low Platelets) is a severe complication "
            "of preeclampsia. Features: AST > 70 IU/L, LDH > 600 IU/L, platelets < 100,000. "
            "Management: immediate delivery, corticosteroids if < 34 weeks, MgSO4 prophylaxis."
        ),
    },
    {
        "source": "NICE NG133 2019 — Hypertension in Pregnancy",
        "text": (
            "Women with chronic hypertension should have their antihypertensive treatment adjusted to keep "
            "BP below 135/85 mmHg. Women with gestational hypertension should be offered birth after 37 weeks. "
            "Women with preeclampsia who do not have severe hypertension should be reviewed by a consultant and "
            "offered birth at 37 weeks."
        ),
    },
    {
        "source": "NICE NG133 2019 — Fetal Monitoring",
        "text": (
            "All women with preeclampsia should have continuous cardiotocography (CTG) in labour. "
            "Offer a single course of antenatal corticosteroids (betamethasone 2x 12mg IM 24hrs apart) "
            "if delivery before 34+6 weeks is anticipated."
        ),
    },
    {
        "source": "WHO 2011 — Fluid Management",
        "text": (
            "IV fluid management in preeclampsia: restrict total fluid intake to 80mL/hr to avoid pulmonary oedema. "
            "Insert urinary catheter to monitor output. Target urine output > 25mL/hr. "
            "If oliguria persists, request consultant review before fluid challenge."
        ),
    },
    {
        "source": "WHO 2011 — Referral Criteria",
        "text": (
            "Refer immediately to a higher-level facility with obstetric care if: systolic BP ≥ 160 mmHg, "
            "diastolic BP ≥ 110 mmHg, eclamptic seizures, severe headache with visual disturbance, "
            "epigastric pain, pulmonary oedema, or fetal distress detected. Transfer only after initial "
            "stabilisation with antihypertensives and MgSO4."
        ),
    },
    {
        "source": "WHO 2011 — Postnatal Hypertension",
        "text": (
            "Hypertension may persist or develop for the first time postpartum. Monitor BP at least every "
            "4 hours in the first 24 hours after delivery. Women who had preeclampsia are at increased risk "
            "of future cardiovascular disease and should be counselled accordingly."
        ),
    },
    {
        "source": "RCOG Green-top 10A — Mild/Moderate Hypertension",
        "text": (
            "Women with mild hypertension (140–149/90–99 mmHg) without proteinuria may be managed as outpatients "
            "with twice-weekly BP measurements. Antihypertensives are recommended when BP ≥ 150/100 mmHg. "
            "Labetalol is the first-line oral antihypertensive in the UK for pregnant women."
        ),
    },
    {
        "source": "WHO 2014 — Low-dose Aspirin",
        "text": (
            "Low-dose aspirin (75–150mg daily) is recommended for women at high risk of preeclampsia "
            "(prior preeclampsia, multifetal pregnancy, chronic hypertension, diabetes, renal disease). "
            "Start before 16 weeks and continue until delivery."
        ),
    },
    {
        "source": "WHO 2011 — Calcium Supplementation",
        "text": (
            "Calcium supplementation (1.5–2g elemental calcium/day) is recommended for pregnant women "
            "especially in populations with low calcium intake, to reduce the risk of preeclampsia."
        ),
    },
    {
        "source": "NICE NG133 2019 — Blood Tests",
        "text": (
            "Blood investigations for women with suspected preeclampsia should include: full blood count, "
            "urea, creatinine, electrolytes, liver enzymes, uric acid, and coagulation studies. "
            "These should be repeated every 12–24 hours depending on severity."
        ),
    },
    {
        "source": "WHO 2011 — Eclampsia Management",
        "text": (
            "Eclampsia management: place patient on left lateral position, avoid restraint, maintain airway. "
            "Give MgSO4 loading dose 4g IV over 5 minutes if convulsing. If seizure persists > 5 minutes, "
            "give diazepam 10mg IV. After stabilisation, deliver as soon as possible regardless of gestational age."
        ),
    },
    {
        "source": "WHO 2011 — Monitoring Protocol",
        "text": (
            "Standard monitoring for high-risk pregnancy: BP every 15 minutes, respiratory rate every 30 minutes, "
            "pulse oximetry continuous, urine output hourly, deep tendon reflexes every hour (MgSO4 toxicity), "
            "fetal heart rate every 30 minutes, LOC assessment every hour."
        ),
    },
    {
        "source": "NICE NG133 2019 — Gestational Hypertension",
        "text": (
            "Gestational hypertension without proteinuria: start antihypertensive treatment if BP consistently "
            "≥ 140/90 mmHg. Consider oral labetalol first-line, with nifedipine or methyldopa as alternatives. "
            "Measure BP every 2-4 days if mild, daily if moderate, more frequently if severe."
        ),
    },
    {
        "source": "WHO 2011 — Maternal Near-Miss",
        "text": (
            "Maternal near-miss indicators in preeclampsia/eclampsia: BP > 200/120 for > 12 hours, "
            "platelet < 50,000, creatinine > 300 μmol/L, renal failure, pulmonary oedema, eclamptic seizures, "
            "coma > 12 hours, stroke. These require ICU-level care."
        ),
    },
    {
        "source": "FIGO 2016 — Preeclampsia Screening",
        "text": (
            "First-trimester screening for preeclampsia should combine: mean arterial pressure, uterine artery "
            "pulsatility index, serum PlGF, and maternal history. High-risk women should be offered aspirin "
            "before 16 weeks. The FIGO algorithm achieves > 90% detection for preterm preeclampsia."
        ),
    },
    {
        "source": "WHO 2011 — Transport and Referral",
        "text": (
            "Prior to transfer of a woman with severe preeclampsia: ensure BP is controlled < 160/110, "
            "MgSO4 is started, IV access is secure, completed a full set of observations. "
            "Transfer in left lateral position. Provide full clinical summary and current drug chart to receiving unit."
        ),
    },
    {
        "source": "ACOG Practice Bulletin No. 222 — Gestational Hypertension and Preeclampsia",
        "text": (
            "Expectant management is recommended for women with gestational hypertension or preeclampsia without severe features until 37 0/7 weeks of gestation. "
            "For women with severe features, delivery is recommended at or beyond 34 0/7 weeks."
        ),
    },
    {
        "source": "ACOG Practice Bulletin No. 222 — Magnesium Sulfate Toxicity",
        "text": (
            "In the event of magnesium sulfate toxicity (e.g., loss of deep tendon reflexes, respiratory depression, or cardiac arrest), "
            "the infusion should be stopped and intravenous calcium gluconate (10% solution, 10-20 mL over 3 minutes) should be administered."
        ),
    },
    {
        "source": "WHO 2011 — Severe Anaemia in Pregnancy",
        "text": (
            "Severe anaemia (Hb < 7.0 g/dL) is a significant risk factor for maternal morbidity and mortality. "
            "It must be corrected aggressively, particularly near term, via oral or intravenous iron therapy or blood transfusion if Hb < 5.0 g/dL or signs of failure."
        ),
    },
]


async def ingest():
    print(f"Connecting to {DATABASE_URL}...")
    conn = await asyncpg.connect(dsn=DATABASE_URL)

    # Create extension + table
    await conn.execute("CREATE EXTENSION IF NOT EXISTS vector")
    await conn.execute("""
        CREATE TABLE IF NOT EXISTS guideline_chunks (
            id SERIAL PRIMARY KEY,
            source TEXT NOT NULL,
            chunk_text TEXT NOT NULL,
            embedding vector(384)
        )
    """)
    await conn.execute("CREATE INDEX IF NOT EXISTS guideline_chunks_emb_idx ON guideline_chunks USING ivfflat (embedding vector_cosine_ops)")

    # Check if already populated
    count = await conn.fetchval("SELECT COUNT(*) FROM guideline_chunks")
    if count > 0:
        print(f"⚠️  Table already has {count} rows. Skipping ingestion. (Delete rows to re-ingest.)")
        await conn.close()
        return

    # Generate embeddings
    print(f"Generating embeddings for {len(WHO_GUIDELINE_CHUNKS)} guideline chunks...")
    texts = [c["text"] for c in WHO_GUIDELINE_CHUNKS]
    embeddings = embed_batch(texts)

    # Insert
    for i, (chunk, emb) in enumerate(zip(WHO_GUIDELINE_CHUNKS, embeddings)):
        vec_str = "[" + ",".join(str(v) for v in emb) + "]"
        await conn.execute(
            "INSERT INTO guideline_chunks (source, chunk_text, embedding) VALUES ($1, $2, $3::vector)",
            chunk["source"],
            chunk["text"],
            vec_str,
        )
        print(f"  [{i+1}/{len(WHO_GUIDELINE_CHUNKS)}] Inserted: {chunk['source'][:60]}")

    await conn.close()
    print(f"\n✅ Ingested {len(WHO_GUIDELINE_CHUNKS)} WHO guideline chunks into pgvector.")


if __name__ == "__main__":
    asyncio.run(ingest())
