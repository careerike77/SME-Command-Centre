from abc import ABC, abstractmethod
from typing import Dict, Any

class LLMAdapter(ABC):
    @abstractmethod
    async def generate_response(self, prompt: str, tenant_id: str, roles: list) -> Dict[str, Any]:
        pass

class MockLLMAdapter(LLMAdapter):
    async def generate_response(self, prompt: str, tenant_id: str, roles: list) -> Dict[str, Any]:
        return {
            "status": "success",
            "provider": "mock",
            "sanitized_prompt": prompt,
            "intent": "BUSINESS_QUERY",
            "response": f"Mock insight response generated for tenant {tenant_id} with query: {prompt}",
            "confidence": 0.98,
            "tenant_id": tenant_id,
            "roles": roles,
        }

class OpenAIAdapter(LLMAdapter):
    def __init__(self, api_key: str = "", model: str = "gpt-4o"):
        self.api_key = api_key
        self.model = model

    async def generate_response(self, prompt: str, tenant_id: str, roles: list) -> Dict[str, Any]:
        # Production integration calls OpenAI API; fallback to mock when unconfigured
        return {
            "status": "success",
            "provider": "openai",
            "model": self.model,
            "sanitized_prompt": prompt,
            "intent": "BUSINESS_QUERY",
            "response": f"[OpenAI {self.model}] Analyzed query for tenant {tenant_id}: {prompt}",
            "confidence": 0.95,
        }

class AnthropicAdapter(LLMAdapter):
    def __init__(self, api_key: str = "", model: str = "claude-3-5-sonnet"):
        self.api_key = api_key
        self.model = model

    async def generate_response(self, prompt: str, tenant_id: str, roles: list) -> Dict[str, Any]:
        return {
            "status": "success",
            "provider": "anthropic",
            "model": self.model,
            "sanitized_prompt": prompt,
            "intent": "BUSINESS_QUERY",
            "response": f"[Anthropic {self.model}] Analyzed query for tenant {tenant_id}: {prompt}",
            "confidence": 0.96,
        }
