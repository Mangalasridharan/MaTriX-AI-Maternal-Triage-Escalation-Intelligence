"""
apply_swarm_improvements.py
===========================
Takes the JSON output from swarm_audit.py and applies the search/replace 
improvements into the actual Python agent code for the Edge and Cloud nodes.
These changes then form the Pull Request.
"""
import os, json, argparse

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--improvements_path", type=str, required=True)
    args = parser.parse_args()

    try:
        with open(args.improvements_path, "r") as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error loading {args.improvements_path}: {e}")
        return

    improvements = data.get("improvements", [])
    if not improvements:
        print("No improvements found to apply.")
        return

    applied_count = 0
    for imp in improvements:
        target = imp.get("target_file")
        old = imp.get("search_string")
        new = imp.get("replacement_string")

        if not os.path.exists(target):
            print(f"⚠️ Target file missing: {target}")
            continue

        with open(target, "r") as f:
            content = f.read()

        if old in content:
            new_content = content.replace(old, new)
            with open(target, "w") as f:
                f.write(new_content)
            print(f"✅ Applied improvement to {target}")
            applied_count += 1
        else:
            print(f"⚠️ Could not find exact search string in {target}")
            print(f"   Searching for: '{old}'")

    print(f"Summary: Applied {applied_count}/{len(improvements)} improvements.")

if __name__ == "__main__":
    main()
