# Architecture & Tech Stack

MaTriX-AI employs a Hybrid Edge-Cloud Multi-Agent architecture. It is designed to compute base triage reliably local at the edge, while reserving expensive, high-parameter inference for cloud escalation.

## 1. Frontend: The Clinical Interface

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Custom "Aura & Ink" Spatial Editorial design)
- **Icons:** Lucide React
- **Data Fetching:** TanStack Query (React Query) + Axios
- **Charts:** Recharts

## 2. Edge Node: The Offline Agent

Runs on a local machine within the clinic.

- **Framework:** FastAPI (Python 3.13)
- **Database:** PostgreSQL with `pgvector` extension
- **Workflow Engine:** LangGraph (StateGraph)
- **Local LLM Runner:** Ollama
- **Local Model:** `medgemma:4b` (optimized at Q4_K_M for consumer GPUs)
- **Embedding Model:** `all-mpnet-base-v2`
- **Authentication:** `bcrypt` for password hashing, `PyJWT` for token generation.

## 3. Cloud Node: The Executive Agent

Dynamically triggered only when a case breaches severity thresholds.

- **Framework:** FastAPI
- **Inference Hardware:** **AWS SageMaker** (Direct Boto3 integration) or **HuggingFace Inference Endpoints**
- **Cloud Model:** `google/medgemma-27b-it`
- **Routing Logic:** Evaluates full edge context to generate referral, transport, and receiving-facility requirements.

---

## Data Flow Diagram

1. User submits vitals/symptoms on Frontend.
2. Frontend `POST` to Edge API.
3. Edge executes **Agentic Swarm** (LangGraph):
   - **Risk Agent:** Initial analysis.
   - **Guideline Agent:** RAG retrieval from `pgvector`.
   - **Critique Agent:** Self-correction and safety audit of care plans.
   - **Router:** Decides if cloud escalation is mandatory.
4. _If Escalated:_ Edge calls Cloud API (SageMaker/HF) for `MedGemma 27B` synthesis.
5. Frontend displays real-time execution via the **Swarm Visualizer** before showing final care plans.
