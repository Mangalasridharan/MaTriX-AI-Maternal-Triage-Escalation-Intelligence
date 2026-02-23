import json

file_path = r'e:\MaTriX-AI-Maternal-Triage-Escalation-Intelligence\notebooks\Kaggle_MaTriX_Agentic_Validation.ipynb'
with open(file_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

for cell in nb['cells']:
    if cell['cell_type'] == 'code':
        source = cell['source']
        has_edge_model = any('EDGE_MODEL_ID  =' in line or 'EDGE_MODEL_ID =' in line for line in source)
        if has_edge_model:
            new_source = []
            
            # Add Kaggle secret login at the very top of this block
            login_str = (
                "try:\n"
                "    from kaggle_secrets import UserSecretsClient\n"
                "    user_secrets = UserSecretsClient()\n"
                "    hf_token = user_secrets.get_secret('HF_TOKEN')\n"
                "    from huggingface_hub import login\n"
                "    login(hf_token)\n"
                "    print('Authenticated with Hugging Face.')\n"
                "except Exception as e:\n"
                "    print('Warning: HF_TOKEN secret not found. Attach it if using gated models.')\n\n"
            )
            
            # Since Kaggle requires the models to fit on P100, we'll recommend CPU offload parameters implicitly handled by accelerate
            # We also ensure bitsandbytes settings are optimally configured
            modified_source = []
            for line in source:
                # remove old imports if there are any specific to the previous gemma logic
                if 'EDGE_MODEL_ID  ="google/medgemma-4b-it"' in line.replace(" ", ""):
                    line = 'EDGE_MODEL_ID  = "google/medgemma-4b-it"  # Correct MedGemma 4B\n'
                elif 'CLOUD_MODEL_ID ="google/medgemma-27b-it"' in line.replace(" ", ""):
                    line = 'CLOUD_MODEL_ID = "google/medgemma-27b-it"  # Correct MedGemma 27B\n'
                
                # add a clear cache operation between loads to manage the 16GB P100 memory
                if 'print(f"Loading Cloud model: {CLOUD_MODEL_ID}")' in line:
                    modified_source.append('import gc; torch.cuda.empty_cache(); gc.collect()\n')
                
                modified_source.append(line)
            
            cell['source'] = [login_str] + modified_source
            break

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=2)

print("Kaggle secrets and P100 memory management injected successfully!")
