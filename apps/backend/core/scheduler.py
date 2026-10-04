import logging
from zoneinfo import ZoneInfo

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy.ext.asyncio import AsyncSession

from core.db_config import sessionmanager
from notifications.push_service import send_daily_push
from user_group.repository import UserGroupRepository

logger = logging.getLogger(__name__)


async def daily_task() -> None:
    logger.info("Daily scheduled task started")
    async with sessionmanager.session() as session:
        await _open_todays_checkin(session)
        await send_daily_push(session)


async def _open_todays_checkin(session: AsyncSession) -> None:
    """Append today's check-in slot (defaults to False) for every active membership."""
    repository = UserGroupRepository(session)
    for user_group in await repository.get_all_active():
        await repository.add_completion(user_group)


scheduler = AsyncIOScheduler(timezone=ZoneInfo("Europe/Warsaw"))
scheduler.add_job(daily_task, trigger="cron", hour=17, minute=0, id="daily_task")
