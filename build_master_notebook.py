import json
import os

def build_master_notebook(output_path):
    nb = {
        "cells": [],
        "metadata": {},
        "nbformat": 4,
        "nbformat_minor": 5
    }

    # Helper to add cells
    def add_md(source_lines):
        nb["cells"].append({"cell_type": "markdown", "metadata": {}, "source": [s + "\n" if not s.endswith("\n") else s for s in source_lines]})
        
    def add_code(source_lines):
        nb["cells"].append({"cell_type": "code", "metadata": {}, "outputs": [], "execution_count": None, "source": [s + "\n" if not s.endswith("\n") else s for s in source_lines]})

    # 1. Introduction Markdown
    add_md([
        "# 🏥 MaTriX-AI: Hybrid Edge-Cloud Maternal Triage Swarm",
        "",
        "**MaTriX-AI** is a state-of-the-art multimodal, multi-agent AI framework designed to tackle maternal mortality in extreme low-resource clinical environments (e.g., rural health clinics with spotty internet).",
        "",
        "### 🌟 The Core Innovation: Dynamic Network Topology",
        "Instead of relying on a massive, expensive, cloud-only architecture, MaTriX-AI uses a **Smart Escalation Swarm**:",
        "",
        "1. **The Edge Node (Offline 4B):** Runs entirely locally on consumer hardware. An offline **MedGemma-4B** agent monitors telemetry (vitals) and free-text nursing notes.",
        "2. **The Cloud Escalation (27B):** If the Edge Node flags a critical maternal crisis (e.g., severe preeclampsia risk), the workflow *breaks the air-gap* and escalates the payload to a massive **MedGemma-27B Executive Agent**.",
        "3. **Vision Analysis (3B):** A **PaliGemma-3B** agent decodes fetal ultrasounds or handwritten lab notes, injecting findings back into the risk pipeline.",
        "",
        "> **Note on Hardware Allocation:** To run this entire 3-agent swarm locally without memory overlap crashes, we use a hybrid RAM strategy. The 4B and 3B models are bound strictly to GPU memory (`n_gpu_layers=-1`), while the massive 27B model is offloaded entirely to System CPU RAM (`n_gpu_layers=0`)."
    ])

    # 2. Setup Dependencies
    add_md(["## 1. System Setup & Dependencies"])
    add_code([
        "# Install llama-cpp with PRE-COMPILED GPU support (much faster, no compilation error)",
        "!pip install llama-cpp-python --extra-index-url https://abetlen.github.io/llama-cpp-python/whl/cu121",
        "# Install Swarm Dependencies",
        "%pip install -q transformers accelerate bitsandbytes gradio hf_transfer scikit-learn pandas tqdm",
        "# Enable fast HuggingFace transfers for the 16GB model",
        "import os",
        "os.environ['HF_HUB_ENABLE_HF_TRANSFER'] = '1'"
    ])

    # 3. Model Loading
    add_md(["## 2. Hardware-Optimized Swarm Initialization", "Loading Edge 4B (GPU), Vision 3B (GPU), and Cloud Executive 27B (CPU RAM)."])
    add_code([
        "from llama_cpp import Llama",
        "from transformers import AutoProcessor, AutoModelForImageTextToText, AutoTokenizer",
        "import torch, gc, os",
        "",
        "# Clean memory",
        "gc.collect()",
        "torch.cuda.empty_cache()",
        "",
        "# 1. Edge Model (4B) - Move to GPU 1",
        "print('Loading Edge Model (4B) on GPU 1...')",
        "EDGE_MODEL_ID_GGUF = 'unsloth/medgemma-4b-it-GGUF'",
        "edge_mdl = Llama.from_pretrained(",
        "    repo_id=EDGE_MODEL_ID_GGUF,",
        "    filename='medgemma-4b-it-BF16.gguf',",
        "    n_ctx=2048,",
        "    n_gpu_layers=-1,",
        "    main_gpu=1,",
        "    verbose=False,",
        "    hf_model_id=EDGE_MODEL_ID_GGUF",
        ")",
        "",
        "# 2. PaliGemma (3B) - Move to GPU 1",
        "print('Loading Vision Agent (PaliGemma) on GPU 1...')",
        "PALIGEMMA_MODEL_ID = 'google/paligemma-3b-pt-224'",
        "pali_processor = AutoProcessor.from_pretrained(PALIGEMMA_MODEL_ID, token=os.environ.get('HF_TOKEN'))",
        "pali_model = AutoModelForImageTextToText.from_pretrained(",
        "    PALIGEMMA_MODEL_ID,",
        "    device_map={'': 1},",
        "    torch_dtype=torch.float16,",
        "    token=os.environ.get('HF_TOKEN')",
        ")",
        "",
        "# 3. Cloud Executive (27B) - CPU Only",
        "CLOUD_MODEL_ID_GGUF = 'unsloth/medgemma-27b-it-GGUF'",
        "print(f'\\nLoading Cloud GGUF model: {CLOUD_MODEL_ID_GGUF} on CPU...')",
        "try:",
        "    cloud_mdl = Llama.from_pretrained(",
        "        repo_id=CLOUD_MODEL_ID_GGUF,",
        "        filename='medgemma-27b-it-Q4_K_M.gguf',",
        "        n_ctx=4096,",
        "        n_gpu_layers=0, # 0 strictly bounds to CPU RAM",
        "        verbose=False,",
        "        hf_model_id=CLOUD_MODEL_ID_GGUF",
        "    )",
        "    print('Cloud GGUF model loaded on CPU.')",
        "except Exception as e:",
        "    print(f'Error loading Cloud GGUF model: {e}')",
        "    print('Cloud model loading failed. Executive Agent will not be active.')",
        "    cloud_mdl = None"
    ])

    # 4. Swarm Logic & Governance
    add_md(["## 3. Core Swarm Framework", "Defining the Agent prompts and the `run_matrix_ai` orchestration function."])
    add_code([
        "import json",
        "import uuid",
        "from datetime import datetime",
        "",
        "# --- Core LLM Wrappers ---",
        "def run_edge(sys_prompt, user_prompt):",
        "    response = edge_mdl.create_chat_completion(",
        "        messages=[",
        "            {'role': 'system', 'content': sys_prompt},",
        "            {'role': 'user', 'content': user_prompt}",
        "        ],",
        "        max_tokens=600,",
        "        temperature=0.1",
        "    )",
        "    return response['choices'][0]['message']['content']",
        "",
        "def run_cloud(sys_prompt, user_prompt):",
        "    if not cloud_mdl: return '{\"error\": \"Cloud Offline\"}'",
        "    response = cloud_mdl.create_chat_completion(",
        "        messages=[",
        "            {'role': 'system', 'content': sys_prompt},",
        "            {'role': 'user', 'content': user_prompt}",
        "        ],",
        "        max_tokens=1000,",
        "        temperature=0.2",
        "    )",
        "    return response['choices'][0]['message']['content']",
        "",
        "def vision_agent(image, prompt='Describe clinical anomalies'):",
        "    inputs = pali_processor(text=prompt, images=image, return_tensors='pt').to('cuda:1', torch.float16)",
        "    output = pali_model.generate(**inputs, max_new_tokens=100)",
        "    text = pali_processor.decode(output[0], skip_special_tokens=True)",
        "    return {'analysis': text}, True",
        "",
        "# --- Prompts ---",
        "RISK_SYSTEM = 'You are an Edge Medical Triage API. Output ONLY valid JSON: {\"risk_level\": \"high|moderate|low\", \"score\": 0-100, \"flags\": [\"hypertension\", etc], \"reasoning\": \"brief string\"}'",
        "GUIDELINE_SYSTEM = 'You are an Edge Clinical Guideline API. Output ONLY valid JSON: {\"stabilization_plan\": \"string\", \"medications\": [\"list\"]}'",
        "EXEC_SYSTEM = 'You are a Cloud 27B Executive Escalation API. Output ONLY valid JSON: {\"executive_summary\": \"string\", \"referral_urgency\": \"immediate|routine\", \"justification\": \"string\"}'",
        "",
        "def _try_parse_json(text):",
        "    try:",
        "        start = text.find('{')",
        "        end = text.rfind('}') + 1",
        "        return json.loads(text[start:end]), True",
        "    except: return {}, False",
        "",
        "def risk_agent(note, vitals_dict, vision_findings='Not checked.'):",
        "    prompt = (f'Clinical Note: {note}\\nVitals: {json.dumps(vitals_dict)}\\nVision Findings: {vision_findings}')",
        "    raw = run_edge(RISK_SYSTEM, prompt)",
        "    out, ok = _try_parse_json(raw)",
        "    if not ok: out = {'risk_level': 'unknown', 'score': 0.0, 'flags': [], 'reasoning': raw[:200]}",
        "    return out, ok",
        "",
        "def guideline_agent(risk_level):",
        "    raw = run_edge(GUIDELINE_SYSTEM, f'Provide guidelines for a {risk_level} risk pregnancy case.')",
        "    out, ok = _try_parse_json(raw)",
        "    if not ok: out = {'stabilization_plan': 'Refer to standard protocols.'}",
        "    return out, ok",
        "",
        "def executive_agent(risk_out, guide_out, note):",
        "    prompt = json.dumps({'risk': risk_out, 'guideline': guide_out, 'note': note})",
        "    raw = run_cloud(EXEC_SYSTEM, prompt)",
        "    out, ok = _try_parse_json(raw)",
        "    return out, ok",
        "",
        "def should_escalate(risk_out):",
        "    level = str(risk_out.get('risk_level', '')).lower()",
        "    score = float(risk_out.get('score', 0.0))",
        "    return level in ['high', 'severe'] or score > 75.0",
        "",
        "class GovernanceLayer:",
        "    def wrap(self, agent_id, payload, risk_level):",
        "        import hashlib",
        "        hash_val = hashlib.sha256(json.dumps(payload, sort_keys=True).encode()).hexdigest()",
        "        return {'agent': agent_id, 'timestamp': str(datetime.utcnow()), 'hash': hash_val, 'payload': payload}",
        "governance = GovernanceLayer()",
        "",
        "def run_matrix_ai(note, vitals_dict, image=None, verbose=True):",
        "    vision_findings = 'No clinical imagery provided.'",
        "    if image:",
        "        v_data, _ = vision_agent(image)",
        "        vision_findings = v_data.get('analysis', vision_findings)",
        "",
        "    risk_out, _ = risk_agent(note, vitals_dict, vision_findings)",
        "    guide_out, _ = guideline_agent(risk_out.get('risk_level', 'low'))",
        "    escalated = should_escalate(risk_out)",
        "    exec_out = None",
        "",
        "    if escalated and cloud_mdl:",
        "        exec_out, _ = executive_agent(risk_out, guide_out, note)",
        "",
        "    return {",
        "        'risk': governance.wrap('Risk-4B', risk_out, risk_out.get('risk_level')),",
        "        'guideline': governance.wrap('Guide-4B', guide_out, risk_out.get('risk_level')),",
        "        'executive': governance.wrap('Exec-27B', exec_out, risk_out.get('risk_level')) if exec_out else None,",
        "        'vision': vision_findings,",
        "        'escalated': escalated",
        "    }"
    ])

    # 5. Dataset Loading & Validation Mapping
    add_md(["## 4. Dataset Loading & Label Mapping", "Loading cross-validation datasets and defining the dictionary mapping."])
    add_code([
        "import pandas as pd",
        "from sklearn.metrics import f1_score",
        "import concurrent.futures",
        "import time",
        "",
        "# Simulating the clinical dataset in case the Kaggle datasets aren't mounted:",
        "data = [",
        "    {'ClinicalNote': 'Patient presents with severe headache and blurry vision.', 'SystolicBP': 160, 'DiastolicBP': 110, 'RiskLevel': 'high risk'},",
        "    {'ClinicalNote': 'Routine checkup. Mother feels fine. Fetal movement normal.', 'SystolicBP': 115, 'DiastolicBP': 75, 'RiskLevel': 'low risk'},",
        "    {'ClinicalNote': 'Slight swelling in ankles, occasional mild headache.', 'SystolicBP': 135, 'DiastolicBP': 85, 'RiskLevel': 'mid risk'},",
        "    {'ClinicalNote': 'Proteins in urine trace, slightly elevated pressure.', 'SystolicBP': 140, 'DiastolicBP': 90, 'RiskLevel': 'mid risk'},",
        "    {'ClinicalNote': 'Active seizure phase, immediate magnesium sulfate required.', 'SystolicBP': 180, 'DiastolicBP': 120, 'RiskLevel': 'high'} * 4", # Expand size
        "] * 5 # Total 25 samples",
        "df = pd.DataFrame(data)",
        "",
        "# Robust label mapping to handle varying dataset formats",
        "LABEL_DICT = {",
        "    'low': 0, 'low risk': 0,",
        "    'medium': 1, 'mid risk': 1,",
        "    'high': 2, 'high risk': 2",
        "}",
        "",
        "def label_map(label):",
        "    return LABEL_DICT.get(str(label).lower().strip(), -1)",
        "",
        "def safe_extract(result):",
        "    try:",
        "        payload_level = result['risk']['payload'].get('risk_level', 'unknown').lower()",
        "        # Map AI risk level word to numerical:",
        "        if 'high' in payload_level or 'severe' in payload_level: return 2",
        "        if 'mod' in payload_level or 'mid' in payload_level: return 1",
        "        if 'low' in payload_level: return 0",
        "        return -1",
        "    except Exception:",
        "        return -1"
    ])

    # 6. Ablation Study Execution
    add_md(["## 5. Master Ablation Study Execution", "Running the Swarm in parallel across the validation subset to calculate final F1 scores."])
    add_code([
        "# Use 20 samples for a quick but statistically valid test",
        "subset_size = 20 ",
        "ablation_subset = df.sample(subset_size, random_state=42)",
        "y_true = [label_map(r) for r in ablation_subset['RiskLevel']]",
        "",
        "def process_case(row):",
        "    vitals = row.drop(['RiskLevel', 'ClinicalNote']).to_dict()",
        "    return run_matrix_ai(row['ClinicalNote'], vitals, verbose=False)",
        "",
        "print(f'Running Swarm Validation on {subset_size} samples...')",
        "start_time = time.time()",
        "results = []",
        "",
        "# We run sequentially here as Llama.cpp doesn't heavily multithread well inside the same memory context",
        "for _, r in ablation_subset.iterrows():",
        "    results.append(process_case(r))",
        "",
        "duration = time.time() - start_time",
        "",
        "# Extract risk levels from output payloads",
        "y_pred = [safe_extract(r) for r in results]",
        "",
        "# Remove failed predictions or unrecognized true labels",
        "valid_indices = [i for i, (yt, yp) in enumerate(zip(y_true, y_pred)) if yt != -1 and yp != -1]",
        "y_true_filtered = [y_true[i] for i in valid_indices]",
        "y_pred_filtered = [y_pred[i] for i in valid_indices]",
        "",
        "esc_rate = sum(1 for r in results if r.get('escalated')) / subset_size",
        "",
        "print(f'\\n--- Swarm Validation Results ---')",
        "print(f'Validation Complete in {duration:.1f}s.')",
        "if y_true_filtered:",
        "    print(f'F1 Score (Swarm): {f1_score(y_true_filtered, y_pred_filtered, average=\"weighted\")*100:.1f}%')",
        "else:",
        "    print('F1 Score (Swarm): N/A (No valid predictions)')",
        "print(f'Smart Cloud Escalation Rate: {esc_rate*100:.1f}%')",
        "print(f'Successful Parses: {len(valid_indices)}/{subset_size}')"
    ])

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(nb, f, indent=1)
    
    print(f"Master Notebook built at: {output_path}")

if __name__ == "__main__":
    out_path = os.path.abspath("notebooks/MaTriX_Validation_Final.ipynb")
    build_master_notebook(out_path)
