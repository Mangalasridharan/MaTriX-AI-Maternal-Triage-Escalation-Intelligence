import json
import os

filepath = 'notebooks/Kaggle_MaTriX_Agentic_Validation.ipynb'

with open(filepath, 'r', encoding='utf-8') as f:
    nb = json.load(f)

# 1. Update Escalation & run_matrix_ai (incl. Multimodal)
escalation_logic = [
    "def should_escalate(risk_out):\n",
    "    \"\"\"Intelligent agentic routing: escalate only when clinically warranted.\"\"\"\n",
    "    score = risk_out.get(\"score\", 0)\n",
    "    flags = risk_out.get(\"flags\", {})\n",
    "    return (\n",
    "        score > 0.65 or\n",
    "        flags.get(\"severe_htn\", False) or\n",
    "        flags.get(\"neurological_signs\", False)\n",
    "    )\n",
    "\n",
    "def run_matrix_ai(note, vitals_dict, image=None, verbose=True):\n",
    "    \"\"\"Run the complete 4-agent swarm (Vision + Risk + Guideline + Executive).\"\"\"\n",
    "    parse_failures = []\n",
    "    vision_out = None\n",
    "    \n",
    "    # Stage 0: Vision Agent (PaliGemma Ungated)\n",
    "    if image:\n",
    "        if verbose: print(\"[VISION 3B] PaliGemma analyzing clinic imagery...\")\n",
    "        v_data, v_ok = vision_agent(image)\n",
    "        vision_out = governance.wrap(\"VisionAgent-3B\", v_data, \"unknown\")\n",
    "        if not v_ok: parse_failures.append(\"VisionAgent\")\n",
    "    \n",
    "    # Stage 1: Edge Risk Agent (4B GGUF)\n",
    "    if verbose: print(\"[EDGE 4B] Risk Agent running...\")\n",
    "    risk_out, risk_ok = risk_agent(note, vitals_dict)\n",
    "    if not risk_ok: parse_failures.append(\"RiskAgent\")\n",
    "    risk_governed = governance.wrap(\"RiskAgent-4B\", risk_out, risk_out.get(\"risk_level\",\"unknown\"))\n",
    "    \n",
    "    # Stage 2: Edge Guideline Agent (4B GGUF)\n",
    "    if verbose: print(\"[EDGE 4B] cross-referencing WHO/NICE guidelines...\")\n",
    "    guide_out, guide_ok = guideline_agent(risk_out.get(\"risk_level\",\"mid\"))\n",
    "    if not guide_ok: parse_failures.append(\"GuidelineAgent\")\n",
    "    guide_governed = governance.wrap(\"GuidelineAgent-4B\", guide_out, risk_out.get(\"risk_level\"))\n",
    "\n",
    "    # Stage 3: Cloud Executive Agent (27B GGUF) - Smart Escalation\n",
    "    exec_governed = None\n",
    "    escalated = should_escalate(risk_out)\n",
    "    if escalated:\n",
    "        if verbose: print(\"[CLOUD 27B] Executive Agent activated for synthesis...\")\n",
    "        exec_out, exec_ok = executive_agent(risk_out, guide_out, note)\n",
    "        if not exec_ok: parse_failures.append(\"ExecutiveAgent\")\n",
    "        exec_governed = governance.wrap(\"ExecutiveAgent-27B\", exec_out, risk_out.get(\"risk_level\"))\n",
    "\n",
    "    return {\n",
    "        \"vision\": vision_out, \n",
    "        \"risk\": risk_governed, \n",
    "        \"guideline\": guide_governed, \n",
    "        \"executive\": exec_governed,\n",
    "        \"escalated\": escalated, \n",
    "        \"parse_failures\": parse_failures\n",
    "    }\n",
    "\n",
    "print(\"MaTriX-AI Swarm Core Logic Updated.\")"
]

# 2. Update Gradio Demo with Image Support
gradio_demo = [
    "import gradio as gr\n",
    "from PIL import Image\n",
    "\n",
    "def gradio_triage(age, systolic, diastolic, blood_sugar, temp, hr, note, image):\n",
    "    vitals = {\"Age\": age, \"SystolicBP\": systolic, \"DiastolicBP\": diastolic,\n",
    "              \"BS\": blood_sugar, \"BodyTemp\": temp, \"HeartRate\": hr}\n",
    "    \n",
    "    # Run the multimodal swarm\n",
    "    res = run_matrix_ai(note or \"Routine visit.\", vitals, image=image, verbose=False)\n",
    "    \n",
    "    risk = res['risk']['payload']\n",
    "    guide = res['guideline']['payload']\n",
    "    exec_ = res.get('executive')\n",
    "    vis = res.get('vision')\n",
    "\n",
    "    vision_txt = f\"VISION AGENT: {vis['payload']['analysis']}\" if vis else \"VISION: No image provided.\"\n",
    "    \n",
    "    risk_txt = (f\"RISK AGENT (Edge 4B)\\n\"\n",
    "                f\"Level : {risk.get('risk_level','?').upper()}\\n\"\n",
    "                f\"Score : {risk.get('score',0):.2f}\\n\"\n",
    "                f\"Flags : {risk.get('flags',{})}\")\n",
    "\n",
    "    guide_txt = (f\"GUIDELINE AGENT (Edge 4B)\\n\"\n",
    "                 f\"Source : {guide.get('source','WHO 2011')}\\n\"\n",
    "                 f\"Monitoring: {guide.get('monitoring','N/A')[:200]}\")\n",
    "\n",
    "    if exec_:\n",
    "        ep = exec_['payload']\n",
    "        exec_txt = (f\"EXECUTIVE AGENT (Cloud 27B)\\n\"\n",
    "                    f\"Urgency: {ep.get('urgency','?').upper()}\\n\"\n",
    "                    f\"Plan: {ep.get('plan','')[:300]}\")\n",
    "    else:\n",
    "        exec_txt = \"EXECUTIVE AGENT: Not escalated (Triage handled at Edge).\"\n",
    "\n",
    "    audit_txt = (f\"GOVERNANCE AUDIT\\n\"\n",
    "                 f\"Trace ID: {res['risk']['trace_id']}\\n\"\n",
    "                 f\"Hash: {res['risk']['content_hash_sha256'][:24]}...\")\n",
    "\n",
    "    return vision_txt, risk_txt, guide_txt, exec_txt, audit_txt\n",
    "\n",
    "with gr.Blocks(theme=gr.themes.Soft()) as demo:\n",
    "    gr.Markdown(\"# MaTriX-AI Swarm Demo\")\n",
    "    with gr.Row():\n",
    "        with gr.Column():\n",
    "            image = gr.Image(type=\"pil\", label=\"Clinical Imagery (e.g. Edema, Blood Loss)\")\n",
    "            with gr.Row():\n",
    "                age = gr.Number(label=\"Age\", value=25)\n",
    "                ga = gr.Number(label=\"GA (Wks)\", value=32)\n",
    "            sys = gr.Slider(80, 200, label=\"Systolic\", value=120)\n",
    "            dia = gr.Slider(40, 120, label=\"Diastolic\", value=80)\n",
    "            note = gr.Textbox(label=\"Clinical Notes\")\n",
    "            btn = gr.Button(\"Run Swarm Evaluation\", variant=\"primary\")\n",
    "        with gr.Column():\n",
    "            o_vis = gr.Textbox(label=\"Vision Analysis\")\n",
    "            o_risk = gr.Textbox(label=\"Risk Triage\")\n",
    "            o_guide = gr.Textbox(label=\"WHO Guideline\")\n",
    "            o_exec = gr.Textbox(label=\"Cloud Executive Plan\")\n",
    "            o_audit = gr.Textbox(label=\"Audit Trail\")\n",
    "    \n",
    "    btn.click(gradio_triage, inputs=[age, sys, dia, ga, ga, ga, note, image], \n",
    "              outputs=[o_vis, o_risk, o_guide, o_exec, o_audit])\n",
    "\n",
    "demo.launch(share=False)"
]

# Update logic based on IDs
for cell in nb['cells']:
    if cell.get('id') == '1c633ea0': # Escalation logic
        cell['source'] = escalation_logic
    elif cell.get('id') == '7d500303': # Gradio cell
        cell['source'] = gradio_demo

# Update Section 9 Header and Content (Multimodal Implementation)
for cell in nb['cells']:
    if cell.get('id') == 'd852631e':
        cell['cell_type'] = 'markdown'
        cell['source'] = [
            "## 9. Swarm Execution: Real-World Case Summary\n",
            "This section demonstrates the full 4-agent flow on a complex pre-eclampsia case with visual context."
        ]

with open(filepath, 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=2)

print("Comprehensive notebook update complete.")
