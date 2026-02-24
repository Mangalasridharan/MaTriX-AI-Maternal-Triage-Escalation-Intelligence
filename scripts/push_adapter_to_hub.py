import os, argparse
from huggingface_hub import HfApi

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--adapter_path", type=str, required=True)
    parser.add_argument("--repo_id", type=str, required=True)
    args = parser.parse_args()

    token = os.environ.get("HF_TOKEN")
    if not token:
        print("⚠️ No HF_TOKEN. Skipping Hub push.")
        return

    api = HfApi(token=token)
    api.create_repo(repo_id=args.repo_id, exist_ok=True, private=True)
    
    api.upload_folder(
        folder_path=args.adapter_path,
        repo_id=args.repo_id,
        commit_message="🤖 Auto-pushed LoRA adapter fine-tune",
    )
    print(f"🚀 Pushed {args.adapter_path} context to HF: {args.repo_id}")

if __name__ == "__main__":
    main()
