from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from sqlalchemy.ext.asyncio import AsyncSession


@asynccontextmanager
async def transaction(session: AsyncSession) -> AsyncIterator[None]:
    """Begin a transaction even if a dependency (e.g. auth) already autobegun one."""
    if session.in_transaction():
        await session.commit()
    async with session.begin():
        yield
