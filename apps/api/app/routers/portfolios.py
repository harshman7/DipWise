from fastapi import APIRouter, HTTPException, status

from app.schemas.portfolio import PortfolioResponse

router = APIRouter(prefix="/portfolios", tags=["portfolios"])


@router.get("/", response_model=list[PortfolioResponse])
def list_portfolios() -> list[PortfolioResponse]:
    """List portfolios for the authenticated user."""
    # TODO: wire auth dependency + portfolio_service
    return []


@router.get("/{portfolio_id}", response_model=PortfolioResponse)
def get_portfolio(portfolio_id: int) -> PortfolioResponse:
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not yet implemented")
