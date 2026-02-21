# MaTriX-AI Features

## 1. Offline-First Edge Triage

The system executes primary maternal triage completely offline using a local **MedGemma 4B** model running via Ollama. This ensures that resource-constrained clinics with unstable internet can still receive instant (<2 seconds) risk assessments for symptoms like hemorrhage, sepsis, or preeclampsia.

## 2. Guideline-Rooted RAG

To prevent AI hallucinations, triage decisions are cross-referenced against a local `pgvector` database. This database stores chunked embeddings of **WHO, NICE, and RCOG** maternal health guidelines. The AI is forced to cite exact protocols for stabilization and drug administration (e.g., Magnesium Sulfate regimens).

## 3. Intelligent Cloud Escalation

If the edge node detects a critical severity score, the system asynchronously dispatches the patient state to the **Cloud API**. The cloud layer utilizes a heavier **Gemma-2-27B** parameter model to synthesize an executive care plan, referral priority, and transit instructions.

## 4. Immersive "Spatial Editorial" UI

Replaced traditional, dense medical forms with a modern, high-contrast, "Aura & Ink" design. It features:

- A "Floating Dock" navigation system.
- "Typeform-style" single-question step wizards to reduce cognitive load during emergencies.
- Ambient contextual background glows (e.g., pulsing red for critical warnings).

## 5. Temporal Case History

A longitudinal timeline feed inspired by Apple Health, allowing clinicians to review historical visits, monitor blood pressure trends visually via Recharts, and track escalation rates over time.

## 6. Secure JWT Authentication

Role-based JWT architecture allowing nurses and administrators to securely log cases to the edge system, while the Edge system securely authenticates with the Cloud API using a server-side API Key.
