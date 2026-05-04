from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.portfolio import (
    PortfolioCreate,
    PortfolioDetailResponse,
    PortfolioResponse,
)
from app.services.portfolio_service import (
    create_portfolio,
    get_portfolio_detail,
    list_portfolios,
)

router = APIRouter(prefix="/portfolios", tags=["portfolios"])


@router.get("/", response_model=list[PortfolioResponse])
def list_portfolios_route(
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> list[PortfolioResponse]:
    return list_portfolios(db, current.id)


@router.post("/", response_model=PortfolioResponse, status_code=201)
def create_portfolio_route(
    body: PortfolioCreate,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> PortfolioResponse:
    return create_portfolio(db, current.id, body)


@router.get("/{portfolio_id}", response_model=PortfolioDetailResponse)
def get_portfolio_route(
    portfolio_id: int,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> PortfolioDetailResponse:
    detail = get_portfolio_detail(db, current.id, portfolio_id)
    if not detail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found",
        )
    return detail
