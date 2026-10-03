from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from group.errors import GroupNotFoundError
from group.models import Group
from group.repository import GroupRepository


async def get_group(group_id: UUID, db: AsyncSession) -> Group:
    repository = GroupRepository(db)
    group = await repository.get_by_id(group_id)
    if group is None:
        raise GroupNotFoundError(f"Group {group_id} not found")
    return group
