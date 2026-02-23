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
            "HF_MODEL_QUANTIZE": "bitsandbytes",
            "MAX_INPUT_LENGTH": "2048",
            "MAX_TOTAL_TOKENS": "4096",
        },
        "instance_type": "ml.g5.12xlarge",
        "endpoint_name": "matrix-medgemma-27b-prod"
    },
    "medgemma-4b": {
        "hub": {
            "HF_MODEL_ID": "google/medgemma-4b-it",
            "SM_NUM_GPUS": "1",
            "HF_MODEL_QUANTIZE": "bitsandbytes",
            "MAX_INPUT_LENGTH": "2048",
            "MAX_TOTAL_TOKENS": "4096",
        },
        "instance_type": "ml.g5.2xlarge",
        "endpoint_name": "matrix-medgemma-4b-prod"
    },
    "paligemma-3b": {
        "hub": {
            "HF_MODEL_ID": "google/paligemma-3b-pt-224",
            "SM_NUM_GPUS": "1",
            "HF_MODEL_QUANTIZE": "bitsandbytes",
            "MAX_INPUT_LENGTH": "1024",
            "MAX_TOTAL_TOKENS": "2048",
        },
        "instance_type": "ml.g5.2xlarge",
        "endpoint_name": "matrix-paligemma-3b-prod"
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
        hub_config["HUGGING_FACE_HUB_TOKEN"] = hf_token

    # Boto3 Client
    sm_client = boto3.client("sagemaker", region_name=region)

    # Image URI (TGI 1.1.0)
    image_uri = f"763104351884.dkr.ecr.{region}.amazonaws.com/huggingface-pytorch-tgi-inference:2.0.1-tgi1.1.0-gpu-py39-cu118-ubuntu20.04"

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
                print(f"Endpoint already exists. Updating...")
                sm_client.update_endpoint(
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
