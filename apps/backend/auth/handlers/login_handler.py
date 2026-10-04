from sqlalchemy.ext.asyncio import AsyncSession

from auth.errors import InvalidCredentialsError
from auth.schemas import LoginRequest, TokenResponse
from auth.security import create_access_token
from user import repository
from user.security import verify_password


async def login(request: LoginRequest, db: AsyncSession) -> TokenResponse:
    user = await repository.get_user_by_email(request.email, db)
    if user is None or not verify_password(request.password, user.password_hash):
        raise InvalidCredentialsError("Invalid email or password")

    return TokenResponse(access_token=create_access_token(user.id))
