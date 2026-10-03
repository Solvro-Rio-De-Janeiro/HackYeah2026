from sqlalchemy.ext.asyncio import AsyncSession

from group.models import Group
from group.repository import GroupRepository
from group.schemas import CreateGroupRequest


async def create_group(request: CreateGroupRequest, db: AsyncSession) -> Group:
    repository = GroupRepository(db)
    group = Group(name=request.name)
    return await repository.create(group)
