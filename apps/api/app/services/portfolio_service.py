"""Portfolio CRUD and valuation logic.

Placeholder — wire up when auth and asset data are live.
"""

from sqlalchemy.orm import Session

from app.models.portfolio import Portfolio
from app.schemas.portfolio import PortfolioCreate, PortfolioResponse


def create_portfolio(db: Session, user_id: int, data: PortfolioCreate) -> PortfolioResponse:
    portfolio = Portfolio(user_id=user_id, name=data.name, description=data.description)
    db.add(portfolio)
    db.commit()
    db.refresh(portfolio)
    return PortfolioResponse.model_validate(portfolio)


def list_portfolios(db: Session, user_id: int) -> list[PortfolioResponse]:
    rows = db.query(Portfolio).filter(Portfolio.user_id == user_id).all()
    return [PortfolioResponse.model_validate(r) for r in rows]
