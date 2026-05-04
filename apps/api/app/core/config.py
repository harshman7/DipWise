from typing import Literal

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "DipWise API"
    ENV: str = "development"

    DATABASE_URL: str = "postgresql://dipwise:dipwise_secret@localhost:5432/dipwise"
    REDIS_URL: str = "redis://localhost:6379/0"

    JWT_SECRET_KEY: str = "change-me-to-a-random-secret"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    MARKET_DATA_PROVIDER: Literal["yahoo", "polygon", "alphavantage"] = "yahoo"
    MARKET_DATA_API_KEY: str = ""
    PRICE_STALE_DAYS: int = 2

    NEWS_API_KEY: str = ""

    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
    ]

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
