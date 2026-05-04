from datetime import datetime

from pydantic import BaseModel, model_validator

_VALID_ALERT_TYPES = frozenset({"dip_threshold", "price_below"})


class AlertCreate(BaseModel):
    asset_id: int | None = None
    symbol: str | None = None
    alert_type: str = "dip_threshold"
    threshold: float
    message: str | None = None

    @model_validator(mode="after")
    def check_asset_or_symbol(self) -> "AlertCreate":
        if self.asset_id is None and (self.symbol is None or not str(self.symbol).strip()):
            raise ValueError("Provide asset_id or non-empty symbol")
        if self.alert_type not in _VALID_ALERT_TYPES:
            raise ValueError(
                f"alert_type must be one of: {', '.join(sorted(_VALID_ALERT_TYPES))}"
            )
        return self


class AlertResponse(BaseModel):
    id: int
    asset_id: int
    alert_type: str
    threshold: float
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
