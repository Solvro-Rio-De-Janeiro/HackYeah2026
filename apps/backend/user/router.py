from uuid import UUID

from fastapi import APIRouter, HTTPException

from core.db_config import DBSessionDep
from user.errors import EmailAlreadyExistsError, UserNotFoundError
from user.handlers.create_user_handler import create_user as _create_user
from user.handlers.delete_user_handler import delete_user as _delete_user
from user.handlers.get_user_handler import get_user as _get_user
from user.handlers.update_user_handler import update_user as _update_user
from user.schemas import CreateUserRequest, UpdateUserRequest, UserResponse

router = APIRouter()


@router.post("/user", response_model=UserResponse, status_code=201)
async def create_user(request: CreateUserRequest, db: DBSessionDep) -> UserResponse:
    try:
        user = await _create_user(request, db)
    except EmailAlreadyExistsError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    return UserResponse.model_validate(user)


@router.get("/user/{id}", response_model=UserResponse)
async def get_user(id: UUID, db: DBSessionDep) -> UserResponse:
    try:
        user = await _get_user(id, db)
    except UserNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return UserResponse.model_validate(user)


@router.put("/user/{id}", response_model=UserResponse)
async def update_user(
    id: UUID, request: UpdateUserRequest, db: DBSessionDep
) -> UserResponse:
    try:
        user = await _update_user(id, request, db)
    except UserNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except EmailAlreadyExistsError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    return UserResponse.model_validate(user)


@router.delete("/user/{id}", status_code=204)
async def delete_user(id: UUID, db: DBSessionDep) -> None:
    try:
        await _delete_user(id, db)
    except UserNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
