from sqlalchemy.ext.asyncio import AsyncSession

from group.errors import GroupNotFoundError
from group.models import Group
from group.repository import GroupRepository
from group.schemas import JoinGroupRequest
from user.errors import UserNotFoundError
from user.repository import get_user_by_id
from user_group.errors import UserAlreadyInGroupError
from user_group.models import UserGroup
from user_group.repository import UserGroupRepository


async def join_group_by_code(request: JoinGroupRequest, db: AsyncSession) -> Group:
    user = await get_user_by_id(request.user_id, db)
    if user is None:
        raise UserNotFoundError(f"User {request.user_id} not found")

    group_repository = GroupRepository(db)
    group = await group_repository.get_by_code(request.code.strip().upper())
    if group is None:
        raise GroupNotFoundError(f"No group found for code {request.code!r}")

    repository = UserGroupRepository(db)
    existing = await repository.get_by_user_and_group(request.user_id, group.id)
    if existing is not None:
        raise UserAlreadyInGroupError(
            f"User {request.user_id} is already a member of group {group.id}"
        )

    user_group = UserGroup(user_id=request.user_id, group_id=group.id)
    await repository.create(user_group)
    return group
