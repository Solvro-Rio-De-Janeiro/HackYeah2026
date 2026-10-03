from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(extra="ignore", env_file=".env")
    connection_string: str = Field(default="", validation_alias="CONNECTION_STRING")
