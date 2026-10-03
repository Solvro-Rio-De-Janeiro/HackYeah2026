from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(extra="ignore", env_file=".env")
    connection_string: str = Field(default="", validation_alias="CONNECTION_STRING")
    jwt_secret_key: str = Field(
        default="dev-secret-change-me", validation_alias="JWT_SECRET_KEY"
    )
    jwt_access_token_expires_minutes: int = Field(
        default=60, validation_alias="JWT_ACCESS_TOKEN_EXPIRES_MINUTES"
    )


settings = Settings()
