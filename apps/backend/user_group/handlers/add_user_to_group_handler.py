from sqlalchemy.ext.asyncio import AsyncSession

from group.errors import GroupNotFoundError
from group.repository import GroupRepository
from user.errors import UserNotFoundError
from user.repository import get_user_by_id
from user_group.errors import UserAlreadyInGroupError
from user_group.models import UserGroup
from user_group.repository import UserGroupRepository
from user_group.schemas import AddUserToGroupRequest


async def add_user_to_group(
    request: AddUserToGroupRequest, db: AsyncSession
) -> UserGroup:
    user = await get_user_by_id(request.user_id, db)
    if user is None:
        raise UserNotFoundError(f"User {request.user_id} not found")

    group_repository = GroupRepository(db)
    group = await group_repository.get_by_id(request.group_id)
    if group is None:
        raise GroupNotFoundError(f"Group {request.group_id} not found")

    repository = UserGroupRepository(db)
    existing = await repository.get_by_user_and_group(
        request.user_id, request.group_id
    )
    if existing is not None:
        raise UserAlreadyInGroupError(
            f"User {request.user_id} is already a member of group {request.group_id}"
        )

    user_group = UserGroup(user_id=request.user_id, group_id=request.group_id)
    return await repository.create(user_group)
