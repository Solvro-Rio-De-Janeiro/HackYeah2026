from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from user import repository
from user.errors import EmailAlreadyExistsError, UserNotFoundError
from user.models import User
from user.schemas import UpdateUserRequest
from user.security import hash_password


async def update_user(
    user_id: UUID, request: UpdateUserRequest, db: AsyncSession
) -> User:
    user = await repository.get_user_by_id(user_id, db)
    if user is None:
        raise UserNotFoundError(f"User {user_id} not found")

    if request.email != user.email:
        existing = await repository.get_user_by_email(request.email, db)
        if existing is not None:
            raise EmailAlreadyExistsError(
                f"User with email {request.email} already exists"
            )

    user.name = request.name
    user.email = request.email
    if request.password:
        user.password_hash = hash_password(request.password)

    return await repository.update_user(user, db)
