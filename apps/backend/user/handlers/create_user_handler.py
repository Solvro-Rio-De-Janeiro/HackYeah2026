from sqlalchemy.ext.asyncio import AsyncSession

from user import repository
from user.errors import EmailAlreadyExistsError
from user.models import User, UserRole
from user.schemas import CreateUserRequest
from user.security import hash_password


async def create_user(request: CreateUserRequest, db: AsyncSession) -> User:
    existing = await repository.get_user_by_email(request.email, db)
    if existing is not None:
        raise EmailAlreadyExistsError(f"User with email {request.email} already exists")

    user = User(
        name=request.name,
        email=request.email,
        password_hash=hash_password(request.password),
        role=UserRole.USER,
    )
    return await repository.create_user(user, db)
