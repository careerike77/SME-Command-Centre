import os
from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel, Field
from typing import List, Optional
from sanitizer import PromptSanitizer
from adapters import MockLLMAdapter, OpenAIAdapter, AnthropicAdapter

app = FastAPI(title="AI-BOS AI Microservice", version="0.1.0")

class SanitizeRouteRequest(BaseModel):
    prompt: str = Field(..., min_length=1)
    tenant_id: str
    user_roles: List[str] = Field(default_factory=list)

class SanitizeRouteResponse(BaseModel):
    status: str
    provider: str
    sanitized_prompt: str
    intent: str
    response: str
    confidence: float

@app.post("/api/v1/ai/sanitize-and-route", response_model=SanitizeRouteResponse)
async def sanitize_and_route(
    body: SanitizeRouteRequest,
    x_tenant_id: Optional[str] = Header(None, alias="X-Tenant-ID")
):
    # Enforce tenant isolation in header / payload alignment
    if x_tenant_id and x_tenant_id != body.tenant_id:
        raise HTTPException(status_code=403, detail="Tenant ID header mismatch")

    sanitized = PromptSanitizer.sanitize(body.prompt)

    mock_mode = os.getenv("MOCK_LLM_MODE", "true").lower() == "true"
    provider = os.getenv("LLM_PROVIDER", "mock").lower()

    if mock_mode or provider == "mock":
        adapter = MockLLMAdapter()
    elif provider == "openai":
        adapter = OpenAIAdapter(api_key=os.getenv("OPENAI_API_KEY", ""))
    elif provider == "anthropic":
        adapter = AnthropicAdapter(api_key=os.getenv("ANTHROPIC_API_KEY", ""))
    else:
        adapter = MockLLMAdapter()

    res = await adapter.generate_response(sanitized, body.tenant_id, body.user_roles)
    return res
