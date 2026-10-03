from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from user import repository
from user.errors import UserNotFoundError
from user.models import User


async def get_user(user_id: UUID, db: AsyncSession) -> User:
    user = await repository.get_user_by_id(user_id, db)
    if user is None:
        raise UserNotFoundError(f"User {user_id} not found")
    return user
