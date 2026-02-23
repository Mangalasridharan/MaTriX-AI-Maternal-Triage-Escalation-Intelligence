import json
import os

filepath = 'notebooks/Kaggle_MaTriX_Agentic_Validation.ipynb'

with open(filepath, 'r', encoding='utf-8') as f:
    nb = json.load(f)

# Final Polish: Conclusion, Roadmap, and Gradio fix
new_conclusion = [
    "## 10. Deployment Roadmap: PHC to District Hospital\n",
    "\n",
    "| Stage | Hardware | Model Strategy | Connectivity | Use Case |\n",
    "|---|---|---|---|---|\n",
    "| PHC (Village) | Raspberry Pi / Tab | MedGemma 4B GGUF | Offline (100%) | Frontline triage & flag detection |\n",
    "| CHC (Block) | Laptop / Jetson | PaliGemma + 4B GGUF | Limited 4G | Visual triage (Hemorrhage/Edema) |\n",
    "| District Hospital | On-prem / Cloud | MedGemma 27B GGUF | Broadband | Executive synthesis & board review |\n",
    "\n",
    "## Conclusion\n",
    "\n",
    "The MaTriX-AI **4-agent swarm** (Vision, Risk, Guideline, and Executive) provides an end-to-end framework for maternal safety in low-resource settings. By leveraging a hybrid of **MedGemma 4B/27B GGUFs** for local reasoning and **PaliGemma** for clinical imagery analysis, the system identifies high-risk cases that single-model baselines often miss. \n",
    "\n",
    "The `GovernanceLayer` ensures every decision is grounded in WHO/NICE guidelines and remains fully auditable via SHA-256 tracing. MaTriX-AI is not just an LLM wrapper; it is a responsible, multimodal clinical decision support system designed to save lives where they are most at risk."
]

# Fix Gradio inputs mapping in cell 7d500303
for cell in nb['cells']:
    if cell.get('id') == '7d500303':
        # Correcting the inputs list to match actual variables
        # Current: inputs=[age, sys, dia, ga, ga, ga, note, image]
        # Should be: inputs=[age, sys, dia, blood_sugar, temp, hr, note, image] - wait, let's check my previous script logic
        # My previous script had: def gradio_triage(age, systolic, diastolic, blood_sugar, temp, hr, note, image):
        # The block had: age, ga, sys, dia, note, image. 
        # Let's align them perfectly.
        
        corrected_gradio = [
            "import gradio as gr\n",
            "from PIL import Image\n",
            "\n",
            "def gradio_triage(age, sys, dia, bs, temp, hr, note, image):\n",
            "    vitals = {\"Age\": age, \"SystolicBP\": sys, \"DiastolicBP\": dia, \"BS\": bs, \"BodyTemp\": temp, \"HeartRate\": hr}\n",
            "    res = run_matrix_ai(note or \"ANC Visit\", vitals, image=image, verbose=False)\n",
            "    \n",
            "    # Extract payloads safely\n",
            "    v_txt = f\"VISION: {res['vision']['payload']['analysis']}\" if res.get('vision') else \"VISION: No imagery.\"\n",
            "    r_txt = f\"RISK: {res['risk']['payload']['risk_level'].upper()} (Score: {res['risk']['payload'].get('score', 0):.2f})\"\n",
            "    g_txt = f\"WHO GUIDE: {res['guideline']['payload'].get('source', 'WHO')} - {res['guideline']['payload'].get('stabilization', '')[:150]}...\"\n",
            "    e_txt = f\"EXECUTIVE: {res['executive']['payload'].get('plan', '')[:250]}\" if res.get('executive') else \"EXECUTIVE: Triage managed at edge.\"\n",
            "    a_txt = f\"AUDIT: {res['risk']['trace_id']} | HASH: {res['risk']['content_hash_sha256'][:16]}\"\n",
            "\n",
            "    return v_txt, r_txt, g_txt, e_txt, a_txt\n",
            "\n",
            "with gr.Blocks(theme=gr.themes.Soft()) as demo:\n",
            "    gr.Markdown(\"## MaTriX-AI Multimodal Swarm\")\n",
            "    with gr.Row():\n",
            "        with gr.Column():\n",
            "            img_in = gr.Image(type=\"pil\", label=\"Clinical Image\")\n",
            "            note_in = gr.Textbox(label=\"Clinical Note\", placeholder=\"Describe symptoms...\")\n",
            "            with gr.Row():\n",
            "                age_in = gr.Number(label=\"Age\", value=28)\n",
            "                bs_in = gr.Number(label=\"Blood Sugar\", value=6.0)\n",
            "            with gr.Row():\n",
            "                sys_in = gr.Slider(80, 200, label=\"Systolic\", value=120)\n",
            "                dia_in = gr.Slider(40, 130, label=\"Diastolic\", value=80)\n",
            "            with gr.Row():\n",
            "                temp_in = gr.Slider(96, 104, label=\"Temp (F)\", value=98.6)\n",
            "                hr_in = gr.Slider(40, 160, label=\"Heart Rate\", value=80)\n",
            "            run_btn = gr.Button(\"Run Agentic Evaluation\", variant=\"primary\")\n",
            "        with gr.Column():\n",
            "            o_v = gr.Textbox(label=\"1. Vision Agent (PaliGemma)\")\n",
            "            o_r = gr.Textbox(label=\"2. Risk Agent (MedGemma 4B GGUF)\")\n",
            "            o_g = gr.Textbox(label=\"3. Guideline Agent (WHO/NICE)\")\n",
            "            o_e = gr.Textbox(label=\"4. Executive Agent (MedGemma 27B GGUF)\")\n",
            "            o_a = gr.Textbox(label=\"Governance Audit Trail\")\n",
            "\n",
            "    run_btn.click(gradio_triage, \n",
            "                  inputs=[age_in, sys_in, dia_in, bs_in, temp_in, hr_in, note_in, img_in], \n",
            "                  outputs=[o_v, o_r, o_g, o_e, o_a])\n",
            "\n",
            "demo.launch(share=False)"
        ]
        cell['source'] = corrected_gradio

# Update Conclusion cell source
for cell in nb['cells']:
    if cell.get('id') == '65d1114b':
        cell['source'] = new_conclusion

with open(filepath, 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=2)

print("Conclusion and Gradio UI fully synchronized.")
