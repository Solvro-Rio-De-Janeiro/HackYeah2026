from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from user_group.errors import UserGroupNotFoundError
from user_group.repository import UserGroupRepository


async def deactivate_user_group(user_group_id: UUID, db: AsyncSession):
    repository = UserGroupRepository(db)
    user_group = await repository.get_by_id(user_group_id)
    if user_group is None:
        raise UserGroupNotFoundError(f"UserGroup {user_group_id} not found")
    return await repository.deactivate(user_group)
