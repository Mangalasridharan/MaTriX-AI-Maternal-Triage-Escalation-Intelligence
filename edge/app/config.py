"""Configuration settings for the edge system — updated with JWT secret."""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    app_name: str = "MaTriX-AI Edge System"
    debug: bool = False

    # Database
    database_url: str = "" # Must be set via DATABASE_URL env var

    # Local LLM (Ollama — MedGemma 4B)
    ollama_base_url: str = "http://localhost:11434"
    local_model: str = "medgemma:4b"
    local_llm_context: int = 4096
    local_llm_temperature: float = 0.1

    # Embeddings (768-dim per spec)
    embedding_model: str = "all-mpnet-base-v2"

    # Cloud escalation service
    cloud_api_url: str = "http://localhost:9000"
    cloud_api_key: str = ""  # Must be set via CLOUD_API_KEY env var

    # JWT Auth (frontend ↔ edge)
    jwt_secret_key: str = ""  # Must be set via JWT_SECRET_KEY env var
    jwt_algorithm: str = "HS256"

    # Clinic shared password (nurse login)
    clinic_password: str = "demo1234"

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
