import os
from pydantic import BaseModel

class Settings(BaseModel):
    PORT: int = int(os.getenv("AI_SERVICE_PORT", "8000"))
    HOST: str = os.getenv("AI_SERVICE_HOST", "0.0.0.0")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEFAULT_TIMEOUT: float = float(os.getenv("AI_TIMEOUT_SECONDS", "45.0"))

settings = Settings()
