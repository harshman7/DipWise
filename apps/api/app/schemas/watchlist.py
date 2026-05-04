from datetime import datetime

from pydantic import BaseModel


class WatchlistCreate(BaseModel):
    name: str


class WatchlistResponse(BaseModel):
    id: int
    name: str
    created_at: datetime

    model_config = {"from_attributes": True}


class WatchlistItemCreate(BaseModel):
    symbol: str


class WatchlistItemResponse(BaseModel):
    id: int
    asset_id: int
    symbol: str
    name: str

    model_config = {"from_attributes": True}
