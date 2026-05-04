from datetime import datetime

from pydantic import BaseModel


class AlertCreate(BaseModel):
    asset_id: int
    alert_type: str = "dip_threshold"
    threshold: float
    message: str | None = None


class AlertResponse(BaseModel):
    id: int
    asset_id: int
    alert_type: str
    threshold: float
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
