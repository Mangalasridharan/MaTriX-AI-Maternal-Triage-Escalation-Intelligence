"""
Cloud LLM client — HuggingFace Inference Endpoint (AWS) for 27B model.
Falls back to local Ollama if HF endpoint is not configured.
"""
import json
import asyncio
import httpx
from app.config import cloud_settings


class CloudLLM:
    """Async client for the 27B model on SageMaker or HF Inference Endpoints with Ollama fallback."""

    def __init__(self):
        self.hf_endpoint = cloud_settings.hf_inference_endpoint.rstrip("/")
        self.hf_token = cloud_settings.hf_api_token
        self.sm_endpoint = cloud_settings.sagemaker_endpoint_name
        self.aws_region = cloud_settings.aws_region
        self.ollama_url = cloud_settings.ollama_base_url
        self.ollama_model = cloud_settings.cloud_model
        self.timeout = 60.0
        self.max_retries = 2

    def _use_sagemaker(self) -> bool:
        return bool(self.sm_endpoint)

    def _use_hf(self) -> bool:
        return bool(self.hf_endpoint and self.hf_token)

    async def generate(self, prompt: str, system: str = "") -> dict:
        """
        Generate a structured JSON response from the 27B model.
        Order of precedence:
        1. AWS SageMaker (MedGemma-27B)
        2. HuggingFace Inference Endpoint (AWS-hosted)
        3. Local Ollama Fallback
        """
        if self._use_sagemaker():
            try:
                return await self._call_sagemaker(prompt, system)
            except Exception as exc:
                print(f"SageMaker failed: {exc}, trying next...")
        
        if self._use_hf():
            return await self._call_hf(prompt, system)
        else:
            return await self._call_ollama(prompt, system)

    async def _call_sagemaker(self, prompt: str, system: str) -> dict:
        """Invoke SageMaker endpoint (synchronous boto3 wrapped in to_thread)."""
        import boto3
        
        # Gemma-2 chat template
        full_prompt = f"<start_of_turn>system\n{system}<end_of_turn>\n<start_of_turn>user\n{prompt}<end_of_turn>\n<start_of_turn>model\n"
        
        payload = {
            "inputs": full_prompt,
            "parameters": {
                "max_new_tokens": 1500,
                "temperature": 0.05,
                "do_sample": False,
            },
        }

        def _invoke():
            client = boto3.client("sagemaker-runtime", region_name=self.aws_region)
            response = client.invoke_endpoint(
                EndpointName=self.sm_endpoint,
                Body=json.dumps(payload),
                ContentType="application/json",
            )
            return json.loads(response["Body"].read().decode())

        try:
            data = await asyncio.to_thread(_invoke)
            # TGI on SageMaker often returns a list or dict depending on configuration
            raw = data[0]["generated_text"] if isinstance(data, list) else data.get("generated_text", "{}")
            return _extract_json(raw)
        except Exception:
            raise

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
            except Exception:
                if attempt == self.max_retries:
                    # Fallback to Ollama
                    return await self._call_ollama(prompt, system)
                await asyncio.sleep(2 ** attempt)
        return {}  # Explicit return for linters

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
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.post(f"{self.ollama_url}/api/generate", json=payload)
                resp.raise_for_status()
                raw = resp.json().get("response", "{}")
                return json.loads(raw)
        except Exception:
            return {}  # Explicit return for linters


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
