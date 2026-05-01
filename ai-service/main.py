"""
ai-service — VaidyaMarg AI Recommendation Service (stub)

Placeholder service that satisfies Docker Compose and Nginx upstream
configuration. Replace this stub with real medicine recommendation
ML logic when Phase 4 work begins.

Planned features:
  - Generic medicine recommendation from patient history
  - Interaction checker
  - Chronic disease refill prediction
"""
from __future__ import annotations
from fastapi import FastAPI

app = FastAPI(
    title="VaidyaMarg AI Service",
    description="AI recommendation service — Phase 4 (stub)",
    version="0.1.0-stub",
)


@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "ok",
        "service": "ai-service",
        "version": "0.1.0-stub",
        "note": "Stub service — real ML implementation in Phase 4",
    }


@app.get("/", include_in_schema=False)
async def root():
    return {"message": "VaidyaMarg AI Service — see /docs"}
