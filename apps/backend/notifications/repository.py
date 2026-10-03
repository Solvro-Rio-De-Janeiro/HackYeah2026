from uuid import UUID

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from notifications.models import PushSubscription
from user_group.models import UserGroup


class PushSubscriptionRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_user_payment_id(self, user_payment_id: str):
        pass
    async def get_for_group(self, group_id: UUID) -> list[PushSubscription]:
        query = (
            select(PushSubscription)
            .join(UserGroup, UserGroup.user_id == PushSubscription.user_id)
            .where(UserGroup.group_id == group_id, UserGroup.active.is_(True))
            .distinct()
        )
        return list((await self.session.scalars(query)).all())

    async def get_for_active_groups(self) -> list[PushSubscription]:
        query = (
            select(PushSubscription)
            .join(UserGroup, UserGroup.user_id == PushSubscription.user_id)
            .where(UserGroup.active.is_(True))
            .distinct()
        )
        return list((await self.session.scalars(query)).all())

    async def upsert(
        self, user_id: UUID, endpoint: str, p256dh: str, auth: str
    ) -> PushSubscription:
        row = await self.session.scalar(
            select(PushSubscription).where(PushSubscription.endpoint == endpoint)
        )
        if row is None:
            row = PushSubscription(
                user_id=user_id, endpoint=endpoint, p256dh=p256dh, auth=auth
            )
            self.session.add(row)
        else:
            row.user_id, row.p256dh, row.auth = user_id, p256dh, auth
        await self.session.commit()
        await self.session.refresh(row)
        return row

    async def delete(self, subscription_id: UUID) -> None:
        await self.session.execute(
            delete(PushSubscription).where(PushSubscription.id == subscription_id)
        )
