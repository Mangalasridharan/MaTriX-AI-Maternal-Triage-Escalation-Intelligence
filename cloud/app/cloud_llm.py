"""
Cloud LLM client — HuggingFace Inference Endpoint (AWS) for 27B model.
Falls back to local Ollama if HF endpoint is not configured.
"""
import json
import asyncio
import httpx
from app.config import cloud_settings


class CloudLLM:
    """Async client for multi-model SageMaker or HF Inference Endpoints with Ollama fallback."""

    def __init__(self):
        self.hf_endpoint = cloud_settings.hf_inference_endpoint.rstrip("/")
        self.hf_token = cloud_settings.hf_api_token
        self.aws_region = cloud_settings.aws_region
        self.ollama_url = cloud_settings.ollama_base_url
        self.ollama_model = cloud_settings.cloud_model
        self.timeout = 60.0
        self.max_retries = 2

    async def generate(self, prompt: str, system: str = "", model_type: str = "27b", image_data: str | None = None) -> dict:
        """
        Generate a structured response. 
        model_type: '27b', '4b', or 'vision'
        """
        endpoint = self._get_endpoint(model_type)
        
        if endpoint:
            try:
                return await self._call_sagemaker(endpoint, prompt, system, image_data)
            except Exception as exc:
                print(f"SageMaker ({model_type}) failed: {exc}, trying next...")
        
        # HF only supports the main model (27b) in this setup
        if model_type == "27b" and self.hf_endpoint and self.hf_token:
            return await self._call_hf(prompt, system)
        
        # Final fallback to Ollama
        try:
            return await self._call_ollama(prompt, system, image_data)
        except Exception as exc:
            if cloud_settings.debug:
                print(f"Ollama failed: {exc}. DEBUG mode: providing mock vision response.")
                if model_type == "vision":
                    return {
                        "analysis": "Clinical image shows significant bilateral pitting edema (grade 2+) and moderate facial swelling, consistent with pre-eclampsia symptoms.",
                        "findings": ["pitting_edema", "facial_swelling", "potential_preeclampsia"],
                        "risk_correction": 15.0
                    }
            raise exc

    def _get_endpoint(self, model_type: str) -> str:
        if model_type == "27b": return cloud_settings.sm_27b_endpoint
        if model_type == "4b": return cloud_settings.sm_4b_endpoint
        if model_type == "vision": return cloud_settings.sm_paligemma_endpoint
        return ""

    async def _call_sagemaker(self, endpoint: str, prompt: str, system: str, image_data: str | None = None) -> dict:
        """Invoke SageMaker endpoint."""
        import boto3
        
        # Chat template for Gemma-2 / PaliGemma
        full_prompt = f"<start_of_turn>system\n{system}<end_of_turn>\n<start_of_turn>user\n"
        if image_data:
            full_prompt += f"Attached Image: {image_data[:100]}... [Base64]\n" # Simplified for TGI vision-id
        full_prompt += f"{prompt}<end_of_turn>\n<start_of_turn>model\n"
        
        payload = {
            "inputs": full_prompt,
            "parameters": {
                "max_new_tokens": 1500,
                "temperature": 0.05,
                "do_sample": False,
            },
        }
        
        # If it's a VLM, we might need to restructure payload depending on TGI version
        # For this demo, we assume the prompt is augmented or the endpoint handles the base64

        def _invoke():
            client = boto3.client("sagemaker-runtime", region_name=self.aws_region)
            
            # PaliGemma on Standard HF Inference DLC requires a specific dict structure
            if model_type == "vision":
                # Standard HF Inference Container format for image-to-text
                payload_vision = {
                    "inputs": image_data if image_data else "",
                    "parameters": {
                        "prompt": prompt,
                        "max_new_tokens": 500
                    }
                }
                # Note: Some DLC versions prefer {"inputs": {"image": "...", "text": "..."}}
                # We'll use the most common one for the deployed task "image-text-to-text"
                body = json.dumps(payload_vision)
            else:
                # Standard TGI format for MedGemma text models
                body = json.dumps(payload)

            response = client.invoke_endpoint(
                EndpointName=endpoint,
                Body=body,
                ContentType="application/json",
            )
            return json.loads(response["Body"].read().decode())

        data = await asyncio.to_thread(_invoke)
        
        if isinstance(data, list) and len(data) > 0:
            raw = data[0].get("generated_text", "{}")
        elif isinstance(data, dict):
            raw = data.get("generated_text", "{}")
        else:
            raw = "{}"

        return _extract_json(raw)

    async def _call_hf(self, prompt: str, system: str) -> dict:
        """Call HuggingFace TGI API."""
        full_prompt = f"<start_of_turn>system\n{system}<end_of_turn>\n<start_of_turn>user\n{prompt}<end_of_turn>\n<start_of_turn>model\n"
        payload = {
            "inputs": full_prompt,
            "parameters": {"max_new_tokens": 1500, "temperature": 0.05, "return_full_text": False},
        }
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.post(
                self.hf_endpoint,
                json=payload,
                headers={"Authorization": f"Bearer {self.hf_token}"}
            )
            resp.raise_for_status()
            data = resp.json()
            if isinstance(data, list) and len(data) > 0:
                raw = data[0].get("generated_text", "{}")
            elif isinstance(data, dict):
                raw = data.get("generated_text", "{}")
            else:
                raw = "{}"
            return _extract_json(raw)

    async def _call_ollama(self, prompt: str, system: str, image_data: str | None = None) -> dict:
        """Fallback to local Ollama."""
        payload = {
            "model": self.ollama_model,
            "prompt": prompt,
            "system": system,
            "format": "json",
            "stream": False,
        }
        if image_data:
            payload["images"] = [image_data]
            
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.post(f"{self.ollama_url}/api/generate", json=payload)
            resp.raise_for_status()
            return json.loads(resp.json().get("response", "{}"))


def _extract_json(text: str) -> dict:
    import re
    # 1. Try direct parse
    try:
        return json.loads(text.strip())
    except Exception:
        pass
    
    # 2. Try cleaning markdown blocks
    text = re.sub(r"```json\s*", "", text)
    text = re.sub(r"```\s*", "", text)
    
    # 3. Try finding first { and last }
    match = re.search(r"(\{.*\})", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except Exception:
            pass
            
    return {}

cloud_llm = CloudLLM()
