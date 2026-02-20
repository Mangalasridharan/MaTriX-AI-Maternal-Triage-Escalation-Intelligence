"""Local LLM model integration."""

class LocalLLM:
    """Interface for local language model."""
    
    def __init__(self, model_name: str = "ollama"):
        """Initialize local LLM."""
        self.model_name = model_name
    
    async def generate(self, prompt: str) -> str:
        """Generate response from local LLM."""
        pass
