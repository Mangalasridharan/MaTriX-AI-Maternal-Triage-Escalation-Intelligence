# MaTriX-AI Setup & Operations Guide

This guide will walk you through starting the multi-agent maternal triage system locally. Ensure you have Node.js and Python 3.13 installed.

## Prerequisites

1. **Docker Desktop** (To run PostgreSQL with pgvector natively).
2. **Ollama** installed on your host machine to run the local `medgemma:4b` edge node.
3. **Python 3.13**.
4. **Node.js 18+**.

## 1. Environment Configuration

### Edge Environment (`edge/.env`)

Create an `.env` file in the `edge` folder:

```
DATABASE_URL=postgresql+asyncpg://matrix:matrix@localhost:5432/matrixdb
OLLAMA_BASE_URL=http://localhost:11434
LOCAL_MODEL=medgemma:4b
EMBEDDING_MODEL=all-mpnet-base-v2
CLOUD_API_URL=http://localhost:9000
CLOUD_API_KEY=matrix_cloud_dev_secret_key
JWT_SECRET_KEY=generate_a_secure_jwt_key
JWT_ALGORITHM=HS256
CLINIC_PASSWORD=demo1234
```

### Cloud Environment (`cloud/.env`)

Create an `.env` file in the `cloud` folder:

```
CLOUD_API_KEY=matrix_cloud_dev_secret_key
HF_INFERENCE_ENDPOINT=
HF_API_TOKEN=
HF_MODEL_ID=google/gemma-2-27b-it
OLLAMA_BASE_URL=http://localhost:11434
CLOUD_MODEL=llama3:latest
DEBUG=True
```

### Frontend Environment (`frontend/.env.local`)

Create an `.env.local` file in the `frontend` folder:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 2. Infrastructure Setup

You must boot the database and the local LLM first.

1. **Start the Database:**
   ```bash
   docker-compose up -d
   ```
2. **Start the Local LLM:**
   Make sure Ollama is open. Pull the base model if needed:
   ```bash
   ollama pull medgemma:4b
   ```

---

## 3. Database Ingestion & Seeding

In a new terminal wrapper, initialize the Edge environment:

```bash
cd edge
py -3.13 -m venv venv
.\venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

Load the sample WHO guidelines into vector space, and seed the demo login:

```bash
python scripts/ingest_guidelines.py
python scripts/seed_demo.py
```

---

## 4. Run the Stack (3 Terminals Required)

### Terminal 1: Cloud API (Escalation Node)

```bash
cd cloud
py -3.13 -m venv venv
.\venv\Scripts\activate  # Windows
pip install -r requirements.txt
python -m uvicorn app.main:app --port 9000 --reload
```

### Terminal 2: Edge API (Local Node)

```bash
cd edge
.\venv\Scripts\activate  # Assuming already built
python -m uvicorn app.main:app --port 8000 --reload
```

### Terminal 3: Next.js Frontend

```bash
cd frontend
npm install
npm run dev
```

## 5. Usage

- Navigate to `http://localhost:3000`.
- Click "Judge/Demo Access" or sign in with the username **`demo`** and password **`demo1234`**.
- The system will triage cases offline via port 8000 and automatically call port 9000 if severe criteria are met.
