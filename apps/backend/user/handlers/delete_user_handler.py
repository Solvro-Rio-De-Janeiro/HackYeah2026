from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from user import repository
from user.errors import UserNotFoundError


async def delete_user(user_id: UUID, db: AsyncSession) -> None:
    user = await repository.get_user_by_id(user_id, db)
    if user is None:
        raise UserNotFoundError(f"User {user_id} not found")
    await repository.delete_user(user, db)
