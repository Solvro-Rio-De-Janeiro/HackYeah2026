import logging
from zoneinfo import ZoneInfo

from apscheduler.schedulers.asyncio import AsyncIOScheduler

from core.db_config import sessionmanager
from notifications.push_service import send_daily_push

logger = logging.getLogger(__name__)


async def daily_task() -> None:
    logger.info("Daily scheduled task started")
    async with sessionmanager.session() as session:
        await send_daily_push(session)


scheduler = AsyncIOScheduler(timezone=ZoneInfo("Europe/Warsaw"))
scheduler.add_job(daily_task, trigger="cron", hour=17, minute=0, id="daily_task")
