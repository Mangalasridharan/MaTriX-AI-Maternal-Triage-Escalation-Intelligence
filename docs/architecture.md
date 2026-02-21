# Architecture & Tech Stack

MaTriX-AI employs a Hybrid Edge-Cloud Multi-Agent architecture. It is designed to compute base triage reliably local at the edge, while reserving expensive, high-parameter inference for cloud escalation.

## 1. Frontend: The Clinical Interface

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Custom "Aura & Ink" Spatial Editorial design)
- **Icons:** Lucide React
- **Data Fetching:** Axios with HTTP interceptors for JWT injection
- **Charts:** Recharts

## 2. Edge Node: The Offline Agent

Runs on a local machine within the clinic.

- **Framework:** FastAPI (Python 3.13)
- **Database:** PostgreSQL with `pgvector` extension (asyncpg / psycopg driver)
- **ORM:** SQLAlchemy (Async)
- **Local LLM Runner:** Ollama
- **Local Model:** `medgemma:4b`
- **Embedding Model:** `all-mpnet-base-v2` (SentenceTransformers)
- **Authentication:** `bcrypt` for password hashing, `PyJWT` for token generation.

## 3. Cloud Node: The Executive Agent

Dynamically triggered only when a case breaches severity thresholds.

- **Framework:** FastAPI
- **Inference Hardware:** AWS / HuggingFace Inference Endpoints
- **Cloud Model:** `google/gemma-2-27b-it` (or Ollama fallback for dev)
- **Routing Logic:** Evaluates full edge context to generate referral, transport, and receiving-facility requirements.

---

## Data Flow Diagram

1. User submits vitals/symptoms on Frontend.
2. Frontend `POST` to Edge API.
3. Edge embeds text and queries `pgvector` for WHO guidelines.
4. Edge prompts local `MedGemma 4B` with patient data + guidelines.
5. Edge returns initial Triage plan.
6. _If Critical:_ Edge makes async request to Cloud API (`Gemma-2-27b`).
7. Cloud API returns Executive Care and Transit plan back to Frontend.
