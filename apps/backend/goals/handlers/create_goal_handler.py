from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from goals.repository import GoalRepository
from goals.schemas import CreateGoalRequest
from user_group.repository import UserGroupRepository


class CreateGoalHandler:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.goal_repository = GoalRepository(self.session)
        self.user_group_repository = UserGroupRepository(session=self.session)

    async def handle(self, request: CreateGoalRequest):
        user_groups = await self.user_group_repository.get_by_group_id(request.group_id)
        if not user_groups:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No users found for this group",
            )

        await self.user_group_repository.create_balances_for_memberships(user_groups)
        await self.goal_repository.create(request)

        await self.session.commit()
