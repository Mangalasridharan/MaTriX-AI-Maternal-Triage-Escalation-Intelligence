# MaTriX-AI: Maternal Triage & Risk Escalation Intelligence

![MaTriX-AI Hero Banner](https://via.placeholder.com/1200x400/0A0A0A/FFFFFF?text=MaTriX-AI:+Hybrid+Edge-Cloud+Maternal+Swarm)

MaTriX-AI is a state-of-the-art, multimodal, multi-agent AI framework designed specifically for addressing maternal mortality crises in low-resource and remote clinical environments. It leverages a highly optimized **Hybrid Edge-Cloud Architecture**, deploying lightweight, offline models directly to the clinic, and escalates complex, high-risk cases to a powerful cloud AI only when critical thresholds are breached.

---

## 🌟 The Core Innovation

In low-resource clinics, internet connectivity is scarce and patient volume is overwhelmingly high. MaTriX-AI introduces an agentic workflow that runs **offline** on a consumer-grade laptop, analyzing raw vitals and scanning unstructured clinical notes in 1–2 seconds.

- **Offline Survival:** The Edge tier is fully functional even if the clinic loses connection. It identifies high-risk maternal distress instantly.
- **Intelligent Escalation:** Escaping the "all-or-nothing" API dependency trap. The system only burns expensive cloud tokens when a case is mathematically flagged as critical (Risk Score > 0.65).
- **Multimodal Reasoning:** Empowered by PaliGemma 3B, it reads fetal ultrasounds, ECGs, and handwritten lab notes.
- **Immutable Governance:** Because this is healthcare, every AI decision creates a cryptographically hashed Audit Trail (SHA-256) committed to a persistent PostgreSQL database.

---

## 🏗️ System Architecture

MaTriX-AI uses three distinct specialized agents passing context dynamically.

### 1. The Edge Tier (Local/Offline)

- **Risk Agent [MedGemma 4B]**: Acts as the initial triage nurse. It takes vital signs and unstructured notes, computes a continuous risk score, and flags critical conditions (e.g., _Gestational Diabetes, Pre-Eclampsia_).
- **Guideline Agent [MedGemma 4B + RAG]**: Acts as the protocol specialist. Driven by a localized Vector Database (`pgvector`), it matches identified risks against WHO and NICE clinical standard guidelines to output a safe stabilization plan.

### 2. The Cloud Tier (Escalation)

- **Executive Agent [MedGemma 27B]**: Acts as the senior attending physician. Activated _only_ for high-risk flags. It synthezes the edge context, formulates an aggressive transfer plan, and determines extraction urgency.
- **Vision Specialist [PaliGemma 3B]**: Deciphers any uploaded clinical scans and injects the parsed text directly into the Risk Agent's flow.

---

## 🛠️ Technology Stack

| Domain               | Technology                                  | Description                                                                                                                                    |
| :------------------- | :------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend UI/UX**   | **Next.js 14, React 18, Tailwind CSS**      | Spatial, premium Dribbble-inspired dark-mode UI. Employs Framer Motion for deep interactive micro-animations and a multi-step clinical wizard. |
| **Edge Backend**     | **FastAPI, Python 3.13**                    | High-concurrency async ASGI server managing the swarm state.                                                                                   |
| **Local LLM Engine** | **Ollama, unsloth/medgemma-1.5-4b-it-GGUF** | Highly-quantized (4-bit API) offline inference engine capable of running on minimal RAM.                                                       |
| **Vector Database**  | **PostgreSQL + `pgvector`**                 | Stores 1000+ WHO maternal guideline embeddings via `all-mpnet-base-v2`.                                                                        |
| **Cloud Backend**    | **FastAPI, AWS SageMaker**                  | The escalation server managing the Boto3 connectivity to Heavy-Duty HuggingFace inference clusters.                                            |

---

## ⚡ Deployment & Setup Flow

This repository encompasses the Full-Stack application (Frontend, Edge, Cloud).

### Prerequisites

- Docker Desktop (for PostgreSQL)
- Ollama (must be running on host machine with MedGemma 4B pulled via `ollama run hf.co/unsloth/medgemma-1.5-4b-it-GGUF:Q4_K_M`)
- Python 3.13+ and Node.js 18+

### Step 1. Start the Database

```bash
docker-compose up -d
```

### Step 2. Data Seeding & Ingestion

```bash
cd edge
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python scripts/ingest_guidelines.py
python scripts/seed_demo.py
```

### Step 3. Spin up the Hybrid Architecture

You need three separate terminal windows:

**Terminal 1: The Edge Server (Port 8000)**

```bash
cd edge
venv\Scripts\activate
python -m uvicorn app.main:app --port 8000 --reload
```

**Terminal 2: The Cloud Escalation Server (Port 9000)**

```bash
cd cloud
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --port 9000 --reload
```

**Terminal 3: The Spatial Frontend (Port 3000)**

```bash
cd frontend
npm install
npm run dev
```

### Step 4. SageMaker Deployment (Optional)

If deploying the real MedGemma 27B and PaliGemma 3B to AWS SageMaker:

```bash
cd cloud
python scripts/deploy_sagemaker.py --model medgemma-27b
python scripts/deploy_sagemaker.py --model medgemma-4b
python scripts/deploy_sagemaker.py --model paligemma-3b
```

---

## 🧪 Kaggle Validation Suite

We include a fully self-contained standalone Jupyter Notebook located in `notebooks/Kaggle_MaTriX_Agentic_Validation.ipynb`.

- Includes a full End-to-End recreation of the 3-Agent Swarm logic.
- Extracts dynamic JSON responses reliably from non-deterministic LLM tokens.
- Computes Confusion Matrix, Precision, Recall, and F1 Scores across various datasets.
- Generates a fully interactive **Gradio Demo** directly in the notebook payload.
- **Performance:** A validation run over 200 triage cases typically takes ~10-20 minutes depending on how heavily the 27B cloud escalation thresholds trigger.

---

## 🔒 Governance & Trust

Every LLM payload passes through `src/governance/auditor.py`.

1.  **Blocker Check:** Regex validation to prevent the LLM from suggesting fatal contraindications directly (e.g., autonomous drug administration).
2.  **Audit Hashing:** Deeply hashes the patient vitals + AI reasoning into a SHA-256 cryptographic string.
3.  **Persistence:** Saves directly to postgres so the hospital administration can trace exactly _why_ a nurse made a specific decision down to the millisecond.

_(C) 2026 MaTriX-AI Engineering Suite. All Rights Reserved._
