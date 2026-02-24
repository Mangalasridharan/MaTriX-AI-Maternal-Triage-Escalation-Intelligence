import json
import os

def update_notebook(notebook_path):
    with open(notebook_path, 'r', encoding='utf-8') as f:
        nb = json.load(f)

    # 1. Update the setup cell (typically %pip install)
    setup_code = [
        "# Install llama-cpp with PRE-COMPILED GPU support (much faster, no compilation error)\n",
        "!pip install llama-cpp-python --extra-index-url https://abetlen.github.io/llama-cpp-python/whl/cu121\n",
        "# Install Swarm Dependencies\n",
        "%pip install -q transformers accelerate bitsandbytes gradio hf_transfer\n",
        "# Enable fast HuggingFace transfers for the 16GB model\n",
        "import os\n",
        "os.environ[\"HF_HUB_ENABLE_HF_TRANSFER\"] = \"1\"\n"
    ]
    
    # 2. Update the model loading cell (look for EDGE_MODEL_ID_GGUF or similar)
    model_loading_code = [
        "from llama_cpp import Llama\n",
        "from transformers import AutoProcessor, AutoModelForImageTextToText, AutoTokenizer\n",
        "import torch, gc, os\n",
        "\n",
        "# Clean memory\n",
        "gc.collect()\n",
        "torch.cuda.empty_cache()\n",
        "\n",
        "# 1. Edge Model (4B) - Move to GPU 1\n",
        "print(\"Loading Edge Model (4B) on GPU 1...\")\n",
        "EDGE_MODEL_ID_GGUF = \"unsloth/medgemma-4b-it-GGUF\"\n",
        "edge_mdl = Llama.from_pretrained(\n",
        "    repo_id=EDGE_MODEL_ID_GGUF,\n",
        "    filename=\"medgemma-4b-it-BF16.gguf\",\n",
        "    n_ctx=2048,\n",
        "    n_gpu_layers=-1,\n",
        "    main_gpu=1,\n",
        "    verbose=False,\n",
        "    hf_model_id=EDGE_MODEL_ID_GGUF\n",
        ")\n",
        "\n",
        "# 2. PaliGemma (3B) - Move to GPU 1\n",
        "print(\"Loading Vision Agent (PaliGemma) on GPU 1...\")\n",
        "PALIGEMMA_MODEL_ID = \"google/paligemma-3b-pt-224\"\n",
        "pali_processor = AutoProcessor.from_pretrained(PALIGEMMA_MODEL_ID, token=os.environ.get('HF_TOKEN'))\n",
        "pali_model = AutoModelForImageTextToText.from_pretrained(\n",
        "    PALIGEMMA_MODEL_ID,\n",
        "    device_map={\"\": 1}, \n",
        "    torch_dtype=torch.float16,\n",
        "    token=os.environ.get('HF_TOKEN')\n",
        ")\n",
        "\n",
        "# 3. Cloud Executive (27B) - CPU Only\n",
        "CLOUD_MODEL_ID_GGUF = \"unsloth/medgemma-27b-it-GGUF\"\n",
        "print(f\"\\nLoading Cloud GGUF model: {CLOUD_MODEL_ID_GGUF} on CPU...\")\n",
        "CLOUD_MODEL_ID = \"google/medgemma-27b-it\"\n",
        "try:\n",
        "    cloud_mdl = Llama.from_pretrained(\n",
        "        repo_id=CLOUD_MODEL_ID_GGUF,\n",
        "        filename=\"medgemma-27b-it-Q4_K_M.gguf\",\n",
        "        n_ctx=4096,\n",
        "        n_gpu_layers=0, # 0 strictly bounds to CPU RAM\n",
        "        verbose=False,\n",
        "        hf_model_id=CLOUD_MODEL_ID_GGUF\n",
        "    )\n",
        "    cloud_tok = AutoTokenizer.from_pretrained(\n",
        "        CLOUD_MODEL_ID,\n",
        "        token=os.environ.get('HF_TOKEN')\n",
        "    )\n",
        "    print(\"Cloud GGUF model loaded on CPU.\")\n",
        "except Exception as e:\n",
        "    print(f\"Error loading Cloud GGUF model: {e}\")\n",
        "    print(\"Cloud model loading failed. Executive Agent will not be active.\")\n",
        "    cloud_mdl = None\n",
        "    cloud_tok = None\n",
        "\n",
        "print(\"\\nModel loading setup complete for Edge (GGUF), PaliGemma (HF), and Cloud (GGUF).\")\n",
        "\n",
        "print(\"\\nCloud model (27B) status:\")\n",
        "if cloud_mdl:\n",
        "    print(\"  Cloud model is loaded and ready.\")\n",
        "else:\n",
        "    print(\"  Cloud model failed to load or is not available. Executive Agent will remain inactive.\")\n"
    ]

    # 3. Update risk_agent and run_matrix_ai (look for definition)
    swarm_logic_code = [
        "def risk_agent(note, vitals_dict, vision_findings=\"Not checked.\"):\n",
        "    \"\"\"Synced with Website: Includes vision findings in the clinical prompt.\"\"\"\n",
        "    prompt = (f\"Clinical Note: {note}\\n\"\n",
        "              f\"Vitals: {json.dumps(vitals_dict)}\\n\"\n",
        "              f\"Vision Findings: {vision_findings}\")\n",
        "    \n",
        "    raw = run_edge(RISK_SYSTEM, prompt)\n",
        "    out, ok = _try_parse_json(raw)\n",
        "    \n",
        "    if not ok:\n",
        "        out = {\"risk_level\": \"unknown\", \"score\": 0.0, \"flags\": {}, \"reasoning\": raw[:200]}\n",
        "    return out, ok\n",
        "\n",
        "def run_matrix_ai(note, vitals_dict, image=None, verbose=True):\n",
        "    \"\"\"Run the complete 3-agent swarm with Vision-to-Risk synchronization.\"\"\"\n",
        "    vision_findings = \"No clinical imagery provided.\"\n",
        "    \n",
        "    # Stage 0: Vision Analysis\n",
        "    if image:\n",
        "        if verbose: print(\"[VISION 3B] Analyzing imagery...\")\n",
        "        v_data, _ = vision_agent(image, prompt=\"Describe clinical anomalies.\")\n",
        "        vision_findings = v_data.get('analysis', vision_findings)\n",
        "\n",
        "    # Stage 1: Risk Assessment (Synced)\n",
        "    if verbose: print(\"[EDGE 4B] Risk Agent running (w/ Vision context)...\")\n",
        "    risk_out, _ = risk_agent(note, vitals_dict, vision_findings)\n",
        "    \n",
        "    # Stage 2: Guidelines\n",
        "    if verbose: print(\"[EDGE 4B] Guideline Agent cross-referencing...\")\n",
        "    guide_out, _ = guideline_agent(risk_out.get(\"risk_level\", \"low\"))\n",
        "    \n",
        "    # Stage 3: Escalation\n",
        "    escalated = should_escalate(risk_out)\n",
        "    exec_out = None\n",
        "    if escalated and cloud_mdl:\n",
        "        if verbose: print(\"[CLOUD 27B] Executive Agent activated...\")\n",
        "        exec_out, _ = executive_agent(risk_out, guide_out, note)\n",
        "        \n",
        "    return {\n",
        "        \"risk\": governance.wrap(\"Risk-4B\", risk_out, risk_out.get('risk_level')),\n",
        "        \"guideline\": governance.wrap(\"Guide-4B\", guide_out, risk_out.get('risk_level')),\n",
        "        \"executive\": governance.wrap(\"Exec-27B\", exec_out, risk_out.get('risk_level')) if exec_out else None,\n",
        "        \"vision\": vision_findings, \n",
        "        \"escalated\": escalated, \n",
        "        \"parse_failures\": [] \n",
        "    }\n"
    ]

    modified = False
    for cell in nb['cells']:
        if cell['cell_type'] != 'code':
            continue
        
        source_text = "".join(cell['source'])
        
        if "%pip install" in source_text or "!pip install" in source_text:
            cell['source'] = setup_code
            modified = True
        
        if "EDGE_MODEL_ID_GGUF =" in source_text:
            cell['source'] = model_loading_code
            modified = True
            
    # 4. Update ablation study (look for subset_size = min(200, len(df)))
    ablation_study_code = [
        "import concurrent.futures\n",
        "import time\n",
        "from sklearn.metrics import f1_score\n",
        "\n",
        "# Robust label mapping to handle varying dataset formats\n",
        "LABEL_DICT = {\n",
        "    'low': 0, 'low risk': 0,\n",
        "    'medium': 1, 'mid risk': 1,\n",
        "    'high': 2, 'high risk': 2\n",
        "}\n",
        "\n",
        "def label_map(label):\n",
        "    return LABEL_DICT.get(str(label).lower().strip(), -1)\n",
        "\n",
        "def safe_extract(result):\n",
        "    try:\n",
        "        return label_map(result['risk']['payload']['risk_level'])\n",
        "    except Exception:\n",
        "        return None\n",
        "\n",
        "# Use 20 samples for a quick but statistically valid test\n",
        "subset_size = 20 \n",
        "ablation_subset = df.sample(subset_size, random_state=42)\n",
        "y_true = [label_map(r) for r in ablation_subset['RiskLevel']]\n",
        "\n",
        "def process_case(row):\n",
        "    vitals = row.drop(['RiskLevel', 'ClinicalNote']).to_dict()\n",
        "    # Using run_matrix_ai which is now synced with Vision Findings\n",
        "    return run_matrix_ai(row['ClinicalNote'], vitals, verbose=False)\n",
        "\n",
        "print(f\"Running Parallel Swarm Validation on {subset_size} samples...\")\n",
        "start_time = time.time()\n",
        "\n",
        "with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:\n",
        "    results = list(executor.map(process_case, [r for _, r in ablation_subset.iterrows()]))\n",
        "\n",
        "duration = time.time() - start_time\n",
        "# Extract risk levels from output payloads\n",
        "y_pred = [safe_extract(r) for r in results]\n",
        "\n",
        "# Remove failed predictions or unrecognized true labels\n",
        "valid_indices = [i for i, (yt, yp) in enumerate(zip(y_true, y_pred)) if yt != -1 and yp is not None]\n",
        "y_true_filtered = [y_true[i] for i in valid_indices]\n",
        "y_pred_filtered = [y_pred[i] for i in valid_indices]\n",
        "\n",
        "esc_rate = sum(1 for r in results if r.get('escalated')) / subset_size\n",
        "\n",
        "print(f\"Validation Complete in {duration:.1f}s.\")\n",
        "if y_true_filtered:\n",
        "    print(f\"F1 Score (Swarm): {f1_score(y_true_filtered, y_pred_filtered, average='weighted'):.3f}\")\n",
        "else:\n",
        "    print(\"F1 Score (Swarm): N/A (No valid predictions)\")\n",
        "print(f\"Smart Escalation Rate: {esc_rate*100:.1f}%\")\n"
    ]

    modified = False
    for cell in nb['cells']:
        if cell['cell_type'] != 'code':
            continue
        
        source_text = "".join(cell['source'])
        
        if "%pip install" in source_text or "!pip install" in source_text:
            cell['source'] = setup_code
            modified = True
        
        if "EDGE_MODEL_ID_GGUF =" in source_text:
            cell['source'] = model_loading_code
            modified = True
            
        if "def run_matrix_ai" in source_text:
            cell['source'] = swarm_logic_code
            modified = True

        if "subset_size = min(200, len(df))" in source_text:
            cell['source'] = ablation_study_code
            modified = True

    if modified:
        with open(notebook_path, 'w', encoding='utf-8') as f:
            json.dump(nb, f, indent=1)
        print(f"Successfully updated {notebook_path}")
    else:
        print("No matching cells found to update.")

if __name__ == "__main__":
    path = os.path.abspath("notebooks/Kaggle_MaTriX_Agentic_Validation.ipynb")
    update_notebook(path)
