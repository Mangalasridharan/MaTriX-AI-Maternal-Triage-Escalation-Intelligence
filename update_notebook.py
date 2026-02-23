import json
import os

filepath = 'notebooks/Kaggle_MaTriX_Agentic_Validation.ipynb'

with open(filepath, 'r', encoding='utf-8') as f:
    nb = json.load(f)

# PURE UNGATED STACK: No tokens, no gating, community-optimized weights
source = [
    "!pip install -U llama-cpp-python transformers accelerate\n",
    "from transformers import AutoProcessor, AutoModelForImageTextToText\n",
    "from llama_cpp import Llama\n",
    "import gc; import torch; torch.cuda.empty_cache(); gc.collect()\n",
    "\n",
    "# 1. Load Edge Model (Unsloth MedGemma 4B GGUF - Ungated)\n",
    "print(\"Loading Edge GGUF: unsloth/medgemma-4b-it-GGUF\")\n",
    "edge_mdl = Llama.from_pretrained(\n",
    "    repo_id=\"unsloth/medgemma-4b-it-GGUF\",\n",
    "    filename=\"medgemma-4b-it-BF16.gguf\",\n",
    "    n_ctx=2048, n_gpu_layers=-1, verbose=False\n",
    ")\n",
    "\n",
    "# 2. Load Cloud Executive Model (Unsloth MedGemma 27B GGUF - Ungated)\n",
    "print(\"Loading Cloud GGUF: unsloth/medgemma-27b-it-GGUF\")\n",
    "cloud_mdl = Llama.from_pretrained(\n",
    "    repo_id=\"unsloth/medgemma-27b-it-GGUF\",\n",
    "    filename=\"BF16/medgemma-27b-it-BF16-00001-of-00002.gguf\",\n",
    "    n_ctx=2048, n_gpu_layers=-1, verbose=False\n",
    ")\n",
    "\n",
    "# 3. Load Multimodal PaliGemma (FAL Community Mix - Ungated)\n",
    "PALI_ID = \"fal/paligemma-3b-mix-224\"\n",
    "print(f\"Loading Ungated PaliGemma: {PALI_ID}\")\n",
    "try:\n",
    "    pali_processor = AutoProcessor.from_pretrained(PALI_ID)\n",
    "    pali_model = AutoModelForImageTextToText.from_pretrained(\n",
    "        PALI_ID,\n",
    "        device_map=\"auto\",\n",
    "        torch_dtype=torch.float16,\n",
    "        trust_remote_code=True\n",
    "    )\n",
    "    print(\"SUCCESS: PaliGemma loaded (Ungated).\")\n",
    "except Exception as e:\n",
    "    print(f\"PaliGemma load failed: {e}\")\n",
    "    pali_model, pali_processor = None, None\n",
    "\n",
    "print(\"\\n--- MaTriX-AI Swarm Initialized (Pure Permissionless Environment) ---\")"
]

for cell in nb['cells']:
    if cell.get('id') == '5e759c07':
        cell['source'] = source
        break

with open(filepath, 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=2)

print("Updated notebook to a 100% ungated stack (Unsloth + FAL).")
