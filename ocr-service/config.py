from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    google_application_credentials: str = ""
    internal_secret: str = "changeme"
    backend_url: str = "http://api:3000"
    ocr_engine: str = "auto"  # "vision" | "tesseract" | "auto"
    port: int = 8000


settings = Settings()
