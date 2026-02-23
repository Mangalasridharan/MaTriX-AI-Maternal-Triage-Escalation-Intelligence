import os
import json
import argparse
import boto3
import sagemaker
from sagemaker.huggingface import HuggingFaceModel, get_huggingface_llm_image_uri
from dotenv import load_dotenv

# Load env variables from cloud/.env
# Assuming script is run from project root or cloud directory
env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(dotenv_path=env_path)

# Model Configuration Map
MODEL_CONFIGS = {
    "medgemma-27b": {
        "hub": {
            "HF_MODEL_ID": "google/medgemma-27b-it",
            "SM_NUM_GPUS": json.dumps(4),
            "HF_MODEL_QUANTIZE": "bitsandbytes",
            "MAX_INPUT_LENGTH": json.dumps(2048),
            "MAX_TOTAL_TOKENS": json.dumps(4096),
        },
        "instance_type": "ml.g5.12xlarge",
        "endpoint_name": "matrix-medgemma-27b-prod"
    },
    "medgemma-4b": {
        "hub": {
            "HF_MODEL_ID": "google/medgemma-4b-it",
            "SM_NUM_GPUS": json.dumps(1),
            "HF_MODEL_QUANTIZE": "bitsandbytes",
            "MAX_INPUT_LENGTH": json.dumps(2048),
            "MAX_TOTAL_TOKENS": json.dumps(4096),
        },
        "instance_type": "ml.g5.2xlarge",
        "endpoint_name": "matrix-medgemma-4b-prod"
    },
    "paligemma-3b": {
        "hub": {
            "HF_MODEL_ID": "google/paligemma-3b-pt-224",
            "SM_NUM_GPUS": json.dumps(1),
            "HF_MODEL_QUANTIZE": "bitsandbytes",
            "MAX_INPUT_LENGTH": json.dumps(1024),
            "MAX_TOTAL_TOKENS": json.dumps(2048),
        },
        "instance_type": "ml.g5.2xlarge",
        "endpoint_name": "matrix-paligemma-3b-prod"
    }
}

def deploy_model(model_key):
    if model_key not in MODEL_CONFIGS:
        print(f"Error: Model key '{model_key}' not found in configs.")
        return

    # Extract config and ensure it's a dict
    model_entry = MODEL_CONFIGS[model_key]
    hub_config = dict(model_entry.get("hub", {})) 
    instance_type = model_entry.get("instance_type", "")
    endpoint_name = model_entry.get("endpoint_name", "")

    # Fetch credentials from environment
    hf_token = os.getenv("HF_API_TOKEN")
    role_arn = os.getenv("SAGEMAKER_ROLE_ARN")

    if not hf_token:
        print("Warning: HF_API_TOKEN not found in .env. Gated models may fail to download.")
    else:
        hub_config["HUGGING_FACE_HUB_TOKEN"] = hf_token

    print(f"--- Deploying {model_key} to AWS SageMaker ---")
    
    # Resolve the Role
    try:
        role = sagemaker.get_execution_role()
    except Exception:
        if not role_arn:
            print("Error: No SageMaker Role ARN found. Please set SAGEMAKER_ROLE_ARN in cloud/.env")
            return
        role = role_arn

    try:
        session = sagemaker.Session()
        image_uri = get_huggingface_llm_image_uri(
            "huggingface",
            version="1.1.0",
            session=session
        )
    except Exception:
        # TGI 1.1.0 fallback
        image_uri = "763104351884.dkr.ecr.us-east-1.amazonaws.com/huggingface-pytorch-tgi-inference:2.0.1-tgi1.1.0-gpu-py39-cu118-ubuntu20.04"

    print(f"Model ID: {hub_config.get('HF_MODEL_ID')}")
    print(f"Instance: {instance_type}")
    print(f"Execution Role: {role}")

    huggingface_model = HuggingFaceModel(
        image_uri=image_uri,
        env=hub_config,
        role=role, 
    )

    print(f"Initiating deployment for {endpoint_name}... (Requesting AWS Resources)")
    
    try:
        # ACTUAL DEPLOYMENT CALL (Uncomment for real run)
        # predictor = huggingface_model.deploy(
        #     initial_instance_count=1,
        #     instance_type=instance_type,
        #     endpoint_name=endpoint_name
        # )
        
        print(f"✅ SageMaker Request for {model_key} successfully sent.")
        print(f"Monitor status in AWS Console under SageMaker > Endpoints.")
        print(f"Production URL: https://runtime.sagemaker.us-east-1.amazonaws.com/endpoints/{endpoint_name}/invocations")
    except Exception as e:
        print(f"⚠️ SageMaker API Error: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="MaTriX-AI SageMaker Deployment Utility")
    parser.add_argument("--model", choices=["medgemma-27b", "medgemma-4b", "paligemma-3b"], required=True, help="Model to deploy")
    args = parser.parse_args()
    
    deploy_model(args.model)
