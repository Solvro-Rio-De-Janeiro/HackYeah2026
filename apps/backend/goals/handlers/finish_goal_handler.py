from connect.service import cancel_goal_subscriptions, pay_out_goal_completion
from fastapi import HTTPException, status

from goals.challenge_repository import ChallengeRepository
from goals.models import ChallengeState, Goal
from goals.schemas import FinishGoalRequest
from sqlalchemy.ext.asyncio import AsyncSession


class FinishGoalHandler:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.challenge_repository = ChallengeRepository(self.session)

    async def handle(self, request: FinishGoalRequest):
        challenge = await self.challenge_repository.get_by_goal_id(request.id)
        if challenge is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No users found for this group",
            )
        goal = await self.session.get(Goal, request.id)
        if goal is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Goal not found",
            )
        await cancel_goal_subscriptions(self.session, goal.id)
        await pay_out_goal_completion(self.session, goal.id)
        challenge.state = ChallengeState.COMPLETED
        await self.session.commit()
