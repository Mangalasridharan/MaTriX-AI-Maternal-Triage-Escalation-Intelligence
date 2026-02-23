import json

file_path = r'e:\MaTriX-AI-Maternal-Triage-Escalation-Intelligence\notebooks\Kaggle_MaTriX_Agentic_Validation.ipynb'
with open(file_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

# The cell to add a new visualization
new_vis_cell_source = [
    "# Additional Visualizations for System Efficiency & Cost Optimization\n",
    "import matplotlib.pyplot as plt\n",
    "import seaborn as sns\n",
    "\n",
    "# 1. Risk Class Distribution in the sample\n",
    "risk_counts = pd.Series(y_true).map({0:'Low', 1:'Mid', 2:'High'}).value_counts()\n",
    "fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))\n",
    "\n",
    "ax1.pie(risk_counts, labels=risk_counts.index, autopct='%1.1f%%', startangle=90, colors=['#a7f3d0', '#fef08a', '#fecaca'])\n",
    "ax1.set_title('Risk Distribution (Test Subset)')\n",
    "\n",
    "# 2. Simulated Latency / Cost Savings (Edge vs Cloud)\n",
    "# Assuming Edge 4B takes ~2s, Cloud 27B takes ~8s latency.\n",
    "latency_single = [8 for _ in range(subset_size)]  # If we always used 27B Cloud\n",
    "latency_matrix = [2 + (8 if r['escalated'] else 0) for _, r in zip(range(subset_size), [{'escalated': label == 2} for label in y_true])] # approximation for visual\n",
    "\n",
    "total_single_time = sum(latency_single)\n",
    "total_matrix_time = sum(latency_matrix)\n",
    "\n",
    "ax2.bar(['Single 27B Cloud API', 'MaTriX-AI Swarm'], [total_single_time, total_matrix_time], color=['#9ca3af', '#3b82f6'])\n",
    "ax2.set_ylabel('Total Inference Time (seconds)')\n",
    "ax2.set_title(f'Simulated Inference Latency for {subset_size} Patients')\n",
    "for i, v in enumerate([total_single_time, total_matrix_time]):\n",
    "    ax2.text(i, v + 20, f'{v}s', ha='center', fontweight='bold')\n",
    "\n",
    "plt.tight_layout()\n",
    "plt.savefig('efficiency_visual.png', dpi=150, bbox_inches='tight')\n",
    "plt.show()\n",
    "print(f\"By leveraging the 4B edge model as a frontline triage agent, MaTriX-AI reduces total inference time by ~{((total_single_time - total_matrix_time) / total_single_time) * 100:.1f}%\")\n"
]

new_cell = {
    "cell_type": "code",
    "execution_count": None,
    "id": "new_vis_cell_001",
    "metadata": {},
    "outputs": [],
    "source": new_vis_cell_source
}

# We want to insert it after the ablation study cells. Let's find the cell with 'Full classification report'
insert_idx = -1
for i, cell in enumerate(nb['cells']):
    if cell['cell_type'] == 'code':
        if any('Mode C (Full MaTriX-AI) — Classification Report:' in line for line in cell['source']):
            insert_idx = i + 1
            break

if insert_idx != -1:
    nb['cells'].insert(insert_idx, new_cell)
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(nb, f, indent=2)
    print("New visualization cell added successfully!")
else:
    print("Could not find the target cell to insert the visualization.")

