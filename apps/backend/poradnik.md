# Table of Contents

1. [Alembic initialization](#alembic-initialization)
2. [Creating migrations](#creating-migrations)
3. [Example of simple CRUD](#example-of-simple-crud)
4. [Deployment](#deployment)
5. [Common issues](#common-issues)

# Alembic initialization

1. Initialize the Python project.

2. Install Alembic, SQLAlchemy, and the required database drivers using the following commands:

    ```sh
    uv add psycopg[binary] alembic sqlalchemy[asyncio]
    uv lock
    ```

3. Initialize the Alembic project:

    ```sh
    alembic init --template pyproject
    ```

    This command will generate the `/alembic` directory and the `alembic.ini` file.

4. Create the `/core/db_config.py` file based on the following example:

    ```python
    from fastapi import Depends
    from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

    from sqlalchemy.orm import declarative_base

    from core.settings import get_settings


    import contextlib
    from typing import Annotated, Any, AsyncGenerator


    Base = declarative_base()


    class DatabaseSessionManager:
        def __init__(self, host: str, engine_kwargs: dict[str, Any] = {}):
            self._engine = create_async_engine(host, **engine_kwargs)
            self._sessionmaker = async_sessionmaker(
                autocommit=False, expire_on_commit=False, bind=self._engine
            )

        async def close(self):
            if self._engine is None:
                raise Exception("DatabaseSessionManager is not initialized")
            await self._engine.dispose()

            self._engine = None
            self._sessionmaker = None

        @contextlib.asynccontextmanager
        async def connect(self) -> AsyncGenerator[AsyncSession, None]:
            if self._engine is None:
                raise Exception("DatabaseSessionManager is not initialized")

            async with self._engine.begin() as connection:
                try:
                    yield connection
                except Exception:
                    await connection.rollback()
                    raise

        @contextlib.asynccontextmanager
        async def session(self) -> AsyncGenerator[AsyncSession, None]:
            if self._sessionmaker is None:
                raise Exception("DatabaseSessionManager is not initialized")

            session = self._sessionmaker()
            try:
                yield session
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()


    sessionmanager = DatabaseSessionManager(get_settings().connection_string)


    async def get_db() -> AsyncGenerator[AsyncSession, None]:
        async with sessionmanager.session() as session:
            yield session


    DBSessionDep = Annotated[AsyncSession, Depends(get_db)]
    ```
5. Create the `/models/__init__.py` file. This is where you should import your models. Example:

    ```python
    from transcription.models import Transcription, TranscriptionChunk
    from summaries.models import Summary

    __all__ = ["Transcription", "TranscriptionChunk", "Summary"]
    ```

6. Create your connection string. A PostgreSQL connection string has the following format:

    ```text
    postgresql+psycopg://{db_owner_username}:{db_owner_password}@{db_server_url}:{db_port}/{db_name}
    ```

    It is used by the Alembic engine to connect to the database.

    Example:

    ```text
    postgresql+psycopg://postgres:postgres@backend_postgres:5432/postgres
    ```

7. Add the `connection_string` field to your `core/settings`:

    ```python
    connection_string: str = Field(default="", validation_alias="CONNECTION_STRING")
    ```

	8. Add the connection string to your project’s environment variables.

9. Modify the `/alembic/env.py` file:

    ```python
    from sqlalchemy import engine_from_config
    from sqlalchemy import pool
    from alembic import context

    from core.db_config import Base
    from core.settings import get_settings

    config = context.config
    config.set_main_option(
        "sqlalchemy.url",
        get_settings().require("connection_string"),
    )

    target_metadata = Base.metadata


    def run_migrations_offline() -> None:
        """Run migrations in offline mode."""
        url = config.get_main_option("sqlalchemy.url")

        context.configure(
            url=url,
            target_metadata=target_metadata,
            literal_binds=True,
            dialect_opts={"paramstyle": "named"},
        )

        with context.begin_transaction():
            context.run_migrations()


    def run_migrations_online() -> None:
        """Run migrations in online mode."""
        connectable = engine_from_config(
            config.get_section(config.config_ini_section, {}),
            prefix="sqlalchemy.",
            poolclass=pool.NullPool,
        )

        with connectable.connect() as connection:
            context.configure(
                connection=connection,
                target_metadata=target_metadata,
            )

            with context.begin_transaction():
                context.run_migrations()


    if context.is_offline_mode():
        run_migrations_offline()
    else:
        run_migrations_online()
    ```

10. Modify your `app.py` file:

    ```python
    import models  # noqa
    ```

    Add the following lifespan handler:

    ```python
    @asynccontextmanager
    async def lifespan(app: FastAPI):
        yield

        if sessionmanager._engine is not None:
            await sessionmanager.close()
    ```

11. Define your database models. Example:

    ```python
    import uuid

    from sqlalchemy import UUID, Column, DateTime, Text, func

    from core.db_config import Base


    class Summary(Base):
        __tablename__ = "summaries"

        id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
        error = Column(Text, nullable=True)
        created_at = Column(
            DateTime(timezone=True),
            nullable=False,
            server_default=func.now(),
        )
        content = Column(Text, nullable=False, default="")
    ```

    All model classes should inherit from `Base` imported from `core.db_config`.

12. Create your first migration:

    ```sh
    alembic revision --autogenerate -m "Added summary table"
    ```

    This command will generate a migration file in the `/alembic/versions` directory.

    If the generated migration functions are empty, make sure that all your models are imported in `models/__init__.py`.

13. Apply the migration to the database:

    ```sh
    alembic upgrade head
    ```

14. Verify that the tables have been created in the database.

When you want to use db in your endpoint pass db: AsyncSession = Depends(get_db) as a argument and pass it through all your services. Example:

```python
router = APIRouter()


@router.post(
    "/summary",
    response_model=SummaryResponse,
    status_code=202,
    dependencies=[Depends(check_user_session)],
)
async def create_summary(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> SummaryResponse:

    user = get_session_user(request=request)
    response = await handle_summary_generation(user_id=user.username, db=db)
    return response


async def handle_summary_generation(user_id: str, db: AsyncSession) -> SummaryResponse:
    pass
```


# Creating migrations

## Creating a migration file

```sh
alembic revision --autogenerate -m "Added summary table"
```

## Updating the database

```sh
alembic upgrade head
```

## Rolling back the last migration

```sh
alembic downgrade -1
```

# Example of simple CRUD

Always use the repository pattern to separate database integration from business logic.

Example:

```python 
async def add_transcription(user_id: str, file_id: UUID, db: AsyncSession) -> None:
    transcription = Transcription(
        user_id=user_id, file_id=file_id, status="in progress"
    )
    db.add(transcription)
    await db.commit()
    await db.refresh(transcription)


async def get_transcription_by_file_id(file_id: str | uuid.UUID, db: AsyncSession):
    file_uuid = file_id if isinstance(file_id, uuid.UUID) else uuid.UUID(file_id)
    query = (
        select(Transcription)
        .where(Transcription.file_id == file_uuid)
        .options(selectinload(Transcription.chunks))
        .order_by(Transcription.created_at.desc())
        .limit(1)
    )
    transcription: Transcription | None = await db.scalar(query)

    return transcription


async def update_transcription(payload: TransciriptionFinished, db: AsyncSession):
    transcription = await get_transcription_by_file_id(file_id=payload.file_id, db=db)
    if transcription is None:
        raise ValueError(f"Transcription not found for file_id={payload.file_id}")
    transcription.chunks = [
        TranscriptionChunk(
            text=chunk.text,
            speaker=chunk.speaker,
            start_seconds=chunk.start_seconds,
            end_seconds=chunk.end_seconds,
        )
        for chunk in (payload.chunks or [])
    ]
    transcription.error = payload.error
    transcription.status = "finished" if payload.error is None else "failed"
    await db.commit()
    await db.refresh(transcription)


async def get_last_user_transcription(user_id: str, db: AsyncSession) -> Transcription:
    query = (
        select(Transcription)
        .where(Transcription.user_id == user_id)
        .options(selectinload(Transcription.chunks))
        .options(selectinload(Transcription.summary))
        .order_by(Transcription.created_at.desc())
        .limit(1)
    )
    transcription: Transcription | None = await db.scalar(query)
    return transcription
```
# Deployment

Example Dockerfile for a project using Alembic:

```Dockerfile 
FROM ghcr.io/astral-sh/uv:python3.14-bookworm-slim AS builder

ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy

WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked --no-install-project --no-dev
COPY . .
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked --no-dev

FROM python:3.14-slim
WORKDIR /app

COPY --from=builder /app /app
ENV PATH="/app/.venv/bin:$PATH"

EXPOSE 8010

CMD ["sh", "-c", "alembic upgrade head && exec uvicorn app:app --host 0.0.0.0 --port 8010"]
```

# Common issues

This section should contain common issues and their solutions.

| Issue | Solution |
|-------|----------|
|   Empty migration files in alembic/versions    |   Check imports in models/\_\_init\_\_.py and make sure that models is imported in app.py       |