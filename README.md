# MaTriX-AI: 4-Agent Multimodal Maternal Swarm

Hybrid Edge–Cloud Triage System (PaliGemma + MedGemma)

## Quick Start (Windows)

If you are on Windows, simply run **`run_matrix.bat`** from the root directory. It will handle environment setup, dependencies, Docker, seeding, and launch all services in separate windows for you.

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

# Recommended: 4-bit quantization for RTX 3050 and other consumer GPUs
LOCAL_MODEL=hf.co/unsloth/medgemma-1.5-4b-it-GGUF:Q4_K_M

LOCAL_LLM_CONTEXT=4096
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

# AWS SageMaker (Primary)
SAGEMAKER_ENDPOINT_NAME=your-endpoint-name
AWS_REGION=us-east-1

# HuggingFace (Alternative)
HF_INFERENCE_ENDPOINT=
HF_API_TOKEN=
HF_MODEL_ID=google/medgemma-27b-it

# Ollama fallback
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
   Make sure Ollama is open. Pull the optimized model:
   ```bash
   ollama pull hf.co/unsloth/medgemma-1.5-4b-it-GGUF:Q4_K_M
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
