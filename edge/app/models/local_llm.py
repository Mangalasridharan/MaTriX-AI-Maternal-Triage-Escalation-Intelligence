"""Local LLM client via Ollama REST API."""
import json
import asyncio
import httpx
from app.config import settings


class LocalLLM:
    """Async interface to the locally running Ollama instance."""

    def __init__(self):
        self.base_url = settings.ollama_base_url
        self.model = settings.local_model
        self.timeout = 90.0
        self.max_retries = 3

    async def generate(self, prompt: str, system: str = "") -> dict:
        """
        Call Ollama /api/generate with JSON mode.
        Returns parsed dict from model JSON output.
        Retries up to max_retries times on failure.
        """
        payload = {
            "model": self.model,
            "prompt": prompt,
            "system": system,
            "format": "json",
            "stream": False,
            "options": {
                "temperature": 0.1,
                "num_predict": 1200,
            },
        }

        for attempt in range(1, self.max_retries + 1):
            try:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    resp = await client.post(
                        f"{self.base_url}/api/generate",
                        json=payload,
                    )
                    resp.raise_for_status()
                    raw = resp.json().get("response", "{}")
                    return json.loads(raw)
            except (httpx.HTTPError, json.JSONDecodeError) as exc:
                if attempt == self.max_retries:
                    raise RuntimeError(
                        f"LocalLLM failed after {self.max_retries} attempts: {exc}"
                    ) from exc
                await asyncio.sleep(2 ** attempt)   # exponential backoff

    async def health_check(self) -> bool:
        """Return True if Ollama is reachable and model is available."""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(f"{self.base_url}/api/tags")
                models = [m["name"] for m in resp.json().get("models", [])]
                return any(self.model in m for m in models)
        except Exception:
            return False


# Module-level singleton
local_llm = LocalLLM()
