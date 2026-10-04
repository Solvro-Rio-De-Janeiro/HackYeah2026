from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(extra="ignore", env_file=".env")
    connection_string: str = Field(default="", validation_alias="CONNECTION_STRING")
    stripe_secret_key: str = Field(default="", validation_alias="STRIPE_SECRET_KEY")
    stripe_webhook_secret: str = Field(
        default="", validation_alias="STRIPE_WEBHOOK_SECRET"
    )
    frontend_url: str = Field(
        default="http://localhost:4200", validation_alias="FRONTEND_URL"
    )
    jwt_secret_key: str = Field(
        default="dev-secret-change-me", validation_alias="JWT_SECRET_KEY"
    )
    jwt_access_token_expires_minutes: int = Field(
        default=60, validation_alias="JWT_ACCESS_TOKEN_EXPIRES_MINUTES"
    )
    vapid_private_key: str = Field(default="", validation_alias="VAPID_PRIVATE_KEY")
    vapid_subject: str = Field(
        default="mailto:admin@example.com", validation_alias="VAPID_SUBJECT"
    )


settings = Settings()
