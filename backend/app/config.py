"""Application settings and environment configuration for Team COLLO."""

import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

ENV_PATH = Path(__file__).resolve().parent.parent / ".env"


class Settings(BaseSettings):
    """Central configuration settings loaded from environment or .env."""

    model_config = SettingsConfigDict(
        env_file=str(ENV_PATH),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173"

    DATABASE_URL: str = "postgresql+psycopg://localhost:5432/teamcollo"

    # JWT Authentication settings
    JWT_SECRET_KEY: str = ""
    SECRET_KEY: str = ""
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    @property
    def jwt_secret(self) -> str:
        """Retrieve the secret key for signing JWT tokens.

        Ensures production deployments cannot run without an explicitly configured secret.
        """
        secret = self.JWT_SECRET_KEY or self.SECRET_KEY
        if not secret:
            if self.ENVIRONMENT.lower() in ("production", "prod"):
                raise ValueError(
                    "JWT_SECRET_KEY must be configured in environment or .env for production."
                )
            # Safe development fallback key
            return "teamcollo-dev-secret-key-replace-in-production-f4c0a1879d"
        return secret

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse comma-separated CORS origins into a list."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


settings = Settings()

