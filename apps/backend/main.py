from contextlib import asynccontextmanager

from fastapi import FastAPI

from core.db_config import sessionmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield

    if sessionmanager._engine is not None:
        await sessionmanager.close()


app = FastAPI(lifespan=lifespan)


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: str | None = None):
    return {"item_id": item_id, "q": q}
