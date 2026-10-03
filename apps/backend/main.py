from contextlib import asynccontextmanager

import models  # noqa: F401
from core.db_config import sessionmanager
from fastapi import FastAPI
from goals.router import router as goal_router
from payments.router import router as payment_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield

    if sessionmanager._engine is not None:
        await sessionmanager.close()


app = FastAPI(lifespan=lifespan)
app.include_router(router=goal_router)
app.include_router(payment_router, prefix="/api/payments")


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: str | None = None):
    return {"item_id": item_id, "q": q}
