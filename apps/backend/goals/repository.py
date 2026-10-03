from sqlalchemy.ext.asyncio import AsyncSession

from goals.models import AddictionType, Challenge, ChallengeState, GiftGoal, Goal, GoalPeriod
from goals.schemas import CreateGoalRequest


class GoalRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, request: CreateGoalRequest) -> Goal:
        
        challenge = Challenge(
            foundation_id=request.foundation_id,
            group_id=request.group_id,
            state=ChallengeState.ACTIVE,
            addiction_type=AddictionType(request.addiction_type),
        )

        gift_goal= GiftGoal(name=request.name, price = request.price)
        goal = Goal(
            saldo=request.saldo,
            period=GoalPeriod(request.period),
            challenge=challenge,
            gift_goal = gift_goal
        )

        self.session.add(challenge)
        self.session.add(goal)
        await self.session.flush()
        return goal
