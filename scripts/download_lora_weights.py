import os, argparse

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--kernel", type=str, required=True)
    parser.add_argument("--output_path", type=str, required=True)
    args = parser.parse_args()
    
    os.makedirs(args.output_path, exist_ok=True)
    if os.environ.get("GITHUB_ACTIONS"):
        os.system(f"kaggle kernels output {args.kernel} -p {args.output_path}")
    print(f"✅ Downloaded Kaggle kernel outputs to {args.output_path}")

if __name__ == "__main__":
    main()
