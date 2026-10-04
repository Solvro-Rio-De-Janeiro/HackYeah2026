from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from user_group.errors import CompletionIndexOutOfRangeError, UserGroupNotFoundError
from user_group.models import UserGroup
from user_group.repository import UserGroupRepository


async def mark_completion(
    user_group_id: UUID, index: int, db: AsyncSession
) -> UserGroup:
    repository = UserGroupRepository(db)
    user_group = await repository.get_by_id(user_group_id)
    if user_group is None:
        raise UserGroupNotFoundError(f"UserGroup {user_group_id} not found")

    if index < 0 or index >= len(user_group.completions):
        raise CompletionIndexOutOfRangeError(
            f"Index {index} out of range for UserGroup {user_group_id} completions"
        )

    return await repository.mark_completion(user_group, index)
