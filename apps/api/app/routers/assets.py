from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.asset import Asset
from app.schemas.asset import AssetResponse

router = APIRouter(prefix="/assets", tags=["assets"])


@router.get("/", response_model=list[AssetResponse])
def list_assets(db: Session = Depends(get_db)) -> list[AssetResponse]:
    rows = db.query(Asset).order_by(Asset.symbol).all()
    return [AssetResponse.model_validate(r) for r in rows]


@router.get("/{symbol}", response_model=AssetResponse)
def get_asset(symbol: str, db: Session = Depends(get_db)) -> AssetResponse:
    sym = symbol.upper().strip()
    row = db.query(Asset).filter(Asset.symbol == sym).one_or_none()
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asset {sym} not found",
        )
    return AssetResponse.model_validate(row)
