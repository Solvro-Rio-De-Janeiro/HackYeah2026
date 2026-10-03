from uuid import UUID

from fastapi import APIRouter

from core.db_config import DBSessionDep
from goals.handlers.create_goal_handler import CreateGoalHandler
from goals.handlers.finish_goal_handler import FinishGoalHandler
from goals.schemas import CreateGoalRequest, FinishGoalRequest

router = APIRouter()


@router.post("/goal")
async def create_goal(request: CreateGoalRequest, session: DBSessionDep):
    handler = CreateGoalHandler(session)
    goal = await handler.handle(request)
    return goal


@router.patch("/goal/{id}")
async def finish_goal(id: UUID, session: DBSessionDep):
    handler = FinishGoalHandler(session)
    await handler.handle(FinishGoalRequest(id=id))
