# MaTriX-AI — Maternal Triage Escalation Intelligence

> **Hybrid Edge–Cloud Multi-Agent Maternal Risk Escalation System powered by MedGemma**

A privacy-aware, offline-capable clinical AI system for maternal triage in low-resource settings.
Local clinics run the edge system (MedGemma 4B). Severe cases are escalated to a cloud-hosted 27B model
via HuggingFace Inference Endpoints on AWS for senior obstetric reasoning.

---

## 🏗 Architecture

```
Nurse → [Next.js 14 Frontend]
           ↓ JWT
       [FastAPI Edge] → [LangGraph Workflow]
                              ↓
                      [Risk Agent — MedGemma 4B]
                              ↓
                   [Guideline RAG Agent — pgvector + MedGemma 4B]
                              ↓
                       [Router — Pure Logic]
                     /              \
               Low Risk          High Risk
                  ↓                  ↓
           [Local Plan]    [Cloud FastAPI → HF Gemma-2-27B-IT]
                                       ↓
                              [Executive Agent Plan]
                                       ↓
                               [Return to Edge → Frontend]
```

## 📁 Project Structure

```
MaTriX-AI/
├── .gitignore              ← Global gitignore
├── docker-compose.yml      ← PostgreSQL + Edge + Cloud
│
├── edge/                   ← Local clinic server (MedGemma 4B)
│   ├── requirements.txt
│   ├── .env.example
│   ├── app/
│   │   ├── main.py         ← FastAPI entrypoint (CORS, JWT, startup)
│   │   ├── config.py       ← Settings (Ollama, DB, JWT, cloud URL)
│   │   ├── agents/
│   │   │   ├── risk_agent.py       ← MedGemma 4B triage
│   │   │   ├── guideline_agent.py  ← RAG + MedGemma 4B
│   │   │   └── router.py           ← Escalation rules
│   │   ├── workflow/
│   │   │   ├── state.py    ← MaternalState TypedDict
│   │   │   └── graph.py    ← LangGraph StateGraph
│   │   ├── db/
│   │   │   ├── models.py   ← ORM: Patient, Visit, Vital, Symptom, RiskOutput ...
│   │   │   ├── database.py ← Async SQLAlchemy + pgvector init
│   │   │   ├── schemas.py  ← Pydantic: CaseSubmission, CaseResult ...
│   │   │   └── crud.py     ← Async CRUD operations
│   │   ├── rag/
│   │   │   ├── embed.py    ← sentence-transformers (768-dim)
│   │   │   └── retrieve.py ← pgvector cosine similarity
│   │   ├── models/
│   │   │   └── local_llm.py ← Ollama client (JSON mode, retry)
│   │   ├── api/
│   │   │   └── routes.py   ← POST /submit_case, GET /case/{id}, GET /history
│   │   └── utils/
│   │       └── auth.py     ← JWT create/verify (python-jose)
│   └── scripts/
│       └── ingest_guidelines.py ← WHO guideline ingestion (20 chunks)
│
├── cloud/                  ← Cloud escalation service (27B via HF AWS)
│   ├── requirements.txt
│   ├── .env.example
│   └── app/
│       ├── main.py         ← FastAPI + API-key auth
│       ├── config.py       ← HF endpoint, token, model
│       ├── cloud_llm.py    ← HF Inference API client (Ollama fallback)
│       ├── executive_agent.py ← 27B senior OB/GYN prompt
│       └── db_models.py    ← cloud_cases (JSONB) table
│
└── frontend/               ← Next.js 14 + TypeScript + Tailwind + Recharts
    ├── app/
    │   ├── layout.tsx      ← Root layout (Inter font, dark theme)
    │   ├── page.tsx        ← Dashboard (intake form + results)
    │   ├── login/page.tsx  ← JWT login page
    │   ├── history/page.tsx ← Case history table
    │   └── globals.css     ← Design system (glassmorphism, badges, glows)
    ├── components/
    │   ├── IntakeForm.tsx   ← Patient form (vitals, symptoms)
    │   ├── RiskCard.tsx     ← SVG circular gauge + risk badge
    │   ├── GuidelinePanel.tsx ← WHO guideline plan display
    │   ├── EscalationBanner.tsx ← Safe/escalated dual-state banner
    │   ├── BpChart.tsx      ← Recharts BP trend (with danger lines)
    │   ├── HistoryTable.tsx ← TanStack Query history table
    │   ├── Navbar.tsx       ← Sticky nav with active route
    │   └── QueryProvider.tsx ← TanStack Query provider
    └── lib/
        └── api.ts           ← Typed axios client (JWT interceptor)
```

---

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Ollama installed locally with `medgemma:4b` pulled:
  ```bash
  ollama pull medgemma:4b
  ```
- Node.js 18+ (for frontend)

### 1. Clone & configure

```bash
git clone https://github.com/Mangalasridharan/MaTriX-AI-Maternal-Triage-Escalation-Intelligence
cd MaTriX-AI-Maternal-Triage-Escalation-Intelligence

cp edge/.env.example edge/.env
cp cloud/.env.example cloud/.env
```

Edit `edge/.env` — set `JWT_SECRET_KEY` and `CLINIC_PASSWORD`.
Edit `cloud/.env` — add `HF_INFERENCE_ENDPOINT` and `HF_API_TOKEN` (for 27B model on AWS).

### 2. Start PostgreSQL

```bash
docker-compose up postgres -d
```

### 3. Ingest WHO guidelines into pgvector

```bash
cd edge
pip install -r requirements.txt
python scripts/ingest_guidelines.py
```

### 4. Run edge API

```bash
uvicorn app.main:app --reload --port 8000
```

### 5. Run cloud API (separate terminal)

```bash
cd cloud
pip install -r requirements.txt
uvicorn app.main:app --reload --port 9000
```

### 6. Run frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000** → Login → Submit a case.

### Using Docker Compose (all services)

```bash
docker-compose up --build
```

---

## 🔐 Security

| Connection            | Method                                   |
| --------------------- | ---------------------------------------- |
| Frontend ↔ Edge API   | JWT Bearer token (8-hour session)        |
| Edge ↔ Cloud API      | `X-API-Key` header                       |
| Patient data in cloud | **Never** — only structured summary sent |
| Raw vitals            | Stay on-device (edge PostgreSQL)         |

---

## 🧠 AI Models

| Agent               | Model          | Location                    | Interface         |
| ------------------- | -------------- | --------------------------- | ----------------- |
| Risk Agent          | MedGemma 4B    | Local (each hospital)       | Ollama            |
| Guideline RAG Agent | MedGemma 4B    | Local (each hospital)       | Ollama + pgvector |
| Executive Agent     | Gemma-2-27B-IT | Cloud (HF Inference on AWS) | HF TGI API        |

---

## 📊 Database Schema

**Edge PostgreSQL** (raw clinical data):

- `patients` · `visits` · `vitals` (time-series) · `symptoms`
- `risk_outputs` · `guideline_outputs` · `escalation_logs`
- `guideline_chunks` (pgvector, 768-dim embeddings)

**Cloud PostgreSQL** (aggregate only):

- `cloud_cases` — JSONB case summary + executive plan

---

## ☁ Cloud Deployment (27B Model)

1. Deploy `google/gemma-2-27b-it` on [HuggingFace Inference Endpoints](https://ui.endpoints.huggingface.co/) → AWS region
2. Copy the endpoint URL and your HF API token into `cloud/.env`
3. Deploy the cloud FastAPI service to an EC2 or ECS instance
4. Update `CLOUD_API_URL` in `edge/.env` to point to the cloud service

---

## 🔧 Escalation Logic

The Router escalates if **any** of these are true:

- `risk_level = "severe"`
- `risk_level = "high"` AND `confidence ≥ 0.60`
- `bp_systolic ≥ 160`
- Both `headache` AND `visual_disturbance` present
- `risk_score ≥ 70`

---

_Built with ❤️ for frontline maternal healthcare workers._
