from uuid import UUID

from fastapi import APIRouter, HTTPException, status

from core.db_config import DBSessionDep
from group.errors import GroupNotFoundError
from group.handlers.create_group_handler import create_group as _create_group
from group.handlers.delete_group_handler import delete_group as _delete_group
from group.handlers.get_group_handler import get_group as _get_group
from group.handlers.update_group_handler import update_group as _update_group
from group.schemas import CreateGroupRequest, GroupResponse, UpdateGroupRequest

router = APIRouter()


@router.post(
    "/group", response_model=GroupResponse, status_code=status.HTTP_201_CREATED
)
async def create_group(request: CreateGroupRequest, db: DBSessionDep) -> GroupResponse:
    group = await _create_group(request, db)
    return GroupResponse.model_validate(group)


@router.get("/group/{id}", response_model=GroupResponse)
async def get_group(id: UUID, db: DBSessionDep) -> GroupResponse:
    try:
        group = await _get_group(id, db)
    except GroupNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc
    return GroupResponse.model_validate(group)


@router.put("/group/{id}", response_model=GroupResponse)
async def update_group(
    id: UUID, request: UpdateGroupRequest, db: DBSessionDep
) -> GroupResponse:
    try:
        group = await _update_group(id, request, db)
    except GroupNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc
    return GroupResponse.model_validate(group)


@router.delete("/group/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_group(id: UUID, db: DBSessionDep) -> None:
    try:
        await _delete_group(id, db)
    except GroupNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc
