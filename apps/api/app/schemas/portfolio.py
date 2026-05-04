from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


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


class PortfolioTransactionCreate(BaseModel):
    symbol: str
    tx_type: Literal["buy", "sell"]
    shares: float = Field(gt=0)
    price: float = Field(gt=0)
    executed_at: datetime | None = None


class PortfolioTransactionResponse(BaseModel):
    id: int
    portfolio_id: int
    asset_symbol: str
    tx_type: str
    shares: float
    price: float
    executed_at: datetime

    model_config = {"from_attributes": True}
