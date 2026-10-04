from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from group.errors import GroupNotFoundError
from group.models import Group
from group.repository import GroupRepository
from group.schemas import UpdateGroupRequest


async def update_group(
    group_id: UUID, request: UpdateGroupRequest, db: AsyncSession
) -> Group:
    repository = GroupRepository(db)
    group = await repository.get_by_id(group_id)
    if group is None:
        raise GroupNotFoundError(f"Group {group_id} not found")

    group.name = request.name
    return await repository.update(group)
