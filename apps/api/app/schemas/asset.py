from pydantic import BaseModel


class AssetResponse(BaseModel):
    id: int
    symbol: str
    name: str
    asset_type: str
    exchange: str | None

    model_config = {"from_attributes": True}


class AssetCreate(BaseModel):
    symbol: str
    name: str
    asset_type: str = "stock"
    exchange: str | None = None
