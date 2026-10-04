from uuid import UUID

from fastapi import APIRouter, status

from core.db_config import DBSessionDep
from goals.handlers.create_goal_handler import CreateGoalHandler
from goals.handlers.finish_goal_handler import FinishGoalHandler
from goals.schemas import CreateGoalRequest, FinishGoalRequest, GoalResponse

router = APIRouter()


@router.post("/goal", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
async def create_goal(request: CreateGoalRequest, session: DBSessionDep) -> GoalResponse:
    handler = CreateGoalHandler(session)
    goal, checkout_urls = await handler.handle(request)
    response = GoalResponse.model_validate(goal)
    response.checkout_urls = checkout_urls
    return response


@router.patch("/goal/{id}")
async def finish_goal(id: UUID, session: DBSessionDep):
    handler = FinishGoalHandler(session)
    await handler.handle(FinishGoalRequest(id=id))
