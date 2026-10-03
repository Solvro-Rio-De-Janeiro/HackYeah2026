from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from group.models import Group
from user.errors import UserNotFoundError
from user.repository import get_user_by_id
from user_group.repository import UserGroupRepository


async def get_user_groups(user_id: UUID, db: AsyncSession) -> list[Group]:
    user = await get_user_by_id(user_id, db)
    if user is None:
        raise UserNotFoundError(f"User {user_id} not found")

    repository = UserGroupRepository(db)
    memberships = await repository.get_by_user_id(user_id)
    return [membership.group for membership in memberships]
