from pydantic import BaseModel, HttpUrl


class PushKeys(BaseModel):
    p256dh: str
    auth: str


class PushSubscriptionRequest(BaseModel):
    endpoint: HttpUrl
    keys: PushKeys
