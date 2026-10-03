from datetime import datetime, timedelta, timezone
from uuid import UUID

import jwt

from core.settings import settings

_ALGORITHM = "HS256"


def create_access_token(user_id: UUID) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=settings.jwt_access_token_expires_minutes
    )
    payload = {"sub": str(user_id), "exp": expires_at}
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=_ALGORITHM)


def decode_access_token(token: str) -> UUID:
    payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[_ALGORITHM])
    return UUID(payload["sub"])
