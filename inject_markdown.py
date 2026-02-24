import json
import os

def inject_markdown(notebook_path):
    with open(notebook_path, 'r', encoding='utf-8') as f:
        nb = json.load(f)

    # 1. Provide the new comprehensive intro markdown cell
    intro_md = [
        "# 🏥 MaTriX-AI: Hybrid Edge-Cloud Maternal Triage Swarm\n",
        "\n",
        "**MaTriX-AI** is a state-of-the-art multimodal, multi-agent AI framework designed to tackle maternal mortality in extreme low-resource clinical environments (e.g., rural health clinics with spotty internet).\n",
        "\n",
        "### 🌟 The Core Innovation: Dynamic Network Topology\n",
        "Instead of relying on a massive, expensive, cloud-only architecture, MaTriX-AI uses a **Smart Escalation Swarm**:\n",
        "\n",
        "1. **The Edge Node (Offline 4B):** Runs entirely locally on consumer hardware. An offline **MedGemma-4B** agent monitors telemetry (vitals) and free-text nursing notes to calculate a continuous Risk Score.\n",
        "2. **The Cloud Escalation (27B):** If the Edge Node flags a critical maternal crisis (e.g., severe preeclampsia risk), the workflow *breaks the air-gap* and escalates the structured payload to a massive **MedGemma-27B Executive Agent** in the cloud for an emergency extraction plan.\n",
        "3. **Vision Analysis (3B):** A **PaliGemma-3B** agent decodes fetal ultrasounds or handwritten lab notes, injecting findings back into the risk pipeline.\n",
        "\n",
        "### 🤖 Automated Self-Improvement (CI/CD)\n",
        "The system is governed by a GitHub Actions CI/CD pipeline. Every week, if the clinic opts-in, the system queries the local database for cases where nurse outcomes disagreed with AI predictions (Drift). It then:\n",
        "1. Launches a remote **LoRA Fine-tuning job** on Kaggle GPUs.\n",
        "2. Uses **GitHub Copilot** to audit the agent prompts and suggest code improvements.\n",
        "3. Automatically opens a Pull Request with the new architecture.\n",
        "\n",
        "### 🧪 This Validation Suite\n",
        "This standalone notebook proves the multi-agent swarm architecture using a strict Ablation Study across multiple datasets. It compares single-agent (4B only) performance vs. the fully synchronized 3-Agent Swarm (4B + 27B + Vision).\n",
        "\n",
        "> **Note on Hardware Allocation:** To run this entire 3-agent swarm locally without memory overlap crashes, we use a hybrid RAM strategy. The 4B and 3B models are bound strictly to GPU memory (`n_gpu_layers=-1`), while the massive 27B model is offloaded entirely to System CPU RAM (`n_gpu_layers=0`)."
    ]

    # Find the very first cell if it's markdown and replace it, otherwise insert it.
    if len(nb['cells']) > 0 and nb['cells'][0]['cell_type'] == 'markdown':
        nb['cells'][0]['source'] = intro_md
    else:
        new_cell = {
            "cell_type": "markdown",
            "metadata": {},
            "source": intro_md
        }
        nb['cells'].insert(0, new_cell)

    with open(notebook_path, 'w', encoding='utf-8') as f:
        json.dump(nb, f, indent=1)
    
    print(f"Successfully injected comprehensive architecture markdown into {notebook_path}")

if __name__ == "__main__":
    path = os.path.abspath("notebooks/Kaggle_MaTriX_Agentic_Validation.ipynb")
    inject_markdown(path)
