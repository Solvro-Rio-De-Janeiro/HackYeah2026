from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from goals.models.challenge import Challenge
from goals.models.goal import Goal


class ChallengeRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_goal_id(self, goal_id: UUID) -> Challenge:
        query = (
            select(Challenge)
            .join(Goal, Goal.challenge_id == Challenge.id)
            .where(Goal.id == goal_id)
        )
        result = await self.session.execute(query)
        return result.scalar_one_or_none()
