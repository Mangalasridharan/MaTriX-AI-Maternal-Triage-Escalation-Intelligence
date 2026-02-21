"""
Cloud LLM client — HuggingFace Inference Endpoint (AWS) for 27B model.
Falls back to local Ollama if HF endpoint is not configured.
"""
import json
import asyncio
import httpx
from app.config import cloud_settings


class CloudLLM:
    """Async client for the 27B model on HF Inference Endpoints (AWS) with Ollama fallback."""

    def __init__(self):
        self.hf_endpoint = cloud_settings.hf_inference_endpoint.rstrip("/")
        self.hf_token = cloud_settings.hf_api_token
        self.ollama_url = cloud_settings.ollama_base_url
        self.ollama_model = cloud_settings.cloud_model
        self.timeout = 60.0
        self.max_retries = 2

    def _use_hf(self) -> bool:
        return bool(self.hf_endpoint and self.hf_token)

    async def generate(self, prompt: str, system: str = "") -> dict:
        """
        Generate a structured JSON response from the 27B model.
        Primary:  HuggingFace Inference Endpoint (AWS, Gemma-2-27B-IT)
        Fallback: Local Ollama (llama3:latest or similar)
        """
        if self._use_hf():
            return await self._call_hf(prompt, system)
        else:
            return await self._call_ollama(prompt, system)

    async def _call_hf(self, prompt: str, system: str) -> dict:
        """Call HuggingFace Text Generation Inference API (TGI compatible)."""
        full_prompt = f"<start_of_turn>system\n{system}<end_of_turn>\n<start_of_turn>user\n{prompt}<end_of_turn>\n<start_of_turn>model\n"

        payload = {
            "inputs": full_prompt,
            "parameters": {
                "max_new_tokens": 1500,
                "temperature": 0.05,
                "return_full_text": False,
                "do_sample": False,
            },
        }

        for attempt in range(1, self.max_retries + 1):
            try:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    resp = await client.post(
                        self.hf_endpoint,
                        json=payload,
                        headers={
                            "Authorization": f"Bearer {self.hf_token}",
                            "Content-Type": "application/json",
                        },
                    )
                    resp.raise_for_status()
                    data = resp.json()
                    # TGI returns [{"generated_text": "..."}]
                    raw = data[0]["generated_text"] if isinstance(data, list) else data.get("generated_text", "{}")
                    # Extract JSON from the response
                    return _extract_json(raw)
            except Exception as exc:
                if attempt == self.max_retries:
                    # Fallback to Ollama
                    return await self._call_ollama(prompt, system)
                await asyncio.sleep(2 ** attempt)

    async def _call_ollama(self, prompt: str, system: str) -> dict:
        """Fallback: call local Ollama API."""
        payload = {
            "model": self.ollama_model,
            "prompt": prompt,
            "system": system,
            "format": "json",
            "stream": False,
            "options": {"temperature": 0.05, "num_predict": 1500},
        }
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.post(f"{self.ollama_url}/api/generate", json=payload)
            resp.raise_for_status()
            raw = resp.json().get("response", "{}")
            return json.loads(raw)


def _extract_json(text: str) -> dict:
    """Extract the first valid JSON object from a text response."""
    import re
    # Try direct parse first
    try:
        return json.loads(text.strip())
    except json.JSONDecodeError:
        pass
    # Extract from markdown code block
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if match:
        return json.loads(match.group(1))
    # Find first {...} block
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        return json.loads(match.group(0))
    return {}


# Module-level singleton
cloud_llm = CloudLLM()
