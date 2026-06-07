from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./travel_planner.db"
    SECRET_KEY: str = "change-this-secret-key-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    GOOGLE_GEMINI_API_KEY: Optional[str] = None
    OPENWEATHER_API_KEY: Optional[str] = None
    GOOGLE_PLACES_API_KEY: Optional[str] = None
    CHROMA_DB_PATH: str = "./chroma_db"
    FRONTEND_URL: str = "http://localhost:5173"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()
