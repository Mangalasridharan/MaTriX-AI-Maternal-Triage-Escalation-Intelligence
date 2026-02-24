# MaTriX-AI: Hybrid Edge-Cloud Architecture

MaTriX-AI uses a decoupled, three-tier architecture ensuring an offline-first resilient mode for clinical clinics, and a high-resource escalation mode for severe maternal anomalies.

## 🏢 Tier 1: The Clinic Edge (Offline Environment)

**Functionality**: Offline-First Triage & RAG-based Guidelines

- **Hardware Required:** Any consumer laptop with 8GB RAM + (ideally RTX 3050 GPU).
- **Database:** `PostgreSQL` + `pgvector` storing `all-mpnet-base-v2` embeddings representing parsed WHO & NICE maternal care documents.
- **Base Model:** **MedGemma 4B** (quantized via Unsloth to a Q4_K_M GGUF format via Ollama).
- **Risk Agent:** Processes raw notes, Blood Pressure, Heart Rate, Glucose, etc. It assigns a mathematical risk `score`.
- **Guideline Agent:** Taking the output of the Risk Agent, performs a hybrid semantic-BM25 vector search on `pgvector` to identify the correct clinical playbook (e.g., Pre-Eclampsia loading dose MgSO4 protocol).
- **Data Structure:** All telemetry and clinical inferences are written synchronously to PostgreSQL with cryptographically bound trace IDs to ensure auditability before cloud transmission.

## 🌩️ Tier 2: The Cloud Escalation Center

_(Requires Internet Access)_

**Functionality**: Heavy-Duty Context Analysis & Vision Processing

- **Routing Logic:** If the Edge Risk Agent determines a patient matches 'HIGH' urgency (e.g., Severe Hypertension, Ruptured Membranes), the Edge FastAPI server sends a Webhook payload to the Cloud FastAPI instance.
- **Deployment:** AWS SageMaker Inference Endpoints backed by `ml.g5.12xlarge` resources.
- **Executive Agent:** **MedGemma 27B** parameter model. Analyzes the complete patient history, current vitals, and identified WHO guideline to build an extraction/transfer plan, calculating exact "time-to-criticality".
- **Vision Specialist:** **PaliGemma 3B**, a multimodal VLM capable of extracting text, parsing ECG waveforms, or finding abnormalities in an uploaded JPG of a Fetal Heart Tracer.

## 🖥️ Tier 3: The Spatial Interface

**Functionality**: Interactive Nursing Dashboard

- **Framework:** Next.js 14, Tailwind CSS, Framer Motion.
- **UX Pattern:** Premium Dribbble-inspired Dark Mode Interface.
- **Interactivity:** Drag and Drop CTG Images, Live Markdown Streaming, WebSocket updates.
- **Visual Logic:** Agentic computation is visualized as physical cards animating into view, representing multiple "doctor personas" evaluating the patient sequentially.

---

### Sequence Flow (Maternal Triage)

1. **Nurse inputs data** (Vitals + Short text phrase) on the NextJS frontend.
2. Frontend sends JSON payload to `Edge API (port 8000)`.
3. Edge API sends context to Ollama (`MedGemma 4B`).
4. **Risk Agent** calculates `mid` or `high` risk, and outputs structured JSON.
5. If `high` risk, Edge API triggers a REST POST to `Cloud API (port 9000)`.
6. Cloud API invokes `SageMaker Endpoint (MedGemma 27B)`.
7. **Executive Agent** parses deep medical strategy and returns final plan.
8. `Governance Layer` hashes the payload (SHA-256).
9. Response travels back to Frontend, popping open the "Escalation Panel."
