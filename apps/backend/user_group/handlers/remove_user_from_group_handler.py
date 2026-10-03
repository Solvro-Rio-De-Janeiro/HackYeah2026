from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from user_group.errors import UserGroupNotFoundError
from user_group.repository import UserGroupRepository


async def remove_user_from_group(
    group_id: UUID, user_id: UUID, db: AsyncSession
) -> None:
    repository = UserGroupRepository(db)
    user_group = await repository.get_by_user_and_group(user_id, group_id)
    if user_group is None:
        raise UserGroupNotFoundError(
            f"User {user_id} is not a member of group {group_id}"
        )
    await repository.delete(user_group)
