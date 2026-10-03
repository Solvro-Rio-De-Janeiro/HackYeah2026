from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from group.errors import GroupNotFoundError
from group.repository import GroupRepository


async def delete_group(group_id: UUID, db: AsyncSession) -> None:
    repository = GroupRepository(db)
    group = await repository.get_by_id(group_id)
    if group is None:
        raise GroupNotFoundError(f"Group {group_id} not found")
    await repository.delete(group)
