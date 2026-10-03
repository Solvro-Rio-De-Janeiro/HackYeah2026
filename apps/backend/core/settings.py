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


settings = Settings()
