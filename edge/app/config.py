"""Configuration settings for the edge system."""
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Application settings."""
    app_name: str = "Edge Clinic System"
    debug: bool = False
    database_url: str = "sqlite:///./clinic.db"
    
    class Config:
        env_file = ".env"

settings = Settings()
