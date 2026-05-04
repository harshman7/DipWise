from datetime import datetime
from typing import Any

from pydantic import BaseModel, model_validator

_VALID_ALERT_TYPES = frozenset({"dip_threshold", "price_below", "sma_cross"})


class AlertCreate(BaseModel):
    asset_id: int | None = None
    symbol: str | None = None
    alert_type: str = "dip_threshold"
    threshold: float
    message: str | None = None
    params_json: dict[str, Any] | None = None

    @model_validator(mode="after")
    def check_asset_or_symbol(self) -> "AlertCreate":
        if self.asset_id is None and (self.symbol is None or not str(self.symbol).strip()):
            raise ValueError("Provide asset_id or non-empty symbol")
        if self.alert_type not in _VALID_ALERT_TYPES:
            raise ValueError(
                f"alert_type must be one of: {', '.join(sorted(_VALID_ALERT_TYPES))}"
            )
        if self.alert_type == "sma_cross":
            p = self.params_json or {}
            if p.get("kind") != "sma_cross":
                raise ValueError(
                    "sma_cross alerts require params_json.kind set to 'sma_cross'"
                )
            period = int(p.get("period", 100))
            if period < 2 or period > 500:
                raise ValueError("params_json.period must be between 2 and 500")
            direction = str(p.get("direction", "below"))
            if direction not in ("above", "below"):
                raise ValueError("params_json.direction must be 'above' or 'below'")
        return self


class AlertResponse(BaseModel):
    id: int
    asset_id: int
    alert_type: str
    threshold: float
    is_active: bool
    created_at: datetime
    params_json: dict[str, Any] | None = None

    model_config = {"from_attributes": True}
