"""Cloud service configuration — HuggingFace Inference Endpoint on AWS."""
from pydantic_settings import BaseSettings
from functools import lru_cache


class CloudSettings(BaseSettings):
    """Cloud service settings."""
    # Security
    cloud_api_key: str = "changeme"

    # HuggingFace Inference Endpoint (AWS-hosted 27B)
    hf_inference_endpoint: str = ""       # e.g. https://xxx.us-east-1.aws.endpoints.huggingface.cloud
    hf_api_token: str = ""                # HF API token
    hf_model_id: str = "google/gemma-2-27b-it"  # default model

    # Ollama fallback (local)
    ollama_base_url: str = "http://localhost:11434"
    cloud_model: str = "llama3:latest"

    debug: bool = False

    class Config:
        env_file = ".env"


@lru_cache()
def get_cloud_settings() -> CloudSettings:
    return CloudSettings()


cloud_settings = get_cloud_settings()
