from uuid import UUID

from pydantic import BaseModel, ConfigDict


class CreateUserRequest(BaseModel):
    name: str
    email: str
    password: str


class UpdateUserRequest(BaseModel):
    name: str
    email: str
    password: str | None = None


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    email: str
    role: str
