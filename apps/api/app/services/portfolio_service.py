from sqlalchemy.orm import Session

from app.models.asset import Asset
from app.models.portfolio import Portfolio, PortfolioPosition
from app.schemas.portfolio import (
    PortfolioCreate,
    PortfolioDetailResponse,
    PortfolioResponse,
    PositionResponse,
)


def list_portfolios(db: Session, user_id: int) -> list[PortfolioResponse]:
    rows = (
        db.query(Portfolio)
        .filter(Portfolio.user_id == user_id)
        .order_by(Portfolio.created_at.desc())
        .all()
    )
    return [PortfolioResponse.model_validate(r) for r in rows]


def get_portfolio_detail(
    db: Session, user_id: int, portfolio_id: int
) -> PortfolioDetailResponse | None:
    pf = (
        db.query(Portfolio)
        .filter(Portfolio.id == portfolio_id, Portfolio.user_id == user_id)
        .one_or_none()
    )
    if not pf:
        return None
    positions_raw = (
        db.query(PortfolioPosition, Asset.symbol, Asset.name)
        .join(Asset, Asset.id == PortfolioPosition.asset_id)
        .filter(PortfolioPosition.portfolio_id == portfolio_id)
        .all()
    )
    positions = [
        PositionResponse(
            id=pos.id,
            asset_symbol=sym,
            shares=float(pos.shares),
            avg_cost_basis=float(pos.avg_cost_basis),
        )
        for pos, sym, _name in positions_raw
    ]
    return PortfolioDetailResponse(
        id=pf.id,
        name=pf.name,
        description=pf.description,
        created_at=pf.created_at,
        positions=positions,
    )


def create_portfolio(db: Session, user_id: int, body: PortfolioCreate) -> PortfolioResponse:
    pf = Portfolio(
        user_id=user_id,
        name=body.name,
        description=body.description,
    )
    db.add(pf)
    db.commit()
    db.refresh(pf)
    return PortfolioResponse.model_validate(pf)
