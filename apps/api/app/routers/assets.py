from fastapi import APIRouter, HTTPException, status

from app.schemas.asset import AssetResponse

router = APIRouter(prefix="/assets", tags=["assets"])


@router.get("/", response_model=list[AssetResponse])
def list_assets() -> list[AssetResponse]:
    """List all tracked assets."""
    # TODO: query database
    return []


@router.get("/{symbol}", response_model=AssetResponse)
def get_asset(symbol: str) -> AssetResponse:
    """Get a single asset by symbol."""
    # TODO: query database
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Asset {symbol} not found")
