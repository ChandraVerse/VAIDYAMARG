from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    OCR_ENGINE: str = "tesseract"          # google | tesseract
    GOOGLE_APPLICATION_CREDENTIALS: str = ""
    BACKEND_CALLBACK_URL: str = "http://localhost:3000/api/v1/prescriptions/ocr-result"
    BACKEND_INTERNAL_SECRET: str = "changeme"
    REDIS_URL: str = "redis://localhost:6379"
    PORT: int = 8000
    LOG_LEVEL: str = "info"
    MAX_FILE_SIZE_MB: int = 10

    class Config:
        env_file = ".env"


settings = Settings()
