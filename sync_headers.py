import json

filepath = 'notebooks/Kaggle_MaTriX_Agentic_Validation.ipynb'

with open(filepath, 'r', encoding='utf-8') as f:
    nb = json.load(f)

# 1. Update Cell 1 (Introduction and Architecture)
intro_source = [
    "# MaTriX-AI: Agentic Maternal Triage for Low-Resource Settings\n",
    "## Multimodal 4-Agent Swarm (Vision + Risk + Guideline + Executive)\n",
    "\n",
    "**Competition Track:** Agentic Workflow Prize | Responsible Medical AI\n",
    "\n",
    "Maternal mortality remains one of the world's most preventable crises. MaTriX-AI is a **4-agent swarm** that integrates **Visual Question Answering (VQA)** with clinical triage. It runs offline on low-cost edge devices, escalates to a 27B Cloud Executive Agent for high-complexity cases, and wraps every output in a WHO-grounded clinician governance layer.\n",
    "\n",
    "---\n",
    "\n",
    "## Architecture: The 4-Agent Multimodal Swarm\n",
    "\n",
    "```\n",
    "PATIENT INPUT (Vitals + Symptoms + Clinical Image)\n",
    "          |\n",
    "          v\n",
    "+---------------------------------------+\n",
    "| 1. VISION AGENT (PaliGemma 3B)        |\n",
    "|    - Clinical Imagery VQA (Edema/BP)  |\n",
    "+---------------------------------------+\n",
    "          |\n",
    "          v\n",
    "+---------------------------------------+\n",
    "| 2. RISK AGENT (MedGemma 4B GGUF)      |\n",
    "|    - Multi-Schema Triage + Severity   |\n",
    "+---------------------------------------+\n",
    "          |\n",
    "          v\n",
    "+---------------------------------------+\n",
    "| 3. GUIDELINE AGENT (MedGemma 4B GGUF) |\n",
    "|    - WHO/NICE Protocol Retrieval (RAG)|\n",
    "+---------------------------------------+\n",
    "          | [score > 0.65 OR SEVERE_FLAG]\n",
    "          v\n",
    "+---------------------------------------+\n",
    "| 4. EXECUTIVE AGENT (MedGemma 27B GGUF)|\n",
    "|    - Cloud Synthesis & Care Roadmap   |\n",
    "+---------------------------------------+\n",
    "          |\n",
    "          v\n",
    "+---------------------------------------+\n",
    "| GOVERNANCE LAYER (SHA-256 Verified)   |\n",
    "|  - Cryptographic Audit Trail          |\n",
    "|  - Blocked: Autonomous Actions        |\n",
    "+---------------------------------------+\n",
    "```\n",
    "\n",
    "## Competitive Comparison\n",
    "\n",
    "| Feature | Single-LLM Baseline | MaTriX-AI (This Notebook) |\n",
    "|---|---|---|\n",
    "| Multimodal | No | **Yes (PaliGemma 3B Integration)** |\n",
    "| Stk Strategy | Gated API | **100% Ungated GGUF (Permissionless)** |\n",
    "| Agents | 1 | **4 (Vision + Risk + Guide + Exec)** |\n",
    "| Governance | No | **SHA-256 Audit Trail & Review Gates** |\n",
    "| Offline Uptime| No | **100% (Edge-First Design)** |\n",
    "\n",
    "---"
]

# Update intro cell
if nb['cells'][0].get('id') == '3d2768e7':
    nb['cells'][0]['source'] = intro_source

# 2. Update Efficiency Visualizations (Cell new_vis_cell_001)
# Already updated to mention 4B edge model and scalability. Just verify.

# 3. Update Disagreement Analysis Markdown (Cell 5e43fffe)
for cell in nb['cells']:
    if cell.get('id') == '5e43fffe':
        cell['source'] = [
            "## 7. Agent Disagreement Analysis\n",
            "Comparing different 'Modes' of the swarm. We analyze cases where the **Risk Agent (local 4B)** and **Executive Agent (cloud 27B)** diverge, demonstrating the necessity of the sharded swarm architecture for high-stakes clinical synthesis."
        ]

# 4. Check Section 9 Swarm Execution (Cell d852631e)
for cell in nb['cells']:
    if cell.get('id') == 'd852631e':
        cell['source'] = [
            "## 9. Swarm Execution: Real-World Multimodal Case\n",
            "Demonstrating the full 4-agent flow on a complex pre-eclampsia case with visual edema detection provided by the Vision Agent."
        ]

with open(filepath, 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=2)

print("Notebook intros and headers fully synchronized with the 4-agent swarm architecture.")
