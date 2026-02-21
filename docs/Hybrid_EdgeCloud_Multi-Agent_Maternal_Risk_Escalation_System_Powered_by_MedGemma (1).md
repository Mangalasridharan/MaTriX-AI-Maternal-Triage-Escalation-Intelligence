Hybrid Edge–Cloud Multi-Agent
Maternal Risk Escalation
System Powered by
MedGemma
🧠 PROJECT TITLE
Hybrid Edge–Cloud Multi-Agent Maternal Risk Escalation System Powered by
MedGemma
🎯 SYSTEM OBJECTIVE
To provide:
Offline-capable maternal triage (edge)
Evidence-grounded stabilization guidance (edge)
Cloud-based executive escalation reasoning 27B
Structured referral and audit logging
Privacy-aware architecture
Multi-agent workflow orchestration
🏗 HIGH-LEVEL ARCHITECTURE
You have 3 main zones:
Frontend Web UI
Edge System Local clinic server)
Cloud Escalation System
🧩 OVERALL SYSTEM FLOW
1
Hybrid Edge–Cloud Multi-Agent Maternal Risk Escalation System Powered by MedGemma
flowchart LR
Nurse -->|Enter Case| Frontend
Frontend -->|POST /submit_case| EdgeAPI
EdgeAPI --> LangGraph
LangGraph --> RiskAgent
LangGraph --> GuidelineAgent
LangGraph --> Router
Router -->|Low Risk| FinalLocalPlan
Router -->|High Risk| EscalationTrigger
EscalationTrigger -->|POST Case Summary| CloudAPI
CloudAPI --> ExecutiveAgent
ExecutiveAgent -->|Return Plan| EdgeAPI
EdgeAPI --> Frontend
RiskAgent
LangGraph
Nurse
POST /submit_case
Enter Case
Frontend
EdgeAP
GuidelineAgent
Low Risk
FinalLocalPlan
Router
High Risk
Return Plan
🖥 󾠮 FRONTEND DESIGN
Stack
Next.js 14
TypeScript
TailwindCSS
TanStack Query
EscalationTrigger
POST Case Summa
CloudAP
ExecutiveAgent
2
Hybrid Edge–Cloud Multi-Agent Maternal Risk Escalation System Powered by MedGemma
Recharts BP trend graph)
Features
Patient intake form
BP trend visualization
Risk badge display
Stabilization instructions panel
Escalation status indicator
Referral summary download
Case history view
🧠 󾠯 EDGE SYSTEM DESIGN
This runs in clinic.
🔹 Components
FastAPI
LangGraph
MedGemma 1.4B INT8 CPU
PostgreSQL
pgvector
🔹 Logical Agents (Local)
Agent
Risk Agent
Guideline Agent
Router
Type
LLM 1.4B
Code
Responsibility
Risk classification + reasoning
LLM 1.4B + RAG Stabilization + WHO grounding
Decide escalation
Escalation Trigger Code
Call cloud API
3
Hybrid Edge–Cloud Multi-Agent Maternal Risk Escalation System Powered by MedGemma
�
� EDGE WORKFLOW GRAPH
flowchart TD
Intake --> RiskAgent
RiskAgent --> GuidelineAgent
GuidelineAgent --> Router
Router -->|Low Risk| LocalPlan
Router -->|High Risk| EscalationCall
Intake
RiskAgent
GuidelineAgent
Router
Low Risk
LocalPlan
High Risk
EscalationCall
☁ 󾠰 CLOUD SYSTEM DESIGN
4
Hybrid Edge–Cloud Multi-Agent Maternal Risk Escalation System Powered by MedGemma
Components
FastAPI
MedGemma 27B GPU VM
PostgreSQL (cloud)
Secure API auth
Cloud Agent
Agent
Model
Executive Agent 27B
Cloud Flow
flowchart TD
Role
Harmonized care + referral optimization
ReceiveCase --> ExecutiveAgent
ExecutiveAgent --> GeneratePlan
GeneratePlan --> ReturnResponse
ReceiveCase
ExecutiveAgent
GeneratePlan
ReturnResponse
5
Hybrid Edge–Cloud Multi-Agent Maternal Risk Escalation System Powered by MedGemma
�
� DATABASE DESIGN (EDGE)
PostgreSQL with pgvector.
📋 TABLE SCHEMA
󾠮 patients
CREATETABLE patients (
id UUIDPRIMARYKEY,
name TEXT,
ageINT,
gestational_age_weeksINT,
created_atTIMESTAMPDEFAULT NOW()
);
󾠯 visits
CREATETABLE visits (
id UUIDPRIMARYKEY,
patient_id UUIDREFERENCES patients(id),
visit_dateTIMESTAMP,
notes TEXT
);
󾠰 vitals
Time-series style.
CREATETABLE vitals (
id UUIDPRIMARYKEY,
visit_id UUIDREFERENCES visits(id),
systolicINT,
diastolicINT,
6
Hybrid Edge–Cloud Multi-Agent Maternal Risk Escalation System Powered by MedGemma
proteinuria TEXT,
heart_rateINT,
created_atTIMESTAMPDEFAULT NOW()
);
Indexed:
CREATE INDEX idx_vitals_patient_time
ON vitals(visit_id, created_at);
󾠱 symptoms
CREATETABLE symptoms (
id UUIDPRIMARYKEY,
visit_id UUIDREFERENCES visits(id),
symptom TEXT
);
󾠲 risk_outputs
CREATETABLE risk_outputs (
id UUIDPRIMARYKEY,
visit_id UUIDREFERENCES visits(id),
risk_level TEXT,
risk_scoreFLOAT,
reasoning TEXT,
confidenceFLOAT,
created_atTIMESTAMPDEFAULT NOW()
);
󾠳 guideline_outputs
CREATETABLE guideline_outputs (
id UUIDPRIMARYKEY,
visit_id UUIDREFERENCES visits(id),
7
Hybrid Edge–Cloud Multi-Agent Maternal Risk Escalation System Powered by MedGemma
stabilization_plan TEXT,
guideline_sources TEXT,
created_atTIMESTAMPDEFAULT NOW()
);
󾠴 escalation_logs
CREATETABLE escalation_logs (
id UUIDPRIMARYKEY,
visit_id UUIDREFERENCES visits(id),
escalatedBOOLEAN,
escalation_reason TEXT,
cloud_response TEXT,
created_atTIMESTAMPDEFAULT NOW()
);
🧠 VECTOR STORE (WHO GUIDELINES)
CREATETABLE guideline_embeddings (
id UUIDPRIMARYKEY,
content TEXT,
embedding VECTOR(768)
);
Using pgvector.
☁ CLOUD DATABASE SCHEMA
Cloud does not need raw vitals.
cloud_cases
CREATETABLE cloud_cases (
id UUIDPRIMARYKEY,
8
Hybrid Edge–Cloud Multi-Agent Maternal Risk Escalation System Powered by MedGemma
case_summary JSONB,
executive_plan TEXT,
created_atTIMESTAMPDEFAULT NOW()
);
🔁 API DESIGN
EDGE ENDPOINTS
POST /submit_case
Input:
{
}
"patient_id":"...",
"vitals": {...},
"symptoms": [...]
Output:
{
}
"risk_level":"...",
"stabilization_plan":"...",
"escalated":true/false
CLOUD ENDPOINT
POST /executive_escalation
Input:
{
"risk_output": {...},
"guideline_output": {...},
9
Hybrid Edge–Cloud Multi-Agent Maternal Risk Escalation System Powered by MedGemma
"case_summary": {...}
}
Output:
{
}
"executive_plan":"...",
"referral_priority":"urgent",
"justification":"..."
🔐 SECURITY DESIGN
JWT between frontend and edge
API key between edge and cloud
Only structured summary sent to cloud
Raw vitals remain local
🧠 ESCALATION LOGIC (Router)
Escalate if:
risk_level = severe
OR confidence < 0.6
OR systolic
≥
160
OR neurological symptoms present
This is pure code logic.
📦 DEPLOYMENT PLAN
Edge
Docker Compose:
10
Hybrid Edge–Cloud Multi-Agent Maternal Risk Escalation System Powered by MedGemma
FastAPI
PostgreSQL
LLM runtime
pgvector
Cloud
GPU VM
FastAPI
27B via vLLM
📊 FULL SYSTEM ARCHITECTURE
DIAGRAM
flowchart LR
subgraph Edge_System
A[Frontend]
B[FastAPI]
C[LangGraph]
D[Risk Agent - 1.4B]
E[Guideline Agent - 1.4B]
F[Router]
G[PostgreSQL]
H[pgvector]
end
subgraph Cloud_System
I[FastAPI]
J[Executive Agent - 27B]
K[Cloud DB]
end
A --> B
B --> C
11
Hybrid Edge–Cloud Multi-Agent Maternal Risk Escalation System Powered by MedGemma
C --> D
C --> E
C --> F
D --> G
E --> H
F -->|Escalate| I
I --> J
J --> K
J --> B
Edge_System
LangGraph
Frontend
FastAP
Cloud_System
FastAP
Executive Agent - 27B
Router
Escalate
Cloud DB
Risk Agent - 1.4B
Guideline Agent - 1.4B
PostgreSQ
pgvector
12
Hybrid Edge–Cloud Multi-Agent Maternal Risk Escalation System Powered by MedGemmaS
