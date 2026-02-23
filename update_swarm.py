import json
import os

filepath = 'notebooks/Kaggle_MaTriX_Agentic_Validation.ipynb'

with open(filepath, 'r', encoding='utf-8') as f:
    nb = json.load(f)

# Update _infer to handle Llama GGUF optionally
# And update run_edge to prioritize GGUF
inference_cell = [
    "def _infer(model, tokenizer, system, user, max_tokens=256):\n",
    "    # Check if model is llama-cpp-python (Llama object)\n",
    "    if hasattr(model, 'create_chat_completion'):\n",
    "        resp = model.create_chat_completion(\n",
    "            messages=[\n",
    "                {\"role\": \"system\", \"content\": system},\n",
    "                {\"role\": \"user\", \"content\": user}\n",
    "            ],\n",
    "            max_tokens=max_tokens,\n",
    "            temperature=0.1\n",
    "        )\n",
    "        return resp['choices'][0]['message']['content'].strip()\n",
    "    \n",
    "    # Standard Transformers inference\n",
    "    prompt = f\"<start_of_turn>system\\n{system}<end_of_turn>\\n<start_of_turn>user\\n{user}<end_of_turn>\\n<start_of_turn>model\\n\"\n",
    "    device = next(model.parameters()).device\n",
    "    inputs = tokenizer(prompt, return_tensors=\"pt\", truncation=True, max_length=2048).to(device)\n",
    "    with torch.inference_mode():\n",
    "        out = model.generate(**inputs, max_new_tokens=max_tokens, do_sample=False,\n",
    "                             pad_token_id=tokenizer.eos_token_id)\n",
    "    return tokenizer.decode(out[0][inputs['input_ids'].shape[-1]:], skip_special_tokens=True).strip()\n",
    "\n",
    "def run_edge(system, user): return _infer(edge_mdl, None, system, user, max_tokens=256)\n",
    "def run_cloud(system, user): \n",
    "    if cloud_mdl is None: return \"Cloud model not loaded.\"\n",
    "    return _infer(cloud_mdl, cloud_tok, system, user, max_tokens=512)"
]

# Update swarm agents to include PaliGemma
vision_agent_cell = [
    "\n",
    "# --- MULTIMODAL EXTENSION ---\n",
    "def vision_agent(image_input, prompt=\"Describe significant maternal risk signs in this image.\"):\n",
    "    \"\"\"Multimodal VQA Agent using PaliGemma 3B.\"\"\"\n",
    "    if 'pali_model' not in globals() or pali_model is None:\n",
    "        return {\"analysis\": \"Vision system offline\", \"findings\": []}, False\n",
    "\n",
    "    from PIL import Image\n",
    "    if isinstance(image_input, str): image = Image.open(image_input).convert(\"RGB\")\n",
    "    else: image = image_input.convert(\"RGB\")\n",
    "\n",
    "    inputs = pali_processor(text=prompt, images=image, return_tensors=\"pt\").to(pali_model.device)\n",
    "    with torch.inference_mode():\n",
    "        out = pali_model.generate(**inputs, max_new_tokens=100)\n",
    "    \n",
    "    analysis = pali_processor.decode(out[0], skip_special_tokens=True).strip()\n",
    "    findings = []\n",
    "    for keyword in [\"edema\", \"hemorrhage\", \"swelling\", \"paleness\"]: \n",
    "        if keyword in analysis.lower(): findings.append(keyword)\n",
    "    \n",
    "    return {\"analysis\": analysis, \"findings\": findings}, True\n",
    "\n",
    "def run_matrix_ai_multimodal(note, vitals_dict, image=None, verbose=True):\n",
    "    \"\"\"Extended Swarm: 4-Agent (Vision + Risk + Guideline + Executive).\"\"\"\n",
    "    parse_failures = []\n",
    "    vision_out = None\n",
    "    \n",
    "    if image:\n",
    "        if verbose: print(\"[VISION 3B] PaliGemma analyzing imagery...\")\n",
    "        vision_data, v_ok = vision_agent(image)\n",
    "        vision_out = governance.wrap(\"VisionAgent-3B\", vision_data, \"unknown\")\n",
    "    \n",
    "    risk_prompt = f\"Clinical Note: {note}\\nVitals: {json.dumps(vitals_dict)}\"\n",
    "    if vision_out: \n",
    "        risk_prompt += f\"\\nVisual Findings: {vision_out['payload']['analysis']}\"\n",
    "        \n",
    "    if verbose: print(\"[EDGE 4B] Risk Agent (GGUF) running...\")\n",
    "    risk_out, risk_ok = risk_agent(note, vitals_dict)\n",
    "    risk_governed = governance.wrap(\"RiskAgent-4B\", risk_out, risk_out.get(\"risk_level\", \"unknown\"))\n",
    "\n",
    "    guide_out, _ = guideline_agent(risk_out.get(\"risk_level\",\"mid\"))\n",
    "    guide_governed = governance.wrap(\"GuidelineAgent-4B\", guide_out, risk_out.get(\"risk_level\"))\n",
    "    \n",
    "    exec_governed = None\n",
    "    if should_escalate(risk_out):\n",
    "        exec_out, _ = executive_agent(risk_out, guide_out, note)\n",
    "        exec_governed = governance.wrap(\"ExecutiveAgent-27B\", exec_out, risk_out.get(\"risk_level\"))\n",
    "        \n",
    "    return {\"vision\": vision_out, \"risk\": risk_governed, \"guideline\": guide_governed, \"executive\": exec_governed}\n"
]

# Validation cell for PaliGemma
validation_cell = [
    "import requests\n",
    "from PIL import Image\n",
    "from io import BytesIO\n",
    "\n",
    "print(\"Validating PaliGemma 3B Multimodal Integrity...\")\n",
    "test_url = \"https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/transformers/tasks/segmentation.png\"\n",
    "try:\n",
    "    raw_img = Image.open(BytesIO(requests.get(test_url).content))\n",
    "    v_data, v_ok = vision_agent(raw_img, prompt=\"Describe the colors in this image.\")\n",
    "    if v_ok:\n",
    "        print(\"SUCCESS: PaliGemma reasoning active.\")\n",
    "        print(f\"Output: {v_data['analysis']}\")\n",
    "    else:\n",
    "        print(\"FAILURE: Vision agent returned error.\")\n",
    "except Exception as e:\n",
    "    print(f\"SKIPPED: Could not fetch test image (check internet). Error: {e}\")\n"
]

# Apply changes
for cell in nb['cells']:
    if cell.get('id') == '162a4582': # Inference logic
        cell['source'] = inference_cell
    elif cell.get('id') == 'a6370c68': # Swarm logic
        cell['source'].extend(vision_agent_cell)

# Insert validation cell after model loading
found_idx = -1
for i, cell in enumerate(nb['cells']):
    if cell.get('id') == '5e759c07':
        found_idx = i
        break

if found_idx != -1:
    # Check if validation cell already exists to avoid duplicates
    if not any(c.get('id') == 'pali_val_001' for c in nb['cells']):
        new_cell = {
            "cell_type": "code",
            "execution_count": None,
            "id": "pali_val_001",
            "metadata": {},
            "outputs": [],
            "source": validation_cell
        }
        nb['cells'].insert(found_idx + 1, new_cell)

with open(filepath, 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=2)

print("Updated notebook with PaliGemma Swarm logic and validation.")
