from uuid import UUID

from goals.schemas import CreateGoalRequest
from fastapi import APIRouter, Depends, Request

router = APIRouter()


@router.post("/goal")
def create_goal(request: CreateGoalRequest):

    pass


@router.patch("/goal/{id}")
def finish_goal(id: UUID):
    pass
