from celery import Celery
from celery.schedules import crontab

from app.core.config import settings

celery = Celery(
    "dipwise",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
)

celery.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

celery.conf.beat_schedule = {
    "ingest-active-symbols": {
        "task": "app.workers.tasks.ingest_active_symbols",
        "schedule": crontab(minute="*/30"),
    },
    "check-alerts": {
        "task": "app.workers.tasks.run_check_alerts",
        "schedule": crontab(minute="*/10"),
    },
}

celery.autodiscover_tasks(["app.workers"])

import app.workers.tasks  # noqa: E402, I001 — register tasks
