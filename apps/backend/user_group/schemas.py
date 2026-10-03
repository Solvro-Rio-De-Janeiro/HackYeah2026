from uuid import UUID

from pydantic import BaseModel, ConfigDict


class AddUserToGroupRequest(BaseModel):
    user_id: UUID
    group_id: UUID


class UserGroupResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    group_id: UUID
    completions: list[bool]
