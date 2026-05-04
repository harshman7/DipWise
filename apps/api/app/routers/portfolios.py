from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.portfolio import PortfolioResponse
from app.services.portfolio_service import get_portfolio, list_portfolios

router = APIRouter(prefix="/portfolios", tags=["portfolios"])


@router.get("/", response_model=list[PortfolioResponse])
def list_portfolios_route(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[PortfolioResponse]:
    """List portfolios for the authenticated user."""
    return list_portfolios(db, current_user.id)


@router.get("/{portfolio_id}", response_model=PortfolioResponse)
def get_portfolio_route(
    portfolio_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PortfolioResponse:
    row = get_portfolio(db, current_user.id, portfolio_id)
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found",
        )
    return PortfolioResponse.model_validate(row)
