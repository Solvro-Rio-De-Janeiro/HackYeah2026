from uuid import UUID

from fastapi import APIRouter, HTTPException, status

from core.db_config import DBSessionDep
from group.errors import GroupNotFoundError
from group.schemas import GroupResponse
from user.errors import UserNotFoundError
from user_group.errors import UserAlreadyInGroupError, UserGroupNotFoundError
from user_group.handlers.add_user_to_group_handler import (
    add_user_to_group as _add_user_to_group,
)
from user_group.handlers.get_user_groups_handler import (
    get_user_groups as _get_user_groups,
)
from user_group.handlers.remove_user_from_group_handler import (
    remove_user_from_group as _remove_user_from_group,
)
from user_group.schemas import AddUserToGroupRequest, UserGroupResponse

router = APIRouter()


@router.post(
    "/user-group",
    response_model=UserGroupResponse,
    status_code=status.HTTP_201_CREATED,
)
async def add_user_to_group(
    request: AddUserToGroupRequest, db: DBSessionDep
) -> UserGroupResponse:
    try:
        user_group = await _add_user_to_group(request, db)
    except (UserNotFoundError, GroupNotFoundError) as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc
    except UserAlreadyInGroupError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail=str(exc)
        ) from exc
    return UserGroupResponse.model_validate(user_group)


@router.delete("/user-group/{group_id}/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_user_from_group(
    group_id: UUID, user_id: UUID, db: DBSessionDep
) -> None:
    try:
        await _remove_user_from_group(group_id, user_id, db)
    except UserGroupNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc


@router.get("/user-group/user/{user_id}", response_model=list[GroupResponse])
async def get_user_groups(
    user_id: UUID, db: DBSessionDep
) -> list[GroupResponse]:
    try:
        groups = await _get_user_groups(user_id, db)
    except UserNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc
    return [GroupResponse.model_validate(group) for group in groups]
