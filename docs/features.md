# MaTriX-AI: Key Features

## 🤖 1. Swarm Intelligence (Multi-Agent System)

Unlike traditional monolithic LLMs, MaTriX-AI splits cognitive load across three distinct medical personas:

- **Risk Agent:** Computes structured JSON dictionaries representing patient risk severity scores, directly from parsing clinical nuance out of unstructured text notes.
- **Guideline Agent:** Cross-references the calculated risk level with indexed WHO clinical guidelines using a Hybrid RAG Retrieval architecture.
- **Executive Agent:** Intervenes _only_ for high severity events, outputting extraction logistics and time-to-transfer recommendations.

## 📴 2. Edge-First Resilience (Zero-Internet Execution)

The cornerstone of MaTriX is its ability to run the triage logic on an offline, consumer-grade laptop.

- Utilizes **MedGemma 4B** compressed in `GGUF` format via Unsloth.
- Runs locally via `Ollama` resulting in millisecond-latency triage even when the power grids and cellular towers completely fail.

## ☁️ 3. Mathematical Cloud Escalation

Rather than sending every API call to an expensive Cloud Model, MaTriX-AI implements deterministic mathematical thresholds.

- A calculated non-linear risk score combines 6 distinct maternal vitals against standard ranges.
- Only patients scoring above `.65` (High Risk) are routed to the **AWS SageMaker MedGemma 27B** Cloud model instance.
- This hybrid setup saves an estimated 80% on cloud tokenization costs.

## 👁️ 4. Vision Diagnostics (PaliGemma 3B)

Maternal clinics generate visual diagnostic artifacts everyday.

- **PaliGemma 3B VLM** deployed via SageMaker interprets Fetal Ultrasounds or continuous CTG tracings.
- The raw text generated from the visual scan is fed natively into the Risk Agent's contextual memory, allowing it to instantly update the overall patient risk score.

## 🛡️ 5. Immutable Governance Layer & Auditability

Medical AI must not be a black box.

- `governance.py` acts as a deterministic wrapper around every single LLM output.
- Validates outputs against a strict regex blacklist (e.g., blocking any autonomous instructions regarding severe medication dosages without a doctor's signature).
- Cryptographically hashes (`SHA-256`) the context, prompt, output, and timestamp, permanently storing it in a PostgreSQL database table structure.

## 🌌 6. Spatial Editorial Interface

A premium, highly interactive dashboard built in Next.js 14.

- Employs the **"Aura & Spatial Flow"** design language, typically reserved for high-end consumer technology.
- Visualizes agentic streams dynamically—as the AI calculates, cards flip, fade, and lock into place with micro-interactions via `Framer Motion`.
