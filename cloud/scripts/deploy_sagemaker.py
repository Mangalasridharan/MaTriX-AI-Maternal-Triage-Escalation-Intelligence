import os
import json
import argparse
import boto3
import time
from dotenv import load_dotenv

# Load env variables from cloud/.env
env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(dotenv_path=env_path)

# Model Configuration Map
MODEL_CONFIGS = {
    "medgemma-27b": {
        "hub": {
            "HF_MODEL_ID": "google/medgemma-27b-it",
            "SM_NUM_GPUS": "4",
            "MAX_INPUT_LENGTH": "2048",
            "MAX_TOTAL_TOKENS": "4096",
            "HF_TRUST_REMOTE_CODE": "true",
        },
        "instance_type": "ml.g5.12xlarge",
        "endpoint_name": "matrix-medgemma-27b-prod"
    },
    "medgemma-4b": {
        "hub": {
            "HF_MODEL_ID": "google/medgemma-1.5-4b-it",
            "SM_NUM_GPUS": "1",
            "MAX_INPUT_LENGTH": "2048",
            "MAX_TOTAL_TOKENS": "4096",
            "HF_TRUST_REMOTE_CODE": "true",
        },
        "instance_type": "ml.g5.2xlarge",
        "endpoint_name": "matrix-medgemma-4b-prod"
    },
    "paligemma-3b": {
        "hub": {
            # Standard HF Inference container env vars (NOT TGI)
            "HF_MODEL_ID": "google/paligemma-3b-pt-224",
            "HF_TASK": "image-text-to-text",
            "HF_TRUST_REMOTE_CODE": "true",
        },
        "instance_type": "ml.g5.2xlarge",
        "endpoint_name": "matrix-paligemma-3b-prod",
        "use_standard_inference": True  # Use HF Inference DLC (not TGI)
    }
}

def deploy_model(model_key):
    if model_key not in MODEL_CONFIGS:
        print(f"Error: Model key '{model_key}' not found in configs.")
        return

    config = MODEL_CONFIGS[model_key]
    hub_config = config["hub"]
    instance_type = config["instance_type"]
    endpoint_name = config["endpoint_name"]
    model_name = f"{endpoint_name}-model-{int(time.time())}"
    variant_name = "AllTraffic"

    # Credentials
    hf_token = os.getenv("HF_API_TOKEN")
    role_arn = os.getenv("SAGEMAKER_ROLE_ARN")
    region = os.getenv("AWS_REGION", "us-east-1")

    if hf_token:
        hub_config["HF_TOKEN"] = hf_token

    # Boto3 Client
    sm_client = boto3.client("sagemaker", region_name=region)

    # Image URI selection:
    # - PaliGemma is a VLM and CANNOT use TGI (text-generation-server). Use the
    #   standard HF PyTorch Inference container with transformers pipeline instead.
    # - MedGemma models use TGI for high-performance text generation.
    use_standard_inference = config.get("use_standard_inference", False)
    if use_standard_inference:
        # Standard HuggingFace Inference DLC (transformers 4.49 supports PaliGemma natively)
        # Tag sourced from: https://aws.github.io/deep-learning-containers/reference/available_images/
        image_uri = f"763104351884.dkr.ecr.{region}.amazonaws.com/huggingface-pytorch-inference:2.6.0-transformers4.49.0-gpu-py312-cu124-ubuntu22.04"
    else:
        # TGI 3.3.4-v2.0 on PyTorch 2.7 — confirmed to exist in ECR (verified via describe-images)
        # NOTE: bitsandbytes removed (incompatible with cuda graphs in TGI 3.x)
        # NOTE: HF_TOKEN is now correctly injected for gated model access
        image_uri = f"763104351884.dkr.ecr.{region}.amazonaws.com/huggingface-pytorch-tgi-inference:2.7.0-tgi3.3.4-gpu-py311-cu124-ubuntu22.04-v2.0"

    print(f"--- Deploying {model_key} to AWS SageMaker ---")
    print(f"Model ID: {hub_config.get('HF_MODEL_ID')}")
    print(f"Instance: {instance_type}")
    print(f"Region: {region}")

    try:
        # 1. Create Model
        print(f"Creating model resource: {model_name}...")
        sm_client.create_model(
            ModelName=model_name,
            ExecutionRoleArn=role_arn,
            PrimaryContainer={
                "Image": image_uri,
                "Environment": hub_config
            }
        )

        # 2. Create Endpoint Config
        print(f"Creating endpoint configuration...")
        config_name = f"{endpoint_name}-config-{int(time.time())}"
        sm_client.create_endpoint_config(
            EndpointConfigName=config_name,
            ProductionVariants=[
                {
                    "VariantName": variant_name,
                    "ModelName": model_name,
                    "InstanceType": instance_type,
                    "InitialInstanceCount": 1
                }
            ]
        )

        # 3. Create/Update Endpoint
        print(f"Deploying endpoint: {endpoint_name}...")
        try:
            sm_client.create_endpoint(
                EndpointName=endpoint_name,
                EndpointConfigName=config_name
            )
        except sm_client.exceptions.ClientError as e:
            if "already exists" in str(e):
                # Check if endpoint is in a terminal Failed state - must delete first
                try:
                    ep = sm_client.describe_endpoint(EndpointName=endpoint_name)
                    if ep["EndpointStatus"] == "Failed":
                        print(f"Endpoint is in Failed state. Deleting for clean redeploy...")
                        sm_client.delete_endpoint(EndpointName=endpoint_name)
                        time.sleep(20)  # wait for deletion to propagate
                        sm_client.create_endpoint(
                            EndpointName=endpoint_name,
                            EndpointConfigName=config_name
                        )
                    else:
                        print(f"Endpoint exists (status: {ep['EndpointStatus']}). Updating...")
                        sm_client.update_endpoint(
                            EndpointName=endpoint_name,
                            EndpointConfigName=config_name
                        )
                except sm_client.exceptions.ClientError:
                    sm_client.create_endpoint(
                        EndpointName=endpoint_name,
                        EndpointConfigName=config_name
                    )
            else:
                raise e

        print(f"✅ SageMaker deployment for {model_key} initiated successfully.")
        print(f"It will take 10-15 minutes to become 'InService'.")
        print(f"Monitor status in AWS Console under SageMaker > Endpoints.")

    except Exception as e:
        print(f"⚠️ SageMaker Deployment Error: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="MaTriX-AI SageMaker Boto3 Deployment Utility")
    parser.add_argument("--model", choices=["medgemma-27b", "medgemma-4b", "paligemma-3b"], required=True)
    args = parser.parse_args()
    
    deploy_model(args.model)
