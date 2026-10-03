# Backend

## Async PostgreSQL and migrations

The API uses SQLAlchemy's async engine with `asyncpg`. Configure `DATABASE_URL`
in the environment (or copy `.env.example` to `.env`). The application accepts
`postgresql://` and `postgres://` URLs and normalizes them to `asyncpg`.

Create a migration after defining/importing ORM models:

```powershell
uv run alembic revision --autogenerate -m "describe schema change"
```

Review generated migrations before applying them. Apply all migrations with:

```powershell
uv run alembic upgrade head
```

Other useful commands:

```powershell
uv run alembic current
uv run alembic history
uv run alembic downgrade -1
uv run alembic upgrade head --sql
```

Define models by subclassing `core.base.Base`. Import each model module in
`alembic/env.py` so Alembic can see its tables during autogeneration. Use
`Depends(get_session)` from `core.db_config` for request scoped database access;
make transaction boundaries explicit in the service or route that performs
writes. The engine is disposed during FastAPI shutdown. Alembic uses a separate
short lived connection pool when running migrations.

Set `DB_POOL_SIZE`, `DB_MAX_OVERFLOW`, `DB_POOL_TIMEOUT`, and
`DB_POOL_RECYCLE` for the expected application worker count and PostgreSQL
connection limits. Pool settings apply per process, so total possible
connections are multiplied by the number of workers/replicas.
