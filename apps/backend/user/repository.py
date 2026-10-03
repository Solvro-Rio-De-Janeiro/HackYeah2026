from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from user.models import User


async def create_user(user: User, db: AsyncSession) -> User:
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def get_user_by_id(user_id: UUID, db: AsyncSession) -> User | None:
    return await db.get(User, user_id)


async def get_user_by_email(email: str, db: AsyncSession) -> User | None:
    query = select(User).where(User.email == email)
    return await db.scalar(query)


async def update_user(user: User, db: AsyncSession) -> User:
    await db.commit()
    await db.refresh(user)
    return user


async def delete_user(user: User, db: AsyncSession) -> None:
    await db.delete(user)
    await db.commit()
