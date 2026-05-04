from datetime import datetime

from pydantic import BaseModel


class PortfolioCreate(BaseModel):
    name: str
    description: str | None = None


class PortfolioResponse(BaseModel):
    id: int
    name: str
    description: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class PositionResponse(BaseModel):
    id: int
    asset_symbol: str | None = None
    shares: float
    avg_cost_basis: float

    model_config = {"from_attributes": True}


class PortfolioDetailResponse(BaseModel):
    id: int
    name: str
    description: str | None
    created_at: datetime
    positions: list[PositionResponse]

    model_config = {"from_attributes": True}
