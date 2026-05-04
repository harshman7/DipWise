from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.portfolio import (
    PortfolioCreate,
    PortfolioDetailResponse,
    PortfolioResponse,
    PortfolioTransactionCreate,
    PortfolioTransactionResponse,
)
from app.services.portfolio_service import (
    PortfolioNotFoundError,
    add_portfolio_transaction,
    create_portfolio,
    get_portfolio_detail,
    list_portfolios,
    list_portfolio_transactions,
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


@router.post(
    "/{portfolio_id}/transactions",
    response_model=PortfolioTransactionResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_portfolio_transaction_route(
    portfolio_id: int,
    body: PortfolioTransactionCreate,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> PortfolioTransactionResponse:
    try:
        return add_portfolio_transaction(db, current.id, portfolio_id, body)
    except PortfolioNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found",
        ) from e
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e


@router.get(
    "/{portfolio_id}/transactions",
    response_model=list[PortfolioTransactionResponse],
)
def list_portfolio_transactions_route(
    portfolio_id: int,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> list[PortfolioTransactionResponse]:
    rows = list_portfolio_transactions(
        db, current.id, portfolio_id, limit=limit, offset=offset
    )
    if rows is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found",
        )
    return rows


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
