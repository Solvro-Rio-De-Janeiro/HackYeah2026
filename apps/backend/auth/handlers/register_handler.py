from sqlalchemy.ext.asyncio import AsyncSession

from auth.schemas import RegisterRequest, TokenResponse
from auth.security import create_access_token
from user.handlers.create_user_handler import create_user
from user.schemas import CreateUserRequest


async def register(request: RegisterRequest, db: AsyncSession) -> TokenResponse:
    user = await create_user(
        CreateUserRequest(
            name=request.name, email=request.email, password=request.password
        ),
        db,
    )
    return TokenResponse(access_token=create_access_token(user.id))
