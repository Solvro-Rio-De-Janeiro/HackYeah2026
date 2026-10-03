from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from auth.dependencies import CurrentUserDep
from auth.errors import InvalidCredentialsError
from auth.handlers.login_handler import login as _login
from auth.handlers.register_handler import register as _register
from auth.schemas import (
    CurrentUserResponse,
    LoginRequest,
    RegisterRequest,
    TokenResponse,
)
from core.db_config import DBSessionDep
from user.errors import EmailAlreadyExistsError

router = APIRouter(prefix="/auth")


@router.post(
    "/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED
)
async def register(request: RegisterRequest, db: DBSessionDep) -> TokenResponse:
    try:
        return await _register(request, db)
    except EmailAlreadyExistsError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail=str(exc)
        ) from exc


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: DBSessionDep) -> TokenResponse:
    try:
        return await _login(request, db)
    except InvalidCredentialsError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)
        ) from exc


@router.post("/token", response_model=TokenResponse, include_in_schema=False)
async def token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: DBSessionDep
) -> TokenResponse:
    """OAuth2-compatible endpoint used only by Swagger's "Authorize" button."""
    try:
        return await _login(
            LoginRequest(email=form_data.username, password=form_data.password), db
        )
    except InvalidCredentialsError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)
        ) from exc


@router.get("/me", response_model=CurrentUserResponse)
async def me(current_user: CurrentUserDep) -> CurrentUserResponse:
    return CurrentUserResponse.model_validate(current_user)
