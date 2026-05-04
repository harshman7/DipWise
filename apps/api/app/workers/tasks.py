from app.workers.celery_app import celery


@celery.task(name="ping")
def ping() -> str:
    return "pong"


@celery.task(name="check_alerts")
def check_alerts_task() -> int:
    """Periodic task to evaluate active alerts against current prices."""
    # TODO: get a DB session and call alert_service.check_alerts
    return 0
