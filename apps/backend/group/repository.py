from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from group.models import Group


class GroupRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, group: Group) -> Group:
        self.session.add(group)
        await self.session.commit()
        await self.session.refresh(group)
        return group

    async def get_by_id(self, group_id: UUID) -> Group | None:
        return await self.session.get(Group, group_id)

    async def update(self, group: Group) -> Group:
        await self.session.commit()
        await self.session.refresh(group)
        return group

    async def delete(self, group: Group) -> None:
        await self.session.delete(group)
        await self.session.commit()
