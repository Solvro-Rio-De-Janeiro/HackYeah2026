from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from group.models import GroupMemberBalance, UserGroup


class UserGroupRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_group_id(self, group_id: UUID) -> list[UserGroup]:
        statement = (
            select(UserGroup)
            .where(UserGroup.group_id == group_id)
            .options(
                joinedload(UserGroup.user),
                joinedload(UserGroup.group),
                joinedload(UserGroup.balance),
            )
        )
        result = await self.session.scalars(statement)
        return list(result.unique().all())

    async def clear_balances_for_memberships(
        self, memberships: list[UserGroup]
    ) -> list[GroupMemberBalance]:
        balances = [
            GroupMemberBalance(user_group_id=membership.id, balance=0)
            for membership in memberships
            if membership.balance is None
        ]
        self.session.add_all(balances)
        await self.session.flush()
        return balances
