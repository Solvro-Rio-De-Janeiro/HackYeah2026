from fastapi import APIRouter, HTTPException, status

from core.db_config import DBSessionDep
from group.errors import GroupNotFoundError
from user.errors import UserNotFoundError
from user_group.errors import UserAlreadyInGroupError
from user_group.handlers.add_user_to_group_handler import (
    add_user_to_group as _add_user_to_group,
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
