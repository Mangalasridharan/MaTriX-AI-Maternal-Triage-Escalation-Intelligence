import json

notebook_path = 'e:/MaTriX-AI-Maternal-Triage-Escalation-Intelligence/notebooks/Kaggle_MaTriX_Agentic_Validation.ipynb'

with open(notebook_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

new_func = """def _try_parse_json(raw):
    \"\"\"Attempt JSON extraction from large text output; return (dict, parse_ok: bool).\"\"\"
    # 1. Look for the largest balanced { ... } block
    start_idx = raw.find('{')
    if start_idx != -1:
        end_idx = raw.rfind('}')
        if end_idx > start_idx:
            substr = raw[start_idx:end_idx+1]
            try: return json.loads(substr), True
            except: pass
            
    # 2. Look for explicit markdown JSON blocks
    import re
    m = re.search(r'```(?:json)?\s*(\\{.*?\\})\s*```', raw, re.DOTALL | re.IGNORECASE)
    if m:
        try: return json.loads(m.group(1)), True
        except: pass
        
    return {}, False"""

for cell in nb.get('cells', []):
    if cell['cell_type'] == 'code':
        source = "".join(cell.get('source', []))
        if 'def _try_parse_json(raw):' in source:
            # Replace the old function definition
            # We'll do a simple split and replace
            import re
            parts = re.split(r'def _try_parse_json\(raw\):.*?return \{\}, False \s*# Return empty dict and False if all attempts fail\n', source, flags=re.DOTALL)
            if len(parts) == 2:
                new_source = parts[0] + new_func + "\n" + parts[1]
                # Convert back to list of lines preserving newlines
                lines = [line + '\n' for line in new_source.split('\n')]
                # remove the trailing newline from the last string to mimic nbformat
                if lines: lines[-1] = lines[-1].rstrip('\n')
                cell['source'] = lines
                print("Updated _try_parse_json successfully.")

with open(notebook_path, 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)
