from contextlib import asynccontextmanager

from fastapi import FastAPI

import models  # noqa: F401 — register ORM models before mapper configuration
from auth.router import router as auth_router
from connect.router import router as connect_router
from core.db_config import sessionmanager
from goals.router import router as goal_router
from group.router import router as group_router
from payments.router import router as payment_router
from user.router import router as user_router
from user_group.router import router as user_group_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield

    if sessionmanager._engine is not None:
        await sessionmanager.close()


app = FastAPI(lifespan=lifespan)
app.include_router(goal_router, prefix="/api")
app.include_router(user_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(group_router, prefix="/api")
app.include_router(user_group_router, prefix="/api")
app.include_router(payment_router, prefix="/api/payments")
app.include_router(connect_router, prefix="/api/connect")


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: str | None = None):
    return {"item_id": item_id, "q": q}
