"""Cloud service configuration — HuggingFace Inference Endpoint on AWS."""
from pydantic_settings import BaseSettings
from functools import lru_cache


class CloudSettings(BaseSettings):
    """Cloud service settings."""
    # Security
    cloud_api_key: str = "changeme"

    # HuggingFace Inference Endpoint (AWS-hosted 27B) - Optional
    hf_inference_endpoint: str = ""       # e.g. https://xxx.us-east-1.aws.endpoints.huggingface.cloud
    hf_api_token: str = ""                # HF API token
    hf_model_id: str = "google/medgemma-27b-it"  # default model

    # AWS SageMaker Endpoints
    sm_27b_endpoint: str = "matrix-medgemma-27b-prod"
    sm_4b_endpoint: str = "matrix-medgemma-4b-prod"
    sm_paligemma_endpoint: str = "matrix-paligemma-3b-prod"
    aws_region: str = "us-east-1"

    # Ollama fallback (local)
    ollama_base_url: str = "http://localhost:11434"
    cloud_model: str = "llama3:latest"

    debug: bool = False

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_cloud_settings() -> CloudSettings:
    return CloudSettings()


cloud_settings = get_cloud_settings()
